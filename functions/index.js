import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import axios from 'axios';
import OpenAI from 'openai';
import {
  createDPOPaymentToken,
  verifyDPOPaymentToken,
  generateReference,
  getHostedCheckoutUrl,
  isPaymentApproved,
  logPayment,
} from './dpo.js';

initializeApp();
const db = getFirestore();
const nowIso = () => new Date().toISOString();
const safeText = (value, max = 1000) => String(value || '').trim().slice(0, max);

const requireUser = (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Authentication required');
  return { uid, email: request.auth.token.email || '' };
};

const requireAdmin = async (request) => {
  const caller = requireUser(request);
  const profile = await db.collection('users').doc(caller.uid).get();
  if (profile.data()?.role !== 'admin') throw new HttpsError('permission-denied', 'Administrator access required');
  return caller;
};

const getProfile = async (uid) => {
  const snap = await db.collection('users').doc(uid).get();
  return snap.exists ? { id: snap.id, ...snap.data() } : null;
};

const getOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) throw new HttpsError('failed-precondition', 'OPENAI_API_KEY is not configured');
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

const sendMail = async ({ to, subject, html, text }) => {
  if (!process.env.SENDGRID_API_KEY || !process.env.FROM_EMAIL) {
    throw new HttpsError('failed-precondition', 'Email service is not configured');
  }
  await axios.post('https://api.sendgrid.com/v3/mail/send', {
    personalizations: [{ to: Array.isArray(to) ? to.map((email) => ({ email })) : [{ email: to }] }],
    from: { email: process.env.FROM_EMAIL, name: process.env.FROM_NAME || 'I Am An Artist' },
    subject,
    content: [{ type: html ? 'text/html' : 'text/plain', value: html || text || '' }],
  }, { headers: { Authorization: `Bearer ${process.env.SENDGRID_API_KEY}` } });
};

// ─── Track Sponsored Ad Events ────────────────────────────────────────
export const trackSponsoredAdEvent = onCall(async (request) => {
  const adId = safeText(request.data?.adId, 120);
  const event = request.data?.event;
  if (!adId || !['impression', 'click'].includes(event)) {
    throw new HttpsError('invalid-argument', 'A valid adId and event are required');
  }
  const ref = db.collection('sponsored_ads').doc(adId);
  const snap = await ref.get();
  if (!snap.exists || snap.data()?.status !== 'active' || snap.data()?.payment_status !== 'paid') {
    throw new HttpsError('not-found', 'Active sponsored ad not found');
  }
  const field = event === 'click' ? 'clicks' : 'impressions';
  await ref.update({ [field]: FieldValue.increment(1), updated_date: nowIso() });
  return { success: true };
});

// ─── Send Email (Admin) ───────────────────────────────────────────────
export const sendEmail = onCall(async (request) => {
  await requireAdmin(request);
  const { to, subject, body, html } = request.data || {};
  if (!to || !subject || (!body && !html)) throw new HttpsError('invalid-argument', 'to, subject and body are required');
  await sendMail({ to, subject, text: body, html });
  return { success: true };
});

// ─── Invoke LLM ───────────────────────────────────────────────────────
export const invokeLLM = onCall(async (request) => {
  requireUser(request);
  const prompt = String(request.data?.prompt || '').trim();
  if (!prompt) throw new HttpsError('invalid-argument', 'prompt is required');
  const completion = await getOpenAI().chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a practical advisor for Zambian artists and art collectors. Avoid unsupported claims.' },
      { role: 'user', content: prompt.slice(0, 5000) },
    ],
    max_tokens: 350,
  });
  return { text: completion.choices[0]?.message?.content || '' };
});

// ─── Messages ─────────────────────────────────────────────────────────
export const markMessagesRead = onCall(async (request) => {
  const { email } = requireUser(request);
  const { messageId, conversation_id } = request.data || {};
  if (!messageId && !conversation_id) throw new HttpsError('invalid-argument', 'messageId or conversation_id is required');
  if (messageId) {
    const ref = db.collection('messages').doc(messageId);
    const snap = await ref.get();
    if (!snap.exists) throw new HttpsError('not-found', 'Message not found');
    if (snap.data().recipient_email !== email) throw new HttpsError('permission-denied', 'Not the message recipient');
    await ref.update({ is_read: true, read_date: nowIso(), updated_date: nowIso() });
    return { success: true, updated: 1 };
  }
  const snap = await db.collection('messages')
    .where('conversation_id', '==', conversation_id)
    .where('recipient_email', '==', email)
    .where('is_read', '==', false)
    .get();
  const batch = db.batch();
  snap.docs.forEach((item) => batch.update(item.ref, { is_read: true, read_date: nowIso(), updated_date: nowIso() }));
  await batch.commit();
  return { success: true, updated: snap.size };
});

export const sendMessage = onCall(async (request) => {
  const caller = requireUser(request);
  const { artwork_id, recipient_email, content, message_type = 'text', offer_amount = null } = request.data || {};
  if (!recipient_email || !content?.trim()) throw new HttpsError('invalid-argument', 'recipient_email and content are required');
  const profile = await getProfile(caller.uid);
  const participants = [caller.email, recipient_email].sort();
  const conversationId = `${artwork_id || 'general'}_${participants[0]}_${participants[1]}`;
  const payload = {
    artwork_id: artwork_id || null,
    conversation_id: conversationId,
    sender_email: caller.email,
    sender_name: profile?.full_name || caller.email,
    recipient_email,
    content: content.trim(),
    message_type,
    offer_amount: message_type === 'offer' ? Number(offer_amount) : null,
    is_read: false,
    created_date: nowIso(),
    updated_date: nowIso(),
  };
  const ref = await db.collection('messages').add(payload);
  return { success: true, message: { id: ref.id, ...payload } };
});

// ─── Orders ───────────────────────────────────────────────────────────
export const createOrder = onCall(async (request) => {
  const caller = requireUser(request);
  const { artworkId, buyerName, deliveryMethod = 'courier', deliveryAddress = '', deliveryPhone = '', deliveryNotes = '' } = request.data || {};
  if (!artworkId) throw new HttpsError('invalid-argument', 'artworkId is required');
  const artworkRef = db.collection('artworks').doc(String(artworkId));
  const orderRef = db.collection('orders').doc();
  let orderPayload;
  await db.runTransaction(async (transaction) => {
    const artworkSnap = await transaction.get(artworkRef);
    if (!artworkSnap.exists) throw new HttpsError('not-found', 'Artwork not found');
    const artwork = artworkSnap.data();
    if (!['available', 'listed'].includes(String(artwork.status || 'available'))) {
      throw new HttpsError('failed-precondition', 'This artwork is not currently available');
    }
    if (artwork.artist_email === caller.email) throw new HttpsError('failed-precondition', 'You cannot purchase your own artwork');
    const amount = Number(artwork.price_zmw ?? artwork.price);
    if (!Number.isFinite(amount) || amount <= 0) throw new HttpsError('failed-precondition', 'Artwork price is invalid');
    const profile = await getProfile(caller.uid);
    const now = nowIso();
    orderPayload = {
      artwork_id: artworkSnap.id,
      artwork_title: safeText(artwork.title, 200),
      artwork_image: artwork.image_urls?.[0] || artwork.images?.[0] || '',
      buyer_uid: caller.uid,
      buyer_email: caller.email,
      buyer_name: safeText(buyerName || profile?.full_name || caller.email, 160),
      seller_email: artwork.artist_email,
      seller_name: safeText(artwork.artist_name, 160),
      amount,
      amount_zmw: amount,
      delivery_method: safeText(deliveryMethod, 40),
      delivery_option: safeText(deliveryMethod, 40),
      delivery_address: safeText(deliveryAddress, 500),
      delivery_phone: safeText(deliveryPhone, 40),
      delivery_notes: safeText(deliveryNotes, 1000),
      status: 'pending',
      delivery_status: 'pending',
      payment_status: 'pending',
      created_date: now,
      updated_date: now,
    };
    transaction.create(orderRef, orderPayload);
    transaction.update(artworkRef, { status: 'reserved', reserved_by_uid: caller.uid, updated_date: now });
  });
  return { success: true, order: { id: orderRef.id, ...orderPayload } };
});

// ─── DPO Checkout ─────────────────────────────────────────────────────
export const createCheckoutSession = onCall(async (request) => {
  const caller = requireUser(request);
  const { artworkIds, buyerName, deliveryMethod, deliveryAddress, deliveryPhone, deliveryNotes } = request.data || {};

  if (!artworkIds || !Array.isArray(artworkIds) || artworkIds.length === 0) {
    throw new HttpsError('invalid-argument', 'artworkIds array is required');
  }

  const amountMap = {};
  let totalAmount = 0;
  const artworkSnaps = [];

  for (const artworkId of artworkIds) {
    const snap = await db.collection('artworks').doc(String(artworkId)).get();
    if (!snap.exists) throw new HttpsError('not-found', `Artwork ${artworkId} not found`);
    const data = snap.data();
    if (!['available', 'listed'].includes(String(data.status || 'available'))) {
      throw new HttpsError('failed-precondition', `${data.title || artworkId} is not available`);
    }
    const price = Number(data.price_zmw ?? data.price);
    if (!Number.isFinite(price) || price <= 0) throw new HttpsError('failed-precondition', `Invalid price for ${data.title || artworkId}`);
    amountMap[artworkId] = price;
    totalAmount += price;
    artworkSnaps.push({ id: artworkId, data });
  }

  const profile = await getProfile(caller.uid);
  const sessionRef = db.collection('checkoutSessions').doc();
  const reference = generateReference();

  const sessionData = {
    buyer_uid: caller.uid,
    buyer_email: caller.email,
    buyer_name: safeText(buyerName || profile?.full_name || caller.email, 160),
    artworkIds,
    amounts: amountMap,
    totalAmount,
    delivery_method: safeText(deliveryMethod || 'courier', 40),
    delivery_address: safeText(deliveryAddress || '', 500),
    delivery_phone: safeText(deliveryPhone || '', 40),
    delivery_notes: safeText(deliveryNotes || '', 1000),
    companyRef: reference,
    status: 'pending',
    payment_status: 'pending',
    created_date: nowIso(),
    updated_date: nowIso(),
  };

  await sessionRef.set(sessionData);
  await logPayment(db, {
    type: 'checkout_session_created',
    sessionId: sessionRef.id,
    reference,
    totalAmount,
    buyer_email: caller.email,
  });

  const baseUrl = process.env.APP_BASE_URL || 'https://www.iamanartistapp.com';

  const dpoParams = {
    amount: totalAmount,
    reference,
    firstName: safeText(profile?.full_name?.split(' ')[0] || 'Buyer', 50),
    lastName: safeText(profile?.full_name?.split(' ').slice(1).join(' ') || '', 50),
    email: caller.email,
    phone: safeText(deliveryPhone || '', 30),
    address: safeText(deliveryAddress || '', 200),
    redirectUrl: `${baseUrl}/order/success?sessionId=${sessionRef.id}`,
    backUrl: `${baseUrl}/checkout?cancel=true`,
  };

  const dpoResult = await createDPOPaymentToken(dpoParams);
  const redirectUrl = getHostedCheckoutUrl(dpoResult.token);

  await sessionRef.update({
    dpo_token: dpoResult.token,
    dpo_reference: dpoResult.reference,
    redirect_url: redirectUrl,
    updated_date: nowIso(),
  });

  await logPayment(db, {
    type: 'dpo_token_created',
    sessionId: sessionRef.id,
    dpoToken: dpoResult.token,
    dpoReference: dpoResult.reference,
    result: dpoResult.result,
  });

  return {
    success: true,
    sessionId: sessionRef.id,
    redirectUrl,
    reference,
    totalAmount,
  };
});

export const verifyDPOPayment = onCall(async (request) => {
  const caller = requireUser(request);
  const { sessionId } = request.data || {};
  if (!sessionId) throw new HttpsError('invalid-argument', 'sessionId is required');

  const sessionRef = db.collection('checkoutSessions').doc(sessionId);
  const sessionSnap = await sessionRef.get();
  if (!sessionSnap.exists) throw new HttpsError('not-found', 'Checkout session not found');
  const session = sessionSnap.data();

  if (session.buyer_uid !== caller.uid) throw new HttpsError('permission-denied', 'Session does not belong to this user');
  if (session.payment_status === 'paid' || session.payment_status === 'completed') {
    return { success: true, status: 'completed', session };
  }

  const verifyResult = await verifyDPOPaymentToken(session.dpo_token);
  const approved = isPaymentApproved(verifyResult);
  const paymentStatus = approved ? 'completed' : 'pending';

  await sessionRef.update({
    payment_status: paymentStatus,
    verify_result: verifyResult,
    verified_date: approved ? nowIso() : null,
    updated_date: nowIso(),
  });

  await logPayment(db, {
    type: 'payment_verified',
    sessionId,
    dpoToken: session.dpo_token,
    approved,
    verifyStatus: verifyResult.status,
    verifyResult: verifyResult.resultExplanation,
  });

  if (approved) {
    const orders = [];
    for (const artworkId of session.artworkIds) {
      const artworkRef = db.collection('artworks').doc(artworkId);
      const artworkSnap = await artworkRef.get();
      if (!artworkSnap.exists) continue;
      const artwork = artworkSnap.data();

      const orderRef = db.collection('orders').doc();
      const orderPayload = {
        artwork_id: artworkId,
        artwork_title: safeText(artwork.title, 200),
        artwork_image: artwork.image_urls?.[0] || artwork.images?.[0] || '',
        buyer_uid: session.buyer_uid,
        buyer_email: session.buyer_email,
        buyer_name: session.buyer_name,
        seller_email: artwork.artist_email,
        seller_name: safeText(artwork.artist_name, 160),
        amount: session.amounts[artworkId],
        amount_zmw: session.amounts[artworkId],
        delivery_method: session.delivery_method,
        delivery_address: session.delivery_address,
        delivery_phone: session.delivery_phone,
        delivery_notes: session.delivery_notes,
        status: 'confirmed',
        delivery_status: 'pending',
        payment_status: 'paid',
        payment_method: 'dpo',
        dpo_token: session.dpo_token,
        dpo_reference: session.dpo_reference,
        checkout_session_id: sessionId,
        paid_date: nowIso(),
        created_date: nowIso(),
        updated_date: nowIso(),
      };
      await orderRef.set(orderPayload);
      orders.push({ id: orderRef.id, ...orderPayload });

      await artworkRef.update({
        status: 'sold',
        sold_price_zmw: session.amounts[artworkId],
        sold_date: nowIso(),
        buyer_email: session.buyer_email,
        updated_date: nowIso(),
      });

      await db.collection('transactions').add({
        type: 'sale',
        order_id: orderRef.id,
        artwork_id: artworkId,
        artwork_title: safeText(artwork.title, 200),
        buyer_uid: session.buyer_uid,
        buyer_email: session.buyer_email,
        seller_email: artwork.artist_email,
        seller_name: safeText(artwork.artist_name, 160),
        amount: session.amounts[artworkId],
        platform_fee: Math.round(session.amounts[artworkId] * 0.1),
        artist_payout: Math.round(session.amounts[artworkId] * 0.9),
        payment_method: 'dpo',
        dpo_token: session.dpo_token,
        status: 'completed',
        created_date: nowIso(),
        updated_date: nowIso(),
      });

      await db.collection('payments').add({
        order_id: orderRef.id,
        checkout_session_id: sessionId,
        buyer_uid: session.buyer_uid,
        buyer_email: session.buyer_email,
        seller_email: artwork.artist_email,
        amount: session.amounts[artworkId],
        payment_method: 'dpo',
        dpo_token: session.dpo_token,
        dpo_reference: session.dpo_reference,
        status: 'completed',
        created_date: nowIso(),
        updated_date: nowIso(),
      });

      await db.collection('artistPayouts').add({
        order_id: orderRef.id,
        artwork_id: artworkId,
        seller_email: artwork.artist_email,
        seller_name: safeText(artwork.artist_name, 160),
        total_amount: session.amounts[artworkId],
        platform_fee: Math.round(session.amounts[artworkId] * 0.1),
        payout_amount: Math.round(session.amounts[artworkId] * 0.9),
        status: 'pending',
        created_date: nowIso(),
        updated_date: nowIso(),
      });

      if (process.env.SENDGRID_API_KEY && process.env.FROM_EMAIL) {
        try {
          await sendMail({
            to: artwork.artist_email,
            subject: '🎨 Your artwork has been sold!',
            html: `<h2>Congratulations!</h2><p>Your artwork <strong>${safeText(artwork.title, 200)}</strong> has been purchased.</p><p>Amount: ZMW ${session.amounts[artworkId].toLocaleString()}</p><p>Please arrange delivery with the buyer.</p>`,
          });
        } catch (e) { /* email is optional */ }
      }
    }

    return {
      success: true,
      status: 'completed',
      orders: orders.map((o) => ({ id: o.id, artwork_title: o.artwork_title, amount: o.amount })),
      session,
    };
  }

  return { success: true, status: 'pending', session };
});

export const dpoCallback = onRequest(async (request, response) => {
  try {
    const { TransactionToken } = request.body || {};

    if (!TransactionToken) {
      response.status(200).json({ received: true });
      return;
    }

    const verifyResult = await verifyDPOPaymentToken(TransactionToken);
    const approved = isPaymentApproved(verifyResult);

    const sessionsSnap = await db.collection('checkoutSessions')
      .where('dpo_token', '==', TransactionToken)
      .limit(1)
      .get();

    if (!sessionsSnap.empty) {
      const sessionRef = sessionsSnap.docs[0].ref;
      const session = sessionsSnap.docs[0].data();

      if (session.payment_status !== 'completed') {
        await sessionRef.update({
          payment_status: approved ? 'completed' : 'pending',
          verify_result: verifyResult,
          verified_date: approved ? nowIso() : null,
          updated_date: nowIso(),
        });

        if (approved) {
          for (const artworkId of session.artworkIds) {
            const artworkRef = db.collection('artworks').doc(artworkId);
            const artworkSnap = await artworkRef.get();
            if (!artworkSnap.exists) continue;
            const artwork = artworkSnap.data();
            const orderRef = db.collection('orders').doc();
            const orderPayload = {
              artwork_id: artworkId,
              artwork_title: safeText(artwork.title, 200),
              artwork_image: artwork.image_urls?.[0] || artwork.images?.[0] || '',
              buyer_uid: session.buyer_uid,
              buyer_email: session.buyer_email,
              buyer_name: session.buyer_name,
              seller_email: artwork.artist_email,
              seller_name: safeText(artwork.artist_name, 160),
              amount: session.amounts[artworkId],
              amount_zmw: session.amounts[artworkId],
              delivery_method: session.delivery_method,
              delivery_address: session.delivery_address,
              delivery_phone: session.delivery_phone,
              delivery_notes: session.delivery_notes,
              status: 'confirmed',
              delivery_status: 'pending',
              payment_status: 'paid',
              payment_method: 'dpo',
              dpo_token: TransactionToken,
              checkout_session_id: sessionRef.id,
              paid_date: nowIso(),
              created_date: nowIso(),
              updated_date: nowIso(),
            };
            await orderRef.set(orderPayload);
            await artworkRef.update({ status: 'sold', sold_price_zmw: session.amounts[artworkId], sold_date: nowIso(), buyer_email: session.buyer_email, updated_date: nowIso() });
          }
        }
      }
    }

    await logPayment(db, {
      type: 'dpo_callback',
      token: TransactionToken,
      approved,
      body: request.body,
    });

    response.status(200).json({ received: true });
  } catch (err) {
    await logPayment(db, { type: 'dpo_callback_error', error: err.message, body: request.body });
    response.status(200).json({ received: true });
  }
});

// ─── Place Bid ────────────────────────────────────────────────────────
export const placeBid = onCall(async (request) => {
  const caller = requireUser(request);
  const artworkId = request.data?.artwork_id;
  const amount = Number(request.data?.amount);
  if (!artworkId || !Number.isFinite(amount) || amount <= 0) throw new HttpsError('invalid-argument', 'Valid artwork_id and amount are required');
  const artworkRef = db.collection('artworks').doc(artworkId);
  const bidRef = db.collection('bids').doc();
  let currentHighBid = 0;
  await db.runTransaction(async (transaction) => {
    const artworkSnap = await transaction.get(artworkRef);
    if (!artworkSnap.exists) throw new HttpsError('not-found', 'Artwork not found');
    const artwork = artworkSnap.data();
    const current = Number(artwork.current_bid_zmw || artwork.price_zmw || artwork.price || 0);
    const minimum = current + Number(artwork.bid_increment || 50);
    if (amount < minimum) throw new HttpsError('failed-precondition', `Minimum bid is ZMW ${minimum}`, { minimum });
    if (artwork.auction_end_date && new Date(artwork.auction_end_date) <= new Date()) throw new HttpsError('failed-precondition', 'Auction has ended');
    currentHighBid = amount;
    const profile = await getProfile(caller.uid);
    transaction.set(bidRef, {
      artwork_id: artworkId,
      bidder_uid: caller.uid,
      bidder_email: caller.email,
      bidder_name: profile?.full_name || caller.email,
      amount,
      status: 'active',
      created_date: nowIso(),
      updated_date: nowIso(),
    });
    transaction.update(artworkRef, { current_bid_zmw: amount, highest_bidder_email: caller.email, updated_date: nowIso() });
  });
  return { success: true, bidId: bidRef.id, currentHighBid };
});

// ─── Suggest Artwork Price ────────────────────────────────────────────
export const suggestArtworkPrice = onCall(async (request) => {
  requireUser(request);
  const category = String(request.data?.category || '').trim();
  if (!category) throw new HttpsError('invalid-argument', 'category is required');
  const snap = await db.collection('artworks').where('category', '==', category).limit(100).get();
  const prices = snap.docs
    .map((d) => Number(d.data().sold_price_zmw || d.data().price_zmw || d.data().price))
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => a - b);
  const fallback = Number(request.data?.current_price || 1500);
  const median = prices.length ? prices[Math.floor(prices.length / 2)] : fallback;
  const suggested = Math.max(50, Math.round(median / 50) * 50);
  return {
    suggested_price: suggested,
    confidence: prices.length >= 10 ? 'high' : prices.length >= 3 ? 'medium' : 'low',
    sample_size: prices.length,
    reasoning: prices.length
      ? [`Based on ${prices.length} ${category} listings`, 'Rounded to a buyer-friendly ZMW 50 increment', 'Adjust for size, materials, provenance and artist demand']
      : ['Limited marketplace history for this category', 'Use materials, size and hours worked as a floor', 'Review the suggestion after comparable sales are recorded'],
  };
});

// ─── Verification ─────────────────────────────────────────────────────
export const submitVerification = onCall(async (request) => {
  const caller = requireUser(request);
  const data = request.data || {};
  if (!data.full_name || !data.nrc_number || !data.phone_number) throw new HttpsError('invalid-argument', 'Full name, NRC and phone number are required');
  const [nrcSnap, phoneSnap] = await Promise.all([
    db.collection('user_verifications').where('nrc_number', '==', data.nrc_number).limit(1).get(),
    db.collection('user_verifications').where('phone_number', '==', data.phone_number).limit(1).get(),
  ]);
  const conflict = [...nrcSnap.docs, ...phoneSnap.docs].find((item) => item.data().user_uid !== caller.uid);
  if (conflict) throw new HttpsError('already-exists', 'This NRC or phone number is already linked to another account');
  const existing = await db.collection('user_verifications').where('user_uid', '==', caller.uid).limit(1).get();
  const ref = existing.empty ? db.collection('user_verifications').doc() : existing.docs[0].ref;
  const payload = { ...data, user_uid: caller.uid, user_email: caller.email, status: 'pending', verification_status: 'pending', submitted_date: nowIso(), updated_date: nowIso() };
  await ref.set(payload, { merge: true });
  await db.collection('users').doc(caller.uid).set({ verification_status: 'pending', updated_date: nowIso() }, { merge: true });
  return { success: true, verification_id: ref.id, message: 'Verification submitted successfully' };
});

export const approveVerification = onCall(async (request) => {
  await requireAdmin(request);
  const verificationId = request.data?.verificationId || request.data?.verification_id;
  const requested = request.data?.action || request.data?.status || 'approve';
  const action = ['reject', 'rejected'].includes(requested) ? 'reject' : 'approve';
  const notes = safeText(request.data?.notes || request.data?.rejection_reason, 1000);
  if (!verificationId) throw new HttpsError('invalid-argument', 'verificationId is required');
  const ref = db.collection('user_verifications').doc(String(verificationId));
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError('not-found', 'Verification not found');
  const status = action === 'approve' ? 'approved' : 'rejected';
  const legacyStatus = action === 'approve' ? 'verified' : 'rejected';
  await ref.update({ status, verification_status: legacyStatus, review_notes: notes, rejection_reason: action === 'reject' ? notes : '', reviewed_date: nowIso(), verification_date: action === 'approve' ? nowIso() : null, updated_date: nowIso() });
  const data = snap.data();
  if (data.user_uid) {
    await db.collection('users').doc(data.user_uid).set({ verification_status: legacyStatus, is_verified: action === 'approve', is_verified_artist: action === 'approve', role: action === 'approve' ? 'artist' : 'user', updated_date: nowIso() }, { merge: true });
  }
  if (data.user_email && process.env.SENDGRID_API_KEY && process.env.FROM_EMAIL) {
    const subject = action === 'approve' ? 'Artist Verification Approved' : 'Artist Verification Update';
    const message = action === 'approve'
      ? `Dear ${data.full_name || 'Artist'}, your artist verification has been approved.`
      : `Dear ${data.full_name || 'Applicant'}, your verification was not approved.${notes ? ` Reason: ${notes}` : ''}`;
    await sendMail({ to: data.user_email, subject, text: message });
  }
  return { success: true, status: legacyStatus };
});

// ─── Collaboration ────────────────────────────────────────────────────
export const handleCollaborationRequest = onCall(async (request) => {
  const caller = requireUser(request);
  const { requestId, action } = request.data || {};
  if (!requestId || !['accept', 'reject', 'decline'].includes(action)) throw new HttpsError('invalid-argument', 'Valid requestId and action are required');
  const ref = db.collection('collaboration_requests').doc(requestId);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError('not-found', 'Collaboration request not found');
  const data = snap.data();
  if (![data.collaborator_email, data.recipient_email, data.artist_email, data.to_email].includes(caller.email)) throw new HttpsError('permission-denied', 'Only the recipient can process this request');
  const accepted = action === 'accept';
  await ref.update({ status: accepted ? 'accepted' : 'rejected', responded_date: nowIso(), updated_date: nowIso() });
  if (accepted) {
    await db.collection('collaborations').add({ ...data, request_id: requestId, status: 'active', created_date: nowIso(), updated_date: nowIso() });
  }
  return { success: true, message: accepted ? 'Collaboration accepted' : 'Collaboration declined' };
});

// ─── Reviews ──────────────────────────────────────────────────────────
export const processReviews = onCall(async (request) => {
  requireUser(request);
  const { entity_type, courier_id, artwork_id } = request.data || {};
  const targetId = entity_type === 'courier' ? courier_id : artwork_id;
  if (!targetId) throw new HttpsError('invalid-argument', 'Review target is required');
  const collection = entity_type === 'courier' ? 'courier_reviews' : 'artwork_reviews';
  const field = entity_type === 'courier' ? 'courier_id' : 'artwork_id';
  const snap = await db.collection(collection).where(field, '==', targetId).get();
  const ratings = snap.docs.map((d) => Number(d.data().rating)).filter(Number.isFinite);
  const average = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
  const targetCollection = entity_type === 'courier' ? 'couriers' : 'artworks';
  await db.collection(targetCollection).doc(targetId).set({ average_rating: average, review_count: ratings.length, updated_date: nowIso() }, { merge: true });
  return { success: true, average_rating: average, review_count: ratings.length };
});

// ─── Grievance ────────────────────────────────────────────────────────
export const handleGrievance = onCall(async (request) => {
  const caller = requireUser(request);
  const { orderId, grievanceType, description } = request.data || {};
  if (!grievanceType || !description?.trim()) throw new HttpsError('invalid-argument', 'Grievance type and description are required');
  const payload = { order_id: orderId || null, grievance_type: grievanceType, description: description.trim(), user_uid: caller.uid, user_email: caller.email, status: 'open', created_date: nowIso(), updated_date: nowIso() };
  const ref = await db.collection('grievances').add(payload);
  const solutions = ['Keep all communication and payment evidence in the platform', 'Allow support to review the order and delivery timeline', 'All financial records are tracked for dispute resolution'];
  return { success: true, grievance_id: ref.id, ai_response: 'Your grievance has been logged for review.', solutions };
});

// ─── Revenue ──────────────────────────────────────────────────────────
export const recordRevenue = onCall(async (request) => {
  const caller = await requireAdmin(request);
  const data = request.data || {};
  const amount = Number(data.amount);
  if (!data.transaction_id || !Number.isFinite(amount) || amount < 0) throw new HttpsError('invalid-argument', 'Valid transaction_id and amount are required');
  await db.collection('platform_revenue').add({ ...data, amount, recorded_by_uid: caller.uid, recorded_by_email: caller.email, created_date: nowIso(), updated_date: nowIso() });
  return { success: true };
});

// ─── User Progress ────────────────────────────────────────────────────
export const trackUserProgress = onCall(async (request) => {
  const caller = requireUser(request);
  const action = String(request.data?.action || '').trim();
  if (!action) throw new HttpsError('invalid-argument', 'action is required');
  const pointsByAction = { daily_login: 5, upload_artwork: 20, complete_profile: 25, first_sale: 100, verification: 50 };
  const points = pointsByAction[action] || 5;
  const ref = db.collection('user_progress').doc(caller.uid);
  await db.runTransaction(async (transaction) => {
    const snap = await transaction.get(ref);
    const current = snap.data() || {};
    const today = new Date().toISOString().slice(0, 10);
    if (action === 'daily_login' && current.last_daily_login === today) return;
    transaction.set(ref, { user_uid: caller.uid, user_email: caller.email, points: Number(current.points || 0) + points, completed_actions: FieldValue.arrayUnion(action), last_daily_login: action === 'daily_login' ? today : current.last_daily_login || null, updated_date: nowIso(), created_date: current.created_date || nowIso() }, { merge: true });
  });
  return { success: true, points_awarded: points };
});

// ─── Order Status ─────────────────────────────────────────────────────
export const updateOrderStatus = onCall(async (request) => {
  const caller = requireUser(request);
  const { orderId, status, note, location } = request.data || {};
  if (!orderId || !status) throw new HttpsError('invalid-argument', 'orderId and status are required');
  const ref = db.collection('orders').doc(orderId);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError('not-found', 'Order not found');
  const data = snap.data();
  if (![data.buyer_email, data.seller_email, data.courier_email].includes(caller.email)) throw new HttpsError('permission-denied', 'Not an order participant');
  await ref.update({ status, delivery_status: status, updated_date: nowIso() });
  await db.collection('delivery_updates').add({ order_id: orderId, new_status: status, note: note || '', location: location || '', updated_by_email: caller.email, created_date: nowIso(), updated_date: nowIso() });
  return { success: true, status };
});

export const confirmDelivery = onCall(async (request) => {
  const caller = requireUser(request);
  const { orderId, note = 'Delivery confirmed by buyer' } = request.data || {};
  if (!orderId) throw new HttpsError('invalid-argument', 'orderId is required');
  const ref = db.collection('orders').doc(orderId);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError('not-found', 'Order not found');
  if (snap.data().buyer_email !== caller.email) throw new HttpsError('permission-denied', 'Only the buyer can confirm delivery');
  await ref.update({ status: 'delivered', delivery_status: 'delivered', delivered_date: nowIso(), updated_date: nowIso() });
  await db.collection('delivery_updates').add({ order_id: orderId, new_status: 'delivered', note, updated_by_email: caller.email, created_date: nowIso(), updated_date: nowIso() });
  return { success: true, status: 'delivered' };
});

// ─── Release Payment (DPO simplified — mark as ready for payout) ──────
export const releasePayment = onCall(async (request) => {
  const caller = requireUser(request);
  const { orderId } = request.data || {};
  if (!orderId) throw new HttpsError('invalid-argument', 'orderId is required');
  const orderRef = db.collection('orders').doc(orderId);
  const order = await orderRef.get();
  if (!order.exists) throw new HttpsError('not-found', 'Order not found');
  const callerProfile = await getProfile(caller.uid);
  if (order.data().buyer_email !== caller.email && callerProfile?.role !== 'admin') throw new HttpsError('permission-denied', 'Only the buyer or an administrator can release payment');
  if (order.data().payment_status !== 'paid') throw new HttpsError('failed-precondition', 'Payment has not been completed yet');
  await orderRef.update({ payment_status: 'released', payment_released_date: nowIso(), updated_date: nowIso() });
  const payoutSnap = await db.collection('artistPayouts').where('order_id', '==', orderId).limit(1).get();
  if (!payoutSnap.empty) await payoutSnap.docs[0].ref.update({ status: 'released', released_date: nowIso(), updated_date: nowIso() });
  return { success: true };
});

// ─── Auto Release Payments ────────────────────────────────────────────
export const autoReleasePayments = onSchedule('every 24 hours', async () => {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const snap = await db.collection('orders').where('delivery_status', '==', 'delivered').where('updated_date', '<=', cutoff).get();
  const batch = db.batch();
  snap.docs.filter((item) => item.data().payment_status === 'paid').forEach((item) => {
    batch.update(item.ref, { payment_status: 'released', payment_released_date: nowIso(), updated_date: nowIso() });
    const payoutRef = db.collection('artistPayouts').doc();
    batch.set(payoutRef, { order_id: item.id, status: 'released', released_date: nowIso(), created_date: nowIso(), updated_date: nowIso() });
  });
  await batch.commit();
});

// ─── Courier ──────────────────────────────────────────────────────────
export const calculateCourierBonuses = onCall(async (request) => {
  const caller = requireUser(request);
  const courierId = request.data?.courier_id;
  if (!courierId) throw new HttpsError('invalid-argument', 'courier_id is required');
  const reviews = await db.collection('courier_reviews').where('courier_id', '==', courierId).get();
  const ratings = reviews.docs.map((d) => Number(d.data().rating)).filter(Number.isFinite);
  const average = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
  const bonusRate = average >= 4.8 ? 0.1 : average >= 4.5 ? 0.05 : 0;
  return { success: true, courier_id: courierId, average_rating: average, bonus_rate: bonusRate, requested_by: caller.uid };
});

export const processCourierPayout = onCall(async (request) => {
  await requireAdmin(request);
  const { payoutId } = request.data || {};
  if (!payoutId) throw new HttpsError('invalid-argument', 'payoutId is required');
  await db.collection('courier_payouts').doc(payoutId).update({ status: 'completed', completed_date: nowIso(), updated_date: nowIso() });
  return { success: true };
});

// ─── Buyer Interest ───────────────────────────────────────────────────
export const trackBuyerInterest = onCall(async (request) => {
  const caller = requireUser(request);
  const { artwork_id, action = 'view' } = request.data || {};
  if (!artwork_id) throw new HttpsError('invalid-argument', 'artwork_id is required');
  await db.collection('buyer_preferences').add({ user_uid: caller.uid, user_email: caller.email, artwork_id, action, created_date: nowIso(), updated_date: nowIso() });
  return { success: true };
});

export const matchBuyerPreferences = onCall(async (request) => {
  const caller = requireUser(request);
  const preferences = await db.collection('buyer_preferences').where('user_uid', '==', caller.uid).limit(50).get();
  const categories = [...new Set(preferences.docs.map((d) => d.data().category).filter(Boolean))];
  let artworks = [];
  if (categories.length) {
    const snap = await db.collection('artworks').where('category', 'in', categories.slice(0, 10)).limit(30).get();
    artworks = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
  return { success: true, matches: artworks };
});

// ─── Commission / Cashback ────────────────────────────────────────────
export const applyCommissionCashback = onCall(async (request) => {
  await requireAdmin(request);
  const { artist_email, amount, source_transaction_id } = request.data || {};
  if (!artist_email || !Number.isFinite(Number(amount))) throw new HttpsError('invalid-argument', 'artist_email and amount are required');
  const ref = await db.collection('referral_rewards').add({ artist_email, amount: Number(amount), source_transaction_id: source_transaction_id || null, type: 'commission_cashback', status: 'credited', created_date: nowIso(), updated_date: nowIso() });
  return { success: true, reward_id: ref.id };
});

export const processMonthlyCommissionCashback = onSchedule('0 2 1 * *', async () => {
  const start = new Date();
  start.setUTCMonth(start.getUTCMonth() - 1, 1);
  start.setUTCHours(0, 0, 0, 0);
  const revenues = await db.collection('platform_revenue').where('created_date', '>=', start.toISOString()).get();
  const totals = new Map();
  revenues.docs.forEach((item) => {
    const email = item.data().artist_email;
    if (email) totals.set(email, (totals.get(email) || 0) + Number(item.data().amount || 0));
  });
  const batch = db.batch();
  totals.forEach((amount, email) => {
    const ref = db.collection('referral_rewards').doc();
    batch.set(ref, { artist_email: email, amount: Math.round(amount * 0.02 * 100) / 100, type: 'monthly_commission_cashback', status: 'credited', created_date: nowIso(), updated_date: nowIso() });
  });
  await batch.commit();
});

// ─── Reports ──────────────────────────────────────────────────────────
export const sendArtistRegistryReport = onCall(async (request) => {
  await requireAdmin(request);
  const to = request.data?.to || process.env.ADMIN_REPORT_EMAIL;
  if (!to) throw new HttpsError('invalid-argument', 'Report recipient is required');
  const artists = await db.collection('artist_registry').get();
  const rows = artists.docs.map((d) => d.data()).map((artist) => `<tr><td>${artist.full_name || ''}</td><td>${artist.email || artist.user_email || ''}</td><td>${artist.status || ''}</td></tr>`).join('');
  await sendMail({ to, subject: 'Artist Registry Report', html: `<h2>Artist Registry</h2><p>Total: ${artists.size}</p><table><tr><th>Name</th><th>Email</th><th>Status</th></tr>${rows}</table>` });
  return { success: true, count: artists.size };
});

export const shareArtistInfo = onCall(async (request) => {
  requireUser(request);
  const { artistId, to } = request.data || {};
  if (!artistId || !to) throw new HttpsError('invalid-argument', 'artistId and recipient are required');
  const artist = await db.collection('users').doc(artistId).get();
  if (!artist.exists) throw new HttpsError('not-found', 'Artist not found');
  const data = artist.data();
  await sendMail({ to, subject: `Artist profile: ${data.full_name || 'I Am An Artist'}`, html: `<h2>${data.full_name || ''}</h2><p>${data.bio || data.artist_statement || ''}</p>` });
  return { success: true };
});
