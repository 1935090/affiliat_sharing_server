const mongoose = require("mongoose");
const Moment = require("moment");
const dotenv = require("dotenv");
import { nanoid } from 'nanoid'
dotenv.config();
/*const User = require("./User");*/

const { Schema } = mongoose;
const { TIMEZONE } = process.env;

const mongoSchema = new Schema({
  currency: {
    type: String,
  },
  speed: {
    type: String,
  },
  totalPrice: {
    type: Number,
  },
  sharePrice: {
    type: Number,
  },
  friend: {
    type: Number,
  },
}
  ,
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  });

class PriceListClass {
  //checked 2019-06-03
  static async createPriceList() {
    await PriceList.create({
      currency: "HKD",
      speed: "low",
      totalPrice: 0.4,
      sharePrice: 0.3,
      friend: 100,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "low",
      totalPrice: 0.8,
      sharePrice: 0.6,
      friend: 200,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "low",
      totalPrice: 1.2,
      sharePrice: 0.9,
      friend: 300,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "low",
      totalPrice: 1.6,
      sharePrice: 1.2,
      friend: 400,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "low",
      totalPrice: 2,
      sharePrice: 1.5,
      friend: 500,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "low",
      totalPrice: 2.4,
      sharePrice: 1.9,
      friend: 600,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "low",
      totalPrice: 2.8,
      sharePrice: 2.2,
      friend: 700,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "low",
      totalPrice: 3.2,
      sharePrice: 2.5,
      friend: 800,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "low",
      totalPrice: 3.6,
      sharePrice: 2.8,
      friend: 900,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "low",
      totalPrice: 4,
      sharePrice: 3.2,
      friend: 1000,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "low",
      totalPrice: 4.4,
      sharePrice: 3.5,
      friend: 1100,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "low",
      totalPrice: 4.8,
      sharePrice: 3.8,
      friend: 1200,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "low",
      totalPrice: 5.2,
      sharePrice: 4.1,
      friend: 1300,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "low",
      totalPrice: 5.6,
      sharePrice: 4.4,
      friend: 1400,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "low",
      totalPrice: 6,
      sharePrice: 4.8,
      friend: 1500,
    });
    //
    await PriceList.create({
      currency: "HKD",
      speed: "normal",
      totalPrice: 0.7,
      sharePrice: 0.5,
      friend: 100,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "normal",
      totalPrice: 1.3,
      sharePrice: 1,
      friend: 200,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "normal",
      totalPrice: 2,
      sharePrice: 1.6,
      friend: 300,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "normal",
      totalPrice: 2.7,
      sharePrice: 2.1,
      friend: 400,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "normal",
      totalPrice: 3.3,
      sharePrice: 2.6,
      friend: 500,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "normal",
      totalPrice: 4,
      sharePrice: 3.2,
      friend: 600,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "normal",
      totalPrice: 4.7,
      sharePrice: 3.7,
      friend: 700,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "normal",
      totalPrice: 5.3,
      sharePrice: 4.2,
      friend: 800,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "normal",
      totalPrice: 6,
      sharePrice: 4.8,
      friend: 900,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "normal",
      totalPrice: 6.7,
      sharePrice: 5.3,
      friend: 1000,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "normal",
      totalPrice: 7.3,
      sharePrice: 5.8,
      friend: 1100,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "normal",
      totalPrice: 8,
      sharePrice: 6.4,
      friend: 1200,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "normal",
      totalPrice: 8.7,
      sharePrice: 6.9,
      friend: 1300,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "normal",
      totalPrice: 9.3,
      sharePrice: 7.4,
      friend: 1400,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "normal",
      totalPrice: 10,
      sharePrice: 8,
      friend: 1500,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "fast",
      totalPrice: 1,
      sharePrice: 0.8,
      friend: 100,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "fast",
      totalPrice: 2,
      sharePrice: 1.6,
      friend: 200,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "fast",
      totalPrice: 3,
      sharePrice: 2.4,
      friend: 300,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "fast",
      totalPrice: 4,
      sharePrice: 3.2,
      friend: 400,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "fast",
      totalPrice: 5,
      sharePrice: 4,
      friend: 500,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "fast",
      totalPrice: 6,
      sharePrice: 4.8,
      friend: 600,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "fast",
      totalPrice: 7,
      sharePrice: 5.6,
      friend: 700,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "fast",
      totalPrice: 8,
      sharePrice: 6.4,
      friend: 800,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "fast",
      totalPrice: 9,
      sharePrice: 9.2,
      friend: 900,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "fast",
      totalPrice: 10,
      sharePrice: 8,
      friend: 1000,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "fast",
      totalPrice: 11,
      sharePrice: 8.8,
      friend: 1100,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "fast",
      totalPrice: 12,
      sharePrice: 9.6,
      friend: 1200,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "fast",
      totalPrice: 13,
      sharePrice: 10.4,
      friend: 1300,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "fast",
      totalPrice: 14,
      sharePrice: 11.2,
      friend: 1400,
    });
    await PriceList.create({
      currency: "HKD",
      speed: "fast",
      totalPrice: 15,
      sharePrice: 12,
      friend: 1500,
    });
    return;
  }
}

mongoSchema.loadClass(PriceListClass);

const PriceList = mongoose.model("PriceList", mongoSchema);

module.exports = PriceList;
