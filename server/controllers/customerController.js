const Customer = require("../models/Customer");

const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ name: 1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch customers", error: error.message });
  }
};

const createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create({
      name: req.body.name?.trim(),
      address: req.body.address?.trim()
    });
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ message: "Failed to create customer", error: error.message });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name?.trim(),
        address: req.body.address?.trim()
      },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(customer);
  } catch (error) {
    res.status(400).json({ message: "Failed to update customer", error: error.message });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({ message: "Customer deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete customer", error: error.message });
  }
};

module.exports = { getCustomers, createCustomer, updateCustomer, deleteCustomer };
