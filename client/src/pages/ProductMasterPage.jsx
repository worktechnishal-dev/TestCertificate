import { useEffect, useState } from "react";
import api from "../services/api";

const emptyRow = { parameter: "", requiredResult: "", validationOperator: "", validationValue: "", referenceMethod: "" };
const analysisTitles = ["Physical Analysis", "Chemical Analysis", "Sieve Analysis"];
const emptyProduct = {
  tradeName: "",
  availableSizes: "",
  standardName: "",
  grades: "",
  analyses: analysisTitles.map((title) => ({ title, parameters: [{ ...emptyRow }] }))
};

const toCsv = (items = []) => items.join(", ");
const parseCsv = (value) => value.split(",").map((item) => item.trim()).filter(Boolean);
const numberPattern = /-?\d+(?:\.\d+)?/g;

const validationLabels = {
  greater_than: "Greater than",
  between: "Between",
  less_than: "Less than",
  equal_to: "Equal to"
};

const hasNumericRequiredResult = (row) => Boolean(String(row.requiredResult || "").match(numberPattern));
const validationNumbers = (row) => String(row.validationValue || row.requiredResult || "").match(numberPattern) || [];

const validationDisplayValue = (row) => {
  const numbers = validationNumbers(row);
  if (row.validationOperator === "between" && numbers.length >= 2) return `${numbers[0]} - ${numbers[1]}`;
  if (row.validationOperator) return numbers[0] || "";
  return "";
};

const validationMessage = (row) => {
  const operator = row.validationOperator || "";
  const numbers = validationNumbers(row);

  if (!operator) return "";
  if (operator === "between" && numbers.length < 2) return "Enter minimum and maximum validation values";
  if (operator !== "between" && numbers.length < 1) return "Required Result must include a numeric validation value";
  return "";
};

const buildProductForm = (product) => {
  const standard = product.standards?.[0] || {};
  return {
    tradeName: product.tradeName || "",
    availableSizes: toCsv(product.availableSizes),
    standardName: standard.standardName || "",
    grades: toCsv(standard.grades),
    analyses: analysisTitles.map((title) => {
      const existing = standard.analyses?.find((analysis) => analysis.title === title);
      return {
        title,
        parameters: existing?.parameters?.length ? existing.parameters.map((row) => ({ ...row })) : [{ ...emptyRow }]
      };
    })
  };
};

const ProductMasterPage = () => {
  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [editingProductId, setEditingProductId] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [status, setStatus] = useState("");

  const loadProducts = async () => {
    const { data } = await api.get("/products");
    setProducts(data);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const updateParameter = (analysisIndex, rowIndex, key, value) => {
    setProductForm((current) => ({
      ...current,
      analyses: current.analyses.map((analysis, currentAnalysisIndex) =>
        currentAnalysisIndex !== analysisIndex
          ? analysis
          : {
              ...analysis,
              parameters: analysis.parameters.map((row, currentRowIndex) =>
                currentRowIndex !== rowIndex
                  ? row
                  : {
                      ...row,
                      [key]: value,
                      ...(key === "requiredResult" && !String(value || "").match(numberPattern)
                        ? { validationOperator: "", validationValue: "" }
                        : {})
                    }
              )
            }
      )
    }));
  };

  const updateParameterOperator = (analysisIndex, rowIndex, value) => {
    setProductForm((current) => ({
      ...current,
      analyses: current.analyses.map((analysis, currentAnalysisIndex) =>
        currentAnalysisIndex !== analysisIndex
          ? analysis
          : {
              ...analysis,
              parameters: analysis.parameters.map((row, currentRowIndex) =>
                currentRowIndex !== rowIndex ? row : { ...row, validationOperator: value, validationValue: "" }
              )
            }
      )
    }));
  };

  const updateBetweenLimit = (analysisIndex, rowIndex, position, value) => {
    setProductForm((current) => ({
      ...current,
      analyses: current.analyses.map((analysis, currentAnalysisIndex) =>
        currentAnalysisIndex !== analysisIndex
          ? analysis
          : {
              ...analysis,
              parameters: analysis.parameters.map((row, currentRowIndex) => {
                if (currentRowIndex !== rowIndex) return row;

                const numbers = validationNumbers(row);
                const nextNumbers = [numbers[0] || "", numbers[1] || ""];
                nextNumbers[position] = value;

                return {
                  ...row,
                  validationValue: nextNumbers.filter(Boolean).join(" - ")
                };
              })
            }
      )
    }));
  };

  const addParameter = (analysisIndex) => {
    setProductForm((current) => ({
      ...current,
      analyses: current.analyses.map((analysis, currentAnalysisIndex) =>
        currentAnalysisIndex !== analysisIndex
          ? analysis
          : { ...analysis, parameters: [...analysis.parameters, { ...emptyRow }] }
      )
    }));
  };

  const removeParameter = (analysisIndex, rowIndex) => {
    setProductForm((current) => ({
      ...current,
      analyses: current.analyses.map((analysis, currentAnalysisIndex) =>
        currentAnalysisIndex !== analysisIndex
          ? analysis
          : {
              ...analysis,
              parameters: analysis.parameters.filter((_, currentRowIndex) => currentRowIndex !== rowIndex)
            }
      )
    }));
  };

  const buildPayload = () => ({
    tradeName: productForm.tradeName.trim(),
    availableSizes: parseCsv(productForm.availableSizes),
    standards: [
      {
        standardName: productForm.standardName.trim(),
        grades: parseCsv(productForm.grades),
        analyses: productForm.analyses.map((analysis) => ({
          title: analysis.title,
          parameters: analysis.parameters
            .map((row) => ({
              parameter: row.parameter.trim(),
              requiredResult: row.requiredResult.trim(),
              validationOperator: row.validationOperator || "",
              validationValue: row.validationOperator
                ? row.validationOperator === "between"
                  ? validationDisplayValue(row)
                  : row.requiredResult.trim()
                : "",
              referenceMethod: row.referenceMethod.trim()
            }))
            .filter((row) => row.parameter || row.requiredResult || row.referenceMethod)
        }))
      }
    ]
  });

  const validateProductForm = () =>
    productForm.analyses.flatMap((analysis) =>
      analysis.parameters.flatMap((row) => {
        const message = validationMessage(row);
        return message ? [`${analysis.title} - ${row.parameter || "Parameter"}: ${message}`] : [];
      })
    );

  const saveProduct = async (event) => {
    event.preventDefault();
    try {
      const validationErrors = validateProductForm();
      if (validationErrors.length) {
        setStatus(validationErrors.join(" | "));
        return;
      }

      const payload = buildPayload();
      if (editingProductId) {
        await api.put(`/products/${editingProductId}`, payload);
        setStatus("Product master updated");
      } else {
        await api.post("/products", payload);
        setStatus("Product master added");
      }
      setProductForm(emptyProduct);
      setEditingProductId("");
      setIsDialogOpen(false);
      await loadProducts();
    } catch (error) {
      setStatus(error.response?.data?.errors?.join(" | ") || error.response?.data?.error || error.response?.data?.message || error.message || "Failed to save product master");
    }
  };

  const openAddDialog = () => {
    setProductForm(emptyProduct);
    setEditingProductId("");
    setStatus("");
    setIsDialogOpen(true);
  };

  const editProduct = (product) => {
    setProductForm(buildProductForm(product));
    setEditingProductId(product._id);
    setStatus("");
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setProductForm(emptyProduct);
    setEditingProductId("");
    setIsDialogOpen(false);
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`Delete ${product.tradeName}?`)) return;
    try {
      await api.delete(`/products/${product._id}`);
      if (editingProductId === product._id) {
        setProductForm(emptyProduct);
        setEditingProductId("");
      }
      setStatus("Product deleted");
      await loadProducts();
    } catch (error) {
      setStatus(error.response?.data?.message || error.message || "Failed to delete product");
    }
  };

  return (
    <div className="page-grid">
      <section className="card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Product Master</p>
            <h2>Saved Product Masters</h2>
          </div>
          <button type="button" className="button" onClick={openAddDialog}>Add Product</button>
        </div>
        {status && <p className="status-text">{status}</p>}

        <div className="data-table" role="table" aria-label="Product masters">
          <div className="data-table__row data-table__row--head" role="row">
            <span role="columnheader">Trade Name</span>
            <span role="columnheader">Sizes</span>
            <span role="columnheader">Standards</span>
            <span role="columnheader">Grades / Sizes</span>
            <span role="columnheader">Actions</span>
          </div>
          {products.map((product) => {
            const standards = product.standards || [];
            const sizesText = toCsv(product.availableSizes) || "-";
            const standardsText = standards.map((item) => item.standardName).join(", ") || "-";
            const gradesText = standards.flatMap((item) => item.grades || []).join(", ") || "-";
            return (
              <div key={product._id} className="data-table__row" role="row">
                <span role="cell" className="truncate-cell" title={product.tradeName}><strong>{product.tradeName}</strong></span>
                <span role="cell" className="truncate-cell" title={sizesText}>{sizesText}</span>
                <span role="cell" className="truncate-cell" title={standardsText}>{standardsText}</span>
                <span role="cell" className="truncate-cell" title={gradesText}>{gradesText}</span>
                <span role="cell" className="button-row">
                  <button type="button" className="button-secondary" onClick={() => editProduct(product)}>Edit</button>
                  <button type="button" className="button-secondary danger" onClick={() => deleteProduct(product)}>Delete</button>
                </span>
              </div>
            );
          })}
          {!products.length && <div className="data-table__empty">No products added yet.</div>}
        </div>
      </section>

      {isDialogOpen && (
        <div className="dialog-backdrop" role="presentation">
          <section className="dialog-panel" role="dialog" aria-modal="true" aria-labelledby="product-dialog-title">
            <div className="section-header">
              <div>
                <p className="eyebrow">Product + Standard Master</p>
                <h2 id="product-dialog-title">{editingProductId ? "Update Product Template" : "Add Product Template"}</h2>
              </div>
              <button type="button" className="button-secondary" onClick={closeDialog}>Close</button>
            </div>

            <form className="form-grid" onSubmit={saveProduct}>
              <div className="field"><label>Trade Name</label><input value={productForm.tradeName} onChange={(e) => setProductForm({ ...productForm, tradeName: e.target.value })} required /></div>
              <div className="field"><label>Sizes</label><input value={productForm.availableSizes} onChange={(e) => setProductForm({ ...productForm, availableSizes: e.target.value })} placeholder="30/60, 40/80" /></div>
              <div className="field"><label>Standard</label><input value={productForm.standardName} onChange={(e) => setProductForm({ ...productForm, standardName: e.target.value })} required /></div>
              <div className="field"><label>Grades / Sizes</label><input value={productForm.grades} onChange={(e) => setProductForm({ ...productForm, grades: e.target.value })} placeholder="Grade A, Grade B" required /></div>

              {productForm.analyses.map((analysis, analysisIndex) => (
                <div className="field field-span" key={analysis.title}>
                  <h3>{analysis.title}</h3>
                  <div className="parameter-grid">
                    <div className="analysis-head">Parameter</div>
                    <div className="analysis-head">Required Result</div>
                    <div className="analysis-head">Validation</div>
                    <div className="analysis-head">Reference Method</div>
                    <div className="analysis-head">Action</div>
                    {analysis.parameters.map((row, rowIndex) => (
                      <div className="parameter-row" key={`${analysis.title}-${rowIndex}`}>
                        <input value={row.parameter} onChange={(e) => updateParameter(analysisIndex, rowIndex, "parameter", e.target.value)} required />
                        <input value={row.requiredResult} onChange={(e) => updateParameter(analysisIndex, rowIndex, "requiredResult", e.target.value)} required />
                        <div className="validation-control">
                          <select
                            value={hasNumericRequiredResult(row) ? row.validationOperator || "" : ""}
                            onChange={(e) => updateParameterOperator(analysisIndex, rowIndex, e.target.value)}
                            disabled={!hasNumericRequiredResult(row)}
                            title={!hasNumericRequiredResult(row) ? "Validation is disabled for text required results" : "Select validation rule"}
                          >
                            <option value="">Use required result text</option>
                            {Object.entries(validationLabels).map(([value, label]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                          {row.validationOperator === "between" && (
                            <div className="range-inputs">
                              <input
                                inputMode="decimal"
                                placeholder="Min"
                                value={validationNumbers(row)[0] || ""}
                                onChange={(e) => updateBetweenLimit(analysisIndex, rowIndex, 0, e.target.value)}
                                required
                              />
                              <input
                                inputMode="decimal"
                                placeholder="Max"
                                value={validationNumbers(row)[1] || ""}
                                onChange={(e) => updateBetweenLimit(analysisIndex, rowIndex, 1, e.target.value)}
                                required
                              />
                            </div>
                          )}
                          {validationMessage(row) && <small className="error-text">{validationMessage(row)}</small>}
                        </div>
                        <input value={row.referenceMethod} onChange={(e) => updateParameter(analysisIndex, rowIndex, "referenceMethod", e.target.value)} required />
                        <button type="button" className="button-secondary" onClick={() => removeParameter(analysisIndex, rowIndex)}>Remove</button>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="button-secondary" onClick={() => addParameter(analysisIndex)}>Add Parameter</button>
                </div>
              ))}

              <div className="button-row field-span">
                <button type="submit" className="button">{editingProductId ? "Update Product Master" : "Save Product Master"}</button>
                <button type="button" className="button-secondary" onClick={closeDialog}>Cancel</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default ProductMasterPage;
