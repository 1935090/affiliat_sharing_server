const mongoose = require("mongoose");
const Moment = require("moment");
const dotenv = require("dotenv");
import { nanoid } from 'nanoid'
dotenv.config();
/*const User = require("./User");*/

const { Schema } = mongoose;
const { TIMEZONE } = process.env;

const mongoSchema = new Schema({
  mobilePrefix: {
    type: String,
  },
  currency: {
    type: String,
  },
  country: {
    type: String,
  },
  iso: {
    type: String,
  },
});

class CurrencyMapClass {
  //checked 2019-06-03
  static async createMap() {
    await CurrencyMap.create({
      mobilePrefix: "852",
      currency: "HKD",
      country: "Hong Kong",
      iso: "HKD",
    });
    await CurrencyMap.create({
      mobilePrefix: "886",
      currency: "TWD",
      country: "Taiwan",
      iso: "TWD",
    });
    await CurrencyMap.create({
      mobilePrefix: "853",
      currency: "MOP",
      country: "Macau",
      iso: "MOP",
    });
    return;
  }
}

mongoSchema.loadClass(CurrencyMapClass);

const CurrencyMap = mongoose.model("CurrencyMap", mongoSchema);

module.exports = CurrencyMap;
