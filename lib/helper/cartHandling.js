//checked 2019-06-03
function getFinalPrice({ cart, coupon, referral, user, deliverCourier }) {
  //console.log(deliverCourier);
  let result = {
    cart: 0,
    total: 0,
    creditDeduct: 0,
    deliverPriceTotal: 0,
    couponDiscount: 0,
    stopSubscriptionDiscount: 0,
    bundleDeliverPrice: 0,
  };
  let giftCardTotal = 0;
  const subDiscount = { 3: 50, 6: 100, 12: 150 };
  const deliverPrice = deliverCourier ? deliverCourier.price : 0;
  const bundlePrice = {
    "3":
      deliverCourier && deliverCourier.bundle3
        ? deliverCourier.bundle3
        : deliverPrice,
    "6":
      deliverCourier && deliverCourier.bundle6
        ? deliverCourier.bundle6
        : deliverPrice,
    "12":
      deliverCourier && deliverCourier.bundle12
        ? deliverCourier.bundle12
        : deliverPrice,
  };
  if (cart) {
    cart.map((productInfo) => {
      let price =
        (productInfo.product.data.price - productInfo.product.data.discount) *
        productInfo.product.qty;

      //stopSubscriptionDiscount
      if (
        productInfo.product.data.productType == 1 &&
        productInfo.product.stopSubscriptionDiscount &&
        productInfo.product.idRenew
      ) {
        result.stopSubscriptionDiscount +=
          subDiscount[productInfo.product.data.detail.select];
      }

      result.cart += price;
      result.total += price;
      if (deliverPrice && productInfo.product.data.productType == 0) {
        const deliverTotal = deliverPrice * productInfo.product.qty;
        result.deliverPriceTotal += deliverTotal;
      }
      if (deliverPrice && productInfo.product.data.productType == 1) {
        const deliverTotal =
          deliverPrice *
          productInfo.product.qty *
          productInfo.product.data.detail.select;
        result.deliverPriceTotal += deliverTotal;
      }
      if (productInfo.product.data.productType == 2) {
        giftCardTotal += price;
      }
      if (deliverPrice && productInfo.product.data.productType == 4) {
        const deliverTotal =
          bundlePrice[productInfo.product.data.detail.select] *
          productInfo.product.qty *
          productInfo.product.data.detail.select;
        result.deliverPriceTotal += deliverTotal;
        const bundleDeliverPrice =
          bundlePrice[productInfo.product.data.detail.select] *
          productInfo.product.qty *
          productInfo.product.data.detail.select;
        result.bundleDeliverPrice += bundleDeliverPrice;
      }
    });
  }
  //coupon discount
  if (coupon) {
    result.total -= coupon.discount;
    result.couponDiscount += parseFloat(coupon.discount);
  }

  if (result.stopSubscriptionDiscount) {
    result.total -= result.stopSubscriptionDiscount;
  }

  //referral discount - member 1st purchase
  if (referral && !referral.error) {
    result.total -= referral.discount;
  }
  // deliver price
  result.total += result.deliverPriceTotal;
  //free shipping
  if (coupon && coupon.detail.freeShipping == true) {
    //const deliverTotal = result.deliverPriceTotal;
    result.total -= result.deliverPriceTotal;
    //result.deliverPriceTotal = 0;
    result.couponDiscount += parseFloat(result.deliverPriceTotal);
  }
  //member credit account auto deduction
  if (user && user.creditAccount > 0) {
    if (user.creditAccount > result.total - giftCardTotal) {
      result.creditDeduct = result.total - giftCardTotal;
      result.total = giftCardTotal;
    } else {
      result.total -= user.creditAccount;
      result.creditDeduct = user.creditAccount;
    }
  }
  return result;
}

module.exports = {
  getFinalPrice,
};
