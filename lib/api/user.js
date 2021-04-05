import sendRequest from "./sendRequest";
const BASE_PATH = "/api/v1/user";

export const getSubscription = () =>
  sendRequest(`${BASE_PATH}/get-subscription`, {});

export const getSubscriptionFromId = ({ subscriptionId }) =>
  sendRequest(`${BASE_PATH}/get-subscription-from-id`, {
    body: JSON.stringify({ subscriptionId })
  });

export const getSubscriptionDelivery = () =>
  sendRequest(`${BASE_PATH}/get-subscription-delivery`, {});

export const updateSubscriptionChild = ({ childData, subscriptionId }) =>
  sendRequest(`${BASE_PATH}/update-subscription-child`, {
    body: JSON.stringify({ childData, subscriptionId })
  });

export const updateSubscriptionAddress = ({ addressData, subscriptionId }) =>
  sendRequest(`${BASE_PATH}/update-subscription-address`, {
    body: JSON.stringify({ addressData, subscriptionId })
  });

export const cancelSubscription = ({ subscriptionId }) =>
  sendRequest(`${BASE_PATH}/cancel-subscription`, {
    body: JSON.stringify({ subscriptionId })
  });

export const postponeSubscription = ({ subscriptionId }) =>
  sendRequest(`${BASE_PATH}/postpone-subscription`, {
    body: JSON.stringify({ subscriptionId })
  });

export const updateSubscriptionLineAndPeriod = ({
  planSelected,
  subscriptionId
}) =>
  sendRequest(`${BASE_PATH}/update-subscription-line-and-period`, {
    body: JSON.stringify({ planSelected, subscriptionId })
  });

export const getMyAccountInfo = () =>
  sendRequest(`${BASE_PATH}/get-my-account-info`, {});

export const submitChangePassword = ({
  newPassword,
  currentPassword,
  newPasswordConfirm
}) =>
  sendRequest(`${BASE_PATH}/submit-change-password`, {
    body: JSON.stringify({ newPassword, currentPassword, newPasswordConfirm })
  });

export const submitChangeName = ({ name }) =>
  sendRequest(`${BASE_PATH}/submit-change-name`, {
    body: JSON.stringify({ name })
  });

export const submitChangeCreditCard = ({ stripeTokenId }) =>
  sendRequest(`${BASE_PATH}/submit-change-credit-card`, {
    body: JSON.stringify({ stripeTokenId })
  });

export const deleteMyAddress = ({ index }) =>
  sendRequest(`${BASE_PATH}/delete-my-address`, {
    body: JSON.stringify({ index })
  });

export const deleteMyCreditCard = () =>
  sendRequest(`${BASE_PATH}/delete-my-credit-card`, {});

export const getSessionMessage = ({ pageName }) =>
  sendRequest(`${BASE_PATH}/get-session-message`, {
    body: JSON.stringify({ pageName })
  });

export const getPurchaseOrder = ({ pageNum = 1 }) =>
  sendRequest(`${BASE_PATH}/get-purchase-order`, {
    body: JSON.stringify({ pageNum })
  });

export const getPurchaseOrderDetail = ({ orderId }) =>
  sendRequest(`${BASE_PATH}/get-purchase-order-detail`, {
    body: JSON.stringify({ orderId })
  });

export const getMyDeliveryByOrderId = ({ orderId }) =>
  sendRequest(`${BASE_PATH}/get-my-delivery-by-order-id`, {
    body: JSON.stringify({ orderId })
  });

export const getMyReferral = () =>
  sendRequest(`${BASE_PATH}/get-my-referral`, {});

export const redeemGiftCard = ({ code }) =>
  sendRequest(`${BASE_PATH}/redeem-gift-card`, {
    body: JSON.stringify({ code })
  });

export const getMyCredit = () => sendRequest(`${BASE_PATH}/get-my-credit`, {});

export const getMyGiftInfo = () =>
  sendRequest(`${BASE_PATH}/get-my-gift-info`, {});

export const claimGift = ({ deliveryAddress }) =>
  sendRequest(`${BASE_PATH}/claim-gift`, {
    body: JSON.stringify({ deliveryAddress })
  });
