const User = require("../models/User");
const Campaign = require("../models/Campaign");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

//@desc Get all users
//@route Get /users
//@access Private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").lean();
  if (!users) {
    return res.status(204).json({ message: "No users found" });
  }

  res.status(200).json(users);
});

//@desc Create new user
//@route POST /users
//@access Private
const createNewUser = asyncHandler(async (req, res) => {
  //Destrucutures username, password, and roles from inocoming req.body
  const { username, password, roles } = req.body;

  //Ensure all required fields are provided, else return 400 bad request
  if (!username || !password || !Array.isArray(roles) || roles.length === 0) {
    return res.status(400).json({ message: `All fields are required` });
  }

  //Check for duplicates, if duplicates found, return 409 conflict
  const duplicate = await User.findOne({ username }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  //Hash password using 10 salt rounds.
  const hashedPwd = await bcrypt.hash(password, 10); //salt rounds

  const userObject = { username, password: hashedPwd, roles };

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
  const { id, username, roles, password } = req.body;

  if (!id || !username || !roles.length) {
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
  user.username = username;
  user.roles = roles;

  if (password) {
    //Hash password
    user.password = await bcrypt.hash(password, 10); //salt rounds
  }

  //need mongoose document
  const updatedUser = await user.save();

  res.status(200).json({ message: `${updateUser.username} updated` });
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
  if (campaign?.length) {
    return res.status(400).json({ message: `User has assigned campaign` });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(404).json({ message: `User not found` });
  }

  const result = await user.deleteOne();

  const reply = `Username ${result.username} with ID ${result._id} deleted`;

  res.json(reply);
});

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
