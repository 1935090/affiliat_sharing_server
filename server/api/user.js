const express = require("express");
const Subscription = require("../models/Subscription");
const Delivery = require("../models/Delivery");
const User = require("../models/User");
const Order = require("../models/Order");
const CreditLog = require("../models/CreditLog");
const GiftCard = require("../models/GiftCard");
const { stripeCustomerUpdate } = require("../helper/stripe");
const { sendMail } = require("../helper/mail");

const router = express.Router();

router.use((req, res, next) => {
  if (!req.session.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
});

router.post("/get-subscription", async (req, res) => {
  try {
    const result = await Subscription.getMySubscription({
      userId: req.session.user._id,
    });
    if (result) {
      res.json({ message: result, type: "success" });
    } else {
      res.json({ message: "没有订阅", type: "error" });
    }
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-subscription-from-id", async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    const result = await Subscription.getMySubscriptionFromId({
      subscriptionId,
    });
    if (result) {
      res.json({ message: result, type: "success" });
    } else {
      res.json({ message: "没有订阅", type: "error" });
    }
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-subscription-delivery", async (req, res) => {
  try {
    const result = await Delivery.getMySubscriptionDelivery({
      user: req.session.user._id,
    });
    if (result) {
      res.json({ message: result, type: "success" });
    } else {
      res.json({ message: "没有资料", type: "error" });
    }
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/update-subscription-child", async (req, res) => {
  try {
    let result = null;
    const { childData, subscriptionId } = req.body;
    const userId = req.session.user._id;
    const subscription = await Subscription.updateSubscriptionChild({
      childData,
      subscriptionId,
      userId,
    });
    if (subscription) {
      result = await Delivery.updateSubscriptionChild({
        userId,
        childData,
        subscription,
      });
    }
    if (result) {
      req.session.message["account"] = {
        message: "Change child information - SUCCESS",
        type: "success",
      };
      res.json({ message: "更新成功", type: "success" });
    } else {
      res.json({ message: "更新失败", type: "error" });
    }
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/update-subscription-address", async (req, res) => {
  try {
    let result = null;
    const { addressData, subscriptionId } = req.body;
    const userId = req.session.user._id;
    const subscription = await Subscription.updateSubscriptionAddress({
      addressData,
      subscriptionId,
      userId,
    });
    if (subscription) {
      result = await Delivery.updateSubscriptionAddress({
        userId,
        addressData,
        subscription,
      });

      const updateUserAddress = await User.setAddress({
        userId,
        deliveryAddress: addressData,
      });
    }
    if (result) {
      req.session.message["account"] = {
        message: "Change delivery address - SUCCESS",
        type: "success",
      };
      res.json({ message: "更新成功", type: "success" });
    } else {
      res.json({ message: "更新失败", type: "error" });
    }
  } catch (err) {
    //console.log(err);
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/cancel-subscription", async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    const result = await Subscription.cancelSubscription({
      subscriptionId,
      userId: req.session.user._id,
    });
    if (result) {
      const subscription = await Subscription.findById(subscriptionId).populate(
        "user"
      );
      if (subscription.status == "paused") {
        sendMail({
          userId: subscription.user._id,
          to: subscription.user.email,
          type: 12,
          subscription,
        });
      }
      req.session.message["account"] = {
        message: "Change subscription status - SUCCESS",
        type: "success",
      };
      res.json({ message: "更新成功", type: "success" });
    } else {
      res.json({ message: "更新失败", type: "error" });
    }
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/update-subscription-line-and-period", async (req, res) => {
  try {
    const { planSelected, subscriptionId } = req.body;
    const result = await Subscription.updateSubscriptionLineAndPeriod({
      planSelected,
      subscriptionId,
      userId: req.session.user._id,
    });
    if (result) {
      req.session.message["account"] = {
        message: "Switch line - SUCCESS",
        type: "success",
      };
      res.json({ message: "更新成功", type: "success" });
    } else {
      res.json({ message: "更新失败", type: "error" });
    }
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/postpone-subscription", async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    const result = await Subscription.postponeSubscription({
      subscriptionId,
      userId: req.session.user._id,
    });
    if (result) {
      req.session.message["account"] = {
        message: "Postpone for 1 month SUCCESS",
        type: "success",
      };
      res.json({ message: "更新成功", type: "success" });
    } else {
      res.json({ message: "更新失败", type: "error" });
    }
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//checked 2019-06-03
router.post("/get-my-account-info", async (req, res) => {
  try {
    let result = await User.getMyAccountInfo({
      userId: req.session.user._id,
    });
    if (result) {
      result.currency = req.session.currency;
      res.json({ message: result, type: "success" });
    } else {
      res.json({ message: "刷新页面后再试一次", type: "error" });
    }
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//checked 2019-06-03
router.post("/submit-change-password", async (req, res) => {
  try {
    const { newPassword, currentPassword, newPasswordConfirm } = req.body;
    if (newPassword !== newPasswordConfirm) {
      req.session.message["account"] = {
        message: "Failed match new password to retype password.",
        type: "error",
      };
      res.json({ message: "Current password incorrect.", type: "error" });
      return;
    }
    const result = await User.submitChangePassword({
      userId: req.session.user._id,
      newPassword,
      currentPassword,
    });
    if (result) {
      req.session.message["account"] = {
        message: "Change account password - SUCCESS",
        type: "success",
      };
      res.json({ message: result, type: "success" });
    } else {
      req.session.message["account"] = {
        message: "Current password incorrect.",
        type: "error",
      };
      res.json({ message: "Current password incorrect.", type: "error" });
    }
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/submit-change-name", async (req, res) => {
  try {
    const { name } = req.body;
    const result = await User.submitChangeName({
      userId: req.session.user._id,
      name,
    });
    if (result) {
      req.session.message["account"] = {
        message: "Change account name - SUCCESS",
        type: "success",
      };
      res.json({ message: result, type: "success" });
    } else {
      res.json({ message: "发生错误", type: "error" });
    }
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/submit-change-credit-card", async (req, res) => {
  try {
    const { stripeTokenId } = req.body;
    const user = await User.findById(req.session.user._id);
    const customer = await stripeCustomerUpdate({
      stripeTokenId,
      stripeCustomerId: user.stripeCustomer.id,
    });
    if (customer.id) {
      //console.log(customer.sources.data[0]);
      await User.findByIdAndUpdate(user._id, {
        stripeCustomer: {
          id: customer.id,
          brand: customer.sources.data[0].brand,
          last4: customer.sources.data[0].last4,
        },
      });
      req.session.message["account"] = {
        message: "Change credit card - SUCCESS",
        type: "success",
      };
      res.json({ message: "Success", type: "success" });
    } else {
      res.json({ message: "Your card is declined", type: "error" });
    }
  } catch (err) {
    const message = err.raw ? err.raw.message : "Your card is declined";
    res.json({ message, type: "error" });
    //console.log(err);
    //res.status(500).end();
  }
});

router.post("/delete-my-address", async (req, res) => {
  try {
    const { index } = req.body;
    const userId = req.session.user._id;
    const result = await User.deleteMyAddress({
      userId,
      index,
    });
    if (result) {
      req.session.message["account"] = {
        message: "Delete address - SUCCESS",
        type: "success",
      };
      res.json({ message: "Success", type: "success" });
    } else {
      res.json({ message: "Delete failed", type: "error" });
    }
  } catch (err) {
    //console.log(err);
    res.status(500).end();
  }
});

router.post("/delete-my-credit-card", async (req, res) => {
  try {
    const userId = req.session.user._id;
    const result = await User.deleteMyCreditCard({
      userId,
    });
    if (result) {
      req.session.message["account"] = {
        message: "Delete credit card - SUCCESS",
        type: "success",
      };
      res.json({ message: "Success", type: "success" });
    } else {
      res.json({ message: "Delete failed", type: "error" });
    }
  } catch (err) {
    //console.log(err);
    res.status(500).end();
  }
});

router.post("/get-session-message", async (req, res) => {
  try {
    const { pageName } = req.body;
    let result = "";
    if (
      typeof req.session.message !== "undefined" &&
      typeof req.session.message[pageName] !== "undefined"
    ) {
      result = req.session.message[pageName];
      delete req.session.message[pageName];
    }
    res.json({ message: result, type: "success" });
  } catch (err) {
    //console.log(err);
    res.status(500).end();
  }
});

//checked 2019-06-03
router.post("/get-purchase-order", async (req, res) => {
  try {
    const { pageNum } = req.body;
    const userId = req.session.user._id;
    let result = "";
    result = await Order.getPurchaseOrder({ userId, pageNum });
    res.json({ message: result, type: "success" });
  } catch (err) {
    //console.log(err);
    res.status(500).end();
  }
});

//checked 2019-06-03
router.post("/get-purchase-order-detail", async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.session.user._id;
    let result = "";
    result = await Order.getPurchaseOrderDetail({ userId, orderId });
    res.json({ message: result, type: "success" });
  } catch (err) {
    //console.log(err);
    res.status(500).end();
  }
});

//checked 2019-06-03
router.post("/get-my-delivery-by-order-id", async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.session.user._id;
    let result = "";
    result = await User.getMyDeliveryByOrderId({ userId, orderId });
    res.json({ message: result, type: "success" });
  } catch (err) {
    //console.log(err);
    res.status(500).end();
  }
});

//checked 2019-06-03
router.post("/get-my-referral", async (req, res) => {
  try {
    const result = await CreditLog.find({
      user: req.session.user._id,
      creditType: "memberRef",
    })
      .select("detail.user created_at credit -_id")
      .populate({ path: "detail.user", select: "referralId -_id" });
    if (result) {
      res.json({ message: result, type: "success" });
    } else {
      res.json({ message: "No friends referred.", type: "error" });
    }
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//checked 2019-06-03
router.post("/redeem-gift-card", async (req, res) => {
  try {
    const { code } = req.body;
    let result = { message: "", type: "error" };
    const userObj = await User.findById(req.session.user._id);
    if (!userObj) {
      result = {
        message: "Login first before redeem gift card.",
        type: "error",
      };
    } else {
      const giftCard = await GiftCard.findGiftCardAndRedeem({
        code,
        userObj,
      });
      if (!giftCard) {
        result = { message: "Redeem code not available.", type: "error" };
      } else {
        const creditAddedSucceed = await User.changeCredit({
          userId: userObj._id,
          credit: giftCard.mail.giftCardAmount,
          creditType: "redeemGiftCard",
          detail: { giftCard: giftCard._id },
          reason: "Redeem Gift Card",
        });
        if (creditAddedSucceed) {
          result = { message: "Redeem successful", type: "success" };
        }
      }
    }
    res.json(result);
  } catch (err) {
    res.json({});
  }
});

//checked 2019-06-03
router.post("/get-my-credit", async (req, res) => {
  try {
    const result = await CreditLog.find({
      user: req.session.user._id,
      deleted: 0,
      disabled: 0,
    }).select("created_at reason credit");
    if (result) {
      res.json({ message: result, type: "success" });
    } else {
      res.json({ message: "", type: "error" });
    }
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-my-gift-info", async (req, res) => {
  try {
    let result = { message: "", type: "error" };
    const userId = req.session.user._id;
    const giftInfo = await User.giftInfo({ userId });
    if (giftInfo) {
      res.json({ message: giftInfo, type: "success" });
    }
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/claim-gift", async (req, res) => {
  try {
    let result = { message: "", type: "error" };
    const { deliveryAddress } = req.body;
    const userId = req.session.user._id;
    const claimGift = await User.claimGift({ userId, deliveryAddress });
    if (claimGift) {
      res.json({ message: claimGift, type: "success" });
    }
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

module.exports = router;
