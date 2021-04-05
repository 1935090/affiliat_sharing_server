const express = require("express");
const Admin = require("../models/Admin");
const WebsiteText = require("../models/WebsiteText");
import { nanoid } from 'nanoid'
const soapRequest = require("easy-soap-request");
const accepted_upload = ["jpg", "jpeg", "png", "webp", "gif"];
const multer = require("multer");
const storage = multer.diskStorage({
  destination: "static/upload/images",
  filename: (req, file, cb) => {
    let ext = "";
    switch (file.mimetype) {
      case "image/jpeg":
        ext = ".jpg";
        break;
      case "image/jpg":
        ext = ".jpg";
        break;
      case "image/png":
        ext = ".png";
        break;
      case "image/webp":
        ext = ".webp";
        break;
      case "image/gif":
        ext = ".gif";
        break;
    }
    cb(
      null,
      Date.now() +
      nanoid() +
      ext
    );
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (accepted_upload.some((ext) => file.originalname.endsWith("." + ext))) {
      return cb(null, true);
    }
    return cb(new Error("error"));
  },
  limits: {
    fileSize: 1024 * 1024 * 15,
  },
});

//----EC-SHIP----
const dev = process.env.NODE_ENV !== "production";
const ECSHIP_USERNAME = dev
  ? process.env.ECSHIP_USERNAME_TEST
  : process.env.ECSHIP_USERNAME_LIVE;
const ECSHIP_INTEGRATOR_USERNAME = dev
  ? process.env.ECSHIP_INTEGRATOR_USERNAME_TEST
  : process.env.ECSHIP_INTEGRATOR_USERNAME_LIVE;
const ECSHIP_PASSWORD = dev
  ? process.env.ECSHIP_PASSWORD_TEST
  : process.env.ECSHIP_PASSWORD_LIVE;
const ECSHIP_API_LINK = dev
  ? process.env.ECSHIP_API_LINK_TEST
  : process.env.ECSHIP_API_LINK_LIVE;

const Base64 = require("base-64");
const Pack = require("locutus/php/misc/pack");
const Moment = require("moment");
const Sha1 = require("js-sha1");
const xmlConvert = require("xml-js");

const router = express.Router();

router.use((req, res, next) => {
  if (!req.session.admin || req.session.admin.userGroup !== 0) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
});

//developer

router.post("/delete-all-documents", async (req, res) => {
  try {
    await Admin.deleteAllDocuments();
    res.json({});
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/create-initial-documents", async (req, res) => {
  try {
    await Admin.createInitialDocuments();
    res.json({});
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//delivery

router.post("/get-delivery-list", async (req, res) => {
  try {
    const { condition, pageNum, limit } = req.body;
    const listObject = await Admin.getDeliveryList({
      condition,
      pageNum,
      limit,
    });
    res.json(listObject);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/upsert-delivery", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { dataObj, emailDeliveries } = req.body;
    const result = await Admin.upsertDelivery({ dataObj, emailDeliveries });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-category-plan-product-list", async (req, res) => {
  try {
    const result = await Admin.getCategoryPlanProductList();
    res.json(result);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-category-plan-product-list-by-user-id", async (req, res) => {
  try {
    const { userId, categoryId, subscriptionId } = req.body;
    const result = await Admin.getCategoryPlanProductListByUserId({
      userId,
      categoryId,
      subscriptionId,
    });
    res.json(result);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/update-product-for-delivery", async (req, res) => {
  try {
    const { deliveryId, productId } = req.body;
    const result = await Admin.updateProductForDelivery({
      deliveryId,
      productId,
    });
    res.json(result);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-delivery-first-box", async (req, res) => {
  try {
    const { deliveryId } = req.body;
    const result = await Admin.getDeliveryFirstBox({
      deliveryId,
    });
    res.json(result);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-delivery-table", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const result = await Admin.getDeliveryTable();
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-delivery-from-id", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { id } = req.body;
    const result = await Admin.getDeliveryFromId({ id });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post(
  "/update-remaining-deliveries-and-subscription",
  async (req, res) => {
    try {
      let resultObj = { message: null, type: "error" };
      const { dataObj, subscriptionId } = req.body;
      const result = await Admin.updateRemainingDeliveriesAndSubscription({
        dataObj,
        subscriptionId,
      });
      if (result) {
        resultObj = { message: result, type: "success" };
      }
      res.json(resultObj);
    } catch (err) {
      res.json({ error: err.message || err.toString() });
    }
  }
);

router.post("/update-to-shipped", async (req, res) => {
  try {
    const { trackingCode } = req.body;
    let resultObj = { message: trackingCode, type: "error" };
    const result = await Admin.updateToShipped({
      trackingCode,
    });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/update-old-address-to-new", async (req, res) => {
  try {
    const { oldAddress, newAddress } = req.body;
    let resultObj = { message: "", type: "error" };
    const result = await Admin.updateOldAddressToNew({
      oldAddress,
      newAddress,
    });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//Product

router.post("/get-product-list", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { condition, pageNum } = req.body;
    const result = await Admin.getProductList({ condition, pageNum });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/upsert-product", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { dataObj } = req.body;
    const result = await Admin.upsertProduct({ dataObj });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-product-from-id", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { id } = req.body;
    const result = await Admin.getProductFromId({ id });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-products", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const result = await Admin.getProducts();
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//Category

router.post("/get-category-list-all", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const result = await Admin.getCategoryListAll();
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-category-list", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { condition, pageNum } = req.body;
    const result = await Admin.getCategoryList({ condition, pageNum });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/upsert-category", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { dataObj } = req.body;
    const result = await Admin.upsertCategory({ dataObj });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-category-from-id", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { id } = req.body;
    const result = await Admin.getCategoryFromId({ id });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//User

router.post("/get-user-list", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { condition, pageNum } = req.body;
    const result = await Admin.getUserList({ condition, pageNum });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/upsert-user", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { dataObj } = req.body;
    const result = await Admin.upsertUser({ dataObj });
    if (result && typeof result.message === "undefined") {
      resultObj = { message: result, type: "success" };
    } else {
      resultObj = result;
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-user-from-id", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { id } = req.body;
    const result = await Admin.getUserFromId({ id });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-users", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { email } = req.body;
    const result = await Admin.getUsers({ email });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-test-user", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const result = await Admin.getTestUser();
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/check-user-exists", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { email } = req.body;
    const result = await Admin.checkUserExists({ email });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//Subscription

router.post("/get-subscription-list", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { condition, pageNum } = req.body;
    const result = await Admin.getSubscriptionList({ condition, pageNum });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/upsert-subscription", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { dataObj } = req.body;
    const result = await Admin.upsertSubscription({ dataObj });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/extend-subscription-manually", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { dataObj } = req.body;
    const result = await Admin.extendSubscriptionManually({ dataObj });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-subscription-from-id", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { id } = req.body;
    const result = await Admin.getSubscriptionFromId({ id });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/charge-subscription-from-id", async (req, res) => {
  try {
    let resultObj = { message: "Charge Failed", type: "error" };
    const { id } = req.body;
    const result = await Admin.chargeSubscriptionFromId({ id });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    const message = err.raw ? err.raw.message : "Your card is declined";
    res.json({ message, type: "error" });
  }
});

router.post("/get-subscription-table", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const result = await Admin.getSubscriptionTable();
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-subscription-plans", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const result = await Admin.getSubscriptionPlans();
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/update-user-subscription-plan", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { planSelected, subscriptionId, userId } = req.body;
    const result = await Admin.updateSubscriptionLineAndPeriod({
      planSelected,
      subscriptionId,
      userId,
    });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/update-subscription-remark", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { subscriptionId, remark } = req.body;
    const result = await Admin.updateSubscriptionRemark({
      subscriptionId,
      remark,
    });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/update-subscription-dont-send", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { dontSend, subscriptionId } = req.body;
    const result = await Admin.updateSubscriptionDontSend({
      dontSend,
      subscriptionId,
    });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-product-select-list", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const result = await Admin.getProductSelectList();
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/postpone-subscription-feb", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const result = await Admin.postponeSubscriptionFeb();
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-renewable-list", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const result = await Admin.getRenewableList();
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-renewable-email-list", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const result = await Admin.getRenewableEmailList();
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/renew-aubscriptions", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const result = await Admin.renewSubscriptions();
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/send-renew-subscription-emails", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const result = await Admin.sendRenewSubscriptionEmails();
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//Order

router.post("/get-order-list", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { condition, pageNum } = req.body;
    const result = await Admin.getOrderList({ condition, pageNum });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/upsert-order", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { dataObj } = req.body;
    const result = await Admin.upsertOrder({ dataObj });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/upsert-order-manual", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const result = await Admin.upsertOrderManual();
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-order-from-id", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { id } = req.body;
    const result = await Admin.getOrderFromId({ id });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-delivery-from-order-id", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { id } = req.body;
    const result = await Admin.getDeliveryFromOrderId({ id });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//Cart

router.post("/get-cart-list", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { condition, pageNum } = req.body;
    const result = await Admin.getCartList({ condition, pageNum });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-cart-from-id", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { id } = req.body;
    const result = await Admin.getCartFromId({ id });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//Tracking

router.post("/get-tracking-list", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { condition, pageNum } = req.body;
    const result = await Admin.getTrackingList({ condition, pageNum });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-tracking-from-user-id", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { id } = req.body;
    const result = await Admin.getTrackingFromUserId({ id });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//Inventory

router.post("/get-inventory-list", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { condition, pageNum } = req.body;
    const result = await Admin.getInventoryList({ condition, pageNum });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-inventory-from-id", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { id } = req.body;
    const result = await Admin.getInventoryFromId({ id });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/upsert-inventory", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { dataObj } = req.body;
    const result = await Admin.upsertInventory({ dataObj });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//Coupon

router.post("/get-coupon-list", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { condition, pageNum } = req.body;
    const result = await Admin.getCouponList({ condition, pageNum });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-coupon-from-id", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { id } = req.body;
    const result = await Admin.getCouponFromId({ id });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/upsert-coupon", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { dataObj } = req.body;
    const result = await Admin.upsertCoupon({ dataObj });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/check-coupon-duplicate", async (req, res) => {
  try {
    const { code } = req.body;
    const result = await Admin.checkCouponDuplicate({ code });
    res.json({ message: result, type: "success" });
  } catch (err) {
    res.json(err);
  }
});

router.post("/get-coupon-list-all", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { condition } = req.body;
    const result = await Admin.getCouponListAll({ condition });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//Gift Card

router.post("/get-gift-card-list", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { condition, pageNum } = req.body;
    const result = await Admin.getGiftCardList({ condition, pageNum });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//Credit

router.post("/get-credit-list", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { condition, pageNum } = req.body;
    const result = await Admin.getCreditList({ condition, pageNum });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/upsert-credit", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { dataObj } = req.body;
    const result = await Admin.upsertCredit({ dataObj });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-credit-from-id", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { id } = req.body;
    const result = await Admin.getCreditFromId({ id });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//CreditLogs

router.post("/update-credit-logs", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const result = await Admin.updateCreditLogs();
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-expired-credit-list", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const result = await Admin.getExpiredCreditList();
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/expire-credits", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const result = await Admin.expireCredits();
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//Promotion Email

router.post("/upsert-promotion", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { dataObj } = req.body;
    const result = await Admin.upsertPromotion({ dataObj });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-promotion-list", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { condition, pageNum } = req.body;
    const result = await Admin.getPromotionList({ condition, pageNum });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-promotion-email-list", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { condition, pageNum } = req.body;
    const result = await Admin.getPromotionEmailList({ condition, pageNum });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/search-promotion-email-ids", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { condition, emailType } = req.body;
    const result = await Admin.searchPromotionEmailIds({
      condition,
      emailType,
    });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/add-promotion-emails", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { promotionId } = req.body;
    const result = await Admin.addPromotionEmails({
      promotionId,
    });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/add-promotion-emails", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { promotionId } = req.body;
    const result = await Admin.addPromotionEmails({
      promotionId,
    });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/send-promotion-emails", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { promotionId } = req.body;
    const result = await Admin.sendPromotionEmails({
      promotionId,
    });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-unsend-feedback-list", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const result = await Admin.getUnsendFeedbackList();
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/send-feedback-email", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { delivery } = req.body;
    const result = await Admin.sendFeedbackEmail({ delivery });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-unsend-new-product-user-list", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const result = await Admin.getUnsendNewProductUserList();
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-unsend-delay-user-list", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const result = await Admin.getUnsendDelayUserList();
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/send-new-product-promotion-email", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { user, promotionProducts } = req.body;
    const result = await Admin.sendNewProductPromotionEmail({
      user,
      promotionProducts,
    });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/send-add-price-email", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { user } = req.body;
    const result = await Admin.sendAddPriceEmail({
      user,
    });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/reset-new-product-promotion-email", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const result = await Admin.resetNewProductPromotionEmail();
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/send-new-year-promotion-email", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { user } = req.body;
    const result = await Admin.sendNewYearPromotionEmail({
      user,
    });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/send-delay-user-email", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { user, months, deliveryId } = req.body;
    const result = await Admin.sendDelayUserEmail({
      user,
      months,
      deliveryId,
    });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//Upload

router.post("/upload-image", upload.single("file"), async (req, res) => {
  try {
    if (req.file) {
      const _id = req.query.id;
      const table = req.query.table;
      const field = req.query.field;
      const uploadedFile = req.file;
      const upload = await Admin.uploadImage({
        linkedBy: [{ _id, table }],
        fileName: {
          original: uploadedFile.originalname,
          current: uploadedFile.filename,
        },
        folder: "images",
        field,
      });
      res.json({ message: upload, type: "success" });
    }
  } catch (err) {
    res.status(404).json({});
  }
});

router.post("/get-uploaded-file", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { table, _id, field } = req.body;
    const result = await Admin.getUploadedFile({ table, _id, field });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/update-uploaded-file", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { table, _id, upload, field } = req.body;
    const result = await Admin.updateUploadedFile({
      table,
      _id,
      upload,
      field,
    });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/pull-file-from-upload", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { table, _id, uploadId, field } = req.body;
    const result = await Admin.pullFileFromUpload({
      table,
      _id,
      uploadId,
      field,
    });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//Statistics

router.post("/find-stat-report", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { statisticsType, graphType, graphName } = req.body;
    const result = await Admin.findStatReport({
      statisticsType,
      graphType,
      graphName,
    });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/upsert-stat-report", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { statisticsType, graphType, graphName, graphData } = req.body;
    const result = await Admin.upsertStatReport({
      statisticsType,
      graphType,
      graphName,
      graphData,
    });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-stat-sales", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { condition } = req.body;
    const result = await Admin.getStatSales({
      condition,
    });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-stat-sales-best", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { condition } = req.body;
    const result = await Admin.getStatSalesBest({
      condition,
    });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-stat-subscriptions", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { condition } = req.body;
    const result = await Admin.getStatSubscriptions({
      condition,
    });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-stat-member-register", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { condition } = req.body;
    const result = await Admin.getStatMemberRegister({
      condition,
    });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//Website Text

router.post("/get-website-text-list", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { condition, pageNum } = req.body;
    const result = await Admin.getWebsiteTextList({ condition, pageNum });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/upsert-website-text", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { dataObj } = req.body;
    const result = await Admin.upsertWebsiteText({ dataObj });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-website-text-from-id", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { id } = req.body;
    const result = await Admin.getWebsiteTextFromId({ id });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//Courier

router.post("/get-courier-list", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { condition, pageNum } = req.body;
    const result = await Admin.getCourierList({ condition, pageNum });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/upsert-courier", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { dataObj } = req.body;
    const result = await Admin.upsertCourier({ dataObj });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-courier-from-id", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { id } = req.body;
    const result = await Admin.getCourierFromId({ id });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//comment

router.post("/get-comment-list", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { condition, pageNum } = req.body;
    const result = await Admin.getCommentList({ condition, pageNum });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-comment-list-all", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { condition } = req.body;
    const result = await Admin.getCommentListAll({ condition });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//Currency

router.post("/get-currency-list", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { condition, pageNum } = req.body;
    const result = await Admin.getCurrencyList({ condition, pageNum });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/upsert-currency", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { dataObj } = req.body;
    const result = await Admin.upsertCurrency({ dataObj });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-currency-from-id", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { id } = req.body;
    const result = await Admin.getCurrencyFromId({ id });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//Marketing

router.post("/get-marketing-link-list", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { condition, pageNum } = req.body;
    const result = await Admin.getMarketingLinkList({ condition, pageNum });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/upsert-marketing-link", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { dataObj } = req.body;
    const result = await Admin.upsertMarketingLink({ dataObj });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-marketing-link-from-id", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { id } = req.body;
    const result = await Admin.getMarketingLinkFromId({ id });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//Refund

router.post("/refund-order", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { orderId, fullOrPartial, amount, reason } = req.body;
    const result = await Admin.refundOrder({
      orderId,
      fullOrPartial,
      amount,
      reason,
    });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//Mail

router.post("/send-subscription-renew-mail", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { userId, to, type, subscriptionRenewObj } = req.body;
    const result = await Admin.sendSubscriptionRenewMail({
      userId,
      to,
      type,
      subscriptionRenewObj,
    });
    if (result) {
      resultObj = { message: "done", type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-email-users", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { type } = req.body;
    const result = await Admin.getEmailUsers({
      type,
    });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/send-general-email", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { userId, to, type, user, emailContent, title } = req.body;
    const result = await Admin.sendGeneralEmail({
      userId,
      to,
      type,
      user,
      emailContent,
      title,
    });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//Elaine Report

router.post("/get-order-all", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { condition } = req.body;
    const result = await Admin.getOrderAll({ condition });
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//SOAP

router.post("/call-soap-hk-post-create", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    let item = ``;
    const { deliveries } = req.body;
    const { user, deliveryAddress } = deliveries[0].delivery;
    for (let i = 0; i < deliveries.length; i++) {
      const delivery = deliveries[i].delivery;
      const productName =
        delivery.item.product.data.productType === 1
          ? delivery.item.product.selectedProduct.name
          : delivery.item.product.data.name;
      item += `<item>
      <ns1:productQty>1</ns1:productQty>
      <ns1:productValue>170</ns1:productValue>
      <ns1:productWeight>0.5</ns1:productWeight>
      <ns1:productCountry>HKG</ns1:productCountry>
      <ns1:currencyCode>HKD</ns1:currencyCode>
      <ns1:contentDesc>Educational Toy(${productName})</ns1:contentDesc>
      <ns1:productTariffCode>95030090</ns1:productTariffCode>
    </item>`;
    }
    const countryCode = { Malaysia: "MYA", Singapore: "SGA" };
    // example data

    const ecshipUsername = ECSHIP_USERNAME;
    const integratorUsername = ECSHIP_INTEGRATOR_USERNAME;
    const password = ECSHIP_PASSWORD;
    const simple_nonce = Math.floor(Math.random() * 20000);
    const encoded_nonce = Base64.encode(Pack("H*", simple_nonce));
    const tm_created = Moment().format("YYYY-MM-DD[T]hh[:]mm[:]ss[Z]");

    const PasswordDigest = Base64.encode(
      Pack(
        "H*",
        Sha1(
          Pack("H*", simple_nonce) +
          Pack("a*", tm_created) +
          Pack("a*", password)
        )
      )
    );

    const CREDITCARD = await WebsiteText.findOne({
      title: "ecship current card",
    }).select("desc -_id");

    const url = ECSHIP_API_LINK;
    const headersObj = {
      "user-agent": "PHP-SOAP/7.3.1",
      "Content-Type": "text/xml; charset=UTF-8",
      soapAction: "",
    };
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
                <SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="http://object.integrator.hkpost.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns2="http://webservice.integrator.hkpost.com" xmlns:ns3="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
                  <SOAP-ENV:Header>
                    <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
                      <wsse:UsernameToken>
                        <wsse:Username>${integratorUsername}</wsse:Username>
                        <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordDigest">${PasswordDigest}</wsse:Password>
                        <wsse:Nonce EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary">${encoded_nonce}</wsse:Nonce>
                        <wsu:Created xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">${tm_created}</wsu:Created>
                      </wsse:UsernameToken>
                    </wsse:Security>
                  </SOAP-ENV:Header>
                  <SOAP-ENV:Body>
                    <createOrder>
                      <api02Req>
                        <ns1:ecshipUsername>${ecshipUsername}</ns1:ecshipUsername>
                        <ns1:integratorUsername>${integratorUsername}</ns1:integratorUsername>
                        <ns1:shipCode>AEX</ns1:shipCode>
                        <ns1:countryCode>${countryCode[deliveryAddress.country]
      }</ns1:countryCode>
                        <ns1:senderName>Tinkerer</ns1:senderName>
                        <ns1:senderAddress>Unit F, 7/F On Ho Industry Building 17-19 Shing Wan Road</ns1:senderAddress>
                        <ns1:senderContactNo>36193129</ns1:senderContactNo>
                        <ns1:senderEmail>stephen.chan@seal-edutech.com</ns1:senderEmail>
                        <ns1:refNo></ns1:refNo>
                        <ns1:recipientName>${deliveryAddress.receiverName + deliveryAddress.company
      }</ns1:recipientName>
                        <ns1:recipientAddress>${deliveryAddress.lineOne + deliveryAddress.lineTwo
      }</ns1:recipientAddress>
                        <ns1:recipientCity>${deliveryAddress.townOrCity
        ? deliveryAddress.townOrCity
        : deliveryAddress.country
      }</ns1:recipientCity>
                        <ns1:recipientPostalNo>${deliveryAddress.zipcode
      }</ns1:recipientPostalNo>
                        <ns1:recipientContactNo>${deliveryAddress.phone
      }</ns1:recipientContactNo>
                        <ns1:recipientEmail>${user.email}</ns1:recipientEmail>
                        <ns1:itemCategory>M</ns1:itemCategory>
                        <ns1:senderCountry>Hong Kong SAR</ns1:senderCountry>
                        <ns1:products>
                          ${item}
                        </ns1:products>
                        <ns1:payFlag>OC</ns1:payFlag>
                        <ns1:creditCardNo>${CREDITCARD.desc}</ns1:creditCardNo>
                      </api02Req>
                    </createOrder>
                  </SOAP-ENV:Body>
                </SOAP-ENV:Envelope>`;
    xml = xml.replace(/\n|\r/g, "");

    // usage of module
    try {
      const { response } = await soapRequest(url, headersObj, xml, 20000); // Optional timeout parameter(milliseconds)
      //console.log(response);
      if (response) {
        const xmlJson = xmlConvert.xml2js(response.body);
        const xmlParsed =
          xmlJson.elements[0].elements[0].elements[0].elements[0].elements;
        let xmlObj = {};
        for (let i = 0; i < xmlParsed.length; i++) {
          xmlObj[xmlParsed[i].name.substring(4, xmlParsed[i].name.length)] =
            xmlParsed[i].elements;
        }
        if (xmlObj.itemNo && xmlObj.itemNo[0].text) {
          resultObj = { message: xmlObj.itemNo[0].text, type: "success" };
        }
      }
    } catch (e) {
      //console.log(e);
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/call-soap-hk-post-get-label", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const { itemNumber } = req.body;

    const ecshipUsername = ECSHIP_USERNAME;
    const integratorUsername = ECSHIP_INTEGRATOR_USERNAME;
    const password = ECSHIP_PASSWORD;
    /*const ecshipUsername = "ttinkerer";
    const integratorUsername = "tinkerer";
    const password = "e0ffd554-aa4d-4fb3-8f71-b4567a136fa1";*/
    const simple_nonce = Math.floor(Math.random() * 20000);
    const encoded_nonce = Base64.encode(Pack("H*", simple_nonce));
    const tm_created = Moment().format("YYYY-MM-DD[T]hh[:]mm[:]ss[Z]");

    const PasswordDigest = Base64.encode(
      Pack(
        "H*",
        Sha1(
          Pack("H*", simple_nonce) +
          Pack("a*", tm_created) +
          Pack("a*", password)
        )
      )
    );

    const url = ECSHIP_API_LINK;
    const headersObj = {
      "user-agent": "PHP-SOAP/7.3.1",
      "Content-Type": "text/xml; charset=UTF-8",
      soapAction: "",
    };
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
                <SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="http://object.integrator.hkpost.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns2="http://webservice.integrator.hkpost.com" xmlns:ns3="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
                  <SOAP-ENV:Header>
                    <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
                      <wsse:UsernameToken>
                        <wsse:Username>${integratorUsername}</wsse:Username>
                        <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordDigest">${PasswordDigest}</wsse:Password>
                        <wsse:Nonce EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary">${encoded_nonce}</wsse:Nonce>
                        <wsu:Created xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">${tm_created}</wsu:Created>
                      </wsse:UsernameToken>
                    </wsse:Security>
                  </SOAP-ENV:Header>
                  <SOAP-ENV:Body>
                    <getAddressPack>
                      <api11Req>
                        <ns1:ecshipUsername>${ecshipUsername}</ns1:ecshipUsername>
                        <ns1:integratorUsername>${integratorUsername}</ns1:integratorUsername>
                        <ns1:itemNo>
                          <item>${itemNumber}</item>
                        </ns1:itemNo>
                        <ns1:printMode>0</ns1:printMode>
                      </api11Req>
                    </getAddressPack>
                  </SOAP-ENV:Body>
                </SOAP-ENV:Envelope>`;
    xml = xml.replace(/\n|\r/g, "");

    // usage of module
    try {
      const { response } = await soapRequest(url, headersObj, xml, 20000); // Optional timeout parameter(milliseconds)
      const xmlJson = xmlConvert.xml2js(response.body);
      const xmlParsed =
        xmlJson.elements[0].elements[0].elements[0].elements[0].elements;
      let xmlObj = {};
      for (let i = 0; i < xmlParsed.length; i++) {
        xmlObj[xmlParsed[i].name.substring(4, xmlParsed[i].name.length)] =
          xmlParsed[i].elements;
      }
      if (typeof xmlObj.ap[0].text !== "undefined") {
        resultObj = { message: xmlObj.ap[0].text, type: "success" };
      }
    } catch (e) {
      //console.log(e);
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//updateDeliveryFeedbackSecret

router.post("/update-delivery-feedback-secret", async (req, res) => {
  try {
    let resultObj = { message: null, type: "error" };
    const result = await Admin.updateDeliveryFeedbackSecret();
    if (result) {
      resultObj = { message: result, type: "success" };
    }
    res.json(resultObj);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

module.exports = router;
