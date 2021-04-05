const mongoose = require("mongoose");
const Moment = require("moment");
const User = require("./User");
const dotenv = require("dotenv");
dotenv.config();

const { Schema } = mongoose;

const mongoSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  credit: {
    type: Number,
    required: true
  },
  creditLeft: {
    type: Number
  },
  creditType: {
    type: String,
    required: true
  },
  reason: {
    type: String
  },
  detail: {
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order"
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    giftCard: {
      type: Schema.Types.ObjectId,
      ref: "GiftCard"
    }
  },
  disabled: {
    type: Number,
    default: 0
  },
  deleted: {
    type: Number,
    default: 0
  },
  deductFrom: [
    {
      creditLog: {
        type: Schema.Types.ObjectId,
        ref: "CreditLogs"
      },
      credit: {
        type: Number
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

class CreditLogClass {
  //checked 2019-06-03
  static async createCreditLog({ user, credit, creditType, detail, reason }) {
    let creditLog = null;
    if (credit > 0) {
      creditLog = await CreditLog.create({
        user,
        credit,
        creditType,
        detail,
        reason,
        creditLeft: credit
      });
    } else if (credit < 0) {
      const availableCredits = await CreditLog.find({
        credit: { $gt: 0 },
        creditLeft: { $gt: 0 },
        user
      }).sort({ created_at: 1 });

      let deductFrom = [];
      let creditAll = Math.abs(credit);

      if (availableCredits.length > 0) {
        //Deduct from member referral first
        for (let i = 0; i < availableCredits.length; i++) {
          const availableCredit = availableCredits[i];
          if (availableCredit.creditType == "memberRef" && creditAll > 0) {
            if (creditAll > availableCredit.creditLeft) {
              await CreditLog.findByIdAndUpdate(availableCredit._id, {
                creditLeft: 0
              });
              deductFrom.push({
                creditLog: availableCredit._id,
                credit: -Math.abs(availableCredit.creditLeft)
              });
              creditAll -= availableCredit.creditLeft;
            } else if (creditAll <= availableCredit.creditLeft) {
              const creditLeft = availableCredit.creditLeft - creditAll;
              await CreditLog.findByIdAndUpdate(availableCredit._id, {
                creditLeft
              });
              deductFrom.push({
                creditLog: availableCredit._id,
                credit: -Math.abs(creditAll)
              });
              creditAll = 0;
            }
          }
        }
        //Deduct from credits of refund, giftcard etc.
        if (creditAll > 0) {
          for (let i = 0; i < availableCredits.length; i++) {
            const availableCredit = availableCredits[i];
            if (availableCredit.creditType != "memberRef" && creditAll > 0) {
              if (creditAll > availableCredit.creditLeft) {
                await CreditLog.findByIdAndUpdate(availableCredit._id, {
                  creditLeft: 0
                });
                deductFrom.push({
                  creditLog: availableCredit._id,
                  credit: -Math.abs(availableCredit.creditLeft)
                });
                creditAll -= availableCredit.creditLeft;
              } else if (creditAll <= availableCredit.creditLeft) {
                const creditLeft = availableCredit.creditLeft - creditAll;
                await CreditLog.findByIdAndUpdate(availableCredit._id, {
                  creditLeft
                });
                deductFrom.push({
                  creditLog: availableCredit._id,
                  credit: -Math.abs(creditAll)
                });
                creditAll = 0;
              }
            }
          }
        }
      }

      creditLog = await CreditLog.create({
        user,
        credit,
        creditType,
        detail,
        reason,
        deductFrom
      });
    }
    return creditLog;
  }
  /*static async createCreditLog({ user, credit, creditType, detail, reason }) {
    let creditLog = null;
    creditLog = await CreditLog.create({
      user,
      credit,
      creditType,
      detail,
      reason
    });
    return creditLog;
  }*/
}

mongoSchema.loadClass(CreditLogClass);

const CreditLog = mongoose.model("CreditLog", mongoSchema);

module.exports = CreditLog;
