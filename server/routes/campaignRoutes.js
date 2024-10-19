const express = require("express");
const router = express.Router();
const campaignController = require("../controllers/campaignControllers");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT);

router
  .route("/")
  .get(campaignController.getAllCampaigns)
  .post(campaignController.createNewCampaign)
  .patch(campaignController.updateCampaign)
  .delete(campaignController.deleteCampaign);

module.exports = router;
