const RegisterLog = require("./models/RegisterLog");
const Cart = require("./models/Cart");
const Tracking = require("./models/Tracking");
const User = require("./models/User");
const Currency = require("./models/Currency");
const Marketing = require("./models/Marketing");
const dev = process.env.NODE_ENV !== "production";
const axios = require("axios");

function endPoint({ server, app }) {
  server.get("*", async (req, res, next) => {
    //currency
    if (req.query.currency) {
      const currency = await Currency.findOne({
        iso: req.query.currency,
        deleted: 0,
        disabled: 0,
      }).select("-_id -deleted -disabled -created_at");
      if (currency) {
        req.session.currency = currency;
      }
    }
    if (!req.session.currency) {
      let iso = "HKD";
      const clientIp =
        req.header("x-forwarded-for") || req.connection.remoteAddress;
      try {
        const ipfind = await axios({
          method: "get",
          url: `https://api.ipfind.com/?ip=${clientIp}&auth=01aca56c-b883-4416-bf03-b7db0bfe05c0`,
          timeout: 3000,
        });
        if (
          ipfind &&
          ipfind.status == 200 &&
          ipfind.data &&
          ipfind.data.currency
        ) {
          iso = ipfind.data.currency;
        }
        const currency = await Currency.findOne({
          iso,
          deleted: 0,
          disabled: 0,
        }).select("-_id -deleted -disabled -created_at");
        if (currency) {
          req.session.currency = currency;
        } else {
          const currency = await Currency.findOne({
            iso: "HKD",
            deleted: 0,
            disabled: 0,
          }).select("-_id -deleted -disabled -created_at");
          req.session.currency = currency;
        }
      } catch (e) {
        const currency = await Currency.findOne({
          iso: "HKD",
          deleted: 0,
          disabled: 0,
        }).select("-_id -deleted -disabled -created_at");
        req.session.currency = currency;
      }
    } else {
      const currency = await Currency.findOne({
        iso: req.session.currency.iso,
        deleted: 0,
        disabled: 0,
      }).select("-_id -deleted -disabled -created_at");
      req.session.currency = currency;
    }
    const allCurrency = await Currency.find({
      deleted: 0,
      disabled: 0,
    }).select("-_id -deleted -disabled -created_at");
    if (allCurrency) {
      req.session.allCurrency = allCurrency;
    }

    //referral
    if (req.query.Tinkerer) {
      const user = await User.findOne({ "referral.id": req.query.Tinkerer });
      if (user) {
        req.session.referral = user.referral;
      }
    }

    //marketing link
    if (req.query.fm) {
      const linkCheckExist = await Marketing.findOne({ code: req.query.fm });
      if (linkCheckExist) {
        if (!req.session.marketingIds) {
          req.session.marketingIds = [];
        }
        let linkStored = false;
        for (let i = 0; i < req.session.marketingIds.length; i++) {
          if (
            req.session.marketingIds[i].marketing == String(linkCheckExist._id)
          ) {
            linkStored = true;
            break;
          }
        }
        if (linkStored == false) {
          req.session.marketingIds.push({
            marketing: String(linkCheckExist._id),
          });
          const clickThrough = linkCheckExist.clickThrough
            ? linkCheckExist.clickThrough + 1
            : 1;
          Marketing.findOneAndUpdate(
            { code: req.query.fm },
            { clickThrough }
          ).exec();
        }
      }
    }
    next();
  });

  /*server.get("/", async (req, res, next) => {
    if (req.query.Tinkerer) {
      const user = await User.findOne({ "referral.id": req.query.Tinkerer });
      if (user) {
        req.session.referral = user.referral;
      }
    }
    next();
  });*/

  server.get("/logout", (req, res) => {
    const currency = req.session.currency;
    req.session.destroy();
    res.clearCookie("sealtech_steam");
    res.redirect("/?currency=" + currency.iso);
  });

  server.get("/validate-user/:validateCode/:referralId", async (req, res) => {
    if (req.params.referralId !== 0) {
      const user = await User.findOne({ "referral.id": req.params.referralId });
      if (user) {
        req.session.referral = user.referral;
      }
    }
    let user = await RegisterLog.authenticateEmail({
      emailAuthenticationCode: req.params.validateCode,
      ip: req.header("x-forwarded-for") || req.connection.remoteAddress,
      marketingIds: req.session.marketingIds,
    });
    const registerLog = await RegisterLog.findOne({
      "email.emailAuthenticationCode": req.params.validateCode,
    }).sort({ "email.expire": 1 });

    if (user.type === "success" && registerLog) {
      let link = registerLog.otherInfo.redirect;
      let cartId = registerLog.otherInfo.cartId;
      let trackId = registerLog.otherInfo.trackId;

      //tracking
      if (trackId) {
        Tracking.updateUser({
          userId: user._id,
          trackId: trackId,
        });
      }

      link = link == "login" ? "account" : link;
      if (!req.session.message) req.session.message = {};
      req.session.message["account"] = {
        message: "Welcome to Tinkerer!",
        type: "success",
      };
      if (link === "checkout") {
        req.session.message["checkout"] = {
          message: "Activated! Proceed with delivery address please.",
          type: "success",
        };
      }
      if (cartId) {
        const cartObj = await Cart.getCartAndUpdateUser({
          userId: user.message._id,
          cartId,
        });
        if (cartObj) {
          req.session.cartId = cartObj._id;
        }
      }
      user.message.mobile = "";
      req.session.user = user.message;
      res.redirect("/" + link);
    } else {
      res.redirect("/login");
    }
  });

  server.get("/product-list", (req, res) => {
    app.render(req, res, "/steam/product-list", {
      pageNum: "1",
    });
  });

  server.get("/buy-gift-card", (req, res) => {
    if (req.query.v) {
      app.render(req, res, "/steam/buy-gift-card", {
        v: req.query.v,
      });
    } else {
      app.render(req, res, "/steam/buy-gift-card");
    }
  });

  server.get("/bundle", (req, res) => {
    if (req.query.m) {
      app.render(req, res, "/steam/bundle", {
        m: req.query.m,
      });
    } else {
      app.render(req, res, "/steam/bundle");
    }
  });

  server.get("/gift-list", (req, res) => {
    if (req.query.t) {
      app.render(req, res, "/steam/gift-list", {
        t: req.query.t,
      });
    } else {
      app.render(req, res, "/steam/gift-list");
    }
  });

  server.get("/product-list/page/:pageNum", (req, res) => {
    app.render(req, res, "/steam/product-list", {
      pageNum: req.params.pageNum,
    });
  });

  server.get("/product-detail/:name/:productId", (req, res) => {
    app.render(req, res, "/steam/product-detail", {
      productId: req.params.productId,
      name: req.params.name,
    });
  });

  server.get("/product-video/:name/:productId", (req, res) => {
    app.render(req, res, "/steam/product-video", {
      productId: req.params.productId,
      name: req.params.name,
    });
  });

  server.get("/order-detail/:orderId", (req, res) => {
    app.render(req, res, "/steam/order-detail", {
      orderId: req.params.orderId,
    });
  });

  server.get(
    "/product-feedback/:deliveryId/:rating/:feedbackSecret",
    (req, res) => {
      app.render(req, res, "/steam/product-feedback", {
        deliveryId: req.params.deliveryId,
        rating: req.params.rating,
        feedbackSecret: req.params.feedbackSecret,
      });
    }
  );

  server.get(
    "/cancel-subscription-feedback/:subscriptionId/:feedbackSecret",
    (req, res) => {
      app.render(req, res, "/steam/cancel-subscription-feedback", {
        subscriptionId: req.params.subscriptionId,
        feedbackSecret: req.params.feedbackSecret,
      });
    }
  );

  server.get("/reset-password/:code", (req, res) => {
    app.render(req, res, "/steam/reset-password", {
      code: req.params.code,
    });
  });
}

module.exports = endPoint;
