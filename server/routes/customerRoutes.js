const express = require("express");
const {
  createCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer
} = require("../controllers/customerController");

const router = express.Router();

router.get("/", getCustomers);
router.post("/", createCustomer);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);

module.exports = router;
