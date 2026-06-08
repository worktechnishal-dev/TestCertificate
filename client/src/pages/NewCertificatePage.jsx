import { useEffect, useMemo, useRef, useState } from "react";
import CertificatePreview from "../components/CertificatePreview";
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

const defaultForm = {
  serialNo: "",
  tcNo: "",
  issueDate: "",
  poNo: "",
  batchQuantity: "",
  seller: "Impex India",
  customerId: "",
  customerName: "",
  productId: "",
  tradeName: "",
  standard: "",
  gradeOrSize: "",
  batchNo: "",
  mfgMonth: "",
  analyses: [],
  qcSignatory: "QC Executive",
  labInchargeSignatory: "Lab Incharge"
};

const NewCertificatePage = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [grades, setGrades] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [customerMode, setCustomerMode] = useState("existing");
  const [newCustomer, setNewCustomer] = useState({ name: "", address: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [savedCertificate, setSavedCertificate] = useState(null);
  const skipNextTemplateLoad = useRef(false);

  useEffect(() => {
    const loadMasters = async () => {
      const [{ data: customerData }, { data: productData }, { data: draftData }] = await Promise.all([
        api.get("/customers"),
        api.get("/products"),
        api.get("/certificates/draft")
      ]);

      setCustomers(customerData);
      setProducts(productData);
      setForm((current) => ({
        ...current,
        serialNo: draftData.serialNo,
        tcNo: draftData.tcNo
      }));
    };

    loadMasters();
  }, []);

  const selectedProduct = useMemo(
    () => products.find((item) => item._id === form.productId),
    [products, form.productId]
  );

  const standardOptions = selectedProduct?.standards || [];

  const refreshDraftNumbers = async (issueDate, serialNo = form.serialNo) => {
    const { data } = await api.get("/certificates/draft", {
      params: {
        issueDate: issueDate || undefined,
        serialNo: serialNo || undefined
      }
    });

    setForm((current) => ({
      ...current,
      serialNo: data.serialNo,
      tcNo: data.tcNo
    }));
  };

  useEffect(() => {
    const loadTemplate = async () => {
      if (skipNextTemplateLoad.current) {
        skipNextTemplateLoad.current = false;
        return;
      }

      if (!form.productId || !form.standard) {
        setGrades([]);
        setForm((current) => ({ ...current, analyses: [], gradeOrSize: "" }));
        return;
      }

      const { data } = await api.get("/certificates/draft", {
        params: { productId: form.productId, standardName: form.standard }
      });

      setGrades(data.grades);
      setForm((current) => ({
        ...current,
        analyses: data.analyses,
        gradeOrSize: data.grades.includes(current.gradeOrSize) ? current.gradeOrSize : ""
      }));
    };

    loadTemplate();
  }, [form.productId, form.standard]);

  const handleCustomerChange = async (value) => {
    const selected = customers.find((customer) => customer._id === value);
    setSavedCertificate(null);

    if (!value) {
      setForm((current) => ({
        ...current,
        customerId: "",
        customerName: ""
      }));
      return;
    }

    try {
      const { data: latestCertificate } = await api.get(`/certificates/latest-by-customer/${value}`);

      if (!latestCertificate) {
        setForm((current) => ({
          ...current,
          customerId: value,
          customerName: selected?.name || ""
        }));
        return;
      }

      const latestProductId = latestCertificate.material?.productId || "";
      const latestStandard = latestCertificate.material?.standard || "";
      const latestProduct = products.find((product) => product._id === latestProductId);
      const latestStandardTemplate = latestProduct?.standards?.find((standard) => standard.standardName === latestStandard);

      setGrades(latestStandardTemplate?.grades || []);
      skipNextTemplateLoad.current = true;
      setForm((current) => ({
        ...current,
        poNo: latestCertificate.poNo || "",
        batchQuantity: latestCertificate.batchQuantity || "",
        seller: latestCertificate.seller || current.seller,
        customerId: value,
        customerName: selected?.name || latestCertificate.customer?.name || "",
        productId: latestProductId,
        tradeName: latestCertificate.material?.tradeName || "",
        standard: latestStandard,
        gradeOrSize: latestCertificate.material?.gradeOrSize || "",
        batchNo: latestCertificate.material?.batchNo || "",
        mfgMonth: latestCertificate.material?.mfgMonth || "",
        analyses: latestCertificate.analyses || [],
        qcSignatory: latestCertificate.qcSignatory || current.qcSignatory,
        labInchargeSignatory: latestCertificate.labInchargeSignatory || current.labInchargeSignatory
      }));
      setMessage(`Fetched previous details for ${selected?.name || latestCertificate.customer?.name}`);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to fetch previous customer details");
      setForm((current) => ({
        ...current,
        customerId: value,
        customerName: selected?.name || ""
      }));
    }
  };

  const updateAnalysisRow = (analysisIndex, rowIndex, key, value) => {
    setForm((current) => ({
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

  const addAnalysisRow = (analysisIndex) => {
    setForm((current) => ({
      ...current,
      analyses: current.analyses.map((analysis, currentAnalysisIndex) =>
        currentAnalysisIndex !== analysisIndex
          ? analysis
          : {
              ...analysis,
              rows: [...analysis.rows, { parameter: "", requiredResult: "", result: "", referenceMethod: "" }]
            }
      )
    }));
  };

  const removeAnalysisRow = (analysisIndex, rowIndex) => {
    setForm((current) => ({
      ...current,
      analyses: current.analyses.map((analysis, currentAnalysisIndex) =>
        currentAnalysisIndex !== analysisIndex
          ? analysis
          : {
              ...analysis,
              rows: analysis.rows.filter((_, currentRowIndex) => currentRowIndex !== rowIndex)
            }
      )
    }));
  };

  const downloadCertificate = (certificateId) => {
    window.open(`${api.defaults.baseURL}/certificates/${certificateId}/download`, "_blank");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const clientErrors = validateAnalyses(form.analyses);
      if (clientErrors.length) {
        setMessage(clientErrors.join(" | "));
        setSaving(false);
        return;
      }

      let customerId = form.customerId;
      let customerName = form.customerName;

      if (customerMode === "new") {
        const { data: createdCustomer } = await api.post("/customers", newCustomer);
        customerId = createdCustomer._id;
        customerName = createdCustomer.name;
        setCustomers((current) => [...current, createdCustomer].sort((a, b) => a.name.localeCompare(b.name)));
      }

      const payload = {
        ...form,
        customerId,
        customerName
      };

      const { data } = await api.post("/certificates", payload);
      const { data: draftData } = await api.get("/certificates/draft");

      setMessage(`Certificate saved successfully as ${data.tcNo}`);
      setSavedCertificate(data);
      setCustomerMode("existing");
      setNewCustomer({ name: "", address: "" });
      setForm({
        ...defaultForm,
        serialNo: draftData.serialNo,
        tcNo: draftData.tcNo,
        qcSignatory: form.qcSignatory,
        labInchargeSignatory: form.labInchargeSignatory
      });
      setGrades([]);
    } catch (error) {
      setMessage(error.response?.data?.errors?.join(" | ") || error.response?.data?.message || "Failed to save certificate");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="split-layout certificate-layout">
      <section className="card">
        <p className="eyebrow">New TC</p>
        <h2>Generate Material Test Certificate</h2>
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field"><label>Serial No</label><input value={form.serialNo} disabled /></div>
          <div className="field"><label>TC No</label><input value={form.tcNo} disabled /></div>
          <div className="field"><label>Issue Date</label><input type="date" value={form.issueDate} onChange={(e) => {
            const issueDate = e.target.value;
            setForm({ ...form, issueDate });
            refreshDraftNumbers(issueDate, form.serialNo).catch(() => setMessage("Failed to refresh TC number for selected financial year"));
          }} required /></div>
          <div className="field"><label>PO No</label><input value={form.poNo} onChange={(e) => setForm({ ...form, poNo: e.target.value })} /></div>
          <div className="field"><label>Batch Quantity</label><input value={form.batchQuantity} onChange={(e) => setForm({ ...form, batchQuantity: e.target.value })} /></div>
          <div className="field"><label>Seller</label><select value={form.seller} onChange={(e) => setForm({ ...form, seller: e.target.value })} required>{sellers.map((seller) => <option key={seller} value={seller}>{seller}</option>)}</select></div>
          <div className="field field-span">
            <label>Customer Selection</label>
            <div className="segmented-control">
              <button type="button" className={customerMode === "existing" ? "is-active" : ""} onClick={() => setCustomerMode("existing")}>Existing</button>
              <button type="button" className={customerMode === "new" ? "is-active" : ""} onClick={() => setCustomerMode("new")}>New Customer</button>
            </div>
          </div>

          {customerMode === "existing" ? (
            <div className="field field-span">
              <label>Customer Name</label>
              <select value={form.customerId} onChange={(e) => handleCustomerChange(e.target.value)} required>
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>{customer.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div className="field"><label>Customer Name</label><input value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} required /></div>
              <div className="field field-span"><label>Address</label><input value={newCustomer.address} onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })} /></div>
            </>
          )}

          <div className="field"><label>Trade Name</label><select value={form.productId} onChange={(e) => {
            const product = products.find((item) => item._id === e.target.value);
            setForm({ ...form, productId: e.target.value, tradeName: product?.tradeName || "", standard: "", gradeOrSize: "", analyses: [] });
          }} required>
            <option value="">Select material</option>
            {products.map((product) => (
              <option key={product._id} value={product._id}>{product.tradeName}</option>
            ))}
          </select></div>

          <div className="field"><label>Standard</label><select value={form.standard} onChange={(e) => setForm({ ...form, standard: e.target.value, gradeOrSize: "" })} required>
            <option value="">Select standard</option>
            {standardOptions.map((standard) => (
              <option key={standard.standardName} value={standard.standardName}>{standard.standardName}</option>
            ))}
          </select></div>

          <div className="field"><label>Grade / Size</label><select value={form.gradeOrSize} onChange={(e) => setForm({ ...form, gradeOrSize: e.target.value })} required>
            <option value="">Select grade / size</option>
            {grades.map((grade) => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select></div>

          <div className="field"><label>Batch No</label><input value={form.batchNo} onChange={(e) => setForm({ ...form, batchNo: e.target.value })} required /></div>
          <div className="field"><label>MFG Month</label><input type="month" value={form.mfgMonth} onChange={(e) => setForm({ ...form, mfgMonth: e.target.value })} required /></div>
          <div className="field"><label>QC Signatory</label><input value={form.qcSignatory} onChange={(e) => setForm({ ...form, qcSignatory: e.target.value })} /></div>
          <div className="field"><label>Lab Incharge Signatory</label><input value={form.labInchargeSignatory} onChange={(e) => setForm({ ...form, labInchargeSignatory: e.target.value })} /></div>

          {form.analyses.map((analysis, analysisIndex) => (
            <div className="field field-span" key={analysis.title}>
              <h3>{analysis.title}</h3>
              <div className="analysis-scroll">
                <div className="analysis-editor analysis-editor--certificate">
                  <div className="analysis-head">Parameter</div>
                  <div className="analysis-head">Required Results</div>
                  <div className="analysis-head">Validation</div>
                  <div className="analysis-head">Results</div>
                  <div className="analysis-head">Reference Method</div>
                  <div className="analysis-head">Action</div>
                  {analysis.rows.map((row, rowIndex) => (
                    <div className="analysis-editor__row" key={`${analysis.title}-${rowIndex}`}>
                      <input value={row.parameter} onChange={(e) => updateAnalysisRow(analysisIndex, rowIndex, "parameter", e.target.value)} required />
                      <input value={row.requiredResult} onChange={(e) => updateAnalysisRow(analysisIndex, rowIndex, "requiredResult", e.target.value)} required />
                      <span className="readonly-cell">{validationText(row)}</span>
                      <div>
                        <input
                          value={row.result}
                          onChange={(e) => updateAnalysisRow(analysisIndex, rowIndex, "result", e.target.value)}
                          placeholder="Enter result"
                          required
                        />
                        {row.result && !checkRowResult(row).valid && (
                          <small className="error-text">{checkRowResult(row).message}</small>
                        )}
                      </div>
                      <input value={row.referenceMethod} onChange={(e) => updateAnalysisRow(analysisIndex, rowIndex, "referenceMethod", e.target.value)} required />
                      <button type="button" className="button-secondary" onClick={() => removeAnalysisRow(analysisIndex, rowIndex)}>Remove</button>
                    </div>
                  ))}
                </div>
              </div>
              <button type="button" className="button-secondary" onClick={() => addAnalysisRow(analysisIndex)}>Add Row</button>
            </div>
          ))}

          {message && <p className="status-text">{message}</p>}
          {savedCertificate && (
            <button type="button" className="button-secondary" onClick={() => downloadCertificate(savedCertificate._id)}>
              Download Saved Certificate
            </button>
          )}
          <button className="button" disabled={saving}>{saving ? "Saving..." : "Save Certificate"}</button>
        </form>
      </section>

      <CertificatePreview
        certificate={{
          ...form,
          customerName: customerMode === "existing" ? form.customerName : newCustomer.name
        }}
      />
    </div>
  );
};

export default NewCertificatePage;
