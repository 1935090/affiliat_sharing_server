const dev = process.env.NODE_ENV !== "production";
const GRECAPTCHA_PUBLICKEY = dev
  ? process.env.GRECAPTCHA_TEST_PUBLICKEY
  : process.env.GRECAPTCHA_LIVE_PUBLICKEY;
const GRECAPTCHA_PRIVATEKEY = dev
  ? process.env.GRECAPTCHA_TEST_PRIVATEKEY
  : process.env.GRECAPTCHA_LIVE_PRIVATEKEY;
const axios = require("axios");

//checked 2019-06-03
function getGRecaptchaPublicKey() {
  return GRECAPTCHA_PUBLICKEY;
}

//recheck - seem no one using
/*function getGRecaptchaPrivateKey() {
  return GRECAPTCHA_PRIVATEKEY;
}*/

//checked 2019-06-03
async function verifyGRecaptcha({ grecaptchaValue }) {
  let result = await axios({
    method: "post",
    url: "https://www.google.com/recaptcha/api/siteverify",
    params: {
      secret: GRECAPTCHA_PRIVATEKEY,
      response: grecaptchaValue
    }
  });
  let succeed = result.data.success || {};
  return succeed;
}

module.exports = {
  getGRecaptchaPublicKey,
  //getGRecaptchaPrivateKey,
  verifyGRecaptcha
};
