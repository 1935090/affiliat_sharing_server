const mongoose = require("mongoose");
const Moment = require("moment");
const dotenv = require("dotenv");
dotenv.config();

const { Schema } = mongoose;
const { TIMEZONE } = process.env;

const mongoSchema = new Schema({
  title: {
    type: String,
    unique: true
  },
  desc: {
    type: String
  },
  disabled: {
    type: Number,
    default: 0
  },
  deleted: {
    type: Number,
    default: 0
  }
}
  ,
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  });

class WebsiteTextClass {
  //checked 2019-06-03
  static async getWebsiteText({ title }) {
    const result = await WebsiteText.findOne({
      title,
      deleted: 0,
      disabled: 0
    }).select("title desc -_id");
    return result;
  }
}

mongoSchema.loadClass(WebsiteTextClass);

const WebsiteText = mongoose.model("WebsiteText", mongoSchema);

module.exports = WebsiteText;
