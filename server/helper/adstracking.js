/*const ReactGa = require("react-ga");
const ReactPixel = require("react-facebook-pixel").default;

const dev = process.env.NODE_ENV !== "production";
const GAID = dev ? "UA-144025535-2" : "UA-144025535-1";
const FBPIXELID = dev ? "423247071634613" : "2423662111235811";

function trackPayment({ currency, value }) {
  ReactGa.initialize(GAID);
  ReactGa.event({
    category: "Payment",
    action: "Member checkout success(" + currency + ")",
    label: "Purchase",
    value: parseInt(value)
  });

  ReactPixel.init(FBPIXELID, null, {
    autoConfig: true,
    debug: false
  });
  ReactPixel.track("Purchase", { currency, value });
  return;
}

module.exports = {
  trackPayment
};
*/
