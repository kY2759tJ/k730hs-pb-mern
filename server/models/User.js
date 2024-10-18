const mongoose = require("mongoose");

// Define valid social media type
const USERROLES = ["Admin", "Salesperson"];

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  roles: [
    {
      type: String,
      enum: USERROLES,
      default: "Salesperson",
    },
  ],
  active: {
    type: Boolean,
    default: true,
  },
  salespersonDetails: {
    commission_rate: Number,
  },
});

module.exports = mongoose.model("User", userSchema);
