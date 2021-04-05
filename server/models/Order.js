const mongoose = require("mongoose");
const Moment = require("moment");
const dotenv = require("dotenv");
dotenv.config();
//const GiftCard = require("./GiftCard");
import { nanoid } from 'nanoid'

const { Schema } = mongoose;

const mongoSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  id: {
    type: String,
    default: () =>
      "T" + Moment().format("YYYYMMDD") + "N" + nanoid(),
  },
  totalAmount: {
    type: Number,
  },
  status: {
    type: String,
    default: "Complete",
  },
  stripeCharge: {
    type: Object,
  },
  orderIp: {
    type: String,
  },
  disabled: {
    type: Number,
    default: 0,
  },
  deleted: {
    type: Number,
    default: 0,
  },
  orderType: {
    type: String,
  },
  adDetail: {
    type: Object,
  },
}
  ,
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  });

class OrderClass {
  static async saveOrder({
    user,
    totalAmount,
    stripeCharge,
    orderIp,
    adDetail,
  }) {
    const order = await Order.create({
      user,
      totalAmount,
      stripeCharge,
      orderIp,
      orderType: "payin",
      adDetail,
    });
    return order;
  }
}

mongoSchema.loadClass(OrderClass);

const Order = mongoose.model("Order", mongoSchema);

module.exports = Order;
