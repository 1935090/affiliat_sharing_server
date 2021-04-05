const Cart = require("../models/Cart");
const User = require("../models/User");
const Coupon = require("../models/Coupon");
const Moment = require("moment");

//checked 2019-06-03
async function setCoupon({ req, res, codeByServer }) {
  let code = null;

  if (req.body.code) {
    code = req.body.code;
  } else {
    code = codeByServer;
  }

  if (!code) {
    return {
      message: "Please input coupon code.",
      type: "error"
    };
  }

  delete req.session.coupon;
  let result = { message: "", type: "error" };
  let user = null;
  let cart = null;
  let coupon = null;
  if (req.session.user) {
    //user = await User.findById(req.session.user._id);
    const userArray = await User.getUserCouponDetail({
      userId: req.session.user._id,
      couponCode: code
    });
    user = userArray[0];
  }
  if (req.session.cartId) {
    const cartObj = await Cart.findById(req.session.cartId);
    cart = cartObj.cart;
  }
  coupon = await Coupon.findOne({
    code,
    "validPeriod.start": { $lte: Moment() },
    "validPeriod.end": { $gte: Moment() },
    disabled: 0,
    deleted: 0
  });
  //coupon code invalid or expired
  if (!coupon) {
    return {
      message: "Coupon code is invalid / Coupon has expired.",
      type: "error"
    };
  }
  //need to be member to use coupon
  if (coupon.applyToCustomerGroup.groupType != "All Customer" && !user) {
    return {
      message: "Please login to use coupon.",
      type: "error"
    };
  }
  //coupon has used up
  if (coupon.totalAvailable <= 0 && coupon.totalAvailable !== null) {
    return {
      message: "Coupon is not available as it reached maximum usage.",
      type: "error"
    };
  }
  //each user limit use
  if (
    user &&
    coupon.usagePerUser &&
    user.couponOrders &&
    user.couponOrders.count >= coupon.usagePerUser
  ) {
    return {
      message: "You have reached maximum time of using this coupon.",
      type: "error"
    };
  }

  switch (coupon.applyToCustomerGroup.groupType) {
    case "All Customer":
      break;
    case "No Subscription":
      if (user.subscriptions && user.subscriptions.count > 0) {
        return {
          message: "Coupon is not available.",
          type: "error"
        };
      }
      break;
    case "No Order":
      if (user.orders && user.orders.count > 0) {
        return {
          message: "Coupon is not available.",
          type: "error"
        };
      }
      break;
    case "One Customer":
      if (String(user._id) != String(coupon.applyToCustomerGroup.user)) {
        return {
          message: "Coupon is not available.",
          type: "error"
        };
      }
      break;
  }

  let cartDetail = {
    cart: { qty: 0, totalAmount: 0 },
    productsNoDiscount: { qty: 0, totalAmount: 0 },
    productsDiscounted: { qty: 0, totalAmount: 0 },
    subscriptions: { qty: 0, totalAmount: 0 },
    subscriptionsFirstMonth: { qty: 0, totalAmount: 0 },
    subscriptionsOver3FirstMonth: { qty: 0, totalAmount: 0 },
    specific: {}
  };
  for (let i = 0; i < cart.length; i++) {
    const product = cart[i].product.data;
    const amount = product.price - product.discount;
    const qty = cart[i].product.qty;
    const total = amount * qty;
    const productType = product.productType;
    //cart
    if (productType === 0 || productType === 1 || productType === 4) {
      cartDetail.cart.qty += qty;
      cartDetail.cart.totalAmount += total;
    }
    //products
    if (productType === 0) {
      if (product.discount > 0) {
        cartDetail.productsDiscounted.qty += qty;
        cartDetail.productsDiscounted.totalAmount += total;
      } else {
        cartDetail.productsNoDiscount.qty += qty;
        cartDetail.productsNoDiscount.totalAmount += total;
      }
    }
    //subscriptions
    else if (productType === 1 && cart[i].product.subscription == true) {
      cartDetail.subscriptions.qty += qty;
      cartDetail.subscriptions.totalAmount += total;
      const totalMonth = cart[i].product.data.detail.select;
      cartDetail.subscriptionsFirstMonth.qty += qty;
      cartDetail.subscriptionsFirstMonth.totalAmount += total / totalMonth;
      if (cart[i].product.data.detail.select >= 3) {
        cartDetail.subscriptionsOver3FirstMonth.qty += qty;
        cartDetail.subscriptionsOver3FirstMonth.totalAmount +=
          total / totalMonth;
      }
    }
    //specific
    if (typeof cartDetail.specific[product._id] == "undefined") {
      cartDetail.specific[product._id] = {
        qty,
        totalAmount: total,
        discounted: product.discount > 0 ? true : false
      };
    } else {
      cartDetail.specific[product._id].qty += qty;
      cartDetail.specific[product._id].totalAmount += total;
    }
  }

  //minimun purchase is not meet
  if (cartDetail.cart.totalAmount < coupon.minimumPurchase) {
    return {
      message:
        "Minimum purchase required for this coupon is $" +
        coupon.minimumPurchase +
        ".",
      type: "error"
    };
  }

  switch (coupon.matchCart.contain) {
    case "Any item":
      break;
    case "Products":
      if (
        cartDetail.productsNoDiscount.qty == 0 &&
        cartDetail.productsDiscounted.qty == 0
      ) {
        return {
          message: "Need to have least one product in cart.",
          type: "error"
        };
      }
      break;
    case "Subscriptions":
      if (cartDetail.subscriptions.qty == 0) {
        return {
          message: "Need to have least one subscription in cart.",
          type: "error"
        };
      }
      break;
    case "Specific":
      let containsSpecific = false;
      for (let i = 0; i < coupon.matchCart.products.length; i++) {
        if (
          typeof cartDetail.specific[coupon.matchCart.products[i]] !==
          "undefined"
        ) {
          containsSpecific = true;
          break;
        }
      }
      if (!containsSpecific) {
        return {
          message: "Need to have specific product in cart.",
          type: "error"
        };
      }
      break;
  }

  let couponObj = { detail: coupon, discount: 0 };
  if (coupon.applyDiscount.discountType == "amount") {
    couponObj.discount = coupon.applyDiscount.amount;
  } else if (coupon.applyDiscount.discountType == "percentage") {
    switch (coupon.applyTo.applyType) {
      case "Cart":
        if (coupon.excludeDiscounted == true) {
          couponObj.discount =
            cartDetail.cart.totalAmount * coupon.applyDiscount.amount * 0.01 -
            cartDetail.productsDiscounted.totalAmount *
              coupon.applyDiscount.amount *
              0.01;
        } else {
          couponObj.discount =
            cartDetail.cart.totalAmount * coupon.applyDiscount.amount * 0.01;
        }
        break;
      case "Products":
        if (coupon.excludeDiscounted == true) {
          couponObj.discount =
            cartDetail.productsNoDiscount.totalAmount *
            coupon.applyDiscount.amount *
            0.01;
        } else {
          couponObj.discount =
            cartDetail.productsNoDiscount.totalAmount *
              coupon.applyDiscount.amount *
              0.01 +
            cartDetail.productsDiscounted.totalAmount *
              coupon.applyDiscount.amount *
              0.01;
        }
        break;
      case "Subscriptions":
        couponObj.discount =
          cartDetail.subscriptionsFirstMonth.totalAmount *
          coupon.applyDiscount.amount *
          0.01;
        //hardcode 100% discount apply to sub 3 months or above
        if (coupon.applyDiscount.amount == 100) {
          couponObj.discount =
            cartDetail.subscriptionsOver3FirstMonth.totalAmount *
            coupon.applyDiscount.amount *
            0.01;
        }
        break;
      case "Specific":
        for (let i = 0; i < coupon.applyTo.products.length; i++) {
          if (
            typeof cartDetail.specific[coupon.applyTo.products[i]] !==
            "undefined"
          ) {
            if (coupon.excludeDiscounted == true) {
              if (
                cartDetail.specific[coupon.applyTo.products[i]].discounted ==
                false
              ) {
                couponObj.discount +=
                  cartDetail.specific[coupon.applyTo.products[i]].totalAmount *
                  coupon.applyDiscount.amount *
                  0.01;
              }
            } else {
              couponObj.discount +=
                cartDetail.specific[coupon.applyTo.products[i]].totalAmount *
                coupon.applyDiscount.amount *
                0.01;
            }
          }
        }
        break;
    }
  }

  if (couponObj.discount == 0 && couponObj.freeShipping == false) {
    return {
      message: "Coupon is not applicable to your cart.",
      type: "error"
    };
  }

  couponObj.discount = couponObj.discount.toFixed(2);
  req.session.coupon = couponObj;

  result = {
    message: couponObj,
    user: user,
    type: "success"
  };

  return result;
}

module.exports = {
  setCoupon
};
