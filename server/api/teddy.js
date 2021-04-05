const express = require("express");
const User = require("../models/User");
const Order = require("../models/Order");
const Ads = require("../models/Ads");
const AdsShare = require("../models/AdsShare");
const PriceList = require("../models/PriceList");
const CurrencyMap = require("../models/CurrencyMap");
const Payout = require("../models/Payout");
const Sms = require("../models/Sms");

const {
  stripeCustomerCreate,
  stripeCustomerCharge,
  stripeCustomerCardToken,
} = require("../helper/stripe");
const Moment = require("moment");
const hasha = require("hasha");
const Axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const router = express.Router();

router.post("/registration", async (req, res) => {
  try {
    let result = null;
    let fbTokenDecrypt = null;
    const { email, password, mobile, mobilePrefixCountry, fbToken } = req.body;
    const mobilePrefixList = {
      hk: "852",
      tw: "886",
      macao: "853",
    };
    if (fbToken) {
      const APIresult = await Axios({
        method: "get",
        url: `https://graph.facebook.com/${fbToken.userID}?fields=id,name,email,picture.width(400).height(400),birthday,friends&access_token=${fbToken.accessToken}`,
      });
      const APIgetPermToken = await Axios({
        method: "get",
        url: `https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.FBAPPID}&client_secret=${process.env.FBAPPSECRET}&fb_exchange_token=${fbToken.accessToken}`,
      });
      if (
        APIresult.data &&
        APIresult.data.id &&
        APIgetPermToken.data &&
        APIgetPermToken.data.access_token
      ) {
        fbTokenDecrypt = APIresult.data;
        fbTokenDecrypt.fbLongToken = APIgetPermToken.data;
        if (fbTokenDecrypt.fbLongToken.expires_in) {
          fbTokenDecrypt.fbLongToken.expiryDate = Moment().add(
            fbTokenDecrypt.fbLongToken.expires_in - 60,
            "seconds"
          );
        }
        const APIgetPermPageToken = await Axios({
          method: "get",
          url: `https://graph.facebook.com/${APIresult.data.id}/accounts?access_token=${APIgetPermToken.data.access_token}`,
        });
        if (APIgetPermPageToken.data && APIgetPermPageToken.data.data) {
          fbTokenDecrypt.fbPageTokens = APIgetPermPageToken.data.data;
        }
      }
    }
    result = await User.signUp({
      email,
      password,
      mobile,
      mobilePrefix: mobilePrefixList[mobilePrefixCountry],
      registerType: "email",
      ip: req.header("x-forwarded-for") || req.connection.remoteAddress,
      fbTokenDecrypt,
    });

    res.json(result);
    //res.json({ a: 123 });
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

//checked 2019-06-03
router.post("/signin", async (req, res) => {
  try {
    const { password, email } = req.body;
    let user = null;
    user = await User.signInEmail({
      email,
      password,
    });
    let result = {
      message: "Login failed, email / password incorrect.",
      type: "error",
    };
    if (user) {
      const currencyMap = await CurrencyMap.findOne({
        mobilePrefix: user.mobilePrefix,
      });
      user.currency = currencyMap;
      if (user && user.fbFriends && user.fbFriends > 100) {
        if (currencyMap) {
          let friend = Math.floor(user.fbFriends / 100) * 100;
          if (friend > 1500) friend = 1500;
          const priceList = await PriceList.find({
            friend,
            currency: currencyMap.currency,
          });
          let priceListMap = {};
          for (let i = 0; i < priceList.length; i++) {
            const currencyItem = priceList[i];
            priceListMap[currencyItem.speed] = currencyItem.sharePrice;
          }
          user.priceList = priceListMap;
        }
      }
      if (user.disabled || user.deleted) {
        result = { message: "This account has been banned.", type: "error" };
      } else {
        //req.session.user = user;
        result = {
          message: user,
          type: "success",
        };
      }
    }
    res.json(result);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/submit-payment", async (req, res) => {
  try {
    let result = {
      message: "Payment Failed",
      type: "error",
    };
    const {
      email,
      password,
      number,
      exp_month,
      exp_year,
      cvc,
      payment_type,
      totalAmount,
      stripe_charge,
    } = req.body;
    if (payment_type == "creditCard" || payment_type == "storedCreditCard") {
      const user = await User.findOne({ email, password });
      let cardToken = null;
      let customer = null;
      let stripeChargeResult = null;
      if (user) {
        if (payment_type == "creditCard") {
          cardToken = await stripeCustomerCardToken({
            card: {
              number,
              exp_month,
              exp_year,
              cvc,
            },
          });
          if (cardToken && cardToken.id) {
            customer = await stripeCustomerCreate({
              description: "ASPF APP Client",
              stripeTokenId: cardToken.id,
              email: user.email,
              phone: user.mobilePrefix + user.mobile,
            });
          }
          if (customer && customer.id) {
            await User.findByIdAndUpdate(user._id, {
              $set: {
                stripeCustomer: {
                  id: customer.id,
                  brand: customer.sources.data[0].brand,
                  last4: customer.sources.data[0].last4,
                },
              },
            });
            result = {
              message: "Update Credit Card Success",
              type: "success",
            };
          }
        }
        if (stripe_charge == true) {
          if (payment_type == "storedCreditCard") {
            customer = user.stripeCustomer;
          }
          if (customer.id) {
            stripeChargeResult = await stripeCustomerCharge({
              amount: totalAmount * 100,
              customerId: customer.id,
              description: "ASPF APP Credit Card",
            });
            if (
              stripeChargeResult &&
              stripeChargeResult.status == "succeeded"
            ) {
              await User.findByIdAndUpdate(user._id, {
                $inc: { money: totalAmount },
              });
              await Order.saveOrder({
                user: user._id,
                totalAmount,
                stripeCharge: stripeChargeResult,
                orderIp:
                  req.header("x-forwarded-for") || req.connection.remoteAddress,
              });
              result = {
                message: "Payment Success",
                type: "success",
              };
            }
          }
        }
      }
    }
    res.json(result);
  } catch (err) {
    console.log(err);
    res.json({
      message: err.message,
      type: "error",
    });
  }
});

//checked 2019-06-03
router.post("/delete-card", async (req, res) => {
  try {
    const { password, email } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
      await User.findByIdAndUpdate(user._id, {
        $set: {
          stripeCustomer: null,
        },
      });
    }
    const result = {
      message: "",
      type: "success",
    };
    res.json(result);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//checked 2019-06-03
router.post("/get-order", async (req, res) => {
  try {
    const { password, email } = req.body;
    const user = await User.findOne({ email, password });
    let result = {
      message: "",
      type: "success",
    };
    if (user) {
      const order = await Order.find({ user: user._id }).sort({
        created_at: -1,
      });
      result = {
        message: order,
        type: "success",
      };
    }
    res.json(result);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//checked 2019-06-03
router.post("/get-order-by-id", async (req, res) => {
  try {
    const { password, email, orderId } = req.body;
    const user = await User.findOne({ email, password });
    let result = {
      message: "",
      type: "error",
    };
    if (user) {
      const order = await Order.findById(orderId);
      if (order && String(order.user) == String(user._id))
        result = {
          message: order,
          type: "success",
        };
    }
    res.json(result);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//checked 2019-06-03
router.post("/signin-facebook", async (req, res) => {
  try {
    let result = {
      message: "",
      type: "error",
    };
    let user = null;
    const { fbToken, email, password } = req.body;
    console.log({ fbToken, email, password });
    const APIresult = await Axios({
      method: "get",
      url: `https://graph.facebook.com/${fbToken.userID}?fields=id,name,email,picture.width(400).height(400),birthday,friends,gender&access_token=${fbToken.accessToken}`,
    });
    console.log(
      `https://graph.facebook.com/${fbToken.userID}?fields=id,name,email,picture.width(400).height(400),birthday,friends&access_token=${fbToken.accessToken}`
    );
    if (APIresult.data && APIresult.data.id) {
      if (email && password) {
        user = await User.findOne({
          email,
          password,
        })
          .sort({ created_at: -1 })
          .lean();
      } else {
        console.log(1);
        user = await User.findOne({
          fbId: APIresult.data.id,
        })
          .sort({ created_at: -1 })
          .lean();
        //console.log(user._id);
      }
    }
    if (user) {
      const currencyMap = await CurrencyMap.findOne({
        mobilePrefix: user.mobilePrefix,
      });
      user.currency = currencyMap;
      if (user && user.fbFriends && user.fbFriends > 100) {
        if (currencyMap) {
          let friend = Math.floor(user.fbFriends / 100) * 100;
          if (friend > 1500) friend = 1500;
          const priceList = await PriceList.find({
            friend,
            currency: currencyMap.currency,
          });
          let priceListMap = {};
          for (let i = 0; i < priceList.length; i++) {
            const currencyItem = priceList[i];
            priceListMap[currencyItem.speed] = currencyItem.sharePrice;
          }
          user.priceList = priceListMap;
        }
      }
      const APIgetPermToken = await Axios({
        method: "get",
        url: `https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.FBAPPID}&client_secret=${process.env.FBAPPSECRET}&fb_exchange_token=${fbToken.accessToken}`,
      });
      console.log(
        `https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.FBAPPID}&client_secret=${process.env.FBAPPSECRET}&fb_exchange_token=${fbToken.accessToken}`
      );
      if (APIgetPermToken.data && APIgetPermToken.data.access_token) {
        let fbLongToken = APIgetPermToken.data;
        if (fbLongToken.expires_in) {
          fbLongToken.expiryDate = Moment().add(
            fbLongToken.expires_in - 60,
            "seconds"
          );
        }
        let fbPageTokens = null;
        const APIgetPermPageToken = await Axios({
          method: "get",
          url: `https://graph.facebook.com/${APIresult.data.id}/accounts?access_token=${APIgetPermToken.data.access_token}`,
        });
        console.log(
          `https://graph.facebook.com/${APIresult.data.id}/accounts?access_token=${APIgetPermToken.data.access_token}`
        );
        if (APIgetPermPageToken.data && APIgetPermPageToken.data.data) {
          fbPageTokens = APIgetPermPageToken.data.data;
        }
        await User.findByIdAndUpdate(user._id, {
          fbLongToken,
          fbPageTokens,
          fbFriends: APIresult.data.friends.summary.total_count,
          fbId: fbToken.userID,
          gender: APIresult.data.gender,
          birthday: Moment(APIresult.data.birthday),
          name: APIresult.data.name,
          image: APIresult.data.picture.data.url,
        });
        user.fbLongToken = fbLongToken;
        user.fbPageTokens = fbPageTokens;
        user.fbFriends = APIresult.data.friends.summary.total_count;
        user.fbId = fbToken.userID;
        user.birthday = Moment(APIresult.data.birthday);
        user.gender = APIresult.data.gender;
        user.name = APIresult.data.name;
        user.image = APIresult.data.picture.data.url;
      }
      if (user.disabled || user.deleted) {
        result = { message: "This account has been banned.", type: "error" };
      } else {
        //req.session.user = user;
        result = {
          message: user,
          type: "success",
        };
      }
    }
    res.json(result);
  } catch (err) {
    console.log(err);
    res.json({ error: err.message || err.toString() });
  }
});

//checked 2019-06-03
router.post("/signin-google", async (req, res) => {
  try {
    let result = {
      message: "",
      type: "error",
    };
    let user = null;
    const { googleToken, email, password } = req.body;
    console.log(googleToken);
    /*
    if (email && password) {
      user = await User.findOne({
        email,
        password,
      })
        .sort({ created_at: -1 })
        .lean();
    } else {
      user = await User.findOne({
        googleId: APIresult.data.id,
      })
        .sort({ created_at: -1 })
        .lean();
    }
    if (user) {
      if (user.disabled || user.deleted) {
        result = { message: "This account has been banned.", type: "error" };
      } else {
        result = {
          message: user,
          type: "success",
        };
      }
    }*/
    res.json(result);
  } catch (err) {
    console.log(err);
    res.json({ error: err.message || err.toString() });
  }
});

//facebook post ads
router.post("/get-fan-pages", async (req, res) => {
  console.log(1);
  try {
    const { password, email } = req.body;
    const user = await User.findOne({ email, password });
    let result = {
      message: "",
      type: "error",
    };
    if (user && user.fbPageTokens && user.fbPageTokens.length > 0) {
      result = {
        message: user.fbPageTokens,
        type: "success",
      };
    }
    res.json(result);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//make ads
router.post("/make-an-ad", async (req, res) => {
  try {
    const { password, email, adDetail, useCredit, useMoneyEarn } = req.body;
    const user = await User.findOne({ email, password });
    let canInsertAd = false;
    let result = {
      message: "",
      type: "error",
    };
    let oldAd = null;
    if (user && user.stripeCustomer.id) {
      let totalAmount = adDetail.budget;

      if (adDetail._id) {
        oldAd = await Ads.findById(adDetail._id);
        if (String(oldAd.user) != String(user._id)) {
          res.json(result);
          return;
        }
        totalAmount = parseInt((adDetail.budget - oldAd.budget) * 100) / 100;
      }

      console.log({ amount1: totalAmount });
      if (useCredit) {
        if (user.money - totalAmount >= 0) {
          const money = parseInt((user.money - totalAmount) * 100) / 100;
          await User.findByIdAndUpdate(user._id, { money });
          totalAmount = 0;
          canInsertAd = true;
        } else if (user.money - totalAmount < 0) {
          totalAmount = parseInt((totalAmount - user.money) * 100) / 100;
          await User.findByIdAndUpdate(user._id, { money: 0 });
        }
      }
      console.log({ amount2: totalAmount });
      if (useMoneyEarn) {
        if (user.moneyEarn - totalAmount >= 0) {
          const moneyEarn =
            parseInt((user.moneyEarn - totalAmount) * 100) / 100;
          await User.findByIdAndUpdate(user._id, { moneyEarn });
          totalAmount = 0;
          canInsertAd = true;
        } else if (user.moneyEarn - totalAmount < 0) {
          totalAmount = parseInt((totalAmount - user.moneyEarn) * 100) / 100;
          await User.findByIdAndUpdate(user._id, { moneyEarn: 0 });
        }
      }
      console.log({ amount3: totalAmount });
      const customer = user.stripeCustomer;
      if (customer.id && totalAmount > 0) {
        const stripeChargeResult = await stripeCustomerCharge({
          amount: totalAmount * 100,
          customerId: customer.id,
          description: "ASPF APP Credit Card",
        });
        if (stripeChargeResult && stripeChargeResult.status == "succeeded") {
          await Order.saveOrder({
            user: user._id,
            adDetail,
            totalAmount,
            stripeCharge: stripeChargeResult,
            orderIp:
              req.header("x-forwarded-for") || req.connection.remoteAddress,
          });
          //if (useCredit) await User.findByIdAndUpdate(user._id, { money: 0 });
          canInsertAd = true;
        }
      }

      if (!adDetail._id) {
        if (canInsertAd) {
          adDetail.user = user._id;
          adDetail.budgetRemain = adDetail.budget;
          const ads = await Ads.createAds({ adDetail });
          if (ads)
            result = {
              message: ads._id,
              type: "success",
            };
        }
      } else {
        //adDetail.budgetRemain = adDetail.budget;
        delete adDetail._id;
        adDetail.status = "onGoing";
        const result3 = await Ads.findByIdAndUpdate(oldAd._id, adDetail);
        const result2 = await Ads.findByIdAndUpdate(oldAd._id, {
          $inc: {
            budgetRemain:
              parseInt((adDetail.budget - oldAd.budget) * 100) / 100,
          },
        });
        result = {
          message: oldAd._id,
          type: "success",
        };
        //modify
      }
    }
    res.json(result);
  } catch (err) {
    console.log(err);
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/stop-an-ad", async (req, res) => {
  try {
    let result = {
      message: "",
      type: "error",
    };
    const { password, email, adId } = req.body;
    const status = await stopAnAd({
      password,
      email,
      adId,
      stopForever: false,
    });
    if (status) {
      result = {
        message: status,
        type: "success",
      };
    }
    res.json(result);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

async function stopAnAd({ password, email, adId, stopForever }) {
  //const { password, email, adId } = req.body;
  //console.log({ password, email, adId });
  console.log("Stop Ad");
  try {
    console.log({ password, email, adId, stopForever });
    const user = await User.findOne({
      $or: [
        { email, password: hasha(password) },
        { email, password: password },
      ],
    });
    const ad = await Ads.findById(adId);
    if (user && ad && String(ad.user) == String(user._id) && !ad.stopForever) {
      const status = ad.status == "onGoing" ? "stopped" : "onGoing";
      //await Ads.findByIdAndUpdate(adId, { status });
      if (status == "stopped") {
        const giveBack = ad.budgetRemain;
        await Ads.findOneAndUpdate(
          { _id: adId, status: "onGoing" },
          { status, budgetRemain: 0, stopForever }
        );
        //await Ads.findByIdAndUpdate(adId, { status, budgetRemain: 0 });
        await User.findByIdAndUpdate(user._id, {
          $inc: { money: parseInt(giveBack * 100) / 100 },
        });
        const adsShareList = await AdsShare.find({
          ad: ad._id,
          status: "OnGoing",
        });
        //console.log(adsShareList);
        for (let i = 0; i < adsShareList.length; i++) {
          const adData = adsShareList[i];
          User.findByIdAndUpdate(adData.user, {
            $inc: { moneyEarn: adData.moneyEarn },
          }).exec();
          AdsShare.findByIdAndUpdate(adData._id, {
            status: "Collected",
          }).exec();
        }
      } else {
        await Ads.findByIdAndUpdate(adId, { status });
      }
      return status;
    }
    return null;
  } catch (err) {
    console.log(err);
  }
}

//make ads
router.post("/get-merchant-ads", async (req, res) => {
  try {
    const { password, email, filter, searchWord } = req.body;
    const user = await User.findOne({ email, password });
    let result = {
      message: "",
      type: "error",
    };
    if (user) {
      /*const ads = await Ads.find({ user: user._id }).sort({ created_at: -1 });*/
      const ads = await Ads.findAds({
        match: {
          user: user._id,
          "selectedPost.from.name": { $regex: searchWord, $options: "i" },
          adsType: {
            $regex:
              filter.adsType && filter.adsType != "all" ? filter.adsType : "",
            $options: "i",
          },
          status: {
            $regex:
              filter.adsType && filter.status != "all" ? filter.status : "",
            $options: "i",
          },
        },
        sort: {
          _id: -1,
        },
      });
      if (ads)
        result = {
          message: ads,
          type: "success",
        };
    }
    res.json(result);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-merchant-ads-detail", async (req, res) => {
  try {
    let result = {
      message: "",
      type: "error",
    };
    const { password, email, adId } = req.body;
    const user = await User.findOne({ email, password });
    const ad = await Ads.findById(adId);
    if (user && ad && String(ad.user) == String(user._id)) {
      const now = Moment().format("YYYY-MM-DD");
      const daysBeforeOrg = Moment(
        Moment(now).add(-4, "days").format("YYYY-MM-DD")
      );
      const daysBefore5 = Moment(
        Moment(now).add(-4, "days").format("YYYY-MM-DD")
      ).format("MM-DD");
      const daysBefore4 = Moment(
        Moment(now).add(-3, "days").format("YYYY-MM-DD")
      ).format("MM-DD");
      const daysBefore3 = Moment(
        Moment(now).add(-2, "days").format("YYYY-MM-DD")
      ).format("MM-DD");
      const daysBefore2 = Moment(
        Moment(now).add(-1, "days").format("YYYY-MM-DD")
      ).format("MM-DD");
      const daysBefore1 = Moment(Moment(now).format("YYYY-MM-DD")).format(
        "MM-DD"
      );
      //male
      let fiveDays = await AdsShare.find({
        ad: ad._id,
        created_at: {
          $gte: daysBeforeOrg,
        },
      }).populate("user");
      let allDays = await AdsShare.find({
        ad: ad._id,
      }).populate("user");
      let graph = {
        [daysBefore5]: 0,
        [daysBefore4]: 0,
        [daysBefore3]: 0,
        [daysBefore2]: 0,
        [daysBefore1]: 0,
      };
      let genderGraph = {
        male: { "Total share": 0, "Total spend": 0 },
        female: { "Total share": 0, "Total spend": 0 },
        all: { "Total share": 0, "Total spend": 0 },
      };
      let ageGraph = {
        "16-25": { "Total share": 0, "Total spend": 0 },
        "26-35": { "Total share": 0, "Total spend": 0 },
        "36-45": { "Total share": 0, "Total spend": 0 },
        "46-55": { "Total share": 0, "Total spend": 0 },
        "56-65+": { "Total share": 0, "Total spend": 0 },
        Unknown: { "Total share": 0, "Total spend": 0 },
      };

      let locationGraph = {
        "Hong Kong": { "Total share": 0, "Total spend": 0 },
        Macau: { "Total share": 0, "Total spend": 0 },
        Taiwan: { "Total share": 0, "Total spend": 0 },
      };
      let totalGraph = { Total: { "Total share": 0, "Total spend": 0 } };
      if (fiveDays) {
        for (let i = 0; i < fiveDays.length; fiveDays++) {
          const data = fiveDays[i];
          //console.log(data);
          const daysBefore = Moment(data.created_at).format("MM-DD");
          graph[daysBefore] += 1;
        }
      }
      if (allDays) {
        for (let i = 0; i < allDays.length; allDays++) {
          const data = allDays[i];

          const age = 0;
          if (data.user.birthday) {
            age = parseInt(
              Moment(now).diff(Moment(data.user.birthday), "years")
            );
            if (age >= 56) {
              ageGraph["56-65+"]["Total share"] += 1;
              ageGraph["56-65+"]["Total spend"] += data.moneyHold;
            } else if (age >= 46) {
              ageGraph["46-55"]["Total share"] += 1;
              ageGraph["46-55"]["Total spend"] += data.moneyHold;
            } else if (age >= 36) {
              ageGraph["36-45"]["Total share"] += 1;
              ageGraph["36-45"]["Total spend"] += data.moneyHold;
            } else if (age >= 26) {
              ageGraph["26-35"]["Total share"] += 1;
              ageGraph["26-35"]["Total spend"] += data.moneyHold;
            } else if (age >= 16) {
              ageGraph["16-25"]["Total share"] += 1;
              ageGraph["16-25"]["Total spend"] += data.moneyHold;
            }
          } else {
            ageGraph["Unknown"]["Total share"] += 1;
            ageGraph["Unknown"]["Total spend"] += data.moneyHold;
          }

          if (data.user.gender) {
            genderGraph[data.user.gender]["Total share"] += 1;
            genderGraph[data.user.gender]["Total spend"] += data.moneyHold;
            genderGraph["all"]["Total share"] += 1;
            genderGraph["all"]["Total spend"] += data.moneyHold;
          } else {
            genderGraph["all"]["Total share"] += 1;
            genderGraph["all"]["Total spend"] += data.moneyHold;
          }

          const region = {
            852: "Hong Kong",
            853: "Macau",
            886: "Taiwan",
          };
          locationGraph[region[data.user.mobilePrefix]]["Total share"] += 1;
          locationGraph[region[data.user.mobilePrefix]]["Total spend"] +=
            data.moneyHold;

          totalGraph["Total"]["Total share"] += 1;
          totalGraph["Total"]["Total spend"] += data.moneyHold;
        }
      }
      result = {
        message: { graph, ageGraph, totalGraph, genderGraph, locationGraph },
        type: "success",
      };
    }
    res.json(result);
  } catch (err) {
    console.log(err);
    res.json({ error: err.message || err.toString() });
  }
});

async function getSearchParam(user) {
  let result = {};
  if (user.gender) {
  } else {
    result.gender = "all";
  }
  return result;
}

//public-access
router.post("/get-ads-home", async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = null;
    let searchParam = {};
    if (email && password) {
      user = await User.findOne({ email, password });
      if (user) searchParam = await getSearchParam(user);
      //console.log(searchParam);
    }
    //console.log({ email, password });
    let result = {
      message: "",
      type: "error",
    };
    let adSharedList = {};
    const recently = await Ads.find({ status: "onGoing", ...searchParam })
      .limit(8)
      .sort({ created_at: -1 })
      .lean();
    const popular = await Ads.find({ status: "onGoing", ...searchParam })
      .limit(8)
      .sort({ totalShare: -1 })
      .lean();
    const recommanded = await Ads.find({ status: "onGoing", ...searchParam })
      .limit(8)
      .sort({ speed: 1, created_at: -1 })
      .lean();

    if (user) {
      let adIdList = [];
      for (let i = 0; i < recently.length; i++) {
        adIdList.push(recently[i]._id);
      }
      for (let i = 0; i < popular.length; i++) {
        adIdList.push(popular[i]._id);
      }
      for (let i = 0; i < recommanded.length; i++) {
        adIdList.push(recommanded[i]._id);
      }
      const adsShare = await AdsShare.find({
        user: user._id,
        ad: { $in: adIdList },
      });

      for (let i = 0; i < adsShare.length; i++) {
        adSharedList[adsShare[i].ad] = "Y";
      }
      //console.log(adsShare);
    }

    result = {
      message: { recently, popular, recommanded, adSharedList },
      type: "success",
    };
    res.json(result);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//public-access
router.post("/get-ads-home-2", async (req, res) => {
  try {
    let adSharedList = {};
    const { searchWord, email, password } = req.body;
    let result = {
      message: "",
      type: "error",
    };
    const fbPost = await Ads.findAds({
      limit: 16,
      sort: {
        created_at: -1,
      },
      match: searchWord
        ? {
          adsType: "Facebook Post",
          "selectedPost.from.name": { $regex: searchWord, $options: "i" },
          status: "onGoing",
        }
        : {
          adsType: "Facebook Post",
          status: "onGoing",
        },
    });
    const fbLive = await Ads.findAds({
      limit: 16,
      sort: {
        created_at: -1,
      },
      match: searchWord
        ? {
          adsType: "Facebook Live",
          "selectedPost.from.name": { $regex: searchWord, $options: "i" },
          status: "onGoing",
        }
        : {
          adsType: "Facebook Live",
          status: "onGoing",
        },
    });
    /*const fbLike = await Ads.find({ adsType: "Facebook Like" })
      .limit(8)
      .sort({ totalShare: -1 });*/

    if (email && password) {
      const user = await User.findOne({ email, password });
      //console.log(user);
      if (user) {
        let adIdList = [];
        for (let i = 0; i < fbPost.length; i++) {
          adIdList.push(fbPost[i]._id);
        }
        for (let i = 0; i < fbLive.length; i++) {
          adIdList.push(fbLive[i]._id);
        }
        const adsShare = await AdsShare.find({
          user: user._id,
          ad: { $in: adIdList },
        });

        for (let i = 0; i < adsShare.length; i++) {
          adSharedList[adsShare[i].ad] = "Y";
        }
        //console.log(adsShare);
      }
    }
    result = {
      message: { fbPost, fbLive, adSharedList },
      type: "success",
    };
    res.json(result);
  } catch (err) {
    console.log(err);
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-ads-by-type", async (req, res) => {
  try {
    let result = {
      message: "",
      type: "error",
    };
    let adSharedList = {};
    let adsList = null;
    const { type, searchWord, email, password } = req.body;
    console.log(type);
    switch (type) {
      case "popular":
        adsList = await Ads.findAds({
          sort: { totalShare: -1 },
          match: searchWord
            ? {
              "selectedPost.from.name": { $regex: searchWord, $options: "i" },
              status: "onGoing",
            }
            : { status: "onGoing" },
        });
        break;
      case "recently":
        // code block
        adsList = await Ads.findAds({
          sort: { created_at: -1 },
          match: searchWord
            ? {
              "selectedPost.from.name": { $regex: searchWord, $options: "i" },
              status: "onGoing",
            }
            : { status: "onGoing" },
        });
        break;
      case "recommand":
        // code block
        adsList = await Ads.findAds({
          sort: { speed: 1, created_at: -1 },
          match: searchWord
            ? {
              "selectedPost.from.name": { $regex: searchWord, $options: "i" },
              status: "onGoing",
            }
            : { status: "onGoing" },
        });
        break;
      case "fbPost":
        // code block
        adsList = await Ads.findAds({
          sort: {
            created_at: -1,
          },
          match: searchWord
            ? {
              adsType: "Facebook Post",
              "selectedPost.from.name": { $regex: searchWord, $options: "i" },
              status: "onGoing",
            }
            : {
              adsType: "Facebook Post",
              status: "onGoing",
            },
        });
        break;
      case "fbLike":
        // code block
        adsList = await Ads.find({
          adsType: "Facebook Like",
          status: "onGoing",
        }).sort({
          created_at: -1,
        });
        break;
      case "fbLive":
        // code block
        adsList = await Ads.findAds({
          sort: {
            created_at: -1,
          },
          match: searchWord
            ? {
              adsType: "Facebook Live",
              "selectedPost.from.name": { $regex: searchWord, $options: "i" },
              status: "onGoing",
            }
            : {
              adsType: "Facebook Live",
              status: "onGoing",
            },
        });
        break;
      default:
      // code block
    }
    if (email && password) {
      const user = await User.findOne({ email, password });
      //console.log(user);
      if (user) {
        let adIdList = [];
        for (let i = 0; i < adsList.length; i++) {
          adIdList.push(adsList[i]._id);
        }
        const adsShare = await AdsShare.find({
          user: user._id,
          ad: { $in: adIdList },
        });

        for (let i = 0; i < adsShare.length; i++) {
          adSharedList[adsShare[i].ad] = "Y";
        }
        //console.log(adsShare);
      }
    }
    result = {
      message: adsList,
      adSharedList,
      type: "success",
    };
    res.json(result);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//make ads
router.post("/check-shared-ad", async (req, res) => {
  try {
    const { password, email, adId, checkSharedPre } = req.body;
    const user = await User.findOne({ email, password });
    const ad = await Ads.findById(adId).populate("user");
    let result = {
      message: "",
      type: "error",
    };
    if (user && ad) {
      if (!user.fbFriends || user.fbFriends < 100) {
        result = {
          message: "not enough friends",
          type: "error",
        };
        res.json(result);
        return;
      }
      //check shared frequency.
      //check total shared ad.
      //check last shared ad
      const today = Moment().format("YYYY-MM-DD");
      const todayStart = today + " 00:00:00";
      const todayEnd = today + " 23:59:59";
      const lastSharedAd = await AdsShare.findOne({ user: user._id }).sort({
        created_at: -1,
      });
      const orgShareSec = 600;
      let sharedSecondAgo = orgShareSec;
      //console.log(lastSharedAd);
      const totalSharedAdByType = await AdsShare.find({
        user: user._id,
        status: "OnGoing",
        created_at: { $gte: todayStart, $lte: todayEnd },
      }).populate("ad");
      console.log(totalSharedAdByType);
      let fbPostShareCount = 0;
      let fbLiveShareCount = 0;
      for (let i = 0; i < totalSharedAdByType.length; i++) {
        const adType = totalSharedAdByType[i].ad.adsType;
        if (adType == "Facebook Post") {
          fbPostShareCount += 1;
        } else {
          fbLiveShareCount += 1;
        }
      }
      if (lastSharedAd)
        sharedSecondAgo = Moment().diff(
          Moment(lastSharedAd.created_at),
          "seconds"
        );
      else {
        sharedSecondAgo = 601;
      }
      console.log({
        fbPostShareCount,
        fbLiveShareCount,
        sharedSecondAgo,
      });

      let overShared = false;
      if (ad.adType == "Facebook Post") {
        if (fbPostShareCount >= 10) overShared = true;
      }
      if (ad.adType != "Facebook Post") {
        if (fbLiveShareCount >= 10) overShared = true;
      }
      if (sharedSecondAgo <= 600) {
        overShared = true;
      }

      if (checkSharedPre) {
        res.json({
          fbPostShareCount,
          fbLiveShareCount,
          sharedSecondAgo: orgShareSec - sharedSecondAgo,
          overShared,
        });
        return;
      }

      console.log(overShared);

      if (!overShared) {
        if (ad.adsType == "Facebook Like") {
          const APIgetFirstPost = await Axios({
            method: "get",
            url: `https://graph.facebook.com/${user.fbId}/likes/${ad.fbPageDetail.id}?access_token=${user.fbLongToken.access_token}`,
          });
          if (
            APIgetFirstPost.data &&
            APIgetFirstPost.data.data[0] &&
            APIgetFirstPost.data.data[0].id == ad.fbPageDetail.id
          ) {
            const adsShare = await AdsShare.addAds({
              user: user._id,
              ad: ad._id,
              //fbPostId: APIgetFirstPost.data.data[0].id,
            });
            result = {
              message: "",
              type: "success",
            };
          }
        } else {
          if (
            (await checkPostExist({
              user: ad.user,
              postId: ad.selectedPost.id,
            })) == false
          ) {
            //stopPost();
            console.log("POST NOT EXIST");
            const status = await stopAnAd({
              password: ad.user.password,
              email: ad.user.email,
              adId,
              stopForever: true,
            });
            if (status) {
              result = {
                message: "post deleted",
                type: "error",
              };
            }
          } else {
            const permalink_url = ad.selectedPost.permalink_url;
            const firstPicUrl = ad.selectedPost.attachments
              ? ad.selectedPost.attachments.data[0].url
              : null;
            const APIgetFirstPost = await Axios({
              method: "get",
              url: `https://graph.facebook.com/${user.fbId}/posts?fields=link,message,privacy&limit=1&access_token=${user.fbLongToken.access_token}`,
            });
            console.log({
              link: APIgetFirstPost.data.data[0].link,
              permalink_url,
              firstPicUrl,
            });
            if (
              APIgetFirstPost.data &&
              (APIgetFirstPost.data.data[0].link == permalink_url ||
                APIgetFirstPost.data.data[0].link == firstPicUrl)
            ) {
              if (APIgetFirstPost.data.data[0].message) {
                result = {
                  message: "have message",
                  type: "error",
                };
              } else if (
                APIgetFirstPost.data.data[0].privacy.value != "EVERYONE"
              ) {
                result = {
                  message: "not public",
                  type: "error",
                };
              } else {
                const adsShare = await AdsShare.addAds({
                  user: user._id,
                  ad: ad._id,
                  fbPostId: APIgetFirstPost.data.data[0].id,
                });
                result = {
                  message: "",
                  type: "success",
                };
              }
            }
          }
        }
      } else {
        result = {
          message: "share too frequently",
          type: "error",
        };
      }
    }
    console.log(result);
    res.json(result);
  } catch (err) {
    let result = {
      message: "",
      type: "error",
    };
    res.json(result);
    console.log(err);
  }
});

//public-access
router.post("/check-post-exist", async (req, res) => {
  const { user, postId } = req.body;
  console.log(await checkPostExist({ user, postId }));
  res.json({});
});

router.post("/check-ad-exist-post", async (req, res) => {
  let result = {
    message: "",
    type: "true",
  };
  const { postId } = req.body;
  const adFind = await Ads.findOne({ "selectedPost.id": postId });
  if (!adFind) {
    result = {
      message: "",
      type: "false",
    };
  }
  res.json(result);
});

async function checkPostExist({ user, postId }) {
  try {
    const pageId = String(postId).split("_")[0];
    let permToken = "";
    for (let i = 0; i < user.fbPageTokens.length; i++) {
      const token = user.fbPageTokens[i];
      if (String(token.id) == String(pageId)) {
        permToken = token.access_token;
      }
    }
    //console.log(pageId);

    let result = {
      message: null,
      type: "error",
    };

    console.log(
      `https://graph.facebook.com/${postId}?access_token=${permToken}`
    );
    const APIgetFirstPost = await Axios({
      method: "get",
      url: `https://graph.facebook.com/${postId}?access_token=${permToken}`,
    });
    if (APIgetFirstPost.data) {
      result = {
        message: APIgetFirstPost.data,
        type: "success",
      };
      return true;
    }

    //console.log(APIgetFirstPost);
    return true;
  } catch (err) {
    //console.log(err);
    return false;
  }
}

//public-access
router.post("/check-posted-this-ad", async (req, res) => {
  try {
    let result = {
      message: true,
      type: "success",
    };
    const { password, email, adId } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
      const adFind = await AdsShare.postedThisAd({ user: user._id, ad: adId });
      if (!adFind)
        result = {
          message: false,
          type: "success",
        };
    }

    res.json(result);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//need delete
router.post("/create-price-list", async (req, res) => {
  try {
    await PriceList.createPriceList();

    res.json({});
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//need delete
router.post("/create-currency-map", async (req, res) => {
  try {
    await CurrencyMap.createMap();
    res.json({});
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//
router.post("/get-my-shared-ads", async (req, res) => {
  try {
    let result = {
      message: "",
      type: "error",
    };
    const { password, email } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
      const adFind = await AdsShare.find({ user: user._id })
        .populate("ad")
        .sort({
          created_at: -1,
        });
      if (adFind)
        result = {
          message: adFind,
          type: "success",
        };
    }

    res.json(result);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

//
router.post("/update-paypal-email", async (req, res) => {
  try {
    let result = {
      message: "",
      type: "error",
    };
    const { password, email, paypalEmail } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
      await User.findByIdAndUpdate(user._id, { paypalEmail });
      result = {
        message: "",
        type: "success",
      };
    }

    res.json(result);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/submit-payout", async (req, res) => {
  try {
    let result = {
      message: "",
      type: "error",
    };
    const { password, email, payoutValue } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
      await Payout.createPayout({
        user: user._id,
        amount: payoutValue,
        paypalEmail: user.paypalEmail,
      });
      result = {
        message: "",
        type: "success",
      };
    }
    res.json(result);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-make-an-ad-impression", async (req, res) => {
  try {
    let result = {
      message: "",
      type: "error",
    };
    const { password, email, adDetail } = req.body;
    const user = await User.findOne({ email, password });
    const currencyMap = await CurrencyMap.findOne({
      mobilePrefix: user.mobilePrefix,
    });
    if (user && currencyMap) {
      const price = await PriceList.findOne({
        currency: currencyMap.currency,
        friend: 100,
        speed: adDetail.speed,
      });
      result = {
        message: price.totalPrice,
        type: "success",
      };
    }
    res.json(result);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/get-visitor-price-list", async (req, res) => {
  try {
    let result = {
      message: "",
      type: "error",
    };
    const { currency, friend } = req.body;
    const priceList = await PriceList.find({
      friend,
      currency,
    });
    if (priceList.length > 0) {
      let priceListMap = {};
      for (let i = 0; i < priceList.length; i++) {
        const currencyItem = priceList[i];
        priceListMap[currencyItem.speed] = currencyItem.sharePrice;
      }
      result = {
        message: { priceList: priceListMap },
        type: "success",
      };
    }
    res.json(result);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/send-sms-code", async (req, res) => {
  try {
    let result = {
      message: "",
      type: "error",
    };
    const mobilePrefixList = {
      hk: "852",
      tw: "886",
    };
    const { mobilePrefixCountry, mobile, mobilePrefix } = req.body;
    console.log({ mobilePrefixCountry, mobile, mobilePrefix });
    const to =
      "+" +
      (mobilePrefix ? mobilePrefix : mobilePrefixList[mobilePrefixCountry]) +
      mobile;
    console.log(to);
    const ip = req.header("x-forwarded-for") || req.connection.remoteAddress;
    const send_result = await Sms.sendSms({ to, ip });
    if (send_result.result === "success") {
      result = { type: "success", message: send_result.data };
      res.json(result);
    } else {
      res.json({ error: send_result.error });
    }
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post("/check-sms-code", async (req, res) => {
  try {
    let result = {
      message: "",
      type: "error",
    };
    const { smsId, code } = req.body;
    console.log({ smsId, code });
    const smsResult = await Sms.checkSms({ _id: smsId, code });
    if (smsResult) result = { type: "success", message: "" };
    res.json(result);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

module.exports = router;
