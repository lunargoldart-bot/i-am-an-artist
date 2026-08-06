import axios from 'axios';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';

// DPO CompanyToken must come from environment configuration.
// Prefer process.env.DPO_COMPANY_TOKEN; a placeholder is kept as a fallback only
// so that local development does not crash. Rotate the token and set the env var
// in production (functions config / .env) before going live.
const COMPANY_TOKEN = process.env.DPO_COMPANY_TOKEN || 'B3F59BE7-0756-420E-BB88-1D98E7A6B040';
const SERVICE_TYPE = process.env.DPO_SERVICE_TYPE || '54841';
const API_BASE = 'https://secure.3gdirectpay.com/API/v6/';
const HOSTED_CHECKOUT_BASE = 'https://secure.3gdirectpay.com/payv3.php?ID=';
const CURRENCY = 'ZMW';

const xmlBuilder = new XMLBuilder({
  format: false,
  ignoreAttributes: true,
  suppressEmptyNode: true,
});

const xmlParser = new XMLParser({
  ignoreAttributes: true,
  trimValues: true,
  parseTagValue: false,
});

const buildCreateTokenXml = (params) => {
  const doc = {
    API3G: {
      CompanyToken: COMPANY_TOKEN,
      Request: 'createToken',
      Transaction: {
        PaymentAmount: params.amount.toFixed(2),
        PaymentCurrency: CURRENCY,
        CompanyRef: params.reference,
        customerFirstName: params.firstName || 'Buyer',
        customerLastName: params.lastName || '',
        customerAddress: params.address || '',
        customerCity: params.city || '',
        customerCountry: 'ZM',
        customerEmail: params.email,
        customerPhone: params.phone || '',
        RedirectURL: params.redirectUrl,
        BackURL: params.backUrl,
        Services: SERVICE_TYPE,
        TransactionSource: 'web',
      },
    },
  };
  return xmlBuilder.build(doc);
};

const parseResponse = (xml) => {
  try {
    const parsed = xmlParser.parse(xml);
    const root = parsed.API3G || parsed;
    return {
      result: root.Result || '',
      resultExplanation: root.ResultExplanation || '',
      token: root.TransToken || root.TransactionToken || '',
      reference: root.TransRef || root.CompanyRef || '',
      status: root.TransStatus || '',
      raw: root,
    };
  } catch (err) {
    throw new Error(`Failed to parse DPO response: ${err.message}`);
  }
};

export const createDPOPaymentToken = async (params) => {
  try {
    const xml = buildCreateTokenXml(params);
    const response = await axios.post(API_BASE, xml, {
      headers: { 'Content-Type': 'application/xml' },
      timeout: 30000,
    });
    const result = parseResponse(response.data);
    if (result.result !== '000' && result.result !== '0') {
      throw new Error(`DPO createToken failed: ${result.resultExplanation || result.result}`);
    }
    return result;
  } catch (err) {
    if (err.response) {
      const parsed = parseResponse(err.response.data);
      throw new Error(`DPO createToken error: ${parsed.resultExplanation || parsed.result || err.message}`);
    }
    throw new Error(`DPO createToken error: ${err.message}`);
  }
};

export const verifyDPOPaymentToken = async (token) => {
  try {
    const doc = {
      API3G: {
        CompanyToken: COMPANY_TOKEN,
        Request: 'verifyToken',
        TransactionToken: token,
      },
    };
    const xml = xmlBuilder.build(doc);
    const response = await axios.post(API_BASE, xml, {
      headers: { 'Content-Type': 'application/xml' },
      timeout: 30000,
    });
    const result = parseResponse(response.data);
    return result;
  } catch (err) {
    if (err.response) {
      const parsed = parseResponse(err.response.data);
      throw new Error(`DPO verifyToken error: ${parsed.resultExplanation || parsed.result || err.message}`);
    }
    throw new Error(`DPO verifyToken error: ${err.message}`);
  }
};

export const generateReference = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `IAA-${ts}-${rand}`;
};

export const getHostedCheckoutUrl = (token) => {
  if (!token) return null;
  return `${HOSTED_CHECKOUT_BASE}${token}`;
};

export const isPaymentApproved = (verifyResult) => {
  return verifyResult.status === '1';
};

export const logPayment = async (db, data) => {
  await db.collection('paymentLogs').add({
    ...data,
    created_date: new Date().toISOString(),
  });
};
