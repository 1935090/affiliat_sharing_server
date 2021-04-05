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
    type: Schema.Types.Mixed
  },
  disabled: {
    type: Number,
    default: 0
  },
  deleted: {
    type: Number,
    default: 0
  },
  images: [
    {
      _id: false,
      upload: {
        type: Schema.Types.ObjectId,
        ref: "Upload"
      }
    }
  ]
},
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  });

class SettingClass {
  //checked 2019-06-03
  static async getSetting({ title }) {
    const result = await Setting.findOne({
      title,
      deleted: 0,
      disabled: 0
    }).select("title desc -_id");
    return result;
  }
}

mongoSchema.loadClass(SettingClass);

const Setting = mongoose.model("Setting", mongoSchema);

module.exports = Setting;
