const mongoose = require("mongoose");
const Moment = require("moment");
const dotenv = require("dotenv");
import { nanoid } from 'nanoid'
dotenv.config();
const Ads = require("./Ads");
const User = require("./User");
const PriceList = require("./PriceList");
const CurrencyMap = require("./CurrencyMap");

const { Schema } = mongoose;
const { TIMEZONE } = process.env;

const mongoSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  id: {
    type: String,
    default: () => nanoid(),
  },
  ad: {
    type: Schema.Types.ObjectId,
    ref: "Ads",
  },
  status: {
    type: String,
    default: "OnGoing", //OnGoing, Failed, Collected, Refunded
  },
  moneyHold: { type: Number, default: 0 },
  moneyEarn: { type: Number, default: 0 },
  moneyToCompany: {
    type: Number,
    default: 0,
  },
  checks: [
    {
      checkDate: Date,
      result: Boolean,
    },
  ],
  fbPostId: {
    type: String,
  },
}
  ,
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  });

class AdsShareClass {
  //checked 2019-06-03
  //checked 2019-06-03
  static async addAds({ user, ad, fbPostId }) {
    let ads = null;
    let haveAds = await AdsShare.postedThisAd({
      user,
      ad,
    });
    if (!haveAds) {
      let findAd = await Ads.findById(ad);
      let findUser = await User.findById(user);
      let friend = Math.floor(findUser.fbFriends / 100) * 100;
      if (friend > 1500) friend = 1500;
      let findCurrency = await CurrencyMap.findOne({
        mobilePrefix: findUser.mobilePrefix,
      });
      let userEarn = await PriceList.findOne({
        currency: findCurrency.currency,
        speed: findAd.speed,
        friend,
      });
      //console.log({ findCurrency, userEarn });
      ads = await AdsShare.create({
        user,
        ad,
        fbPostId,
        moneyHold: userEarn.totalPrice,
        moneyEarn: userEarn.sharePrice,
        moneyToCompany:
          Math.floor((userEarn.totalPrice - userEarn.sharePrice) * 100) / 100,
      });
      if (ads) {
        await Ads.findByIdAndUpdate(ad, {
          $inc: { totalShare: 1, budgetRemain: -userEarn.totalPrice },
        });
        /*await User.findByIdAndUpdate(user, {
          $inc: { money: -userEarn.totalPrice },
        });*/
      }
    }
    return ads;
  }

  static async postedThisAd({ user, ad }) {
    let haveAds = await AdsShare.findOne({
      user,
      ad,
      status: { $in: ["OnGoing", "Collected"] },
    });
    return haveAds;
  }
}

mongoSchema.loadClass(AdsShareClass);

const AdsShare = mongoose.model("AdsShare", mongoSchema);

module.exports = AdsShare;
