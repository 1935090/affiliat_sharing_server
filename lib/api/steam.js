import sendRequest from "./sendRequest";
const BASE_PATH = "/api/v1/steam";

/*export const getTeacherList = ({ pageNum }) =>
  sendRequest(`${BASE_PATH}/get-teacher-list?pageNum=${pageNum}`, {
    method: "GET"
  });

export const signUp = ({ email, password, type, userGroup }) =>
  sendRequest(`${BASE_PATH}/sign-up`, {
    body: JSON.stringify({ email, password, type, userGroup })
  });

export const login = ({ email, password }) =>
  sendRequest(`${BASE_PATH}/login`, {
    body: JSON.stringify({ email, password })
  });

export const getItemPackageList = () =>
  sendRequest(`${BASE_PATH}/get-item-package-list`, {
    method: "GET"
  });*/

export const addToCart = ({ productInfo }) =>
  sendRequest(`${BASE_PATH}/add-to-cart`, {
    body: JSON.stringify({ productInfo })
  });

export const getCart = () => sendRequest(`${BASE_PATH}/get-cart`, {});

export const getCartAddress = () =>
  sendRequest(`${BASE_PATH}/get-cart-address`, {});

export const getCourierByCountry = ({ country }) =>
  sendRequest(`${BASE_PATH}/get-courier-by-country`, {
    body: JSON.stringify({ country })
  });

export const getCourierAll = () =>
  sendRequest(`${BASE_PATH}/get-courier-all`, {});

export const removeFromCart = ({ index }) =>
  sendRequest(`${BASE_PATH}/remove-from-cart`, {
    body: JSON.stringify({ index })
  });

export const changePeriodFromCart = ({ index, arrayKey }) =>
  sendRequest(`${BASE_PATH}/change-period-from-cart`, {
    body: JSON.stringify({ index, arrayKey })
  });

export const submitPayment = ({ stripeTokenId, paymentType }) =>
  sendRequest(`${BASE_PATH}/submit-payment`, {
    body: JSON.stringify({ stripeTokenId, paymentType })
  });

export const submitMobileRegistration = ({
  mobileNumberReg,
  mobileNumberPrefixReg
}) =>
  sendRequest(`${BASE_PATH}/submit-mobile-registration`, {
    body: JSON.stringify({ mobileNumberReg, mobileNumberPrefixReg })
  });

export const submitEmailRegistration = ({
  emailReg,
  passwordReg,
  redirect,
  grecaptchaValue
}) =>
  sendRequest(`${BASE_PATH}/submit-email-registration`, {
    body: JSON.stringify({
      emailReg,
      passwordReg,
      redirect,
      grecaptchaValue
    })
  });

export const submitMobileAuthentication = ({
  mobileAuthenticationCode,
  mobileNumberReg,
  mobileNumberPrefixReg,
  mobilePasswordReg
}) =>
  sendRequest(`${BASE_PATH}/submit-mobile-authentication`, {
    body: JSON.stringify({
      mobileAuthenticationCode,
      mobileNumberReg,
      mobileNumberPrefixReg,
      mobilePasswordReg
    })
  });

export const signIn = ({
  mobile,
  password,
  mobilePrefix,
  email,
  grecaptchaValue
}) =>
  sendRequest(`${BASE_PATH}/signin`, {
    body: JSON.stringify({
      mobile,
      password,
      mobilePrefix,
      email,
      grecaptchaValue
    })
  });

export const signOut = () => sendRequest(`${BASE_PATH}/signout`, {});

export const saveCartAddress = ({
  receiverName,
  country,
  province,
  city,
  district,
  address,
  zipcode,
  lineOne,
  lineTwo,
  lineThree,
  townOrCity,
  county,
  company,
  phone,
  idno,
  courier,
  addressType,
  sfLocker
}) =>
  sendRequest(`${BASE_PATH}/save-cart-address`, {
    body: JSON.stringify({
      receiverName,
      country,
      province,
      city,
      district,
      address,
      zipcode,
      lineOne,
      lineTwo,
      lineThree,
      townOrCity,
      county,
      company,
      courier,
      phone,
      idno,
      addressType,
      sfLocker
    })
  });

export const getCategorySubscriptionPlan = () =>
  sendRequest(`${BASE_PATH}/get-category-subscription-plan`, {});

export const getBundleList = () =>
  sendRequest(`${BASE_PATH}/get-bundle-list`, {});

export const getMyChildren = () =>
  sendRequest(`${BASE_PATH}/get-my-children`, {});
/*export const getTeacherList = () =>
  sendRequest(`${BASE_PATH}/get-teacher-list`, {
    method: "GET"
  });*/

export const getStripeSourceWechat = () =>
  sendRequest(`${BASE_PATH}/get-stripe-source-wechat`, {});

export const getProductList = ({ pageNum }) =>
  sendRequest(`${BASE_PATH}/get-product-list`, {
    body: JSON.stringify({ pageNum })
  });

export const getProductDetail = ({ productId }) =>
  sendRequest(`${BASE_PATH}/get-product-detail`, {
    body: JSON.stringify({ productId })
  });

export const getSessionMessage = ({ link }) =>
  sendRequest(`${BASE_PATH}/get-session-message`, {
    body: JSON.stringify({ link })
  });

export const getStripePublickey = () =>
  sendRequest(`${BASE_PATH}/get-stripe-publickey`, {});

export const getGRecaptchaKey = () =>
  sendRequest(`${BASE_PATH}/get-grecaptcha-key`, {});

export const trackBehavior = ({ event }) =>
  sendRequest(`${BASE_PATH}/track-behavior`, {
    body: JSON.stringify({ event })
  });

export const setCoupon = ({ code }) =>
  sendRequest(`${BASE_PATH}/set-coupon`, {
    body: JSON.stringify({ code })
  });

export const getCoupon = () => sendRequest(`${BASE_PATH}/get-coupon`, {});

export const getReferral = () => sendRequest(`${BASE_PATH}/get-referral`, {});

export const getGiftCard = () => sendRequest(`${BASE_PATH}/get-gift-card`, {});

export const sendResetPasswordMail = ({ email }) =>
  sendRequest(`${BASE_PATH}/send-reset-password-mail`, {
    body: JSON.stringify({ email })
  });

export const resetPassword = ({ email, password, code }) =>
  sendRequest(`${BASE_PATH}/reset-password`, {
    body: JSON.stringify({ email, password, code })
  });

export const submitComment = ({
  rating,
  title,
  description,
  deliveryId,
  answer,
  feedbackSecret
}) =>
  sendRequest(`${BASE_PATH}/submit-comment`, {
    body: JSON.stringify({
      rating,
      title,
      description,
      deliveryId,
      answer,
      feedbackSecret
    })
  });

export const getDeliveryComment = ({ deliveryId, feedbackSecret }) =>
  sendRequest(`${BASE_PATH}/get-delivery-comment`, {
    body: JSON.stringify({
      deliveryId,
      feedbackSecret
    })
  });

export const submitSubscriptionComment = ({
  subscriptionId,
  feedbackSecret,
  subscriptionAnswer
}) =>
  sendRequest(`${BASE_PATH}/submit-subscription-comment`, {
    body: JSON.stringify({
      subscriptionId,
      feedbackSecret,
      subscriptionAnswer
    })
  });

export const getSubscriptionComment = ({ subscriptionId, feedbackSecret }) =>
  sendRequest(`${BASE_PATH}/get-subscription-comment`, {
    body: JSON.stringify({
      subscriptionId,
      feedbackSecret
    })
  });

export const getBoxesPeekaboo = () =>
  sendRequest(`${BASE_PATH}/get-box-peekaboo`, {});

export const getBoxesWonder = () =>
  sendRequest(`${BASE_PATH}/get-box-wonder`, {});

export const getBoxesOdyssey = () =>
  sendRequest(`${BASE_PATH}/get-box-odyssey`, {});

export const getBoxesExplorer = () =>
  sendRequest(`${BASE_PATH}/get-box-explorer`, {});

export const getBoxesSpark = () =>
  sendRequest(`${BASE_PATH}/get-box-spark`, {});

export const getSampleCrate = () =>
  sendRequest(`${BASE_PATH}/get-sample-crate`, {});

export const getWebsiteText = ({ title }) =>
  sendRequest(`${BASE_PATH}/get-website-text`, {
    body: JSON.stringify({ title })
  });

export const getAllCurrency = () =>
  sendRequest(`${BASE_PATH}/get-all-currency`, {
    body: JSON.stringify()
  });

export const checkUserExist = ({ email }) =>
  sendRequest(`${BASE_PATH}/check-user-exist`, {
    body: JSON.stringify({ email })
  });

export const submitFreeTrial = ({ stripeTokenId, finalData }) =>
  sendRequest(`${BASE_PATH}/submit-free-trial`, {
    body: JSON.stringify({ stripeTokenId, finalData })
  });

export const submitEsliteNewCustomer = ({ stripeTokenId, finalData }) =>
  sendRequest(`${BASE_PATH}/submit-eslite-new-customer`, {
    body: JSON.stringify({ stripeTokenId, finalData })
  });

////////////////Admin/////////////////

export const signInAdmin = ({ email, password, grecaptchaValue }) =>
  sendRequest(`${BASE_PATH}/sign-in-admin`, {
    body: JSON.stringify({ email, password, grecaptchaValue })
  });
