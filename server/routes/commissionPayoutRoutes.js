const express = require("express");
const router = express.Router();
const commissionPayoutController = require("../controllers/commissionPayoutControllers");
const verifyJWT = require("../middleware/verifyJWT");

//router.use(verifyJWT);

router
  .route("/")
  .get(commissionPayoutController.getAllCommissionPayouts)
  .post(commissionPayoutController.createNewCommissionPayout)
  .patch(commissionPayoutController.updateCommissionPayout)
  .delete(commissionPayoutController.deleteCommissionPayout);

router
  .route("/details")
  .get(commissionPayoutController.getAllCommissionPayouts);

module.exports = router;
