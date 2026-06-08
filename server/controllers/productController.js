const Product = require("../models/Product");
const numberPattern = /-?\d+(?:\.\d+)?/g;

const validateProductRules = (product) => {
  const errors = [];

  product.standards?.forEach((standard) => {
    standard.analyses?.forEach((analysis) => {
      analysis.parameters?.forEach((row) => {
        if (!row.validationOperator) return;

        const numbers = String(row.validationValue || row.requiredResult || "").match(numberPattern) || [];
        if (row.validationOperator === "between" && numbers.length < 2) {
          errors.push(`${analysis.title} - ${row.parameter}: Required Result must include minimum and maximum values`);
        }
        if (row.validationOperator !== "between" && numbers.length < 1) {
          errors.push(`${analysis.title} - ${row.parameter}: Required Result must include a numeric validation value`);
        }
      });
    });
  });

  return errors;
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ tradeName: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const validationErrors = validateProductRules(req.body);
    if (validationErrors.length) {
      return res.status(400).json({ message: "Product validation failed", errors: validationErrors });
    }

    const { tradeName, availableSizes = [], standards = [] } = req.body;
    const existingProduct = await Product.findOne({ tradeName });

    if (existingProduct) {
      existingProduct.availableSizes = Array.from(
        new Set([...existingProduct.availableSizes, ...availableSizes])
      );

      standards.forEach((incomingStandard) => {
        const existingStandard = existingProduct.standards.find(
          (item) => item.standardName === incomingStandard.standardName
        );

        if (existingStandard) {
          existingStandard.grades = Array.from(
            new Set([...existingStandard.grades, ...(incomingStandard.grades || [])])
          );
          existingStandard.analyses = incomingStandard.analyses || existingStandard.analyses;
        } else {
          existingProduct.standards.push(incomingStandard);
        }
      });

      await existingProduct.save();
      return res.status(200).json(existingProduct);
    }

    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: "Failed to create product", error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const validationErrors = validateProductRules(req.body);
    if (validationErrors.length) {
      return res.status(400).json({ message: "Product validation failed", errors: validationErrors });
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({ message: "Failed to update product", error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete product", error: error.message });
  }
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };
