const mongoose = require("mongoose");
const Moment = require("moment");
const dotenv = require("dotenv");
dotenv.config();

const { Schema } = mongoose;

const mongoSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  email: {
    type: String
  },
  code: {
    type: String
  },
  resetComplete: {
    type: Number,
    default: 0
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

class ForgetPasswordClass { }

mongoSchema.loadClass(ForgetPasswordClass);

const ForgetPassword = mongoose.model("ForgetPassword", mongoSchema);

module.exports = ForgetPassword;
