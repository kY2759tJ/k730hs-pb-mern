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

const salesPersonSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  commissionRate: {
    type: Number,
    required: true,
  },
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Campaign",
  },
});

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
  totalPrice: {
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
    enum: ["Facebook", "Instagram"],
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
    salesPerson: {
      type: salesPersonSchema,
      required: true,
    },
    customer: {
      type: customerSchema, // Embed customer schema inside order
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: OrderStatus,
      default: "Draft", // Default status
      required: true,
    },
    commissionAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

orderSchema.plugin(AutoIncrement, {
  inc_field: "orderId",
  id: "orderNum",
  start_seq: 1000,
});

module.exports = mongoose.model("Order", orderSchema);
