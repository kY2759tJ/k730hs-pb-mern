const Product = require("../models/Product");

//@desc Get all product
//@route Get /product
//@access Private
const getAllProducts = async (req, res) => {
  //Get all products
  const products = await Product.find().lean();

  //If no products
  if (!products?.length) {
    return res.status(400).json({ message: "No products found" });
  }

  res.status(200).json(products);
};

//@desc Create new product
//@route POST /product
//@access Private
const createNewProduct = async (req, res) => {
  const { productName, basePrice } = req.body;

  if (!productName || !basePrice) {
    return res.status(400).json({ message: `All product fields are required` });
  }

  //Check for duplicated product title, if duplicates found, return 409 conflicts
  const duplicate = await Product.findOne({ productName })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate product name" });
  }

  //Create and store new product
  const product = await Product.create({
    productName,
    basePrice,
  });

  //created
  if (product) {
    res.status(201).json({
      message: `New product - ${productName} created`,
      id: product.id,
    });
  } else {
    res.status(400).json({ message: `Invalid product data received` });
  }
};

//@desc Update product
//@route PATCH /product
//@access Private
const updateProduct = async (req, res) => {
  const { id, productName, basePrice } = req.body;

  if (!id || !productName || !basePrice) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const product = await Product.findById(id).exec();

  //Check if product is exist
  if (!product) {
    return res.status(400).json({ message: "Product not found" });
  }

  //Check if product title duplicate
  const duplicate = await Product.findOne({ productName })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  //Allow renaming of the original product
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate product title" });
  }

  product.productName = productName;
  product.basePrice = basePrice;

  const updatedProduct = await product.save();

  res.json({
    message: `'${updatedProduct.productName}' updated`,
    id: product.id,
  });
};

//@desc Delete product
//@route DELETE /product
//@access Private
const deleteProduct = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: `Product ID required` });
  }

  //to-do: delete commision

  //Check if product exist to delete
  const product = await Product.findById(id).exec();

  if (!product) {
    return res.status(400).json({ message: "Product not found" });
  }

  // Save user details before deleting
  const { _id, productName, basePrice } = product;

  const deletedResult = await product.deleteOne();

  const reply = `Product ${productName} with ID ${_id} deleted`;

  res.json(reply);
};

module.exports = {
  getAllProducts,
  createNewProduct,
  updateProduct,
  deleteProduct,
};
