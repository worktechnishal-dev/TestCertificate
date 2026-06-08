const express = require("express");
const {
  createCertificate,
  downloadCertificate,
  getCertificateById,
  getCertificates,
  getDraftTemplate,
  getLatestCertificateByCustomer,
  updateCertificate
} = require("../controllers/certificateController");

const router = express.Router();

router.get("/draft", getDraftTemplate);
router.get("/latest-by-customer/:customerId", getLatestCertificateByCustomer);
router.get("/", getCertificates);
router.get("/:id/download", downloadCertificate);
router.get("/:id", getCertificateById);
router.post("/", createCertificate);
router.put("/:id", updateCertificate);

module.exports = router;
