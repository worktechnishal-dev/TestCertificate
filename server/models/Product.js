const mongoose = require("mongoose");

const parameterSchema = new mongoose.Schema(
  {
    parameter: { type: String, required: true },
    requiredResult: { type: String, required: true },
    validationOperator: {
      type: String,
      enum: ["", "greater_than", "between", "less_than", "equal_to"],
      default: ""
    },
    validationValue: { type: String, default: "" },
    referenceMethod: { type: String, required: true }
  },
  { _id: false }
);

const analysisGroupSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      enum: ["Physical Analysis", "Chemical Analysis", "Sieve Analysis"],
      required: true
    },
    parameters: {
      type: [parameterSchema],
      default: []
    }
  },
  { _id: false }
);

const standardTemplateSchema = new mongoose.Schema(
  {
    standardName: { type: String, required: true },
    grades: {
      type: [String],
      default: []
    },
    analyses: {
      type: [analysisGroupSchema],
      default: []
    }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    tradeName: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    availableSizes: {
      type: [String],
      default: []
    },
    standards: {
      type: [standardTemplateSchema],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
