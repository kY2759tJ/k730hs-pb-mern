const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

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
      required: true,
    },
    post_type: {
      type: String,
      required: true,
    },
    post_url: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
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
