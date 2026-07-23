import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import axios from 'axios';
import OpenAI from 'openai';

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
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) throw new HttpsError('failed-precondition', 'OPENROUTER_API_KEY is not configured');
  return new OpenAI({
    apiKey,
    baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  });
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

export const sendEmail = onCall(async (request) => {
  await requireAdmin(request);
  const { to, subject, body, html } = request.data || {};
  if (!to || !subject || (!body && !html)) throw new HttpsError('invalid-argument', 'to, subject and body are required');
  await sendMail({ to, subject, text: body, html });
  return { success: true };
});

export const invokeLLM = onCall({ secrets: ['OPENROUTER_API_KEY'] }, async (request) => {
  requireUser(request);
  const prompt = String(request.data?.prompt || '').trim();
  if (!prompt) throw new HttpsError('invalid-argument', 'prompt is required');
  const completion = await getOpenAI().chat.completions.create({
    model: process.env.OPENROUTER_MODEL || process.env.OPENAI_MODEL || 'google/gemini-2.0-flash-exp:free',
    messages: [
      { role: 'system', content: 'You are a practical advisor for Zambian artists and art collectors. Avoid unsupported claims.' },
      { role: 'user', content: prompt.slice(0, 5000) },
    ],
    max_tokens: 350,
  });
  return { text: completion.choices[0]?.message?.content || '' };
});

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
    transaction.update(artworkRef, {
      current_bid_zmw: amount,
      highest_bidder_email: caller.email,
      updated_date: nowIso(),
    });
  });
  return { success: true, bidId: bidRef.id, currentHighBid };
});

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
  const payload = {
    ...data,
    user_uid: caller.uid,
    user_email: caller.email,
    status: 'pending',
    verification_status: 'pending',
    submitted_date: nowIso(),
    updated_date: nowIso(),
  };
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
  await ref.update({
    status,
    verification_status: legacyStatus,
    review_notes: notes,
    rejection_reason: action === 'reject' ? notes : '',
    reviewed_date: nowIso(),
    verification_date: action === 'approve' ? nowIso() : null,
    updated_date: nowIso(),
  });
  const data = snap.data();
  if (data.user_uid) {
    await db.collection('users').doc(data.user_uid).set({
      verification_status: legacyStatus,
      is_verified: action === 'approve',
      is_verified_artist: action === 'approve',
      role: action === 'approve' ? 'artist' : 'user',
      updated_date: nowIso(),
    }, { merge: true });
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

export const handleGrievance = onCall(async (request) => {
  const caller = requireUser(request);
  const { orderId, grievanceType, description } = request.data || {};
  if (!grievanceType || !description?.trim()) throw new HttpsError('invalid-argument', 'Grievance type and description are required');
  const payload = {
    order_id: orderId || null,
    grievance_type: grievanceType,
    description: description.trim(),
    user_uid: caller.uid,
    user_email: caller.email,
    status: 'open',
    created_date: nowIso(),
    updated_date: nowIso(),
  };
  const ref = await db.collection('grievances').add(payload);
  const solutions = ['Keep all communication and payment evidence in the platform', 'Allow support to review the order and delivery timeline', 'Do not release escrow funds until the dispute is resolved'];
  return { success: true, grievance_id: ref.id, ai_response: 'Your grievance has been logged for review. Escrow and order records will be checked before a resolution is issued.', solutions };
});

const initiateLipilaCharge = async ({ amount, phone, narration, referenceId, callbackUrl }) => {
  if (!process.env.LIPILA_API_KEY) throw new HttpsError('failed-precondition', 'LIPILA_API_KEY is not configured');
  const endpoint = process.env.LIPILA_CHARGE_URL || 'https://api.lipila.co.zm/v1/charges';
  const response = await axios.post(endpoint, {
    amount: Number(amount),
    payer_msisdn: phone,
    description: narration,
    reference: referenceId,
    currency: 'ZMW',
    callback_url: callbackUrl,
  }, { headers: { Authorization: `Bearer ${process.env.LIPILA_API_KEY}` } });
  return response.data;
};

export const initiateEscrowPayment = onCall(async (request) => {
  const caller = requireUser(request);
  const { orderId, artworkId, phone, artworkTitle } = request.data || {};
  if (!orderId || !phone) throw new HttpsError('invalid-argument', 'orderId and phone are required');
  const orderRef = db.collection('orders').doc(orderId);
  const order = await orderRef.get();
  if (!order.exists || order.data().buyer_email !== caller.email) throw new HttpsError('permission-denied', 'Order does not belong to this user');
  if (artworkId && order.data().artwork_id !== artworkId) throw new HttpsError('failed-precondition', 'Artwork does not match the order');
  if (['escrowed', 'released', 'paid'].includes(order.data().payment_status)) throw new HttpsError('failed-precondition', 'This order has already been paid');
  const amount = Number(order.data().amount_zmw ?? order.data().amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new HttpsError('failed-precondition', 'Order amount is invalid');
  const referenceId = `escrow-${orderId}-${Date.now()}`;
  const payment = await initiateLipilaCharge({ amount, phone, narration: `Escrow payment: ${artworkTitle || artworkId}`, referenceId, callbackUrl: process.env.ESCROW_CALLBACK_URL });
  await db.collection('payment_escrow').add({
    order_id: orderId,
    artwork_id: artworkId || null,
    buyer_uid: caller.uid,
    buyer_email: caller.email,
    amount: Number(amount),
    phone,
    reference_id: referenceId,
    provider_reference: payment.reference || payment.id || null,
    status: 'pending',
    created_date: nowIso(),
    updated_date: nowIso(),
  });
  await orderRef.update({ payment_status: 'pending_confirmation', payment_reference: referenceId, updated_date: nowIso() });
  return { success: true, reference: referenceId };
});

const MEMBERSHIP_TIERS = {
  pro: { amount: 800, label: 'Pro Artist' },
  elite: { amount: 2800, label: 'Elite Member' },
};

export const initiateMembershipPayment = onCall(async (request) => {
  const caller = requireUser(request);
  const tierId = safeText(request.data?.tier_id, 30).toLowerCase();
  const phone = safeText(request.data?.phone, 40);
  const tier = MEMBERSHIP_TIERS[tierId];
  if (!tier || phone.length < 10) throw new HttpsError('invalid-argument', 'Valid tier and mobile money number are required');
  const paymentRef = db.collection('membership_payments').doc();
  const referenceId = `membership-${paymentRef.id}-${Date.now()}`;
  const payment = await initiateLipilaCharge({
    amount: tier.amount,
    phone,
    narration: `I Am An Artist ${tier.label} membership`,
    referenceId,
    callbackUrl: process.env.MEMBERSHIP_CALLBACK_URL,
  });
  await paymentRef.set({
    user_uid: caller.uid,
    user_email: caller.email,
    tier_id: tierId,
    amount: tier.amount,
    phone,
    reference_id: referenceId,
    provider_reference: payment.reference || payment.id || null,
    status: 'pending',
    created_date: nowIso(),
    updated_date: nowIso(),
  });
  return { success: true, reference: referenceId, message: 'Payment initiated. Membership activates after provider confirmation.' };
});

export const lipila_initiate = onCall(async (request) => {
  const caller = requireUser(request);
  const { phone, adId } = request.data || {};
  const days = Number(request.data?.days);
  const pricing = { 7: 150, 14: 250, 30: 400 };
  const amount = pricing[days];
  if (!phone || !adId || !amount) throw new HttpsError('invalid-argument', 'phone, adId and a valid campaign duration are required');
  const adRef = db.collection('sponsored_ads').doc(String(adId));
  const ad = await adRef.get();
  if (!ad.exists) throw new HttpsError('not-found', 'Sponsored ad not found');
  if (ad.data().artist_email !== caller.email) throw new HttpsError('permission-denied', 'Ad does not belong to this user');
  const referenceId = `zartia-ad-${ad.id}-${Date.now()}`;
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  const payment = await initiateLipilaCharge({
    amount,
    phone: safeText(phone, 40),
    narration: `Zartia Sponsored Ad — ${safeText(ad.data().headline, 120)}`,
    referenceId,
    callbackUrl: process.env.LIPILA_AD_CALLBACK_URL,
  });
  await adRef.update({
    end_date: endDate.toISOString().slice(0, 10),
    campaign_days: days,
    payment_amount: amount,
    payment_reference: referenceId,
    payment_provider_reference: payment.reference || payment.id || null,
    payment_status: 'pending',
    status: 'paused',
    updated_date: nowIso(),
  });
  return { success: true, reference: referenceId, amount };
});

const handlePaymentCallback = async (body, kind) => {
  const reference = body.reference || body.reference_id || body.external_reference;
  const providerStatus = String(body.status || '').toLowerCase();
  if (!reference) return false;
  const success = ['success', 'successful', 'paid', 'completed'].includes(providerStatus);
  if (kind === 'ad') {
    const snap = await db.collection('sponsored_ads').where('payment_reference', '==', reference).limit(1).get();
    if (!snap.empty) await snap.docs[0].ref.update({ payment_status: success ? 'paid' : providerStatus, status: success ? 'active' : 'paused', updated_date: nowIso() });
  } else if (kind === 'membership') {
    const snap = await db.collection('membership_payments').where('reference_id', '==', reference).limit(1).get();
    if (!snap.empty) {
      const paymentDoc = snap.docs[0];
      const paymentData = paymentDoc.data();
      await db.runTransaction(async (transaction) => {
        const fresh = await transaction.get(paymentDoc.ref);
        if (!fresh.exists || fresh.data().status === 'paid') return;
        transaction.update(paymentDoc.ref, { status: success ? 'paid' : providerStatus, provider_payload: body, paid_date: success ? nowIso() : null, updated_date: nowIso() });
        if (success) transaction.set(db.collection('users').doc(paymentData.user_uid), { subscription_tier: paymentData.tier_id, subscription_status: 'active', subscription_start_date: nowIso(), updated_date: nowIso() }, { merge: true });
      });
    }
  } else {
    const snap = await db.collection('payment_escrow').where('reference_id', '==', reference).limit(1).get();
    if (!snap.empty) {
      const escrow = snap.docs[0];
      await escrow.ref.update({ status: success ? 'funded' : providerStatus, provider_payload: body, updated_date: nowIso() });
      if (escrow.data().order_id) await db.collection('orders').doc(escrow.data().order_id).set({ payment_status: success ? 'escrowed' : providerStatus, status: success ? 'confirmed' : escrow.data().status, updated_date: nowIso() }, { merge: true });
    }
  }
  return true;
};

export const lipila_callback = onRequest(async (request, response) => {
  if (process.env.LIPILA_WEBHOOK_SECRET && request.get('x-webhook-secret') !== process.env.LIPILA_WEBHOOK_SECRET) return response.status(401).json({ error: 'Invalid webhook signature' });
  await handlePaymentCallback(request.body || {}, 'ad');
  response.status(200).json({ received: true });
});

export const escrowCallback = onRequest(async (request, response) => {
  if (process.env.LIPILA_WEBHOOK_SECRET && request.get('x-webhook-secret') !== process.env.LIPILA_WEBHOOK_SECRET) return response.status(401).json({ error: 'Invalid webhook signature' });
  await handlePaymentCallback(request.body || {}, 'escrow');
  response.status(200).json({ received: true });
});

export const membershipCallback = onRequest(async (request, response) => {
  if (process.env.LIPILA_WEBHOOK_SECRET && request.get('x-webhook-secret') !== process.env.LIPILA_WEBHOOK_SECRET) return response.status(401).json({ error: 'Invalid webhook signature' });
  await handlePaymentCallback(request.body || {}, 'membership');
  response.status(200).json({ received: true });
});

export const recordRevenue = onCall(async (request) => {
  const caller = await requireAdmin(request);
  const data = request.data || {};
  const amount = Number(data.amount);
  if (!data.transaction_id || !Number.isFinite(amount) || amount < 0) throw new HttpsError('invalid-argument', 'Valid transaction_id and amount are required');
  await db.collection('platform_revenue').add({ ...data, amount, recorded_by_uid: caller.uid, recorded_by_email: caller.email, created_date: nowIso(), updated_date: nowIso() });
  return { success: true };
});

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
    transaction.set(ref, {
      user_uid: caller.uid,
      user_email: caller.email,
      points: Number(current.points || 0) + points,
      completed_actions: FieldValue.arrayUnion(action),
      last_daily_login: action === 'daily_login' ? today : current.last_daily_login || null,
      updated_date: nowIso(),
      created_date: current.created_date || nowIso(),
    }, { merge: true });
  });
  return { success: true, points_awarded: points };
});

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

export const releasePayment = onCall(async (request) => {
  const caller = requireUser(request);
  const { orderId } = request.data || {};
  if (!orderId) throw new HttpsError('invalid-argument', 'orderId is required');
  const orderRef = db.collection('orders').doc(orderId);
  const order = await orderRef.get();
  if (!order.exists) throw new HttpsError('not-found', 'Order not found');
  const callerProfile = await getProfile(caller.uid);
  if (order.data().buyer_email !== caller.email && callerProfile?.role !== 'admin') throw new HttpsError('permission-denied', 'Only the buyer or an administrator can release payment');
  await orderRef.update({ payment_status: 'released', payment_released_date: nowIso(), updated_date: nowIso() });
  const escrowSnap = await db.collection('payment_escrow').where('order_id', '==', orderId).limit(1).get();
  if (!escrowSnap.empty) await escrowSnap.docs[0].ref.update({ status: 'released', released_date: nowIso(), updated_date: nowIso() });
  return { success: true };
});

export const autoReleasePayments = onSchedule('every 24 hours', async () => {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const snap = await db.collection('orders').where('delivery_status', '==', 'delivered').where('updated_date', '<=', cutoff).get();
  const batch = db.batch();
  snap.docs.filter((item) => item.data().payment_status === 'escrowed').forEach((item) => batch.update(item.ref, { payment_status: 'released', payment_released_date: nowIso(), updated_date: nowIso() }));
  await batch.commit();
});

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
