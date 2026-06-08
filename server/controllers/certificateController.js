const Certificate = require("../models/Certificate");
const Counter = require("../models/Counter");
const Customer = require("../models/Customer");
const Product = require("../models/Product");
const { streamCertificatePdf } = require("../utils/pdfCertificate");
const { validateAnalyses } = require("../utils/resultValidation");

const getNextSequence = async (key) => {
  const counter = await Counter.findOneAndUpdate(
    { key },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  return counter.value;
};

const getPreviewSequence = async (key) => {
  const counter = await Counter.findOne({ key });
  return (counter?.value || 0) + 1;
};

const financialYearSuffix = (dateValue = new Date()) => {
  const date = new Date(dateValue);
  const usableDate = Number.isNaN(date.getTime()) ? new Date() : date;
  const year = usableDate.getFullYear();
  const month = usableDate.getMonth();
  const startYear = month >= 3 ? year : year - 1;
  return `${String(startYear).slice(-2)}${String(startYear + 1).slice(-2)}`;
};

const tcCounterKey = (dateValue) => `certificateTc:${financialYearSuffix(dateValue)}`;

const formatTcNo = (sequence, dateValue) => `${String(sequence).padStart(3, "0")}${financialYearSuffix(dateValue)}`;

const randomSixDigit = () => Math.floor(100000 + Math.random() * 900000);

const getRandomSerialNo = async (preferredSerialNo) => {
  const preferred = Number(preferredSerialNo);
  if (Number.isInteger(preferred) && preferred >= 100000 && preferred <= 999999) {
    const existing = await Certificate.exists({ serialNo: preferred });
    if (!existing) return preferred;
  }

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const serialNo = randomSixDigit();
    const existing = await Certificate.exists({ serialNo });
    if (!existing) return serialNo;
  }

  throw new Error("Unable to generate a unique serial number");
};

const mapTemplateToRows = (analyses = []) =>
  analyses.map((analysis) => ({
    title: analysis.title,
    rows: analysis.parameters.map((parameter) => ({
      parameter: parameter.parameter,
      requiredResult: parameter.requiredResult,
      validationOperator: parameter.validationOperator || "",
      validationValue: parameter.validationValue || "",
      result: "",
      referenceMethod: parameter.referenceMethod
    }))
  }));

const getDraftTemplate = async (req, res) => {
  try {
    const issueDate = req.query.issueDate || new Date();
    const serialNo = await getRandomSerialNo(req.query.serialNo);
    const tcSequence = await getPreviewSequence(tcCounterKey(issueDate));
    const tcNo = formatTcNo(tcSequence, issueDate);

    const { productId, standardName } = req.query;
    let analyses = [];
    let grades = [];

    if (productId && standardName) {
      const product = await Product.findById(productId);
      const standard = product?.standards.find((item) => item.standardName === standardName);
      if (standard) {
        analyses = mapTemplateToRows(standard.analyses);
        grades = standard.grades;
      }
    }

    res.json({ serialNo, tcNo, grades, analyses });
  } catch (error) {
    res.status(500).json({ message: "Failed to build certificate draft", error: error.message });
  }
};

const createCertificate = async (req, res) => {
  try {
    const {
      issueDate,
      poNo,
      batchQuantity,
      seller = "Impex India",
      customerId,
      customerName,
      productId,
      tradeName,
      gradeOrSize,
      batchNo,
      mfgMonth,
      standard,
      analyses,
      qcSignatory,
      labInchargeSignatory
    } = req.body;

    const [customer, product] = await Promise.all([
      Customer.findById(customerId),
      Product.findById(productId)
    ]);

    if (!customer || !product) {
      return res.status(400).json({ message: "Customer or product not found" });
    }

    const validationErrors = validateAnalyses(analyses);
    if (validationErrors.length) {
      return res.status(400).json({
        message: "Certificate result validation failed",
        errors: validationErrors
      });
    }

    const serialNo = await getRandomSerialNo(req.body.serialNo);
    const tcSequence = await getNextSequence(tcCounterKey(issueDate));
    const tcNo = formatTcNo(tcSequence, issueDate);

    const certificate = await Certificate.create({
      serialNo,
      tcNo,
      issueDate,
      poNo,
      batchQuantity,
      seller,
      customer: {
        id: customer._id,
        name: customerName || customer.name
      },
      material: {
        productId: product._id,
        tradeName,
        gradeOrSize,
        batchNo,
        mfgMonth,
        standard
      },
      analyses,
      qcSignatory,
      labInchargeSignatory
    });

    res.status(201).json(certificate);
  } catch (error) {
    res.status(400).json({ message: "Failed to create certificate", error: error.message });
  }
};

const updateCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    const validationErrors = validateAnalyses(req.body.analyses || []);
    if (validationErrors.length) {
      return res.status(400).json({
        message: "Certificate result validation failed",
        errors: validationErrors
      });
    }

    certificate.issueDate = req.body.issueDate;
    certificate.poNo = req.body.poNo || "";
    certificate.batchQuantity = req.body.batchQuantity || "";
    certificate.seller = req.body.seller || certificate.seller || "Impex India";
    certificate.customer = {
      id: req.body.customerId || certificate.customer.id,
      name: req.body.customerName || certificate.customer.name
    };
    certificate.material = {
      productId: req.body.productId || certificate.material.productId,
      tradeName: req.body.tradeName || certificate.material.tradeName,
      gradeOrSize: req.body.gradeOrSize,
      batchNo: req.body.batchNo,
      mfgMonth: req.body.mfgMonth,
      standard: req.body.standard
    };
    certificate.analyses = req.body.analyses || [];
    certificate.qcSignatory = req.body.qcSignatory || "";
    certificate.labInchargeSignatory = req.body.labInchargeSignatory || "";

    await certificate.save();
    res.json(certificate);
  } catch (error) {
    res.status(400).json({ message: "Failed to update certificate", error: error.message });
  }
};

const getCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find().sort({ createdAt: -1 });
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch certificates", error: error.message });
  }
};

const getCertificateById = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }
    res.json(certificate);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch certificate", error: error.message });
  }
};

const getLatestCertificateByCustomer = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ "customer.id": req.params.customerId }).sort({ createdAt: -1 });
    res.json(certificate || null);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch latest customer certificate", error: error.message });
  }
};

const downloadCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    const downloadedAt = Date.now();
    const safeTcNo = String(certificate.tcNo || "certificate").replace(/[^\w.-]+/g, "_");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${safeTcNo}-${downloadedAt}.pdf"`);
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("X-Certificate-Pdf-Template", "letterhead-real-signature-v2");
    streamCertificatePdf(certificate, res);
  } catch (error) {
    res.status(500).json({ message: "Failed to download certificate", error: error.message });
  }
};

module.exports = {
  getDraftTemplate,
  createCertificate,
  getCertificates,
  getCertificateById,
  getLatestCertificateByCustomer,
  updateCertificate,
  downloadCertificate
};
