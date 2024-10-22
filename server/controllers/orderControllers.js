const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const Campaign = require("../models/Campaign");

//@desc Get all order
//@route Get /order
//@access Private
const getAllOrders = async (req, res) => {
  //Get all orders
  const orders = await Order.find().lean();

  //If no orders
  if (!orders?.length) {
    return res.status(400).json({ message: "No orders found" });
  }

  // Add username to each order before sending the response
  // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE
  // You could also do this with a for...of loop
  const ordersWithUser = await Promise.all(
    orders.map(async (order) => {
      const user = await User.findById(order.salesPerson.user).lean().exec();

      const campaign = await Campaign.findById(order.salesPerson.campaign)
        .lean()
        .exec();

      // Fetch product details for each item in the order
      const itemsWithProductNames = await Promise.all(
        order.items.map(async (item) => {
          const product = await Product.findById(item.product).lean().exec();
          return {
            ...item,
            productName: product?.productName || "Unknown Product", // Add product name
            productBasePrice: product?.basePrice, // Add product name
          };
        })
      );

      return {
        ...order,
        username: user.username,
        fullname: user.fullname,
        campaign: campaign.title,
        itemsWithProductNames,
      };
    })
  );

  res.status(200).json(ordersWithUser);
};

// Helper function to validate the customer object
const isValidSalesPerson = async (salesPerson) => {
  const { user, commissionRate, campaign } = salesPerson;

  // Basic field presence checks
  if (!user || !commissionRate || !campaign) {
    return false;
  }

  //Find if user exist
  const foundUser = await User.findById(user).exec();

  if (!foundUser) {
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
const isValidCustomer = (customer) => {
  const { name, email, contact, platform, accountId, profileUrl } = customer;

  // Basic field presence checks
  if (!name || !email || !contact || !platform || !accountId || !profileUrl) {
    return false;
  }

  // Validate email format
  const emailRegex = /.+\@.+\..+/;
  if (!emailRegex.test(email)) return false;

  // Validate contact number format (E.164)
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(contact)) return false;

  // Validate platform
  const validPlatforms = ["Facebook", "Instagram"];
  if (!validPlatforms.includes(platform)) return false;

  // Validate URL format
  const urlRegex = /^https?:\/\/(?:www\.)?[^\s/$.?#].[^\s]*$/;
  if (!urlRegex.test(profileUrl)) return false;

  return true;
};

// Check if the product ID is valid
const isValidProduct = async (productId) => {
  try {
    const product = await Product.findById(productId);
    return product !== null; // Return true if product exists
  } catch (error) {
    return false; // Return false if there's an error in querying
  }
};

// Validate items in the order
const isValidItems = async (items) => {
  if (!Array.isArray(items) || items.length === 0) return false;

  const validationResults = await Promise.all(
    items.map(async (item) => {
      const { product, quantity } = item;
      const isValidProd = await isValidProduct(product);
      const isValidQuantity = Number.isInteger(quantity) && quantity > 0;

      return isValidProd && isValidQuantity;
    })
  );

  return validationResults.every((result) => result === true); // Check if all items are valid
};

//@desc Create new order
//@route POST /order
//@access Private
const createNewOrder = async (req, res) => {
  const {
    salesPerson,
    customer,
    items,
    totalAmount,
    status,
    commissionAmount,
  } = req.body;

  if (!salesPerson || !customer || !items || !totalAmount || !status) {
    return res.status(400).json({ message: `All order fields are required` });
  }

  // Validate customer object
  if (!isValidSalesPerson(salesPerson)) {
    return res.status(400).json({ error: "Invalid salesPerson details." });
  }

  // Validate customer object
  if (!isValidCustomer(customer)) {
    return res.status(400).json({ error: "Invalid customer details." });
  }

  // Validate items
  const itemsAreValid = await isValidItems(items);
  if (!itemsAreValid) {
    return res
      .status(400)
      .json({ error: "Invalid items. Check product IDs and quantities." });
  }

  //Create and store new order
  const order = await Order.create({
    salesPerson,
    customer,
    items,
    totalAmount,
    status,
    commissionAmount,
  });

  const { orderId } = order;

  //created
  if (order) {
    res.status(201).json({ message: `New order ${orderId} created` });
  } else {
    res.status(400).json({ message: `Invalid order data received` });
  }
};

//@desc Update order
//@route PATCH /order
//@access Private
const updateOrder = async (req, res) => {
  const {
    id,
    salesPerson,
    customer,
    totalAmount,
    items,
    status,
    commissionAmount,
  } = req.body;

  if (!id || !salesPerson || !customer || !items || !status) {
    return res.status(400).json({ message: "All update fields are required" });
  }

  const order = await Order.findById(id).exec();

  //Check if order is exist
  if (!order) {
    return res.status(400).json({ message: "Order not found" });
  }

  order.customer = customer;
  order.items = items;
  order.totalAmount = totalAmount;
  order.status = status;
  order.commissionAmount = commissionAmount;

  const updatedOrder = await order.save();

  res.json(`'${updatedOrder.id}' updated`);
};

//@desc Delete order
//@route DELETE /order
//@access Private
const deleteOrder = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: `Order ID required` });
  }

  //to-do: delete commision

  //Check if order exist to delete
  const order = await Order.findById(id).exec();

  if (!order) {
    return res.status(400).json({ message: "Order not found" });
  }

  // Save user details before deleting
  const { _id, title, social_media, post_type, post_url } = order;

  const deletedResult = await order.deleteOne();

  const reply = `Order ${title} with ID ${_id} deleted`;

  res.json(reply);
};

module.exports = {
  getAllOrders,
  createNewOrder,
  updateOrder,
  deleteOrder,
};
