require("dotenv").config();
const connectDb = require("../config/db");
const Counter = require("../models/Counter");
const Customer = require("../models/Customer");
const Product = require("../models/Product");
const Certificate = require("../models/Certificate");
const { customers, products } = require("./sampleData");

const seed = async () => {
  try {
    await connectDb();

    await Promise.all([
      Counter.deleteMany(),
      Customer.deleteMany(),
      Product.deleteMany(),
      Certificate.deleteMany()
    ]);

    await Customer.insertMany(customers);
    await Product.insertMany(products);
    console.log("Seed completed");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

seed();
