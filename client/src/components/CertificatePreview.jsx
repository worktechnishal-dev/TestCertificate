const CertificatePreview = ({ certificate }) => {
  if (!certificate) {
    return (
      <section className="card">
        <h3>Live Certificate Preview</h3>
        <p className="muted">Select customer, material, grade, and standard to preview the structure.</p>
      </section>
    );
  }

  return (
    <section className="card preview-card">
      <div className="preview-header">
        <div>
          <p className="eyebrow">Preview</p>
          <h3>Material Test Certificate</h3>
        </div>
        <div className="preview-meta">
          <span>Serial No: {certificate.serialNo || "-"}</span>
          <span>TC No: {certificate.tcNo || "-"}</span>
        </div>
      </div>

      <div className="preview-grid">
        <div><strong>Issue Date</strong><span>{certificate.issueDate || "-"}</span></div>
        <div><strong>PO No</strong><span>{certificate.poNo || "-"}</span></div>
        <div><strong>Batch Quantity</strong><span>{certificate.batchQuantity || "-"}</span></div>
        <div><strong>Seller</strong><span>{certificate.seller || "Impex India"}</span></div>
        <div><strong>Customer</strong><span>{certificate.customerName || "-"}</span></div>
        <div><strong>Trade Name</strong><span>{certificate.tradeName || "-"}</span></div>
        <div><strong>Grade / Size</strong><span>{certificate.gradeOrSize || "-"}</span></div>
        <div><strong>Batch No</strong><span>{certificate.batchNo || "-"}</span></div>
        <div><strong>MFG Month</strong><span>{certificate.mfgMonth || "-"}</span></div>
        <div><strong>Standard</strong><span>{certificate.standard || "-"}</span></div>
      </div>

      {certificate.analyses?.map((analysis) => (
        <div key={analysis.title} className="analysis-block">
          <h4>{analysis.title}</h4>
          <div className="analysis-table">
            <div className="analysis-table__head">Parameter</div>
            <div className="analysis-table__head">Required Results</div>
            <div className="analysis-table__head">Results</div>
            <div className="analysis-table__head">Reference Method</div>
            {analysis.rows.map((row, index) => (
              <div className="analysis-table__row" key={`${analysis.title}-${index}`}>
                <span>{row.parameter}</span>
                <span>{row.requiredResult}</span>
                <span>{row.result || "-"}</span>
                <span>{row.referenceMethod}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="sign-grid">
        <div>
          <strong>QC Sign</strong>
          <span>{certificate.qcSignatory || "QC Executive"}</span>
        </div>
        <div>
          <strong>Lab Incharge Sign</strong>
          <span>{certificate.labInchargeSignatory || "Lab Incharge"}</span>
        </div>
      </div>
    </section>
  );
};

export default CertificatePreview;
