const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

// Define valid statuses
const OrderStatus = [
  "Draft",
  "Pending Payment",
  "Processing",
  "Cancelled",
  "Completed",
];

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  total_price: {
    type: Number,
    required: true,
    min: 1,
  },
});

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    match: /.+\@.+\..+/, // Basic email validation
  },
  contact: {
    type: String,
    required: true,
    match: /^\+?[1-9]\d{1,14}$/, // E.164 phone number format
  },
  platform: {
    type: String,
    enum: ["facebook", "instagram", "twitter", "linkedIn"],
    required: true,
  },
  accountId: {
    type: String,
    required: true,
  },
  profileUrl: {
    type: String,
    match: /^https?:\/\/(?:www\.)?[^\s/$.?#].[^\s]*$/, // Basic URL validation
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Campaign",
    },
    customer: {
      type: customerSchema, // Embed customer schema inside order
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: OrderStatus,
      default: "Draft", // Default status
      required: true,
    },
  },
  { timestamps: true }
);

orderSchema.plugin(AutoIncrement, {
  inc_field: "order_id",
  id: "orderNum",
  start_seq: 1000,
});

module.exports = mongoose.model("Order", orderSchema);
