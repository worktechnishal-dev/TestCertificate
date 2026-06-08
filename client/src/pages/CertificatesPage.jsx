import { useEffect, useState } from "react";
import api from "../services/api";
import { checkRowResult, validateAnalyses } from "../utils/resultValidation";

const sellers = ["Impex India", "Cappex Industries"];
const validationLabels = {
  greater_than: "Greater than",
  between: "Between",
  less_than: "Less than",
  equal_to: "Equal to"
};

const validationText = (row) => {
  if (!row.validationOperator) return "Required result text";
  const value = row.validationValue || row.requiredResult || "";
  const numbers = String(value).match(/-?\d+(?:\.\d+)?/g) || [];

  if (row.validationOperator === "greater_than" && numbers[0]) return `> ${numbers[0]}`;
  if (row.validationOperator === "less_than" && numbers[0]) return `< ${numbers[0]}`;
  if (row.validationOperator === "equal_to" && numbers[0]) return `= ${numbers[0]}`;
  if (row.validationOperator === "between" && numbers.length >= 2) return `${numbers[0]} - ${numbers[1]}`;
  return `${validationLabels[row.validationOperator] || row.validationOperator} ${value}`.trim();
};

const toEditForm = (certificate) => ({
  id: certificate._id,
  serialNo: certificate.serialNo,
  tcNo: certificate.tcNo,
  issueDate: certificate.issueDate || "",
  poNo: certificate.poNo || "",
  batchQuantity: certificate.batchQuantity || "",
  seller: certificate.seller || "Impex India",
  customerId: certificate.customer?.id || "",
  customerName: certificate.customer?.name || "",
  productId: certificate.material?.productId || "",
  tradeName: certificate.material?.tradeName || "",
  standard: certificate.material?.standard || "",
  gradeOrSize: certificate.material?.gradeOrSize || "",
  batchNo: certificate.material?.batchNo || "",
  mfgMonth: certificate.material?.mfgMonth || "",
  analyses: certificate.analyses || [],
  qcSignatory: certificate.qcSignatory || "",
  labInchargeSignatory: certificate.labInchargeSignatory || ""
});

const CertificatesPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [editForm, setEditForm] = useState(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const loadCertificates = async () => {
    const { data } = await api.get("/certificates");
    setCertificates(data);
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  const downloadCertificate = (certificateId) => {
    window.open(`${api.defaults.baseURL}/certificates/${certificateId}/download`, "_blank");
  };

  const startUpdate = (certificate) => {
    setEditForm(toEditForm(certificate));
    setStatus("");
  };

  const updateField = (key, value) => {
    setEditForm((current) => ({ ...current, [key]: value }));
  };

  const updateAnalysisRow = (analysisIndex, rowIndex, key, value) => {
    setEditForm((current) => ({
      ...current,
      analyses: current.analyses.map((analysis, currentAnalysisIndex) =>
        currentAnalysisIndex !== analysisIndex
          ? analysis
          : {
              ...analysis,
              rows: analysis.rows.map((row, currentRowIndex) =>
                currentRowIndex !== rowIndex ? row : { ...row, [key]: value }
              )
            }
      )
    }));
  };

  const saveCertificate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus("");

    try {
      const validationErrors = validateAnalyses(editForm.analyses);
      if (validationErrors.length) {
        setStatus(validationErrors.join(" | "));
        setSaving(false);
        return;
      }

      const { data } = await api.put(`/certificates/${editForm.id}`, editForm);
      setStatus(`Updated ${data.tcNo}`);
      setEditForm(toEditForm(data));
      await loadCertificates();
    } catch (error) {
      setStatus(error.response?.data?.errors?.join(" | ") || error.response?.data?.message || error.message || "Failed to update certificate");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-grid">
      <section className="card">
        <p className="eyebrow">Saved Certificates</p>
        <h2>Certificate Register</h2>
        <div className="table-wrap">
          <div className="table-grid table-grid--head">
            <span>Serial No</span>
            <span>TC No</span>
            <span>Issue Date</span>
            <span>Seller</span>
            <span>Customer</span>
            <span>Trade Name</span>
            <span>Standard</span>
            <span>Actions</span>
          </div>
          {certificates.map((certificate) => (
            <div className="table-grid" key={certificate._id}>
              <span>{certificate.serialNo}</span>
              <span>{certificate.tcNo}</span>
              <span>{certificate.issueDate}</span>
              <span>{certificate.seller || "Impex India"}</span>
              <span>{certificate.customer.name}</span>
              <span>{certificate.material.tradeName}</span>
              <span>{certificate.material.standard}</span>
              <div className="button-row">
                <button type="button" className="button-secondary" onClick={() => startUpdate(certificate)}>Update</button>
                <button type="button" className="button-secondary" onClick={() => downloadCertificate(certificate._id)}>Download</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {editForm && (
        <div className="dialog-backdrop" role="presentation" onClick={() => setEditForm(null)}>
          <section
            aria-labelledby="certificate-update-title"
            aria-modal="true"
            className="dialog-panel certificate-update-dialog"
            role="dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="dialog-header">
              <div>
                <p className="eyebrow">Update TC</p>
                <h2 id="certificate-update-title">Update {editForm.tcNo}</h2>
              </div>
              <button type="button" className="button-secondary" onClick={() => setEditForm(null)}>Close</button>
            </div>

            <form className="dialog-form" onSubmit={saveCertificate}>
              <div className="form-grid">
                <div className="field"><label>Serial No</label><input value={editForm.serialNo} disabled /></div>
                <div className="field"><label>TC No</label><input value={editForm.tcNo} disabled /></div>
                <div className="field"><label>Issue Date</label><input type="date" value={editForm.issueDate} onChange={(e) => updateField("issueDate", e.target.value)} required /></div>
                <div className="field"><label>PO No</label><input value={editForm.poNo} onChange={(e) => updateField("poNo", e.target.value)} /></div>
                <div className="field"><label>Batch Quantity</label><input value={editForm.batchQuantity} onChange={(e) => updateField("batchQuantity", e.target.value)} /></div>
                <div className="field"><label>Seller</label><select value={editForm.seller} onChange={(e) => updateField("seller", e.target.value)} required>{sellers.map((seller) => <option key={seller} value={seller}>{seller}</option>)}</select></div>
                <div className="field"><label>Customer Name</label><input value={editForm.customerName} onChange={(e) => updateField("customerName", e.target.value)} required /></div>
                <div className="field"><label>Trade Name</label><input value={editForm.tradeName} onChange={(e) => updateField("tradeName", e.target.value)} required /></div>
                <div className="field"><label>Standard</label><input value={editForm.standard} onChange={(e) => updateField("standard", e.target.value)} required /></div>
                <div className="field"><label>Grade / Size</label><input value={editForm.gradeOrSize} onChange={(e) => updateField("gradeOrSize", e.target.value)} required /></div>
                <div className="field"><label>Batch No</label><input value={editForm.batchNo} onChange={(e) => updateField("batchNo", e.target.value)} required /></div>
                <div className="field"><label>MFG Month</label><input type="month" value={editForm.mfgMonth} onChange={(e) => updateField("mfgMonth", e.target.value)} required /></div>
              </div>

              {editForm.analyses.map((analysis, analysisIndex) => (
                <div className="field update-analysis-block" key={analysis.title}>
                  <h3>{analysis.title}</h3>
                  <div className="analysis-scroll">
                    <div className="analysis-editor analysis-editor--certificate">
                      <div className="analysis-head">Parameter</div>
                      <div className="analysis-head">Required Results</div>
                      <div className="analysis-head">Validation</div>
                      <div className="analysis-head">Results</div>
                      <div className="analysis-head">Reference Method</div>
                      <div className="analysis-head">Status</div>
                      {analysis.rows.map((row, rowIndex) => {
                        const resultCheck = checkRowResult(row);

                        return (
                          <div className="analysis-editor__row" key={`${analysis.title}-${rowIndex}`}>
                            <input value={row.parameter} onChange={(e) => updateAnalysisRow(analysisIndex, rowIndex, "parameter", e.target.value)} required />
                            <input value={row.requiredResult} onChange={(e) => updateAnalysisRow(analysisIndex, rowIndex, "requiredResult", e.target.value)} required />
                            <span className="readonly-cell">{validationText(row)}</span>
                            <input value={row.result} onChange={(e) => updateAnalysisRow(analysisIndex, rowIndex, "result", e.target.value)} required />
                            <input value={row.referenceMethod} onChange={(e) => updateAnalysisRow(analysisIndex, rowIndex, "referenceMethod", e.target.value)} required />
                            <span className={row.result && !resultCheck.valid ? "validation-status validation-status--error" : "validation-status"}>
                              {row.result && !resultCheck.valid ? <small className="error-text">{resultCheck.message}</small> : "OK"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {status && <p className="status-text">{status}</p>}
              <div className="dialog-actions">
                <button className="button" disabled={saving}>{saving ? "Updating..." : "Update Certificate"}</button>
                <button type="button" className="button-secondary" onClick={() => downloadCertificate(editForm.id)}>Download Updated Certificate</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default CertificatesPage;
