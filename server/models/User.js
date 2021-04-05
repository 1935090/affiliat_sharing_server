const mongoose = require("mongoose");
const Moment = require("moment");
const dotenv = require("dotenv");
const { objectEquals } = require("object-equals");
dotenv.config();
const PriceList = require("./PriceList");
const CurrencyMap = require("./CurrencyMap");
//const GiftCard = require("./GiftCard");
import { nanoid } from 'nanoid'
const hasha = require("hasha");

const { Schema } = mongoose;
const mongoSchema = new Schema({
  name: {
    type: String,
  },
  mobile: {
    type: String,
    default: "",
  },
  mobilePrefix: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  userGroup: {
    type: Number,
    default: 1,
  },
  authId: {
    type: String,
  },
  image: {
    type: String,
    default: "avatar.svg",
  },
  currency: {
    iso: {
      type: String,
      default: "HKD",
    },
  },
  registerType: {
    type: String,
    required: true,
  },
  disabled: {
    type: Number,
    default: 0,
  },
  deleted: {
    type: Number,
    default: 0,
  },
  ip: {
    type: String,
  },
  money: {
    type: Number,
    default: 0,
  },
  moneyEarn: {
    type: Number,
    default: 0,
  },
  stripeCustomer: {
    type: Object,
  },
  fbId: {
    type: String,
  },

  birthday: {
    type: Date,
  },
  fbFriends: {
    type: Number,
  },
  paypalEmail: {
    type: String,
  },
  fbLongToken: {
    access_token: String,
    token_type: String,
    expires_in: Number,
    expiryDate: Date,
  },
  fbPageTokens: [
    {
      _id: false,
      access_token: {
        type: String,
      },
      name: {
        type: String,
      },
      id: {
        type: String,
      },
    },
  ],
  googleId: {
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

class UserClass {
  static async signUp({
    mobile,
    email,
    password,
    mobilePrefix,
    registerType,
    ip,
    fbTokenDecrypt,
  }) {
    if (registerType == "email") {
      let user3 = null;
      const user1 = await User.findOne({ email });
      const user2 = await User.findOne({ mobile, mobilePrefix });
      if (fbTokenDecrypt)
        user3 = await User.findOne({ fbId: fbTokenDecrypt.id });
      if (!user1 && !user2 && !user3) {
        let fbId = null;
        let birthday = null;
        let name = null;
        let image = null;
        let fbLongToken = null;
        let fbPageTokens = null;
        let fbFriends = 0;
        if (fbTokenDecrypt) {
          fbId = fbTokenDecrypt.id;
          birthday = Moment(fbTokenDecrypt.birthday);
          name = fbTokenDecrypt.name;
          image = fbTokenDecrypt.picture.data.url;
          fbLongToken = fbTokenDecrypt.fbLongToken;
          fbPageTokens = fbTokenDecrypt.fbPageTokens;
          fbFriends = fbTokenDecrypt.friends.summary.total_count;
        }
        const newUser = await User.create({
          mobile,
          mobilePrefix,
          email,
          password: hasha(password),
          registerType,
          name: email.split("@")[0],
          ip,
          fbId,
          birthday,
          name,
          image,
          fbLongToken,
          fbPageTokens,
          fbFriends,
        });

        if (newUser) {
          return {
            message: { email, password },
            type: "success",
          };
        }
        return;
      } else {
        return {
          message: "The email or mobile has already registered",
          type: "error",
        };
      }
    }
  }

  /*static async signInEmail({ email, password }) {
    let user = await User.findOne({
      email,
      password: hasha(password),
      registerType: "email",
    }).sort({ created_at: -1 });
    return user;
  }*/
  static async signInEmail({ email, password }) {
    let user = await User.findOne({
      $or: [
        { email, password: hasha(password), registerType: "email" },
        { email, password: password, registerType: "email" },
      ],
    })
      .sort({ created_at: -1 })
      .lean();
    if (user && user.fbFriends > 100) {
      const currencyMap = await CurrencyMap.findOne({
        mobilePrefix: user.mobilePrefix,
      });
      if (currencyMap) {
        const friend = Math.floor(user.fbFriends / 100) * 100;
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
    return user;
  }
}

mongoSchema.loadClass(UserClass);

const User = mongoose.model("User", mongoSchema);

module.exports = User;
