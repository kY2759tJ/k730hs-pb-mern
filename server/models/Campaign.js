const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

// Define valid social media type
const SocialMediaType = ["Facebook", "Instagram"];

// Define valid campaign type
const CampaignType = ["Post", "Event", "Live Post"];

// Define valid statuses
const CampaignStatuses = ["Active", "Completed"];

const campaignSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    status: {
      type: String,
      enum: CampaignStatuses,
      default: "active", // Default status
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    social_media: {
      type: String,
      enum: SocialMediaType,
      required: true,
    },
    post_type: {
      type: String,
      enum: CampaignType,
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
  },
  { timestamps: true }
);

campaignSchema.plugin(AutoIncrement, {
  inc_field: "campaign",
  id: "campaignNum",
  start_seq: 100,
});

module.exports = mongoose.model("Campaign", campaignSchema);
