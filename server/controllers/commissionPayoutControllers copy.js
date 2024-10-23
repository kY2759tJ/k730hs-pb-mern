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
  const { salesPerson, yearMonth, campaigns, status, totalPayout } = req.body;

  if (
    !salesPerson ||
    !yearMonth ||
    !Array.isArray(campaigns) ||
    campaigns.length === 0 ||
    !status
  ) {
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

    if (existingCommissionPayout) {
      // Update the existing commission payout
      existingCommissionPayout.campaigns = campaigns;
      existingCommissionPayout.totalPayout = totalPayout;
      existingCommissionPayout.status = status;

      const updatedCommissionPayout = await existingCommissionPayout.save();
      return res.status(200).json({
        message: `Commission payout '${updatedCommissionPayout.id}' updated`,
      });
    } else {
      //Validate array
      // Handle campaign and order updates
      for (const campaignInfo of campaigns) {
        // Check if the campaign exists in the Campaign collection
        const campaignExists = await Campaign.findById(
          campaignInfo.campaign
        ).exec();

        if (!campaignExists) {
          return res.status(400).json({
            message: `Campaign with ID ${campaignInfo.campaignId} does not exist`,
          });
        }
      }

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
    }
  } catch (error) {
    console.error("Error creating/updating commission payout:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

//@desc Update commissionPayout
//@route PATCH /commissionPayout
//@access Private
const updateCommissionPayout = async (req, res) => {
  const { salesPerson, yearMonth, order } = req.body;

  // Validate required fields
  if (!salesPerson || !yearMonth || !order) {
    return res
      .status(400)
      .json({ message: "salesPerson, yearMonth, and order are required" });
  }

  // Find the commission payout by ID
  const existingCommissionPayout = await CommissionPayout.findOne({
    yearMonth,
    salesPerson,
  }).exec();

  // Check if commission payout exists
  if (!commissionPayout) {
    return res.status(400).json({ message: "Commission payout not found" });
  }

  // Validate campaign object
  if (!isValidOrder(order)) {
    return res
      .status(400)
      .json({ error: "Invalid order details in campaign." });
  }

  // Update commission amount and status
  if (commissionAmount !== undefined) {
    commissionPayout.totalPayout = commissionAmount; // Update total payout
  }
  commissionPayout.status = status;

  // If campaigns are provided, update them
  if (campaigns && Array.isArray(campaigns)) {
    // Iterate through each campaign in the provided campaigns
    for (const campaignData of campaigns) {
      const campaignIndex = commissionPayout.campaigns.findIndex(
        (campaign) => campaign.campaign.toString() === campaignData.campaignId
      );

      if (campaignIndex > -1) {
        // If the campaign exists, update its data
        commissionPayout.campaigns[campaignIndex].totalCommission =
          campaignData.totalCommission;

        // Update orders if provided
        if (campaignData.orders && Array.isArray(campaignData.orders)) {
          for (const orderData of campaignData.orders) {
            const orderIndex = commissionPayout.campaigns[
              campaignIndex
            ].orders.findIndex(
              (order) => order.order.toString() === orderData.orderId
            );

            if (orderIndex > -1) {
              // Update existing order
              commissionPayout.campaigns[campaignIndex].orders[
                orderIndex
              ].commissionRate = orderData.commissionRate;
              commissionPayout.campaigns[campaignIndex].orders[
                orderIndex
              ].commissionAmount = orderData.commissionAmount;
            } else {
              // If order doesn't exist, push the new order
              commissionPayout.campaigns[campaignIndex].orders.push({
                order: orderData.orderId,
                commissionRate: orderData.commissionRate,
                commissionAmount: orderData.commissionAmount,
              });
            }
          }
        }
      } else {
        // If the campaign does not exist, add it
        commissionPayout.campaigns.push({
          campaign: campaignData.campaignId,
          totalCommission: campaignData.totalCommission,
          orders: campaignData.orders.map((orderData) => ({
            order: orderData.orderId,
            commissionRate: orderData.commissionRate,
            commissionAmount: orderData.commissionAmount,
          })),
        });
      }
    }
  }

  // Save the updated commission payout
  const updatedCommissionPayout = await commissionPayout.save();

  res.json(`'${updatedCommissionPayout.id}' updated`);
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
