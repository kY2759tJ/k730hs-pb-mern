const express = require("express");
const router = express.Router();
const campaignController = require("../controllers/campaignControllers");

router
  .route("/")
  .get(campaignController.getAllCampaigns)
  .post(campaignController.createNewCampaign)
  .patch(campaignController.updateCampaign)
  .delete(campaignController.deleteCampaign);

module.exports = router;
