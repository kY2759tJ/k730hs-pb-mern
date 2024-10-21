const express = require("express");
const router = express.Router();
const productController = require("../controllers/productControllers");
const verifyJWT = require("../middleware/verifyJWT");

//router.use(verifyJWT);

router
  .route("/")
  .get(productController.getAllProducts)
  .post(productController.createNewProduct)
  .patch(productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = router;
