const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const commissionPayoutSchema = new mongoose.Schema(
  {
    salesPerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference the User collection
      required: true,
    },
    yearMonth: { type: String, required: true }, // e.g., "2024-10"
    campaigns: [
      {
        totalCommission: {
          type: Number,
          required: true,
          default: 0,
        }, // Total commission for this campaign
        campaign: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Campaign", // Reference the Order collection
          required: true,
        }, // Campaign identifier
        orders: [
          {
            order: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Order", // Reference the Order collection
              required: true,
            },
            commissionRate: {
              type: Number,
              required: true, // Store the commission rate used for the calculation
            },
            commissionAmount: {
              type: Number,
              required: true,
              default: 0,
            }, // Commission amount for the order
          },
        ],
      },
    ],
    status: {
      type: String,
      enum: ["Pending", "Paid", "Adjusted"],
      default: "Pending",
    },
    totalPayout: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    paidDate: {
      type: Date, // Optional date field to record when the commission was paid
    },
    notes: {
      type: String, // Optional field for extra information
    },
  },
  { timestamps: true }
);

commissionPayoutSchema.plugin(AutoIncrement, {
  inc_field: "commissionPayoutId",
  id: "commissionPayoutNum",
  start_seq: 1000,
});

module.exports = mongoose.model("CommissionPayout", commissionPayoutSchema);
