const CommissionPayout = require("../models/CommissionPayout");
const Order = require("../models/Order");
const User = require("../models/User");
const Campaign = require("../models/Campaign");

//@desc Get all commissionPayout
//@route Get /commissionPayout
//@access Private
const getAllCommissionPayouts = async (req, res) => {
  //Get all commissionPayouts
  const commissionPayouts = await CommissionPayout.find().lean();

  //If no commissionPayouts
  if (!commissionPayouts?.length) {
    return res.status(400).json({ message: "No commissionPayouts found" });
  }

  // Add username to each commissionPayout before sending the response
  // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE
  // You could also do this with a for...of loop
  const commissionPayoutsWithOrders = await Promise.all(
    commissionPayouts.map(async (commissionPayout) => {
      const user = await User.findById(commissionPayout.salesPerson)
        .lean()
        .exec();

      const campaign = await Campaign.findById(commissionPayout.campaign)
        .lean()
        .exec();

      const order = await Order.findById(commissionPayout.order).lean().exec();

      return {
        ...commissionPayout,
        username: user.username,
        fullname: user.fullname,
        campaignTitle: campaign.title,
        orderId: order.orderId,
      };
    })
  );

  res.status(200).json(commissionPayoutsWithOrders);
};

// Helper function to validate the customer object
const isValidSalesPerson = async (user) => {
  // Basic field presence checks
  if (!user) {
    return false;
  }

  //Find if user exist
  const foundUser = await User.findById(user).exec();

  if (!foundUser) {
    return false;
  }

  return true;
};

// Helper function to validate the customer object
const isValidCampaign = async (campaign) => {
  // Basic field presence checks
  if (!campaign) {
    return false;
  }

  //Find if user exist
  const foundCampaign = await Campaign.findById(campaign).exec();

  if (!foundCampaign) {
    return false;
  }

  return true;
};

// Helper function to validate the customer object
const isValidOrder = async (order) => {
  // Basic field presence checks
  if (!order) {
    return false;
  }

  //Find if user exist
  const foundOrder = await Order.findById(order).exec();

  if (!foundOrder) {
    return false;
  }

  return true;
};

//@desc Create new commissionPayout
//@route POST /commissionPayout
//@access Private
const createNewCommissionPayout = async (req, res) => {
  const {
    salesPerson,
    order,
    campaign,
    commissionRate,
    commissionAmount,
    status,
    paidDate,
    notes,
  } = req.body;

  if (
    !salesPerson ||
    !order ||
    !campaign ||
    !commissionRate ||
    !commissionAmount ||
    !status
  ) {
    return res
      .status(400)
      .json({ message: `All commissionPayout fields are required` });
  }

  // Validate salesPerson object
  if (!isValidSalesPerson(salesPerson)) {
    return res.status(400).json({ error: "Invalid salesperson details." });
  }

  // Validate campaign object
  if (!isValidCampaign(campaign)) {
    return res.status(400).json({ error: "Invalid campaign details." });
  }

  // Validate campaign object
  if (!isValidOrder(order)) {
    return res.status(400).json({ error: "Invalid order details." });
  }

  //Create and store new commissionPayout
  const commissionPayout = await CommissionPayout.create({
    salesPerson,
    order,
    campaign,
    commissionRate,
    commissionAmount,
    status,
  });

  const { commissionPayoutId } = commissionPayout;

  //created
  if (commissionPayout) {
    res
      .status(201)
      .json({ message: `New commissionPayout ${commissionPayoutId} created` });
  } else {
    res.status(400).json({ message: `Invalid commissionPayout data received` });
  }
};

//@desc Update commissionPayout
//@route PATCH /commissionPayout
//@access Private
const updateCommissionPayout = async (req, res) => {
  const {
    id,
    salesPerson,
    order,
    campaign,
    commissionRate,
    commissionAmount,
    status,
  } = req.body;

  if (
    !id ||
    !salesPerson ||
    !order ||
    !campaign ||
    !commissionRate ||
    !commissionAmount ||
    !status
  ) {
    return res.status(400).json({ message: "All update fields are required" });
  }

  const commissionPayout = await CommissionPayout.findById(id).exec();

  //Check if commissionPayout is exist
  if (!commissionPayout) {
    return res.status(400).json({ message: "Commission payout not found" });
  }

  commissionPayout.commissionAmount = commissionAmount;
  commissionPayout.status = status;

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
