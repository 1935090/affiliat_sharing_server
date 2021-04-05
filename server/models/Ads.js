const mongoose = require("mongoose");
const Moment = require("moment");
const dotenv = require("dotenv");
import { nanoid } from 'nanoid'
dotenv.config();
/*const User = require("./User");*/

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
  ageStart: {
    type: Number,
  },
  ageEnd: {
    type: Number,
  },
  age: {
    type: Array,
  },
  budget: {
    type: Number,
  },
  budgetRemain: {
    type: Number,
  },
  gender: {
    type: String,
  },
  adsType: {
    type: String,
  },
  country: {
    type: String,
  },
  countries: {
    type: Array,
  },
  keepAdvertising: {
    type: String,
  },
  scheduledTime: {
    type: String,
  },
  days: {
    type: Number,
  },
  speed: {
    //low,normal,fast
    type: String,
  },
  selectedPost: {
    type: Object,
  },
  totalShare: {
    type: Number,
    default: 0,
  },
  fbPageDetail: {
    type: Object,
  },
  startNow: {
    type: Boolean,
  },
  singleSharePrice: {
    type: Number,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  status: {
    type: String,
    default: "onGoing",
  },
  stopForever: {
    type: Boolean,
    default: false,
  },
},
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

class AdsClass {
  //checked 2019-06-03
  static async createAds({ adDetail }) {
    let ads = null;
    adDetail.ageStart = adDetail.age[0];
    adDetail.ageEnd = adDetail.age[1];
    adDetail.budgetRemain = adDetail.budget;
    ads = await Ads.create(adDetail);
    return ads;
  }

  static async findAds({ limit, sort, match }) {
    const ads = await mongoose
      .model("Ads")
      .aggregate([
        {
          $match: match,
        },
        {
          $sort: sort ? sort : {},
        },
        {
          $limit: limit ? limit : 9999,
        },
      ])
      .exec();
    return ads;
  }
}

mongoSchema.loadClass(AdsClass);

const Ads = mongoose.model("Ads", mongoSchema);

module.exports = Ads;
