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
  const { product_name, base_price } = req.body;

  if (!product_name || !base_price) {
    return res.status(400).json({ message: `All product fields are required` });
  }

  //Check for duplicated product title, if duplicates found, return 409 conflicts
  const duplicate = await Product.findOne({ product_name })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate product name" });
  }

  //Create and store new product
  const product = await Product.create({
    product_name,
    base_price,
  });

  //created
  if (product) {
    res.status(201).json({ message: `New product - ${product_name} created` });
  } else {
    res.status(400).json({ message: `Invalid product data received` });
  }
};

//@desc Update product
//@route PATCH /product
//@access Private
const updateProduct = async (req, res) => {
  const { id, product_name, base_price } = req.body;

  if (!id || !product_name || !base_price) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const product = await Product.findById(id).exec();

  //Check if product is exist
  if (!product) {
    return res.status(400).json({ message: "Product not found" });
  }

  //Check if product title duplicate
  const duplicate = await Product.findOne({ product_name })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  //Allow renaming of the original product
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate product title" });
  }

  product.product_name = product_name;
  product.base_price = base_price;

  const updatedProduct = await product.save();

  res.json(`'${updatedProduct.product_name}' updated`);
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
  const { _id, product_name, base_price } = product;

  const deletedResult = await product.deleteOne();

  const reply = `Product ${product_name} with ID ${_id} deleted`;

  res.json(reply);
};

module.exports = {
  getAllProducts,
  createNewProduct,
  updateProduct,
  deleteProduct,
};
