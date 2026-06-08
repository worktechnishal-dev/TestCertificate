const assert = require("node:assert/strict");
const { Writable } = require("node:stream");
const test = require("node:test");
const { streamCertificatePdf } = require("../utils/pdfCertificate");

const collectPdf = (certificate) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    const writable = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(Buffer.from(chunk));
        callback();
      }
    });

    writable.on("finish", () => resolve(Buffer.concat(chunks)));
    writable.on("error", reject);
    streamCertificatePdf(certificate, writable);
  });

const pageCount = (buffer) => (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;

const sampleCertificate = {
  seller: "Cappex Industries",
  serialNo: 1,
  tcNo: "MTC-00001",
  issueDate: "2026-05-25",
  poNo: "PO-001",
  batchQuantity: "10 MT",
  customer: { name: "Sample Customer" },
  material: {
    tradeName: "Steel Shot",
    gradeOrSize: "S-330",
    batchNo: "B-2605",
    mfgMonth: "2026-05",
    standard: "IS 4606"
  },
  analyses: [
    {
      title: "Physical Analysis",
      rows: [
        { parameter: "Hardness", requiredResult: "45 - 52 HRC", result: "48 HRC", referenceMethod: "IS 1500" },
        { parameter: "Microstructure", requiredResult: "Uniform tempered martensite", result: "Uniform tempered martensite", referenceMethod: "Internal" }
      ]
    },
    {
      title: "Chemical Analysis",
      rows: [
        { parameter: "Carbon", requiredResult: "0.80 - 1.20 %", result: "0.92 %", referenceMethod: "Spectro" },
        { parameter: "Manganese", requiredResult: "0.60 - 1.20 %", result: "0.88 %", referenceMethod: "Spectro" }
      ]
    },
    {
      title: "Sieve Analysis",
      rows: [
        { parameter: "Retained on nominal sieve", requiredResult: "Min 80 %", result: "86 %", referenceMethod: "IS 4606" }
      ]
    }
  ]
};

test("certificate PDF is generated as a single page", async () => {
  const pdf = await collectPdf(sampleCertificate);

  assert.equal(pageCount(pdf), 1);
  assert.ok(pdf.length > 1000);
});
