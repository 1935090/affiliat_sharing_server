const mongoose = require("mongoose");
const Moment = require("moment");
const User = require("../models/User");
const dotenv = require("dotenv");
import { nanoid } from 'nanoid'
dotenv.config();
const { TIMEZONE } = process.env;

const { Schema } = mongoose;

const mongoSchema = new Schema({
  mobile: {
    mobileNumberPrefixReg: Number,
    mobileNumberReg: Number,
    mobileAuthenticationCode: Number,
    expire: Date,
    trial: Number,
    resendNewCode: Number
  },
  email: {
    emailReg: String,
    passwordReg: String,
    emailAuthenticationCode: {
      type: String,
      unique: true
    },
    expire: Date,
    resendEmail: Number
  },
  otherInfo: {
    redirect: String,
    cartId: String,
    trackId: String
  }
});

class RegisterLogClass {
  static async createMobileRegister({
    mobileNumberReg,
    mobileNumberPrefixReg
  }) {
    var registerLog = null;
    const mobileAuthenticationCode = Math.floor(
      100000 + Math.random() * 900000
    );
    const mobile = {
      mobileNumberReg,
      mobileNumberPrefixReg,
      mobileAuthenticationCode,
      expire: Moment(),
      trial: 0,
      resendNewCode: 0
    };
    registerLog = await RegisterLog.create({
      mobile
    });
    //var registerLog = 1;
    //console.log(mobile);
    return { message: registerLog, type: "success" };
  }

  static async authenticateMobile({
    mobileAuthenticationCode,
    mobileNumberReg,
    mobileNumberPrefixReg,
    mobilePasswordReg
  }) {
    var result = null;
    result = await RegisterLog.findOne({
      "mobile.mobileAuthenticationCode": mobileAuthenticationCode,
      "mobile.mobileNumberReg": mobileNumberReg,
      "mobile.mobileNumberPrefixReg": mobileNumberPrefixReg,
      "mobile.expire": { $gte: Moment() },
      "mobile.trial": { $lte: 4 },
      "mobile.resendNewCode": { $lte: 4 }
    });

    if (result) {
      result = await User.signUp({
        mobile: mobileNumberReg,
        mobilePrefix: mobileNumberPrefixReg,
        password: mobilePasswordReg,
        userGroup: 1,
        registerType: "mobile"
      });
      return result;
    } else {
      return { message: "验证失败", type: "error" };
    }

    /*const authenticationCode = Math.floor(100000 + Math.random() * 900000);
    const mobile = {
      mobileNumberReg,
      mobileNumberPrefixReg,
      authenticationCode,
      expire: Moment().add(TIMEZONE, "hours")
    };
    registerLog = await RegisterLog.create({
      mobile
    });*/
    //var registerLog = 1;
    //console.log(mobile);
    //return result;
  }

  //checked 2019-06-03
  static async createEmailRegister({ emailReg, passwordReg, otherInfo }) {
    const user = await User.findOne({ email: emailReg, registerType: "email" });
    if (user) {
      return { message: "Email address has been registered.", type: "error" };
    } else {
      const emailAuthenticationCode = nanoid();

      const email = {
        emailReg,
        passwordReg,
        emailAuthenticationCode,
        expire: Moment().add(1, "days"),
        userGroup: 1,
        resendEmail: 0
      };

      const registerLog = await RegisterLog.create({
        email,
        otherInfo
      });

      if (registerLog) {
        return {
          message: registerLog.email.emailAuthenticationCode,
          type: "success"
        };
      } else {
        return { message: "Unexpected error", type: "error" };
      }
    }
  }

  static async authenticateEmail({
    emailAuthenticationCode,
    ip,
    marketingIds
  }) {
    var result = null;
    const register = await RegisterLog.findOne({
      "email.emailAuthenticationCode": emailAuthenticationCode,
      "email.expire": { $gte: Moment() }
    }).sort({ "email.expire": 1 });

    if (register) {
      result = await User.signUp({
        email: register.email.emailReg,
        password: register.email.passwordReg,
        userGroup: 1,
        registerType: "email",
        ip,
        marketingIds
      });
      return result;
    } else {
      return { message: "验证失败", type: "error" };
    }
  }
}

mongoSchema.loadClass(RegisterLogClass);

const RegisterLog = mongoose.model("RegisterLog", mongoSchema);

module.exports = RegisterLog;
