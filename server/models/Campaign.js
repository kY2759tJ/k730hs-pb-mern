const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

// Define valid social media type
const socialMediaType = ["Facebook", "Instagram"];

// Define valid campaign type
const campaignType = ["Post", "Event", "Live Post"];

// Define valid statuses
const campaignStatuses = ["active", "completed"];

const campaignSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    social_media: {
      type: String,
      enum: socialMediaType,
      required: true,
    },
    post_type: {
      type: String,
      enum: campaignType,
      required: true,
    },
    post_url: {
      type: String,
      validate: {
        validator: function (v) {
          // Regular expression to validate URLs
          return /^(https?:\/\/)?([\w\-]+)\.([a-z]{2,6})([\/\w\-.]*)*\/?$/i.test(
            v
          );
        },
        message: (props) => `${props.value} is not a valid URL!`,
      },
      required: [true, "Campaign URL is required."],
    },
    status: {
      type: String,
      enum: campaignStatuses,
      default: "active", // Default status
      required: true,
    },
  },
  { timestamps: true }
);

campaignSchema.plugin(AutoIncrement, {
  inc_field: "campaign",
  id: "campaignNum",
  start_seq: 100,
});

module.exports = mongoose.model("Campaign", campaignSchema);
