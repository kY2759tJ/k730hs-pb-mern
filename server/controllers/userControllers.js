const User = require("../models/User");
const Campaign = require("../models/Campaign");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

//@desc Get all users
//@route Get /users
//@access Private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").lean();
  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }

  res.status(200).json(users);
});

//@desc Create new user
//@route POST /users
//@access Private
const createNewUser = asyncHandler(async (req, res) => {
  //Destrucutures username, password, and roles from inocoming req.body
  const { name, username, password, roles } = req.body;

  //Ensure all required fields are provided, else return 400 bad request
  if (
    !name ||
    !username ||
    !password ||
    !Array.isArray(roles) ||
    roles.length === 0
  ) {
    return res.status(400).json({ message: `All fields are required` });
  }

  //Check for duplicates, if duplicates found, return 409 conflict
  const duplicate = await User.findOne({ username }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  //Hash password using 10 salt rounds.
  const hashedPwd = await bcrypt.hash(password, 10); //salt rounds

  const userObject = { name, username, password: hashedPwd, roles };

  //Create and store new user
  const user = await User.create(userObject);

  //created
  if (user) {
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    res.status(400).json({ message: `Invalid user data received` });
  }
});

//@desc Update a user
//@route PATCH /users
//@access Private
const updateUser = asyncHandler(async (req, res) => {
  const { id, name, username, roles, password } = req.body;

  if (!id || !name || !username || !roles.length) {
    return res.status(400).json({ message: `All fields are required` });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: `User not found` });
  }

  //Check for duplicate
  const duplicate = await User.findOne({ username }).lean().exec();
  //Allow updates to the original user
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ mesage: `Duplicate username` });
  }

  //mongoose document, update properties exists only
  //no password, no update password every update
  user.name = name;
  user.username = username;
  user.roles = roles;

  if (password) {
    //Hash password
    user.password = await bcrypt.hash(password, 10); //salt rounds
  }

  //need mongoose document
  const updatedUser = await user.save();

  res.status(200).json({ message: `${updatedUser.username} updated` });
});

//@desc Delete a user
//@route DELETE /users
//@access Private
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: `User ID required` });
  }

  //no delete user, if user have campaign
  const campaign = await Campaign.findOne({ user: id }).lean().exec();
  if (campaign) {
    return res.status(400).json({ message: `User has assigned campaign` });
  }

  // Does the user exist to delete?
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Save user details before deleting
  const { username, _id } = user;

  const result = await user.deleteOne();

  const reply = `Username ${username} with ID ${_id} deleted`;

  res.json(reply);
});

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
