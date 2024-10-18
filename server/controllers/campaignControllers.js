const Campaign = require("../models/Campaign");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");

//@desc Get all campaign
//@route Get /campaign
//@access Private
const getAllCampaigns = asyncHandler(async (req, res) => {
  //Get all campaigns
  const campaigns = await Campaign.find().lean();

  //If no campaigns
  if (!campaigns?.length) {
    return res.status(400).json({ message: "No campaigns found" });
  }

  // Add username to each campaign before sending the response
  // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE
  // You could also do this with a for...of loop
  const campaignsWithUser = await Promise.all(
    campaigns.map(async (campaign) => {
      const user = await User.findById(campaign.user).lean().exec();
      return { ...campaign, username: user.username };
    })
  );

  res.status(200).json(campaignsWithUser);
});

//@desc Create new campaign
//@route POST /campaign
//@access Private
const createNewCampaign = asyncHandler(async (req, res) => {
  const { user, title, social_media, post_type, post_url, completed } =
    req.body;

  if (!user || !title || !social_media || !post_type || !post_url) {
    return res.status(400).json({ message: `All fields are required` });
  }

  //Check for duplicated campaign title, if duplicates found, return 409 conflicts
  const duplicate = await Campaign.findOne({ title }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate campaign title" });
  }

  //Create and store new campaign
  const campaign = await Campaign.create({
    user,
    title,
    social_media,
    post_type,
    post_url,
  });

  //created
  if (campaign) {
    res.status(201).json({ message: `New campaign ${title} created` });
  } else {
    res.status(400).json({ message: `Invalid campaign data received` });
  }
});

//@desc Update campaign
//@route PATCH /campaign
//@access Private
const updateCampaign = asyncHandler(async (req, res) => {
  const { id, title, social_media, post_type, post_url } = req.body;

  if (!id || !title || !social_media || !post_type || !post_url) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const campaign = await Campaign.findById(id).exec();

  //Check if campaign is exist
  if (!campaign) {
    return res.status(400).json({ message: "Campaign not found" });
  }

  //Check if campaign title duplicate
  const duplicate = await Campaign.findOne({ title }).lean().exec();

  //Allow renaming of the original campaign
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate campaign title" });
  }

  campaign.title = title;
  campaign.social_media = social_media;
  campaign.post_type = post_type;
  campaign.post_url = post_url;

  const updatedCampaign = await campaign.save();

  res.json(`'${updatedCampaign.title}' updated`);
});

//@desc Delete campaign
//@route DELETE /campaign
//@access Private
const deleteCampaign = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: `Campaign ID required` });
  }

  //to-do: delete commision

  //Check if campaign exist to delete
  const campaign = await Campaign.findById(id).exec();

  if (!campaign) {
    return res.status(400).json({ message: "Campaign not found" });
  }

  // Save user details before deleting
  const { _id, title, social_media, post_type, post_url } = campaign;

  const deletedResult = await campaign.deleteOne();

  const reply = `Campaign ${title} with ID ${_id} deleted`;

  res.json(reply);
});

module.exports = {
  getAllCampaigns,
  createNewCampaign,
  updateCampaign,
  deleteCampaign,
};
