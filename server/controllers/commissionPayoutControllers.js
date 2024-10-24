const CommissionPayout = require("../models/CommissionPayout");
const Order = require("../models/Order");
const User = require("../models/User");
const Campaign = require("../models/Campaign");

//@desc Get all commissionPayout
//@route Get /commissionPayout
//@access Private
const getAllCommissionPayouts = async (req, res) => {
  try {
    const { yearMonth, salesPerson } = req.query;

    const filter = {};
    if (yearMonth) filter.yearMonth = yearMonth;
    if (salesPerson) filter.salesPerson = salesPerson;

    // Get all commission payouts
    const commissionPayouts = await CommissionPayout.find(filter).lean();

    // If no commission payouts found
    if (!commissionPayouts.length) {
      return res.status(400).json({ message: "No commission payouts found" });
    }

    // Add username to each order before sending the response
    // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE
    // You could also do this with a for...of loop
    const commissionPayoutWithInfo = await Promise.all(
      commissionPayouts.map(async (commissionPayout) => {
        const user = await User.findById(commissionPayout.salesPerson)
          .lean()
          .exec();

        return {
          ...commissionPayout,
          username: user.username,
          fullname: user.fullname,
          qyearMonth: yearMonth,
          qsalesPerson: salesPerson,
        };
      })
    );

    console.log(commissionPayoutWithInfo);

    return res.status(200).json(commissionPayoutWithInfo);
  } catch (error) {
    console.error("Error fetching commission payouts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//@desc Create new commissionPayout
//@route POST /commissionPayout
//@access Private
const createNewCommissionPayout = async (req, res) => {
  const { salesPerson, yearMonth, campaignId, status, totalPayout, order } =
    req.body;

  if (!salesPerson || !yearMonth || !campaignId) {
    return res
      .status(400)
      .json({ message: `All commissionPayout fields are required` });
  }

  const newOrder = order || {};

  //Validate salespers
  const validSalesPerson = await User.findById(salesPerson);
  if (!validSalesPerson) {
    return res.status(404).json({ message: "Salesperson not found" });
  }

  try {
    // Check if a commission payout for the same yearMonth and salesPerson exists
    const existingCommissionPayout = await CommissionPayout.findOne({
      yearMonth,
      salesPerson,
    }).exec();

    //== Update commission payout
    if (existingCommissionPayout) {
      //== Check if campaigns exists in exist in commission payout
      //Get all campaigns
      const { campaigns } = existingCommissionPayout;
      const thisCampaign = campaigns.find(
        (item) => item.campaign.toString() === campaignId
      );

      if (!thisCampaign) {
        await addNewCampaign(campaigns, campaignId, newOrder);
        campaignOrderMessage = `addNewCampaign`;
      } else {
        await updateCampaignOrders(thisCampaign, newOrder);
        campaignOrderMessage = `updateCampaignOrders`;
      }

      // Update the commission payout in the database
      await CommissionPayout.updateOne(
        { _id: existingCommissionPayout._id },
        { campaigns }
      );
      return res
        .status(201)
        .json({ message: "Updated commission payout", campaignOrderMessage });
    }

    //=== Create new commmission payout
    const campaigns = [
      {
        campaign: campaignId,
        orders: [],
      },
    ];

    //Create and store new commissionPayout
    const commissionPayout = await CommissionPayout.create({
      salesPerson,
      yearMonth,
      campaigns,
      status,
      totalPayout,
    });
    const { commissionPayoutId } = commissionPayout;
    return res.status(201).json({
      message: `New commissionPayout '${commissionPayout.id}' created`,
      id: commissionPayoutId,
    });
  } catch (error) {
    console.error("Error creating/updating commission payout:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

//@desc Update commissionPayout
//@route PATCH /commissionPayout
//@access Private
const updateCommissionPayout = async (req, res) => {
  const { salesPerson, yearMonth, campaignId, order } = req.body;

  // Validate required fields
  if (!salesPerson || !yearMonth || !campaignId) {
    return res.status(400).json({
      message: "salesPerson, yearMonth, campaignId, and order are required",
    });
  }

  const newOrder = order || {};

  try {
    // Fetch the existing commission payout
    const existingCommissionPayout = await CommissionPayout.findOne({
      yearMonth,
      salesPerson,
    })
      .lean()
      .exec();

    if (!existingCommissionPayout) {
      return res.status(404).json({
        message:
          "Commission payout not found for the given salesperson and month.",
      });
    }

    const { campaigns } = existingCommissionPayout;

    // Find or create campaign and update orders
    const thisCampaign = campaigns.find(
      (item) => item.campaign.toString() === campaignId
    );
    if (thisCampaign) {
      await updateCampaignOrders(thisCampaign, newOrder);
    } else {
      await addNewCampaign(campaigns, campaignId, newOrder);
    }

    const totalPayout = calculateTotalPayout(campaigns);

    // Update the commission payout in the database
    await CommissionPayout.updateOne(
      { _id: existingCommissionPayout._id },
      { campaigns, totalPayout }
    );

    return res.status(201).json({ message: "Updated Order" });
  } catch (error) {
    console.error("Error updating commission payout:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Helper function to recalculate the total commission
const calculateTotalCommission = (orders) => {
  return orders.reduce(
    (total, order) => total + (order.commissionAmount || 0),
    0
  );
};

// Helper function to update orders within a campaign
const updateCampaignOrders = async (campaign, order) => {
  const existingOrderIndex = campaign.orders.findIndex(
    (o) => o.order.toString() === order.order
  );

  if (existingOrderIndex !== -1) {
    // Update existing order
    campaign.orders[existingOrderIndex] = {
      ...campaign.orders[existingOrderIndex],
      ...order,
    };
  } else {
    // Add new order
    campaign.orders.push(order);
  }

  // Recalculate total commission for the campaign
  campaign.totalCommission = calculateTotalCommission(campaign.orders);
};

// Helper function to add a new campaign
const addNewCampaign = async (campaigns, campaignId, order) => {
  campaigns.push({
    totalCommission: 0,
    campaign: campaignId,
    orders: [order],
  });
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

//@desc Delete commissionPayout
//@route DELETE /commissionPayout
//@access Private
const deleteCommissionPayout = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: `CommissionPayout ID required` });
  }

  //to-do: delete commision

  //Check if commissionPayout exist to delete
  const commissionPayout = await CommissionPayout.findById(id).exec();

  if (!commissionPayout) {
    return res.status(400).json({ message: "CommissionPayout not found" });
  }

  // Save user details before deleting
  const { _id, title, social_media, post_type, post_url } = commissionPayout;

  const deletedResult = await commissionPayout.deleteOne();

  const reply = `CommissionPayout ${title} with ID ${_id} deleted`;

  res.json(reply);
};

module.exports = {
  getAllCommissionPayouts,
  createNewCommissionPayout,
  updateCommissionPayout,
  deleteCommissionPayout,
};
