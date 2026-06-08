const mongoose = require("mongoose");

const resultRowSchema = new mongoose.Schema(
  {
    parameter: { type: String, required: true },
    requiredResult: { type: String, required: true },
    validationOperator: {
      type: String,
      enum: ["", "greater_than", "between", "less_than", "equal_to"],
      default: ""
    },
    validationValue: { type: String, default: "" },
    result: { type: String, default: "" },
    referenceMethod: { type: String, required: true }
  },
  { _id: false }
);

const analysisResultSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      enum: ["Physical Analysis", "Chemical Analysis", "Sieve Analysis"],
      required: true
    },
    rows: {
      type: [resultRowSchema],
      default: []
    }
  },
  { _id: false }
);

const certificateSchema = new mongoose.Schema(
  {
    serialNo: { type: Number, required: true, unique: true },
    tcNo: { type: String, required: true, unique: true },
    issueDate: { type: String, required: true },
    poNo: { type: String, default: "" },
    batchQuantity: { type: String, default: "" },
    seller: {
      type: String,
      enum: ["Impex India", "Cappex Industries"],
      default: "Impex India"
    },
    customer: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
      name: { type: String, required: true }
    },
    material: {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      tradeName: { type: String, required: true },
      gradeOrSize: { type: String, required: true },
      batchNo: { type: String, required: true },
      mfgMonth: { type: String, required: true },
      standard: { type: String, required: true }
    },
    analyses: {
      type: [analysisResultSchema],
      default: []
    },
    qcSignatory: { type: String, default: "QC Executive" },
    labInchargeSignatory: { type: String, default: "Lab Incharge" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Certificate", certificateSchema);
