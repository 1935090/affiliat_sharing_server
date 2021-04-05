const stripe = require("stripe");
const currency = "HKD";
const dev = process.env.NODE_ENV !== "production";
const API_SECRETKEY = dev
  ? process.env.STRIPE_TEST_SECRETKEY
  : process.env.STRIPE_LIVE_SECRETKEY;
const client = stripe(API_SECRETKEY);
const API_PUBLICKEY = dev
  ? process.env.STRIPE_TEST_PUBLICKEY
  : process.env.STRIPE_LIVE_PUBLICKEY;

function getStripePublicKey() {
  return API_PUBLICKEY;
}

function stripeCharge({ amount, stripeTokenId, description }) {
  return client.charges.create({
    amount,
    currency,
    source: stripeTokenId,
    description,
  });
}

function stripeRefund({ amount, chargeId, reason }) {
  return client.refunds.create({
    amount,
    charge: chargeId,
    metadata: {
      reason,
    },
  });
}

function stripeCustomerCreate({ stripeTokenId, description, email, phone }) {
  return client.customers.create({
    source: stripeTokenId,
    description,
    email,
    phone,
  });
}

function stripeCustomerUpdate({ stripeTokenId, stripeCustomerId }) {
  return client.customers.update(stripeCustomerId, {
    source: stripeTokenId,
  });
}

function stripeCustomerCharge({ amount, customerId, description }) {
  return client.charges.create({
    amount,
    currency,
    customer: customerId,
    description,
  });
}

function stripeCustomerCardToken(detail) {
  return client.tokens.create(detail);
}

async function stripeSourceCreateWechat({ amount, customerId }) {
  return client.sources.create({
    type: "wechat",
    amount,
    currency,
    owner: {
      name: customerId,
    },
  });
}

module.exports = {
  getStripePublicKey,
  stripeCharge,
  stripeCustomerCreate,
  stripeCustomerUpdate,
  stripeCustomerCharge,
  stripeSourceCreateWechat,
  stripeRefund,
  stripeCustomerCardToken,
};
