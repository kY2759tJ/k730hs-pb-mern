const Campaign = require("../models/Campaign");
const User = require("../models/User");
const Order = require("../models/Order");
const CommissionPayout = require("../models/CommissionPayout");

//@desc Get all campaign
//@route Get /campaign
//@access Private
const getAllCampaigns = async (req, res) => {
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
      return { ...campaign, username: user.username, fullname: user.fullname };
    })
  );

  res.status(200).json(campaignsWithUser);
};

//@desc Create new campaign
//@route POST /campaign
//@access Private
const createNewCampaign = async (req, res) => {
  const { user, status, title, social_media, post_type, post_url } = req.body;

  if (!user || !status || !title || !social_media || !post_type || !post_url) {
    return res
      .status(400)
      .json({ message: `All campaign fields are required` });
  }

  //Check for duplicated campaign title, if duplicates found, return 409 conflicts
  const duplicate = await Campaign.findOne({ title })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate campaign title" });
  }

  //Create and store new campaign
  const campaign = await Campaign.create({
    user,
    status,
    title,
    social_media,
    post_type,
    post_url,
  });

  const { _id } = campaign;

  //created
  if (campaign) {
    res.status(201).json({ message: `New campaign ${title} created`, id: _id });
  } else {
    res.status(400).json({ message: `Invalid campaign data received` });
  }
};

//@desc Update campaign
//@route PATCH /campaign
//@access Private
const updateCampaign = async (req, res) => {
  const { id, status, title, social_media, post_type, post_url } = req.body;

  if (!id || !status || !title || !social_media || !post_type || !post_url) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const campaign = await Campaign.findById(id).exec();

  //Check if campaign is exist
  if (!campaign) {
    return res.status(400).json({ message: "Campaign not found" });
  }

  //Check if campaign title duplicate
  const duplicate = await Campaign.findOne({ title })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  //Allow renaming of the original campaign
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate campaign title" });
  }

  campaign.status = status;
  campaign.title = title;
  campaign.social_media = social_media;
  campaign.post_type = post_type;
  campaign.post_url = post_url;

  const updatedCampaign = await campaign.save();

  res.json(`'${updatedCampaign.title}' updated`);
};

//@desc Delete campaign
//@route DELETE /campaign
//@access Private
const deleteCampaign = async (req, res) => {
  const { id, salesPerson } = req.body;

  try {
    const filter = {};

    // Step 1: Find all orders associated with the campaign
    const existingCommissionPayouts = await CommissionPayout.find({
      salesPerson,
      "campaigns.campaign": id,
    }).exec();

    const { campaigns } = existingCommissionPayouts;

    const commissionPayouts = await Promise.all(
      existingCommissionPayouts.map(async (commissionPayout) => {
        const thisCampaign = commissionPayout.campaigns.filter(
          (campaign) => campaign.campaign.toString() === id
        );

        //Find orderIds and delete from Order
        const orderIds = thisCampaign.flatMap(
          (campaign) => campaign.orders.map((order) => order.order) // Get only the order IDs
        );

        const orderDeleteResult = await Order.deleteMany({
          _id: { $in: orderIds },
        });

        // Step 2: Delete the campaign from CommissionPayout documents and recalcualte
        const campaignDeleteResult = await CommissionPayout.updateMany(
          { salesPerson }, // Match all documents
          { $pull: { campaigns: { campaign: id } } }
        );

        const updatedPayouts = await CommissionPayout.find(); // Fetch updated documents

        for (const payout of updatedPayouts) {
          payout.totalPayout = payout.campaigns.reduce(
            (total, campaign) => total + (campaign.totalCommission || 0),
            0
          );
          await payout.save(); // Save the updated totalPayout
        }

        // Step 5: Delete the campaign from the Campaign schema
        const campaignSchemaDeleteResult = await Campaign.deleteOne({
          _id: id,
        });

        return {
          yearMonth: commissionPayout.yearMonth,
          thisCampaigns: thisCampaign,
          thisOrders: orderIds,
          updatedPayouts: updatedPayouts,
        };
      })
    );

    return res.json({
      message: `Campaign and associated data deleted successfully.`,
      commissionPayouts: commissionPayouts,
      existingCommissionPayouts: existingCommissionPayouts,
      //campaignDeleteResult: campaignDeleteResult,
    });
  } catch (error) {
    console.error("Error deleting campaign and recalculating payout:", error);
    throw new Error(
      "Server error while deleting campaign and recalculating payout."
    );
  }
};

// Helper function to recalculate the total payout
const calculateTotalPayout = (campaigns) => {
  return campaigns.reduce((total, campaign) => {
    const campaignTotal = campaign.orders.reduce(
      (sum, order) => sum + (order.commissionAmount || 0),
      0
    );
    return total + campaignTotal;
  }, 0);
};

module.exports = {
  getAllCampaigns,
  createNewCampaign,
  updateCampaign,
  deleteCampaign,
};
