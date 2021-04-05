const express = require("express");
const RegisterLog = require("../models/RegisterLog");
const User = require("../models/User");
const Order = require("../models/Order");
const Subscription = require("../models/Subscription");
const Delivery = require("../models/Delivery");
const Category = require("../models/Category");
const Admin = require("../models/Admin");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Tracking = require("../models/Tracking");
const Coupon = require("../models/Coupon");
const CreditLog = require("../models/CreditLog");
const ForgetPassword = require("../models/ForgetPassword");
const CustomerComment = require("../models/CustomerComment");
const Courier = require("../models/Courier");
const WebsiteText = require("../models/WebsiteText");
const Currency = require("../models/Currency");
const Setting = require("../models/Setting");
const GiftCard = require("../models/GiftCard");
import { nanoid } from 'nanoid'
//const Moment = require("moment");

//const Item = require("../models/Item";
//const TeacherSchedule = require("../models/TeacherSchedule";
//const ParentBooking = require("../models/ParentBooking";
const {
  stripeCharge,
  stripeCustomerCreate,
  stripeCustomerCharge,
  //stripeSourceCreateWechat,
  getStripePublicKey,
} = require("../helper/stripe");
const { sendMail } = require("../helper/mail");
const {
  getGRecaptchaPublicKey,
  verifyGRecaptcha,
} = require("../helper/grecaptcha");
const { setCoupon } = require("../helper/coupon");
const { mergeCartAndUpdateTracking } = require("../helper/cart");
const { getFinalPrice } = require("../../lib/helper/cartHandling");
const Moment = require("moment");

const router = express.Router();

//checked 2019-06-03
router.post("/add-to-cart", async (req, res) => {
  try {
    let productInfoFromUser = req.body.productInfo;
    let data = await Product.findById(productInfoFromUser.product.data._id)
      .populate("category thumbnail.upload")
      .lean();
    if (data) {
      //if is gift card, then set value to customer's purchase card value
      if (data.productType == 2) {
        data.price = productInfoFromUser.mail.giftCardAmount;
      }
      if (data.productType == 4) {
        data.detail.bundleProduct =
          productInfoFromUser.product.data.detail.bundleProduct;
      }
      productInfoFromUser.product.data = data;
      const productInfo = productInfoFromUser;
      let cart = [];
      if (!req.session.cartId) {
        cart.push(productInfo);
        let newCart = null;
        if (req.session.user) {
          newCart = await Cart.findOrCreateCart({
            userId: req.session.user._id,
          });
        } else {
          newCart = await Cart.createCartForVisitor();
        }
        if (newCart) req.session.cartId = newCart._id;
      } else {
        const cartObj = await Cart.findById(req.session.cartId);
        if (cartObj && cartObj.status == "pending") {
          cart = cartObj.cart;
        } else {
          let newCart = null;
          if (req.session.user) {
            newCart = await Cart.findOrCreateCart({
              userId: req.session.user._id,
            });
          } else {
            newCart = await Cart.createCartForVisitor();
          }
          if (newCart) req.session.cartId = newCart._id;
        }
        //cart = cartObj.cart;
        let newInCart = false;
        for (let i = 0; i < cart.length; i++) {
          if (
            cart[i].product.data.productType === 0 &&
            String(cart[i].product.data._id) ==
            String(productInfo.product.data._id)
          ) {
            cart[i].product.qty += productInfo.product.qty;
            newInCart = true;
            break;
          }
        }
        if (!newInCart) {
          cart.push(productInfo);
        }
      }
      const updateCart = await Cart.updateCart({
        cartId: req.session.cartId,
        cart,
      });
      if (updateCart) {
        res.json({ type: "success" });
      } else {
        res.json({
          message:
            "Items in this cart has been paid. We have emptied the cart.",
          type: "error",
        });
      }
    }
  } catch (err) {
    //res.json({ error: err.message || err.toString() });
  }
});

//checked 2019-06-03
router.post("/get-cart", async (req, res) => {
  try {
    var result = {};
    if (!req.session.cartId) {
      result = { type: "no item" };
    } else {
      const cartObj = await Cart.findById(req.session.cartId);
      let cart = [];
      let coupon = null;
      if (cartObj && cartObj.status == "pending") {
        cart = cartObj.cart;
        coupon = cartObj.coupon;
      }
      result = { message: cart, coupon, type: "success" };
    }
    res.json(result);
  } catch (err) {
    //res.json({ error: err.message || err.toString() });
  }
});

//checked 2019-06-03
router.post("/get-cart-address", async (req, res) => {
  try {
    var result = {};
    if (!req.session.cartAddress) {
      result = { type: "no address" };
    } else {
      var cartAddress = req.session.cartAddress;
      result = { message: cartAddress, type: "success" };
    }
    res.json(result);
  } catch (err) {
    //res.json({ error: err.message || err.toString() });
  }
});

//checked 2019-06-03
router.post("/get-courier-by-country", async (req, res) => {
  try {
    var result = { type: "error" };
    const { country } = req.body;
    const courierList = await Courier.getCourierByCountry({ country });
    if (courierList) {
      result = { message: courierList, type: "success" };
    }
    res.json(result);
  } catch (err) {
    //res.json({ error: err.message || err.toString() });
  }
});

//checked 2019-06-03
router.post("/get-courier-all", async (req, res) => {
  try {
    var result = { type: "error" };
    const courierList = await Courier.find({ disabled: 0, deleted: 0 });
    if (courierList) {
      result = { message: courierList, type: "success" };
    }
    res.json(result);
  } catch (err) {
    //res.json({ error: err.message || err.toString() });
  }
});

//checked 2019-06-03
router.post("/remove-from-cart", async (req, res) => {
  try {
    var result = {};
    const { index } = req.body;
    let cart = [];
    if (!req.session.cartId) {
      result = { type: "no item" };
    } else {
      const cartObj = await Cart.findById(req.session.cartId);
      if (cartObj.status == "pending") {
        cart = cartObj.cart;
        let qty = cart[index].product.qty;
        cart.splice(index, 1);
        result = { message: cart, type: "success", qty };
      } else {
        let newCart = null;
        if (req.session.user) {
          newCart = await Cart.findOrCreateCart({
            userId: req.session.user._id,
          });
        } else {
          newCart = await Cart.createCartForVisitor();
        }
        if (newCart) req.session.cartId = newCart._id;
        result = { message: cart, type: "success", qty: null };
      }
    }
    const updateCart = await Cart.updateCart({
      cartId: req.session.cartId,
      cart,
    });
    if (updateCart) {
      res.json(result);
    } else {
      res.json({
        message: "Items in this cart has been paid. We have emptied the cart.",
        type: "error",
      });
    }
  } catch (err) {
    //res.json({ error: err.message || err.toString() });
  }
});

//checked 2019-06-03
router.post("/change-period-from-cart", async (req, res) => {
  try {
    var result = {};
    const { index, arrayKey } = req.body;
    if (!req.session.cartId) {
      result = { type: "no item" };
    } else {
      const cartObj = await Cart.findById(req.session.cartId);
      var cart = cartObj.cart;
      //cart[index]["selectedPeriod"] = period;
      let product = cart[index].product;
      product.arrayKey = arrayKey;
      product.data = product.otherPlans[arrayKey];
      product.data.category = await Category.findById(product.data.category);
      cart[index].product = product;
      result = { message: cart, type: "success" };
    }
    const updateCart = await Cart.updateCart({
      cartId: req.session.cartId,
      cart,
    });
    if (updateCart) {
      res.json(result);
    } else {
      res.json({
        message: "Items in this cart has been paid. We have emptied the cart.",
        type: "error",
      });
    }
    //res.json(result);
    //var result = { message: "請再嘗試", type: "error" };
    //res.json(result);
  } catch (err) {
    //res.json({ error: err.message || err.toString() });
  }
});

//checked 2019-06-03
router.post("/save-cart-address", async (req, res) => {
  try {
    const {
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
      courier,
      addressType,
      sfLocker,
      idno,
    } = req.body;
    req.session.cartAddress = {
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
      courier,
      addressType,
      sfLocker,
      idno,
    };
    var result = { type: "success" };
    res.json(result);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//checked 2019-06-03
router.post("/submit-payment", async (req, res) => {
  try {
    let totalAmount = 0;
    let subtotal = 0;
    let haveSubscription = false;
    const user = await User.findById(req.session.user._id);
    let stripeChargeResult = null;
    let creditChargeResult = {};
    let customer = null;
    const { stripeTokenId, paymentType } = req.body;
    const cartObj = await Cart.findById(req.session.cartId);
    const cart = cartObj.cart;
    let creditDeduct = 0;
    let stopSubscriptionDiscount = 0;
    let courier = null;
    let deliverPrice = 0;
    let shipping = {};
    //let giftCardTotal = 0;

    const couponCheck = await setCoupon({
      req,
      res,
      codeByServer: req.session.coupon ? req.session.coupon.detail.code : null,
    });
    const coupon = couponCheck.type == "success" ? couponCheck.message : null;

    const referralCheck = await setReferral({
      req,
      res,
    });
    const referral =
      referralCheck.type == "success" ? referralCheck.message : null;

    if (req.session.cartAddress.courier) {
      courier = await Courier.findById(req.session.cartAddress.courier);
      if (courier) {
        deliverPrice = courier.price;
      } else {
        res.json({ message: "Need shipping method", type: "error" });
      }
      delete req.session.cartAddress.courier;
    } else {
      courier = await Courier.findOne({
        country: "Hong Kong",
        name: "SF Express",
        disabled: 0,
        deleted: 0,
      });
      if (courier) {
        deliverPrice = courier.price;
      } else {
        res.json({ message: "Need shipping method", type: "error" });
      }
    }

    const priceObj = getFinalPrice({
      cart,
      coupon,
      referral,
      user,
      deliverCourier: courier,
      //deliverPrice,
    });

    //add free shipping coupon discount to order
    if (coupon) {
      coupon.discount = priceObj.couponDiscount;
    }

    shipping = {
      courier,
      deliverPriceTotal: priceObj.deliverPriceTotal,
    };
    subtotal = Math.ceil(priceObj.cart * 100);
    totalAmount = Math.ceil(priceObj.total * 100);
    creditDeduct = Math.ceil(priceObj.creditDeduct);
    stopSubscriptionDiscount = Math.ceil(priceObj.stopSubscriptionDiscount);

    //totalAmount
    for (var i = 0; i < cart.length; i++) {
      const productInfo = cart[i];
      /*const pricePer =
        (productInfo.product.data.price - productInfo.product.data.discount) *
        productInfo.product.qty *
        100;
      totalAmount += pricePer;
      if (productInfo.product.data.productType == 2) {
        giftCardTotal += pricePer;
      }*/
      if (
        productInfo.product.data.productType == 1 &&
        (paymentType == "stripeCreditCard" ||
          paymentType == "stripeSavedCreditCard")
      ) {
        haveSubscription = true;
        //productInfo.product.subscription = true;
      }

      //add buyer email to gift card
      if (productInfo.product.data.productType == 2) {
        cart[i].mail.giverEmail = user.email;
      }
    }

    /*
    //subtotal
    subtotal = totalAmount;

    //coupon discount
    if (coupon) {
      totalAmount -= coupon.discount * 100;
    }

    //referral discount
    if (referral) {
      if (referral.discountType == "amount")
        totalAmount -= referral.discount * 100;
    }

    //member credit account auto deduction
    if (user && user.creditAccount > 0) {
      if (user.creditAccount * 100 > totalAmount - giftCardTotal) {
        creditDeduct = totalAmount * 0.01 - giftCardTotal * 0.01;
        totalAmount = giftCardTotal;
      } else {
        totalAmount -= user.creditAccount * 100;
        creditDeduct = user.creditAccount;
      }
    }
    */

    //Stripe min-pay is 2.35 HKD
    if (totalAmount < 300) {
      totalAmount = 0;
    }

    if (totalAmount > 0) {
      //Charge through Stripe
      if (paymentType == "stripeWeChat") {
        stripeChargeResult = await stripeCharge({
          amount: totalAmount,
          stripeTokenId,
          description: "TinkererBoxSite客户付款-wechatPay",
        });
      } else if (paymentType == "stripeCreditCard") {
        customer = await stripeCustomerCreate({
          description: "TinkererBoxSite客户",
          stripeTokenId,
          email: req.session.user.email,
          phone: req.session.user.mobile,
        });
        if (customer && customer.id) {
          await User.findByIdAndUpdate(user._id, {
            stripeCustomer: {
              id: customer.id,
              brand: customer.sources.data[0].brand,
              last4: customer.sources.data[0].last4,
            },
          });
          stripeChargeResult = await stripeCustomerCharge({
            amount: totalAmount,
            customerId: customer.id,
            description: "TinkererBoxSite客户付款-creditCard",
          });
        } else {
          res.json({ message: "建立会员付款失败", type: "error" });
        }
      } else if (paymentType == "stripeSavedCreditCard") {
        stripeChargeResult = await stripeCustomerCharge({
          amount: totalAmount,
          customerId: user.stripeCustomer.id,
          description: "TinkererBoxSite客户付款-creditCard",
        });
      }
    } else if (totalAmount === 0 && creditDeduct > 0) {
      creditChargeResult.status = "succeeded";
    }

    //Process order if payment succeed
    if (
      (stripeChargeResult && stripeChargeResult.status == "succeeded") ||
      creditChargeResult.status == "succeeded"
    ) {
      //generate gift card code if purchased.
      for (let i = 0; i < cart.length; i++) {
        if (cart[i].product.data.productType == 2) {
          const result = await GiftCard.saveGiftCard({
            userId: user._id,
            mail: cart[i].mail,
          });
          if (result) {
            cart[i].giftCard = result._id;
          }
        }
      }

      const order = await Order.saveOrder({
        userId: user._id,
        items: cart,
        stripeCharge: stripeChargeResult,
        totalAmount,
        subtotal,
        isServerAutoTransaction: false,
        coupon,
        referral,
        creditDeduct,
        orderIp: req.header("x-forwarded-for") || req.connection.remoteAddress,
        shipping,
        marketingIds: req.session.marketingIds,
        stopSubscriptionDiscount,
      });

      if (creditDeduct > 0) {
        const creditLog = await User.changeCredit({
          userId: user._id,
          credit: -creditDeduct,
          creditType: "orderPayment",
          detail: { order: order._id },
          reason: "Order Payment - " + order.id,
        });
      }

      if (coupon && coupon.detail.totalAvailable !== null) {
        const updateCoupon = await Coupon.updateTotalAvailable({
          code: coupon.detail.code,
        });
      }

      const updateUserAddress = await User.setAddress({
        userId: user._id,
        deliveryAddress: req.session.cartAddress,
      });

      if (order && haveSubscription) {
        const subscription = await Subscription.saveSubscription({
          userId: user._id,
          orderId: order._id,
          itemsArray: cart,
          deliveryAddress: req.session.cartAddress,
          courier,
        });
      }

      if (order) {
        const delivery = await Delivery.saveDelivery({
          userId: user._id,
          orderId: order._id,
          itemsArray: cart,
          deliveryAddress: req.session.cartAddress,
          courier,
        });
      }

      //Member referral
      if (referral && referral.discount !== 0) {
        if (referral.referralType == "memberRef") {
          const referrer = await User.findOne({
            "referral.id": referral.id,
          });
          if (referrer) {
            await User.changeCredit({
              userId: referrer._id,
              credit: referral.discount,
              creditType: "memberRef",
              detail: {
                order: order._id,
                user: user._id,
              },
              reason: "Member Referral",
            });
          }
        }
      }

      /*req.session.message["account"] = {
        message: "Payment success - Box will proceed to deliver.",
        type: "success"
      };*/

      var result = {
        message: "付款成功",
        type: "success",
        orderId: order.id,
      };

      if (user.email) {
        order.username = user.name;
        sendMail({
          userId: user._id,
          to: user.email,
          order,
          type: 1,
          priceObj,
        });
      }

      if (req.session.cartId) {
        const newCart = await Cart.updateCartStatus({
          cartId: req.session.cartId,
          status: "Paid",
        });
        req.session.cartId = newCart._id;
      }

      delete req.session.cartAddress;
      delete req.session.coupon;
      delete req.session.referral;
      delete req.session.marketingIds;

      res.json(result);
    } else {
      res.json({ message: "Payment error. Please try again.", type: "error" });
    }
  } catch (err) {
    //console.log(err);
    const message = err.raw
      ? err.raw.message
      : "Error ,please refresh the page and try again. If problem still exists, contact us.";
    res.json({ message, type: "error" });
    //res.status(500).end();
  }
});

router.post("/submit-mobile-registration", async (req, res) => {
  try {
    var result = "";
    const { mobileNumberReg, mobileNumberPrefixReg } = req.body;
    result = await RegisterLog.createMobileRegister({
      mobileNumberReg,
      mobileNumberPrefixReg,
    });
    res.json(result);
  } catch (err) {
    res.status(500).end();
  }
});

//checked 2019-06-03
router.post("/submit-email-registration", async (req, res) => {
  try {
    let result = null;
    const { emailReg, passwordReg } = req.body;
    if (verfiedGRecaptcha) {
      if (req.session.cartId) {
        newCartLink = req.session.cartId;
      }

      const otherInfo = {
        redirect,
        cartId: newCartLink,
        trackId: req.session.trackId,
      };
      result = await RegisterLog.createEmailRegister({
        emailReg,
        passwordReg,
        otherInfo,
      });

      const referralId = req.session.referral ? req.session.referral.id : 0;
    }

    res.json(result);
  } catch (err) {
    //console.log(err);
    res.status(500).end();
  }
});

router.post("/submit-mobile-authentication", async (req, res) => {
  try {
    var result = "";
    const {
      mobileAuthenticationCode,
      mobileNumberReg,
      mobileNumberPrefixReg,
      mobilePasswordReg,
    } = req.body;
    result = await RegisterLog.authenticateMobile({
      mobileAuthenticationCode,
      mobileNumberReg,
      mobileNumberPrefixReg,
      mobilePasswordReg,
    });
    if (result) res.json(result);
  } catch (err) {
    res.status(500).end();
  }
});

//checked 2019-06-03
router.post("/signin", async (req, res) => {
  try {
    const { mobile, password, mobilePrefix, email, grecaptchaValue } = req.body;
    let user = null;
    if (mobile) {
      user = await User.findOne({
        mobile,
        password,
        mobilePrefix,
      });
    } else if (email) {
      user = await User.signInEmail({
        email,
        password,
      });
    }
    var result = {
      message: "Login failed, email / password incorrect.",
      type: "error",
    };
    const verfiedGRecaptcha = await verifyGRecaptcha({ grecaptchaValue });
    if (user && verfiedGRecaptcha) {
      if (user.disabled || user.deleted) {
        result = { message: "This account has been banned.", type: "error" };
      } else {
        req.user = user;
        user.mobile = user.mobile ? user.mobile.substring(0, 3) : "";
        req.session.user = user;
        await mergeCartAndUpdateTracking({ req });

        result = {
          //message: user,
          type: "success",
          userGroup: user.userGroup,
        };
      }
    }
    res.json(result);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//checked 2019-06-03
router.post("/signout", async (req, res) => {
  try {
    let result = { type: "error" };
    const currency = req.session.currency;
    if (req.session.user) {
      req.session.destroy();
      res.clearCookie("sealtech_steam");
      result = { type: "success" };
    }
    res.redirect("/?currency=" + currency.iso);
    //res.json(result);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//checked 2019-06-03
router.post("/get-category-subscription-plan", async (req, res) => {
  try {
    var result = {};
    result = await Category.getSubscriptionPlan();
    res.json(result);
  } catch (err) {
    //res.json({ error: err.message || err.toString() });
  }
});

//checked 2019-06-03
router.post("/get-my-children", async (req, res) => {
  try {
    let result = null;
    if (req.session.user)
      result = await User.getMyChildren({
        userId: req.session.user._id,
      });
    res.json({ message: result });
  } catch (err) {
    //res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-stripe-source-wechat", async (req, res) => {
  /*try {
    let source = null;
    var totalAmount = 0;
    var haveSubscription = false;
    const cartObj = await Cart.findbyid(req.session.cartId);
    let cart = cartObj.cart;
    for (var i = 0; i < cart.length; i++) {
      const productInfo = cart[i];
      const pricePer =
        (productInfo.product.data.price - productInfo.product.data.discount) *
        productInfo.product.qty *
        100;
      totalAmount += pricePer;
      if (productInfo.product.subscription == true) haveSubscription = true;
    }
    source = await stripeSourceCreateWechat({
      amount: totalAmount,
      customerId: req.session.user._id
    });
    res.json(source);
  } catch (err) {
    //res.json({ error: err.message || err.toString() });
  }*/
});

//checked 2019-06-03
router.post("/get-product-list", async (req, res) => {
  try {
    const { pageNum } = req.body;
    const product = await Product.getProductList({ pageNum });
    var result = { message: "請再嘗試", type: "error" };
    if (product) {
      result = {
        message: product,
        type: "success",
      };
    }
    res.json(result);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//checked 2019-06-03
router.post("/get-product-detail", async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await Product.getProductDetail({ productId });
    var result = { message: "請再嘗試", type: "error" };
    if (product) {
      result = {
        message: product,
        type: "success",
      };
    }
    res.json(result);
  } catch (err) {
    //res.json({ error: err.message || err.toString() });
  }
});

//checked 2019-06-03
router.post("/get-session-message", async (req, res) => {
  try {
    const { link } = req.body;
    let result = { message: "", type: "" };
    if (req.session.message && req.session.message[link]) {
      result = req.session.message[link];
      delete req.session.message[link];
    }
    res.json(result);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//checked 2019-06-03
router.post("/get-stripe-publickey", async (req, res) => {
  try {
    const result = await getStripePublicKey();
    res.json(result);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//checked 2019-06-03
router.post("/get-grecaptcha-key", async (req, res) => {
  try {
    const result = await getGRecaptchaPublicKey();
    res.json(result);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//checked 2019-06-03
router.post("/get-user-list-sum-report", async (req, res) => {
  try {
    let result = { type: "error" };
    let userList = null;
    const { country } = req.body;
    if (country && country != "all") {
      userList = await User.find({ country })
        .select("email created_at")
        .sort({ created_at: -1 });
    } else if (country == "all") {
      userList = await User.aggregate([
        {
          $lookup: {
            from: "orders",
            localField: "_id",
            foreignField: "user",
            as: "order",
          },
        },
        {
          $unwind: "$order",
        },
        {
          $group: {
            _id: "$email",
            amount: { $sum: "$order.totalAmount" },
            created_at: { $first: "$created_at" },
            stripe: { $first: "$stripeCustomer" },
          },
        },
        {
          $sort: {
            created_at: -1,
          },
        },
      ]);
    }
    if (userList) {
      result = { message: userList, type: "success" };
    }
    res.json(result);
  } catch (err) {
    //res.json({ error: err.message || err.toString() });
  }
});

//checked 2019-06-03
router.post("/track-behavior", (req, res) => {
  try {
    const { event } = req.body;
    const userId = req.session.user ? req.session.user._id : null;
    if (!req.session.trackId)
      req.session.trackId = nanoid();
    const trackId = req.session.trackId;
    Tracking.trackBehavior({ event, userId, trackId });
    res.json({});
  } catch (err) {
    //res.json({});
  }
});

//checked 2019-06-03
router.post("/set-coupon", async (req, res) => {
  try {
    const result = await setCoupon({ req, res });
    res.json(result);
  } catch (err) {
    //console.log(err);
    res.json({ err });
  }
});

//checked 2019-06-03
router.post("/get-coupon", async (req, res) => {
  try {
    let result = { message: "", type: "error" };
    if (req.session.coupon) {
      result = await setCoupon({
        req,
        res,
        codeByServer: req.session.coupon.detail.code,
      });
      //result = { message: req.session.coupon, type: "success" };
    }
    res.json(result);
  } catch (err) {
    res.json({});
  }
});

//checked 2019-06-03
/*async function setReferral({ req, res }) {
  let result = { message: "", type: "error" };
  if (req.session.referral && !req.session.user) {
    req.session.referral.error = "Please login to get referral discount.";
  } else if (req.session.referral && req.session.user) {
    delete req.session.referral.error;
    if (req.session.referral.id != req.session.user.referral.id) {
      if (req.session.referral.referralType == "memberRef") {
        const user = req.session.user;
        const orderCheck = await Order.findOne({ user: user._id });
        const creditCheck = await CreditLog.findOne({
          detail: { user: user._id },
          creditType: "memberRef"
        });
        if (creditCheck || orderCheck) {
          delete req.session.referral;
        }
      }
    } else {
      delete req.session.referral;
    }
  }
  if (req.session.referral) {
    result = { message: req.session.referral, type: "success" };
  }
  return result;
}*/
async function setReferral({ req, res }) {
  let result = { message: "", type: "error" };
  if (req.session.referral) {
    delete req.session.referral.error;
    if (req.session.user)
      if (req.session.referral.id != req.session.user.referral.id) {
        if (
          req.session.referral.referralType == "memberRef" &&
          req.session.user
        ) {
          const user = req.session.user;
          const orderCheck = await Order.findOne({ user: user._id });
          const creditCheck = await CreditLog.findOne({
            detail: { user: user._id },
            creditType: "memberRef",
          });
          if (creditCheck || orderCheck) {
            delete req.session.referral;
          }
        }
      } else {
        delete req.session.referral;
      }
  }

  if (req.session.referral) {
    result = { message: req.session.referral, type: "success" };
  }
  return result;
}

//checked 2019-06-03
router.post("/get-referral", async (req, res) => {
  try {
    const result = await setReferral({ req, res });
    res.json(result);
  } catch (err) {
    //console.log(err);
    res.json({});
  }
});

//checked 2019-06-03
router.post("/get-gift-card", async (req, res) => {
  try {
    let result = { message: "", type: "error" };
    const giftCard = await Product.getGiftCard();
    if (giftCard) {
      result = { message: giftCard, type: "success" };
    }
    res.json(result);
  } catch (err) {
    //console.log(err);
    //res.json({});
  }
});

//checked 2019-06-03
router.post("/send-reset-password-mail", async (req, res) => {
  try {
    const { email } = req.body;
    let result = { message: "", type: "error" };
    if (email) {
      const user = await User.findOne({
        deleted: 0,
        disabled: 0,
        email,
        userGroup: 1,
        registerType: "email",
      });
      if (user) {
        const code =
          Moment().format("YYYYMMDD") +
          nanoid();
        const forgetPassword = await ForgetPassword.create({
          user: user._id,
          email: user.email,
          code,
        });
        if (forgetPassword) {
          sendMail({
            userId: user._id,
            to: user.email,
            link: `/reset-password/${code}`,
            type: 6,
          });
          result = { message: "", type: "success" };
        }
      }
    }
    res.json(result);
  } catch (err) {
    //res.json({});
  }
});

//checked 2019-06-03
router.post("/reset-password", async (req, res) => {
  try {
    const { email, password, code } = req.body;
    let result = { message: "", type: "error" };
    const resetRequest = await ForgetPassword.findOneAndUpdate(
      { email, code, resetComplete: 0 },
      { resetComplete: 1 }
    ).sort({ created_at: -1 });
    if (resetRequest) {
      result = { message: "", type: "success" };
      const resetPassword = await User.submitResetPassword({
        userId: resetRequest.user,
        newPassword: password,
      });
    }
    res.json(result);
  } catch (err) {
    //res.json({});
  }
});

//checked 2019-06-03
router.post("/submit-comment", async (req, res) => {
  try {
    const {
      rating,
      title,
      description,
      deliveryId,
      answer,
      feedbackSecret,
    } = req.body;
    //const userId = req.session.user._id;
    let result = { message: "", type: "error" };
    const delivery = await Delivery.findOne({
      _id: deliveryId,
      feedbackSecret,
    });
    if (delivery) {
      const upsertComment = await CustomerComment.createDeliveryComment({
        rating,
        title,
        description,
        deliveryId,
        answer,
      });
      if (upsertComment) {
        result = { message: "", type: "success" };
      }
    }
    res.json(result);
  } catch (err) {
    //res.json({});
  }
});

//checked 2019-06-03
router.post("/submit-subscription-comment", async (req, res) => {
  try {
    const { subscriptionId, feedbackSecret, subscriptionAnswer } = req.body;
    let result = { message: "", type: "error" };
    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      feedbackSecret,
    });
    if (subscription) {
      const upsertComment = await CustomerComment.createSubscriptionComment({
        subscriptionId: subscription._id,
        subscriptionAnswer,
      });
      if (upsertComment) {
        result = { message: "", type: "success" };
      }
    }
    res.json(result);
  } catch (err) {
    //res.json({});
  }
});

router.post("/get-delivery-comment", async (req, res) => {
  try {
    const { deliveryId, feedbackSecret } = req.body;
    let result = { message: "", type: "error" };
    const delivery = await Delivery.findOne(
      { id: deliveryId, feedbackSecret },
      "_id item"
    );
    const deliveryComment = await CustomerComment.findOne(
      {
        delivery: delivery._id,
      },
      "rating title description answer"
    );
    if (delivery) {
      result = { message: { delivery, deliveryComment }, type: "success" };
    }
    res.json(result);
  } catch (err) {
    //res.json({});
  }
});

router.post("/get-subscription-comment", async (req, res) => {
  try {
    const { subscriptionId, feedbackSecret } = req.body;
    let result = { message: "", type: "error" };
    const subscription = await Subscription.findOne(
      { _id: subscriptionId, feedbackSecret },
      "_id"
    );
    const subscriptionComment = await CustomerComment.findOne(
      {
        subscription: subscription._id,
      },
      "subscriptionAnswer"
    );
    if (subscription) {
      result = {
        message: { subscription, subscriptionComment },
        type: "success",
      };
    }
    res.json(result);
  } catch (err) {
    //res.json({});
  }
});

router.post("/get-sample-crate", async (req, res) => {
  try {
    let result = { message: "", type: "error" };
    const boxes = await Product.find({
      name: {
        $in: [
          "Wonder Sample Crate",
          "Odyssey Sample Crate",
          "Explore Sample Crate",
        ],
      },
    })
      .limit(3)
      .sort({ name: -1 })
      .populate([
        { path: "thumbnail.upload", select: "folder fileName.current" },
        { path: "images.upload", select: "folder fileName.current" },
        { path: "magazine.upload", select: "folder fileName.current" },
        { path: "instruction.upload", select: "folder fileName.current" },
        { path: "pullout.upload", select: "folder fileName.current" },
      ]);
    result = { message: boxes, type: "success" };
    res.json(result);
  } catch (err) {
    //res.json({});
  }
});

router.post("/get-box-wonder", async (req, res) => {
  try {
    let result = { message: "", type: "error" };
    const boxes = await Product.find({
      name: { $in: ["Music", "Under the Sea"] },
    })
      .limit(3)
      .populate([
        { path: "thumbnail.upload", select: "folder fileName.current" },
        { path: "images.upload", select: "folder fileName.current" },
        { path: "magazine.upload", select: "folder fileName.current" },
        { path: "instruction.upload", select: "folder fileName.current" },
        { path: "pullout.upload", select: "folder fileName.current" },
      ]);
    result = { message: boxes, type: "success" };
    res.json(result);
  } catch (err) {
    //res.json({});
  }
});

router.post("/get-box-odyssey", async (req, res) => {
  try {
    let result = { message: "", type: "error" };
    const boxes = await Product.find({
      name: { $in: ["Articulated Claw", "Anatomy"] },
    })
      .limit(3)
      .populate([
        { path: "thumbnail.upload", select: "folder fileName.current" },
        { path: "images.upload", select: "folder fileName.current" },
        { path: "magazine.upload", select: "folder fileName.current" },
        { path: "instruction.upload", select: "folder fileName.current" },
        { path: "pullout.upload", select: "folder fileName.current" },
      ]);
    result = { message: boxes, type: "success" };
    res.json(result);
  } catch (err) {
    //res.json({});
  }
});

router.post("/get-box-explorer", async (req, res) => {
  try {
    let result = { message: "", type: "error" };
    const boxes = await Product.find({
      name: { $in: ["Trebuchet", "Repeating Crossbow"] },
    })
      .limit(3)
      .populate([
        { path: "thumbnail.upload", select: "folder fileName.current" },
        { path: "images.upload", select: "folder fileName.current" },
        { path: "magazine.upload", select: "folder fileName.current" },
        { path: "instruction.upload", select: "folder fileName.current" },
        { path: "pullout.upload", select: "folder fileName.current" },
      ]);
    result = { message: boxes, type: "success" };
    res.json(result);
  } catch (err) {
    //res.json({});
  }
});

router.post("/get-website-text", async (req, res) => {
  try {
    let result = { message: "", type: "error" };
    const { title } = req.body;
    const websiteText = await WebsiteText.getWebsiteText({ title });
    if (websiteText) {
      result = { message: websiteText, type: "success" };
    }
    res.json(result);
  } catch (err) {
    //res.json({});
  }
});

router.post("/get-bundle-list", async (req, res) => {
  try {
    let result = { message: "", type: "error" };
    const bundleList = await Product.find({
      disabled: 0,
      deleted: 0,
      productType: 4,
    });
    if (bundleList) {
      result = { message: bundleList, type: "success" };
    }
    res.json(result);
  } catch (err) {
    //res.json({});
  }
});

router.post("/get-all-currency", async (req, res) => {
  try {
    let result = { message: "", type: "error" };
    const currency = await Currency.find({ deleted: 0, disabled: 0 });
    if (currency) {
      result = { message: currency, type: "success" };
    }
    res.json(result);
  } catch (err) {
    //res.json({});
  }
});

router.post("/check-user-exist", async (req, res) => {
  try {
    let result = { message: true, type: "success" };
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      result = { message: false, type: "success" };
    }
    res.json(result);
  } catch (err) {
    //res.json({});
  }
});

router.post("/submit-free-trial", async (req, res) => {
  try {
    let result = { message: "", type: "error" };
    const { stripeTokenId, finalData } = req.body;
    const { memberData, addressData, trialData } = finalData;
    let customer = null;
    let chargeSuccess = false;
    let stripeChargeResult = null;
    let user = null;
    customer = await stripeCustomerCreate({
      description: "TinkererBoxSite客户(trial)",
      stripeTokenId,
      email: memberData.emailReg,
    });
    if (customer && customer.id) {
      //trial payment
      const courier = await Courier.findById(addressData.courier);
      if (courier) {
        if (courier.price !== 0) {
          stripeChargeResult = await stripeCustomerCharge({
            amount: courier.price * 100,
            customerId: customer.id,
            description: "TinkererBoxSite客户付款(trial)-creditCard",
          });
          if (stripeChargeResult && stripeChargeResult.status == "succeeded") {
            chargeSuccess = true;
          }
        } else {
          chargeSuccess = true;
        }
      }

      if (chargeSuccess == true) {
        //signup user
        const userResult = await User.signUp({
          email: memberData.emailReg,
          password: memberData.passwordReg,
          userGroup: 1,
          registerType: "email",
          ip: req.header("x-forwarded-for") || req.connection.remoteAddress,
          marketingIds: req.session.marketingIds,
        });
        if (userResult.type == "success") {
          user = userResult.message;
          await User.findByIdAndUpdate(user._id, {
            stripeCustomer: {
              id: customer.id,
              brand: customer.sources.data[0].brand,
              last4: customer.sources.data[0].last4,
            },
          });
          await User.setAddress({
            userId: user._id,
            deliveryAddress: addressData,
          });
        }

        trialData.product.trial = Moment().add(7, "days");
        trialData.product.data.category = trialData.product.category;

        const order = await Order.saveOrder({
          userId: user._id,
          items: [trialData],
          stripeCharge: stripeChargeResult,
          totalAmount: courier.price * 100,
          subtotal: courier.price * 100,
          isServerAutoTransaction: false,
          coupon: null,
          referral: null,
          creditDeduct: 0,
          orderIp:
            req.header("x-forwarded-for") || req.connection.remoteAddress,
          shipping: {
            courier,
            deliverPriceTotal: courier.price,
          },
          marketingIds: req.session.marketingIds,
        });

        if (order) {
          const subscription = await Subscription.saveSubscription({
            userId: user._id,
            orderId: order._id,
            itemsArray: [trialData],
            deliveryAddress: addressData,
            courier,
          });

          const delivery = await Delivery.saveDelivery({
            userId: user._id,
            orderId: order._id,
            itemsArray: [trialData],
            deliveryAddress: addressData,
            courier,
          });

          delete req.session.marketingIds;

          req.user = user;
          user.mobile = user.mobile ? user.mobile.substring(0, 3) : "";
          req.session.user = user;
          await mergeCartAndUpdateTracking({ req });

          result = { message: order.id, type: "success" };
        }
      }
    } else {
      res.json({ message: "Create customer fail.", type: "error" });
    }

    res.json(result);
  } catch (err) {
    //console.log(err);
    const message = err.raw
      ? err.raw.message
      : "Error ,please refresh the page and try again. If problem still exists, contact us.";
    res.json({ message, type: "error" });
  }
});

router.post("/submit-eslite-new-customer", async (req, res) => {
  try {
    let result = { message: "", type: "error" };
    if (!req.session.admin) {
      res.json(result);
      return;
    }
    const { stripeTokenId, finalData } = req.body;
    const { memberData, addressData, trialData, firstBox } = finalData;
    let customer = null;
    let chargeSuccess = false;
    let stripeChargeResult = null;
    let user = null;
    customer = await stripeCustomerCreate({
      description: "TinkererBoxSite客户(ESLite)",
      stripeTokenId,
      email: memberData.emailReg,
    });
    if (customer && customer.id) {
      //trial payment
      const courier = await Courier.findById(addressData.courier);
      if (courier) {
        /*if (courier.price !== 0) {
          stripeChargeResult = await stripeCustomerCharge({
            amount: courier.price * 100,
            customerId: customer.id,
            description: "TinkererBoxSite客户付款(ESLite)-creditCard"
          });
          if (stripeChargeResult && stripeChargeResult.status == "succeeded") {
            chargeSuccess = true;
          }
        } else {
          chargeSuccess = true;
        }*/
        chargeSuccess = true;
      }

      if (chargeSuccess == true) {
        //signup user
        const userResult = await User.signUp({
          email: memberData.emailReg,
          password: memberData.passwordReg,
          userGroup: 1,
          registerType: "email",
          ip: req.header("x-forwarded-for") || req.connection.remoteAddress,
          marketingIds: req.session.marketingIds,
        });
        if (userResult.type == "success") {
          user = userResult.message;
          await User.findByIdAndUpdate(user._id, {
            stripeCustomer: {
              id: customer.id,
              brand: customer.sources.data[0].brand,
              last4: customer.sources.data[0].last4,
            },
          });
          await User.setAddress({
            userId: user._id,
            deliveryAddress: addressData,
          });
        }

        trialData.product.eslite = true;
        trialData.product.data.category = trialData.product.category;

        const order = await Order.saveOrder({
          userId: user._id,
          items: [trialData],
          stripeCharge: stripeChargeResult,
          totalAmount: 0,
          subtotal: 0,
          isServerAutoTransaction: false,
          coupon: null,
          referral: null,
          creditDeduct: 0,
          orderIp:
            req.header("x-forwarded-for") || req.connection.remoteAddress,
          shipping: {
            courier,
            deliverPriceTotal: 0,
          },
          marketingIds: req.session.marketingIds,
        });

        if (order) {
          const subscription = await Subscription.saveSubscription({
            userId: user._id,
            orderId: order._id,
            itemsArray: [trialData],
            deliveryAddress: addressData,
            courier,
          });

          const delivery = await Delivery.saveDelivery({
            userId: user._id,
            orderId: order._id,
            itemsArray: [trialData],
            deliveryAddress: addressData,
            courier,
          });

          const userSubscription = await Subscription.findOne({
            order: order._id,
          });

          const product = await Product.findById(firstBox);

          const updateFirstBox = await Delivery.findOneAndUpdate(
            { subscription: userSubscription._id },
            { status: "pickup", "item.product.selectedProduct": product },
            { sort: { _id: 1 } }
          );

          delete req.session.marketingIds;

          //req.user = user;
          //user.mobile = user.mobile ? user.mobile.substring(0, 3) : "";
          //req.session.user = user;
          //await mergeCartAndUpdateTracking({ req });

          result = { message: order.id, type: "success" };
        }
      }
    } else {
      res.json({ message: "Create customer fail.", type: "error" });
    }

    res.json(result);
  } catch (err) {
    const message = err.raw
      ? err.raw.message
      : "Something went wrong please contact 6376 7832 Anthony.";
    res.json({ message, type: "error" });
  }
});

////////////admin////////////
router.post("/sign-in-admin", async (req, res) => {
  try {
    /*const { email, password, grecaptchaValue } = req.body;
    const admin = await Admin.signIn({ email, password });
    const verfiedGRecaptcha = await verifyGRecaptcha({ grecaptchaValue });
    if (admin && verfiedGRecaptcha) {
      req.session.admin = admin;
      res.json({ message: "登入成功", type: "success" });
    } else {
      res.json({ message: "登入失败", type: "error" });
    }*/
    const { email, password } = req.body;
    const admin = await Admin.signIn({ email, password });
    if (admin) {
      req.session.admin = admin;
      res.json({ message: "登入成功", type: "success" });
    } else {
      res.json({ message: "登入失败", type: "error" });
    }
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//export default router;
module.exports = router;
