const path = require("path");
const PDFDocument = require("pdfkit");

const logoDir = path.join(__dirname, "..", "assets", "logos");
const companyProfiles = {
  "Cappex Industries": {
    name: "CAPPEX INDUSTRIES",
    logo: path.join(logoDir, "cappex-logo.png"),
    letterhead: path.join(logoDir, "cappex-letterhead.jpg"),
    website: "www.cappexindustries.com",
    email: "sales@cappexindustries.com",
    phone: "9825000713",
    gstin: "",
    factory: "Plot No. 1705, Phase-II, GIDC Chhatral, Dist. Gandhinagar, Gujarat - 382729",
    office: "GF-3/4/5, Fountain Palace, Opp. Mahila Police Station, Near Mithakhali Circle, Navrangpura, Ahmedabad, Gujarat - 380009",
    accent: "#000080",
    signature: path.join(logoDir, "cappex-sign-cropped.png"),
    headerTop: 2,
    headerHeight: 108
  },
  "Impex India": {
    name: "IMPEX INDIA",
    logo: path.join(logoDir, "impex-logo.png"),
    letterhead: path.join(logoDir, "impex-letterhead.jpg"),
    website: "www.impexind.com",
    email: "sales@impexindia.in",
    phone: "9825000713",
    gstin: "24AQMPS7496J1ZX",
    factory: "Plot No. 1705, Phase-II, GIDC Chhatral, Dist. Gandhinagar, Gujarat - 382729",
    office: "GF-3/4/5, Fountain Palace, Opp. Mahila Police Station, Near Mithakhali Circle, Navrangpura, Ahmedabad, Gujarat - 380009",
    accent: "#87484b",
    signature: path.join(logoDir, "impex-stamp.jpg"),
    headerTop: 10,
    headerHeight: 108
  }
};

const safe = (value) => String(value || "-");
const numberPattern = /-?\d+(?:\.\d+)?/g;

const validationRequirement = (row = {}) => {
  const operator = row.validationOperator || "";
  const raw = String(row.validationValue || row.requiredResult || "");
  const numbers = raw.match(numberPattern) || [];

  if (operator === "greater_than" && numbers[0]) return `> ${numbers[0]}`;
  if (operator === "less_than" && numbers[0]) return `< ${numbers[0]}`;
  if (operator === "equal_to" && numbers[0]) return `= ${numbers[0]}`;
  if (operator === "between" && numbers.length >= 2) return `${numbers[0]} - ${numbers[1]}`;
  return row.requiredResult;
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return safe(value);
  const day = date.getDate();
  const suffix = day % 10 === 1 && day !== 11 ? "st" : day % 10 === 2 && day !== 12 ? "nd" : day % 10 === 3 && day !== 13 ? "rd" : "th";
  return `${day}${suffix} ${date.toLocaleString("en-US", { month: "long" })}'${String(date.getFullYear()).slice(-2)}`;
};

const formatMonth = (value) => {
  if (!value) return "-";
  const [year, month] = String(value).split("-");
  if (!year || !month) return safe(value);
  const date = new Date(Number(year), Number(month) - 1, 1);
  return `${date.toLocaleString("en-US", { month: "long" })}'${String(year).slice(-2)}`;
};

const page = {
  footerY: 760,
  maxContentY: 662
};

const textHeight = (doc, text, width, options = {}) => {
  doc.font(options.bold ? "Times-Bold" : "Times-Roman").fontSize(options.size || 10);
  return doc.heightOfString(safe(text), { width: width - 8, align: options.align || "left" }) + 8;
};

const drawCell = (doc, text, x, y, width, height, options = {}) => {
  if (options.fill) {
    doc.save().rect(x, y, width, height).fill(options.fill).restore();
  }
  doc.rect(x, y, width, height).strokeColor("#333333").lineWidth(0.5).stroke();
  doc
    .font(options.bold ? "Times-Bold" : "Times-Roman")
    .fontSize(options.size || 10)
    .fillColor("#000000")
    .text(safe(text), x + 4, y + 4, {
      width: width - 8,
      height: height - 6,
      align: options.align || "left"
    });
};

const ensurePageSpace = (doc, y, needed = 80) => {
  if (y + needed < page.maxContentY) return y;
  return y;
};

const rowHeight = (doc, values, widths, options = {}) =>
  Math.max(options.minHeight || 18, ...values.map((value, index) => textHeight(doc, value, widths[index], options)));

const drawRow = (doc, values, x, y, widths, options = {}) => {
  const height = rowHeight(doc, values, widths, options);
  let left = x;
  values.forEach((value, index) => {
    drawCell(doc, value, left, y, widths[index], height, options);
    left += widths[index];
  });
  return y + height;
};

const drawHeader = (doc, profile) => {
  const top = profile.headerTop ?? 10;
  const height = profile.headerHeight ?? 108;
  doc.image(profile.letterhead, 34, top, {
    width: 544,
    height,
    fit: [544, height],
    align: "center",
    valign: "center"
  });
  return top + height + 12;
};

const drawTitleAndInfo = (doc, certificate, y) => {
  const x = 28;
  const width = 556;
  drawCell(doc, "Material Test Certificate", x, y, width, 32, { bold: true, size: 24 });
  y += 32;

  const half = width / 2;
  y = drawRow(doc, [`Serial Number: ${safe(certificate.serialNo)}`, `TC No: ${safe(certificate.tcNo)}`], x, y, [half, half], { size: 10, minHeight: 18 });
  y = drawRow(doc, [`Date of issue: ${formatDate(certificate.issueDate)}`, `Purchase Order No: ${safe(certificate.poNo)}`], x, y, [half, half], { size: 10, minHeight: 18 });
  y = drawRow(doc, [`Batch Quantity: ${safe(certificate.batchQuantity)}`, `Purchaser: ${safe(certificate.customer?.name)}`], x, y, [half, half], { size: 10, minHeight: 18 });
  return y + 18;
};

const drawMaterials = (doc, certificate, y) => {
  const x = 28;
  const width = 556;
  const standard = safe(certificate.material?.standard);

  doc.font("Times-Bold").fontSize(12).text("1.  Materials", x + 34, y);
  doc.font("Times-Bold").fontSize(12).text(`Standard: ${standard}`, x + 270, y, { width: 286, align: "center" });
  y += 16;

  const widths = [142, 194, 81, 139];
  y = drawRow(doc, ["Trade Name:", "Size:", "Batch No", "Mfg. Month:"], x, y, widths, { bold: true, size: 9, minHeight: 15 });
  y = drawRow(
    doc,
    [
      certificate.material?.tradeName,
      certificate.material?.gradeOrSize,
      certificate.material?.batchNo,
      formatMonth(certificate.material?.mfgMonth)
    ],
    x,
    y,
    widths,
    { size: 9, minHeight: 15 }
  );
  return y + 10;
};

const drawAnalysisTable = (doc, analysis, y, index) => {
  const x = 28;
  const widths = [157, 118, 132, 149];
  const title = `${index}.  ${analysis.title}:`;

  y = ensurePageSpace(doc, y, 70);
  doc.font("Times-Bold").fontSize(11).text(title, x + 34, y);
  y += 14;
  y = drawRow(doc, ["Attribute", "Required", "Results", "Reff Method"], x, y, widths, { bold: true, size: 8, minHeight: 13 });

  analysis.rows?.forEach((row) => {
    y = ensurePageSpace(doc, y, 24);
    y = drawRow(doc, [row.parameter, validationRequirement(row), row.result, row.referenceMethod], x, y, widths, { size: 8, minHeight: 13 });
  });
  return y + 8;
};

const drawVerificationFooter = (doc, profile) => {
  const y = page.footerY;
  doc.save().moveTo(28, y - 8).lineTo(584, y - 8).strokeColor("#b8b8b8").lineWidth(0.5).stroke().restore();

  doc
    .font("Helvetica")
    .fontSize(6.5)
    .fillColor("#000000")
    .text(`To verify this certificate, please visit ${profile.website} and navigate to "Verify Certificate".`, 294, y, {
      width: 286,
      align: "left"
    });

  doc
    .font("Helvetica")
    .fontSize(6.5)
    .fillColor("#000000")
    .text(`For any complains or queries, please write us on ${profile.email}.`, 294, y + 10, {
      width: 286,
      align: "left"
    });
};

const drawFooter = (doc, certificate, profile, y) => {
  const footerStart = Math.max(y + 2, 612);
  y = Math.min(footerStart, page.maxContentY);

  doc
    .font("Times-Bold")
    .fontSize(8)
    .text(`Note: ${safe(certificate.material?.tradeName)} is confirmed as per ${safe(certificate.material?.standard)}`, 34, y, {
      width: 520
    });
  y += 14;

  doc.font("Times-Roman").fontSize(8).fillColor("#000000").text(`For, ${profile.name === "IMPEX INDIA" ? "Impex India" : "Cappex Industries"}`, 34, y);

  const signBox = profile.name === "IMPEX INDIA"
    ? { x: 38, y: y + 5, width: 82, height: 52 }
    : { x: 44, y: y + 1, width: 78, height: 58 };

  doc.image(profile.signature, signBox.x, signBox.y, {
    width: signBox.width,
    height: signBox.height,
    fit: [signBox.width, signBox.height],
    align: "center",
    valign: "center"
  });

  doc.font("Times-Bold").fontSize(8).fillColor("#000000").text("Authorized Signatory", 34, y + 63);
  drawVerificationFooter(doc, profile);
};

function streamCertificatePdf(certificate, writable) {
  const profile = companyProfiles[certificate.seller] || companyProfiles["Impex India"];
  const doc = new PDFDocument({ margin: 0, size: "LETTER", bufferPages: false });
  doc.pipe(writable);

  let y = drawHeader(doc, profile);
  y = drawTitleAndInfo(doc, certificate, y);
  y = drawMaterials(doc, certificate, y);

  certificate.analyses?.forEach((analysis, index) => {
    y = drawAnalysisTable(doc, analysis, y, index + 2);
  });

  drawFooter(doc, certificate, profile, y);
  doc.end();
}

module.exports = { streamCertificatePdf };
