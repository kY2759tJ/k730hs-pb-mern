const CommissionPayout = require("../models/CommissionPayout");
const Order = require("../models/Order");
const User = require("../models/User");
const Campaign = require("../models/Campaign");

//@desc Get all commissionPayout
//@route Get /commissionPayout
//@access Private
const getAllCommissionPayouts = async (req, res) => {
  try {
    // Get all commission payouts
    const commissionPayouts = await CommissionPayout.find().lean();

    // If no commission payouts found
    if (!commissionPayouts.length) {
      return res.status(400).json({ message: "No commission payouts found" });
    }

    // Fetch user, campaigns, and orders for each commission payout
    const commissionPayoutsWithOrders = await Promise.all(
      commissionPayouts.map(async (commissionPayout) => {
        // Get user details
        const user = await User.findById(commissionPayout.salesPerson)
          .lean()
          .exec();

        // For each campaign in the commission payout
        const campaignsArr = await Promise.all(
          commissionPayout.campaigns.map(async (campaignData) => {
            // Fetch campaign details
            const campaign = await Campaign.findById(campaignData.campaign)
              .lean()
              .exec();

            // Fetch orders related to the campaign
            const ordersArr = await Promise.all(
              campaignData.orders.map(async (orderData) => {
                const order = await Order.findById(orderData.order)
                  .lean()
                  .exec();

                return {
                  orderObjId: orderData.order,
                  orderId: order?.orderId, // Use optional chaining to handle null
                  totalAmount: order?.totalAmount,
                  commissionRate: orderData.commissionRate,
                  commissionAmount: orderData.commissionAmount,
                  orderStatus: order?.status,
                };
              })
            );

            return {
              campaignId: campaign._id,
              campaignTitle: campaign.title,
              totalCommission: campaignData.totalCommission,
              orders: ordersArr,
              campaignStatus: campaign.status,
            };
          })
        );

        return {
          ...commissionPayout,
          user: { name: user.username, email: user.fullname }, // Add user data to payout
          campaigns: campaignsArr,
        };
      })
    );

    res.status(200).json(commissionPayoutsWithOrders);
  } catch (error) {
    console.error("Error fetching commission payouts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//@desc Create new commissionPayout
//@route POST /commissionPayout
//@access Private
const createNewCommissionPayout = async (req, res) => {
  const { salesPerson, yearMonth, campaignId, status, totalPayout } = req.body;

  if (!salesPerson || !yearMonth || !campaignId) {
    return res
      .status(400)
      .json({ message: `All commissionPayout fields are required` });
  }

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

    const newOrder = {};

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

    // if (existingCommissionPayout) {
    //   // Update the existing commission payout
    //   existingCommissionPayout.campaigns = campaigns;
    //   existingCommissionPayout.totalPayout = totalPayout;
    //   existingCommissionPayout.status = status;

    //   const updatedCommissionPayout = await existingCommissionPayout.save();
    //   return res.status(200).json({
    //     message: `createNewCommissionPayout Commission payout '${updatedCommissionPayout.id}' updated`,
    //   });
    // } else {
    //   //Get all campaigns
    //   const campaigns = await Campaign.find().lean();

    //   // Handle campaign and order updates
    //   for (const campaignInfo of campaigns) {
    //     // Check if the campaign exists in the Campaign collection
    //     const campaignExists = await Campaign.findById(
    //       campaignInfo.campaign
    //     ).exec();

    //     if (!campaignExists) {
    //       return res.status(400).json({
    //         message: `Campaign with ID ${campaignInfo.campaignId} does not exist`,
    //       });
    //     }
    //   }

    //   //Create and store new commissionPayout
    //   const commissionPayout = await CommissionPayout.create({
    //     salesPerson,
    //     yearMonth,
    //     campaigns,
    //     status,
    //     totalPayout,
    //   });

    //   const { commissionPayoutId } = commissionPayout;

    //   return res.status(201).json({
    //     message: `New commissionPayout '${commissionPayout.id}' created`,
    //     id: commissionPayoutId,
    //   });
    // }
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
  if (!salesPerson || !yearMonth || !campaignId || !order) {
    return res.status(400).json({
      message: "salesPerson, yearMonth, campaignId, and order are required",
    });
  }

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
      await updateCampaignOrders(thisCampaign, order);
    } else {
      await addNewCampaign(campaigns, campaignId, order);
    }

    // Update the commission payout in the database
    await CommissionPayout.updateOne(
      { _id: existingCommissionPayout._id },
      { campaigns }
    );

    return res.status(201).json({ message: "Updated Order" });
  } catch (error) {
    console.error("Error updating commission payout:", error);
    return res.status(500).json({ message: "Server error" });
  }
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
};

// Helper function to add a new campaign
const addNewCampaign = async (campaigns, campaignId, order) => {
  campaigns.push({
    totalCommission: 0,
    campaign: campaignId,
    orders: [order],
  });
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
