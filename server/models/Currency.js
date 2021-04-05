const mongoose = require("mongoose");
const Moment = require("moment");
const dotenv = require("dotenv");
dotenv.config();

const { Schema } = mongoose;

const mongoSchema = new Schema({
  iso: {
    type: String
  },
  name: {
    type: String
  },
  multiplier: {
    type: Number
  },
  disabled: {
    type: Number,
    default: 0
  },
  deleted: {
    type: Number,
    default: 0
  }
},
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  });

class CurrencyClass {
  /*static async getCourierByCountry({ country }) {
    const result = await Courier.find({
      country,
      disabled: 0,
      deleted: 0
    }).select("-created_at -deleted -disabled");
    return result;
  }*/
}

mongoSchema.loadClass(CurrencyClass);

const Currency = mongoose.model("Currency", mongoSchema);

module.exports = Currency;
