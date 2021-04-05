import sendRequest from "./sendRequest";
const BASE_PATH = "/api/v1/admin";

export const deleteAllDocuments = () =>
  sendRequest(`${BASE_PATH}/delete-all-documents`, {});

export const createInitialDocuments = () =>
  sendRequest(`${BASE_PATH}/create-initial-documents`, {});

//delivery

export const getDeliveryList = ({ condition, pageNum, limit } = {}) =>
  sendRequest(`${BASE_PATH}/get-delivery-list`, {
    body: JSON.stringify({ condition, pageNum, limit }),
  });

export const upsertDelivery = ({ dataObj, emailDeliveries }) =>
  sendRequest(`${BASE_PATH}/upsert-delivery`, {
    body: JSON.stringify({ dataObj, emailDeliveries }),
  });

export const getCategoryPlanProductList = () =>
  sendRequest(`${BASE_PATH}/get-category-plan-product-list`, {});

export const getCategoryPlanProductListByUserId = ({
  userId,
  categoryId,
  subscriptionId,
}) =>
  sendRequest(`${BASE_PATH}/get-category-plan-product-list-by-user-id`, {
    body: JSON.stringify({ userId, categoryId, subscriptionId }),
  });

export const updateProductForDelivery = ({ deliveryId, productId }) =>
  sendRequest(`${BASE_PATH}/update-product-for-delivery`, {
    body: JSON.stringify({ deliveryId, productId }),
  });

export const getDeliveryFirstBox = ({ deliveryId }) =>
  sendRequest(`${BASE_PATH}/get-delivery-first-box`, {
    body: JSON.stringify({ deliveryId }),
  });

export const getDeliveryTable = () =>
  sendRequest(`${BASE_PATH}/get-delivery-table`, {
    body: JSON.stringify(),
  });

export const getDeliveryFromId = ({ id }) =>
  sendRequest(`${BASE_PATH}/get-delivery-from-id`, {
    body: JSON.stringify({ id }),
  });

export const updateRemainingDeliveriesAndSubscription = ({
  dataObj,
  subscriptionId,
}) =>
  sendRequest(`${BASE_PATH}/update-remaining-deliveries-and-subscription`, {
    body: JSON.stringify({ dataObj, subscriptionId }),
  });

export const updateToShipped = ({ trackingCode }) =>
  sendRequest(`${BASE_PATH}/update-to-shipped`, {
    body: JSON.stringify({ trackingCode }),
  });

export const updateOldAddressToNew = ({ oldAddress, newAddress }) =>
  sendRequest(`${BASE_PATH}/update-old-address-to-new`, {
    body: JSON.stringify({ oldAddress, newAddress }),
  });

//product

export const getProductList = ({ condition, pageNum } = {}) =>
  sendRequest(`${BASE_PATH}/get-product-list`, {
    body: JSON.stringify({ condition, pageNum }),
  });

export const upsertProduct = ({ dataObj }) =>
  sendRequest(`${BASE_PATH}/upsert-product`, {
    body: JSON.stringify({ dataObj }),
  });

export const getProductFromId = ({ id }) =>
  sendRequest(`${BASE_PATH}/get-product-from-id`, {
    body: JSON.stringify({ id }),
  });

export const getProducts = () => sendRequest(`${BASE_PATH}/get-products`, {});

//Category

export const getCategoryListAll = () =>
  sendRequest(`${BASE_PATH}/get-category-list-all`, {});

export const getCategoryList = ({ condition, pageNum } = {}) =>
  sendRequest(`${BASE_PATH}/get-category-list`, {
    body: JSON.stringify({ condition, pageNum }),
  });

export const upsertCategory = ({ dataObj }) =>
  sendRequest(`${BASE_PATH}/upsert-category`, {
    body: JSON.stringify({ dataObj }),
  });

export const getCategoryFromId = ({ id }) =>
  sendRequest(`${BASE_PATH}/get-category-from-id`, {
    body: JSON.stringify({ id }),
  });

//User

export const getUserList = ({ condition, pageNum } = {}) =>
  sendRequest(`${BASE_PATH}/get-user-list`, {
    body: JSON.stringify({ condition, pageNum }),
  });

export const upsertUser = ({ dataObj }) =>
  sendRequest(`${BASE_PATH}/upsert-user`, {
    body: JSON.stringify({ dataObj }),
  });

export const getUserFromId = ({ id }) =>
  sendRequest(`${BASE_PATH}/get-user-from-id`, {
    body: JSON.stringify({ id }),
  });

export const getUsers = ({ email } = {}) =>
  sendRequest(`${BASE_PATH}/get-users`, {
    body: JSON.stringify({ email }),
  });

export const getTestUser = () => sendRequest(`${BASE_PATH}/get-test-user`, {});

export const checkUserExists = ({ email } = {}) =>
  sendRequest(`${BASE_PATH}/check-user-exists`, {
    body: JSON.stringify({ email }),
  });

//Subscription

export const getSubscriptionList = ({ condition, pageNum } = {}) =>
  sendRequest(`${BASE_PATH}/get-subscription-list`, {
    body: JSON.stringify({ condition, pageNum }),
  });

export const upsertSubscription = ({ dataObj }) =>
  sendRequest(`${BASE_PATH}/upsert-subscription`, {
    body: JSON.stringify({ dataObj }),
  });

export const extendSubscriptionManually = ({ dataObj }) =>
  sendRequest(`${BASE_PATH}/extend-subscription-manually`, {
    body: JSON.stringify({ dataObj }),
  });

export const getSubscriptionFromId = ({ id }) =>
  sendRequest(`${BASE_PATH}/get-subscription-from-id`, {
    body: JSON.stringify({ id }),
  });

export const chargeSubscriptionFromId = ({ id }) =>
  sendRequest(`${BASE_PATH}/charge-subscription-from-id`, {
    body: JSON.stringify({ id }),
  });

export const getSubscriptionTable = () =>
  sendRequest(`${BASE_PATH}/get-subscription-table`, {});

export const getSubscriptionPlans = () =>
  sendRequest(`${BASE_PATH}/get-subscription-plans`, {});

export const updateUserSubscriptionPlan = ({
  planSelected,
  subscriptionId,
  userId,
}) =>
  sendRequest(`${BASE_PATH}/update-user-subscription-plan`, {
    body: JSON.stringify({
      planSelected,
      subscriptionId,
      userId,
    }),
  });

export const updateSubscriptionRemark = ({ subscriptionId, remark }) =>
  sendRequest(`${BASE_PATH}/update-subscription-remark`, {
    body: JSON.stringify({ subscriptionId, remark }),
  });

export const updateSubscriptionDontSend = ({ dontSend, subscriptionId }) =>
  sendRequest(`${BASE_PATH}/update-subscription-dont-send`, {
    body: JSON.stringify({ dontSend, subscriptionId }),
  });

export const getProductSelectList = () =>
  sendRequest(`${BASE_PATH}/get-product-select-list`, {});

export const postponeSubscriptionFeb = () =>
  sendRequest(`${BASE_PATH}/postpone-subscription-feb`, {});

export const getRenewableList = () =>
  sendRequest(`${BASE_PATH}/get-renewable-list`, {});

export const renewSubscriptions = () =>
  sendRequest(`${BASE_PATH}/renew-aubscriptions`, {});

export const getRenewableEmailList = () =>
  sendRequest(`${BASE_PATH}/get-renewable-email-list`, {});

export const sendRenewSubscriptionEmails = () =>
  sendRequest(`${BASE_PATH}/send-renew-subscription-emails`, {});

//Order

export const getOrderList = ({ condition, pageNum } = {}) =>
  sendRequest(`${BASE_PATH}/get-order-list`, {
    body: JSON.stringify({ condition, pageNum }),
  });

export const upsertOrder = ({ dataObj }) =>
  sendRequest(`${BASE_PATH}/upsert-order`, {
    body: JSON.stringify({ dataObj }),
  });

export const upsertOrderManual = () =>
  sendRequest(`${BASE_PATH}/upsert-order-manual`, {});

export const getOrderFromId = ({ id }) =>
  sendRequest(`${BASE_PATH}/get-order-from-id`, {
    body: JSON.stringify({ id }),
  });

export const getDeliveryFromOrderId = ({ id }) =>
  sendRequest(`${BASE_PATH}/get-delivery-from-order-id`, {
    body: JSON.stringify({ id }),
  });

//Cart

export const getCartList = ({ condition, pageNum } = {}) =>
  sendRequest(`${BASE_PATH}/get-cart-list`, {
    body: JSON.stringify({ condition, pageNum }),
  });

export const getCartFromId = ({ id }) =>
  sendRequest(`${BASE_PATH}/get-cart-from-id`, {
    body: JSON.stringify({ id }),
  });

//Tracking

export const getTrackingList = ({ condition, pageNum } = {}) =>
  sendRequest(`${BASE_PATH}/get-tracking-list`, {
    body: JSON.stringify({ condition, pageNum }),
  });

export const getTrackingFromUserId = ({ id }) =>
  sendRequest(`${BASE_PATH}/get-tracking-from-user-id`, {
    body: JSON.stringify({ id }),
  });

//Inventory

export const getInventoryList = ({ condition, pageNum } = {}) =>
  sendRequest(`${BASE_PATH}/get-inventory-list`, {
    body: JSON.stringify({ condition, pageNum }),
  });

export const getInventoryFromId = ({ id }) =>
  sendRequest(`${BASE_PATH}/get-inventory-from-id`, {
    body: JSON.stringify({ id }),
  });

export const upsertInventory = ({ dataObj }) =>
  sendRequest(`${BASE_PATH}/upsert-inventory`, {
    body: JSON.stringify({ dataObj }),
  });

//Coupon

export const getCouponList = ({ condition, pageNum } = {}) =>
  sendRequest(`${BASE_PATH}/get-coupon-list`, {
    body: JSON.stringify({ condition, pageNum }),
  });

export const getCouponListAll = ({ condition } = {}) =>
  sendRequest(`${BASE_PATH}/get-coupon-list-all`, {
    body: JSON.stringify({ condition }),
  });

export const getCouponFromId = ({ id }) =>
  sendRequest(`${BASE_PATH}/get-coupon-from-id`, {
    body: JSON.stringify({ id }),
  });

export const upsertCoupon = ({ dataObj }) =>
  sendRequest(`${BASE_PATH}/upsert-coupon`, {
    body: JSON.stringify({ dataObj }),
  });

export const checkCouponDuplicate = ({ code }) =>
  sendRequest(`${BASE_PATH}/check-coupon-duplicate`, {
    body: JSON.stringify({ code }),
  });

//Gift Card

export const getGiftCardList = ({ condition, pageNum } = {}) =>
  sendRequest(`${BASE_PATH}/get-gift-card-list`, {
    body: JSON.stringify({ condition, pageNum }),
  });

//Credit

export const getCreditList = ({ condition, pageNum } = {}) =>
  sendRequest(`${BASE_PATH}/get-credit-list`, {
    body: JSON.stringify({ condition, pageNum }),
  });

export const getCreditFromId = ({ id }) =>
  sendRequest(`${BASE_PATH}/get-credit-from-id`, {
    body: JSON.stringify({ id }),
  });

export const upsertCredit = ({ dataObj }) =>
  sendRequest(`${BASE_PATH}/upsert-credit`, {
    body: JSON.stringify({ dataObj }),
  });

//CreditLog

export const updateCreditLogs = () =>
  sendRequest(`${BASE_PATH}/update-credit-logs`, {});

export const getExpiredCreditList = () =>
  sendRequest(`${BASE_PATH}/get-expired-credit-list`, {});

export const expireCredits = () =>
  sendRequest(`${BASE_PATH}/expire-credits`, {});

//Promotion Email

export const upsertPromotion = ({ dataObj }) =>
  sendRequest(`${BASE_PATH}/upsert-promotion`, {
    body: JSON.stringify({ dataObj }),
  });

export const getPromotionList = ({ condition, pageNum } = {}) =>
  sendRequest(`${BASE_PATH}/get-promotion-list`, {
    body: JSON.stringify({ condition, pageNum }),
  });

export const getPromotionEmailList = ({ condition, pageNum } = {}) =>
  sendRequest(`${BASE_PATH}/get-promotion-email-list`, {
    body: JSON.stringify({ condition, pageNum }),
  });

export const searchPromotionEmailIds = ({ condition, emailType }) =>
  sendRequest(`${BASE_PATH}/search-promotion-email-ids`, {
    body: JSON.stringify({ condition, emailType }),
  });

export const addPromotionEmails = ({ promotionId }) =>
  sendRequest(`${BASE_PATH}/add-promotion-emails`, {
    body: JSON.stringify({ promotionId }),
  });

export const sendPromotionEmails = ({ promotionId }) =>
  sendRequest(`${BASE_PATH}/send-promotion-emails`, {
    body: JSON.stringify({ promotionId }),
  });

export const getUnsendFeedbackList = () =>
  sendRequest(`${BASE_PATH}/get-unsend-feedback-list`, {});

export const sendFeedbackEmail = ({ delivery }) =>
  sendRequest(`${BASE_PATH}/send-feedback-email`, {
    body: JSON.stringify({ delivery }),
  });

export const getUnsendNewProductUserList = () =>
  sendRequest(`${BASE_PATH}/get-unsend-new-product-user-list`, {});

export const getUnsendDelayUserList = () =>
  sendRequest(`${BASE_PATH}/get-unsend-delay-user-list`, {});

export const sendNewProductPromotionEmail = ({ user, promotionProducts }) =>
  sendRequest(`${BASE_PATH}/send-new-product-promotion-email`, {
    body: JSON.stringify({ user, promotionProducts }),
  });

export const sendAddPriceEmail = ({ user }) =>
  sendRequest(`${BASE_PATH}/send-add-price-email`, {
    body: JSON.stringify({ user }),
  });

export const resetNewProductPromotionEmail = () =>
  sendRequest(`${BASE_PATH}/reset-new-product-promotion-email`, {});

export const sendNewYearPromotionEmail = ({ user }) =>
  sendRequest(`${BASE_PATH}/send-new-year-promotion-email`, {
    body: JSON.stringify({ user }),
  });

export const sendDelayUserEmail = ({ user, months, deliveryId }) =>
  sendRequest(`${BASE_PATH}/send-delay-user-email`, {
    body: JSON.stringify({ user, months, deliveryId }),
  });

//Upload

export const getUploadedFile = ({ table, _id, field }) =>
  sendRequest(`${BASE_PATH}/get-uploaded-file`, {
    body: JSON.stringify({ table, _id, field }),
  });

export const updateUploadedFile = ({ table, _id, upload, field }) =>
  sendRequest(`${BASE_PATH}/update-uploaded-file`, {
    body: JSON.stringify({ table, _id, upload, field }),
  });

export const pullFileFromUpload = ({ table, _id, uploadId, field }) =>
  sendRequest(`${BASE_PATH}/pull-file-from-upload`, {
    body: JSON.stringify({ table, _id, uploadId, field }),
  });

//Statistics

export const findStatReport = ({ statisticsType, graphType, graphName }) =>
  sendRequest(`${BASE_PATH}/find-stat-report`, {
    body: JSON.stringify({ statisticsType, graphType, graphName }),
  });

export const upsertStatReport = ({
  statisticsType,
  graphType,
  graphName,
  graphData,
}) =>
  sendRequest(`${BASE_PATH}/upsert-stat-report`, {
    body: JSON.stringify({ statisticsType, graphType, graphName, graphData }),
  });

export const getStatSales = ({ condition }) =>
  sendRequest(`${BASE_PATH}/get-stat-sales`, {
    body: JSON.stringify({ condition }),
  });

export const getStatSalesBest = ({ condition }) =>
  sendRequest(`${BASE_PATH}/get-stat-sales-best`, {
    body: JSON.stringify({ condition }),
  });

export const getStatSubscriptions = ({ condition }) =>
  sendRequest(`${BASE_PATH}/get-stat-subscriptions`, {
    body: JSON.stringify({ condition }),
  });

export const getStatMemberRegister = ({ condition }) =>
  sendRequest(`${BASE_PATH}/get-stat-member-register`, {
    body: JSON.stringify({ condition }),
  });

//Website Text

export const getWebsiteTextList = ({ condition, pageNum } = {}) =>
  sendRequest(`${BASE_PATH}/get-website-text-list`, {
    body: JSON.stringify({ condition, pageNum }),
  });

export const upsertWebsiteText = ({ dataObj }) =>
  sendRequest(`${BASE_PATH}/upsert-website-text`, {
    body: JSON.stringify({ dataObj }),
  });

export const getWebsiteTextFromId = ({ id }) =>
  sendRequest(`${BASE_PATH}/get-website-text-from-id`, {
    body: JSON.stringify({ id }),
  });

//Courier

export const getCourierList = ({ condition, pageNum } = {}) =>
  sendRequest(`${BASE_PATH}/get-courier-list`, {
    body: JSON.stringify({ condition, pageNum }),
  });

export const upsertCourier = ({ dataObj }) =>
  sendRequest(`${BASE_PATH}/upsert-courier`, {
    body: JSON.stringify({ dataObj }),
  });

export const getCourierFromId = ({ id }) =>
  sendRequest(`${BASE_PATH}/get-courier-from-id`, {
    body: JSON.stringify({ id }),
  });

//Comment
export const getCommentList = ({ condition, pageNum } = {}) =>
  sendRequest(`${BASE_PATH}/get-comment-list`, {
    body: JSON.stringify({ condition, pageNum }),
  });

export const getCommentListAll = ({ condition } = {}) =>
  sendRequest(`${BASE_PATH}/get-comment-list-all`, {
    body: JSON.stringify({ condition }),
  });

//Currency

export const getCurrencyList = ({ condition, pageNum } = {}) =>
  sendRequest(`${BASE_PATH}/get-currency-list`, {
    body: JSON.stringify({ condition, pageNum }),
  });

export const upsertCurrency = ({ dataObj }) =>
  sendRequest(`${BASE_PATH}/upsert-currency`, {
    body: JSON.stringify({ dataObj }),
  });

export const getCurrencyFromId = ({ id }) =>
  sendRequest(`${BASE_PATH}/get-currency-from-id`, {
    body: JSON.stringify({ id }),
  });

//Marketing

export const getMarketingLinkList = ({ condition, pageNum } = {}) =>
  sendRequest(`${BASE_PATH}/get-marketing-link-list`, {
    body: JSON.stringify({ condition, pageNum }),
  });

export const upsertMarketingLink = ({ dataObj }) =>
  sendRequest(`${BASE_PATH}/upsert-marketing-link`, {
    body: JSON.stringify({ dataObj }),
  });

export const getMarketingLinkFromId = ({ id }) =>
  sendRequest(`${BASE_PATH}/get-marketing-link-from-id`, {
    body: JSON.stringify({ id }),
  });

//Mail
export const sendSubscriptionRenewMail = ({
  userId,
  to,
  type,
  subscriptionRenewObj,
}) =>
  sendRequest(`${BASE_PATH}/send-subscription-renew-mail`, {
    body: JSON.stringify({ userId, to, type, subscriptionRenewObj }),
  });

export const getEmailUsers = ({ type }) =>
  sendRequest(`${BASE_PATH}/get-email-users`, {
    body: JSON.stringify({ type }),
  });

export const sendGeneralEmail = ({
  userId,
  to,
  type,
  user,
  emailContent,
  title,
}) =>
  sendRequest(`${BASE_PATH}/send-general-email`, {
    body: JSON.stringify({ userId, to, type, user, emailContent, title }),
  });

//Refund

export const refundOrder = ({ orderId, fullOrPartial, amount, reason }) =>
  sendRequest(`${BASE_PATH}/refund-order`, {
    body: JSON.stringify({ orderId, fullOrPartial, amount, reason }),
  });

//Elaine Report

export const getOrderAll = ({ condition } = {}) =>
  sendRequest(`${BASE_PATH}/get-order-all`, {
    body: JSON.stringify({ condition }),
  });

//SOAP HK POST EC-Ship

export const callSoapHKPostCreate = ({ deliveries }) =>
  sendRequest(`${BASE_PATH}/call-soap-hk-post-create`, {
    body: JSON.stringify({ deliveries }),
  });

export const callSoapHKPostGetLabel = ({ itemNumber }) =>
  sendRequest(`${BASE_PATH}/call-soap-hk-post-get-label`, {
    body: JSON.stringify({ itemNumber }),
  });

//Update delivery feedback secret
export const updateDeliveryFeedbackSecret = () =>
  sendRequest(`${BASE_PATH}/update-delivery-feedback-secret`, {});
