const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const commissionPayoutSchema = new mongoose.Schema(
  {
    salesPerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference the User collection
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order", // Reference the Order collection
      required: true,
    },
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign", // Reference the Order collection
      required: true,
    },
    commissionRate: {
      type: Number,
      required: true, // Store the commission rate used for the calculation
    },
    commissionAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
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
  id: "ommissionPayoutNum",
  start_seq: 1000,
});

module.exports = mongoose.model("CommissionPayout", commissionPayoutSchema);
