const mongoose = require("mongoose");
const Moment = require("moment");
const dotenv = require("dotenv");
import { nanoid } from 'nanoid'
dotenv.config();
const User = require("./User");

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
  amount: {
    type: Number,
  },
  status: {
    type: String,
    default: "pending",
  },
  paypalEmail: {
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

class PayoutClass {
  //checked 2019-06-03
  static async createPayout({ user, amount, paypalEmail }) {
    let payout = null;
    payout = await Payout.create({ user, amount, paypalEmail });
    const userEdit = await User.findByIdAndUpdate(user, {
      $inc: { moneyEarn: -parseInt(amount * 100) / 100 },
    });
    return payout;
  }
}

mongoSchema.loadClass(PayoutClass);

const Payout = mongoose.model("Payout", mongoSchema);

module.exports = Payout;
