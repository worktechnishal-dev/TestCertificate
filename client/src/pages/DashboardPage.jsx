import { Link } from "react-router-dom";

const DashboardPage = () => (
  <div className="page-grid">
    <section className="hero-panel">
      <div>
        <p className="eyebrow">Material Test Certificate Workflow</p>
        <h2>Create test certificates faster with automatic numbering and product-standard templates.</h2>
        <p className="muted">
          Manage customers and product masters, select the right standard, get prefilled parameter rows, enter actual results, and save a complete certificate.
        </p>
        <div className="button-row">
          <Link to="/new-certificate" className="button">Create New TC</Link>
          <Link to="/masters" className="button button-secondary">Manage Masters</Link>
        </div>
      </div>
      <div className="hero-stats">
        <div className="metric-card"><strong>General Information</strong><span>Serial No, TC No, Issue Date, PO No, Batch Quantity, Customer</span></div>
        <div className="metric-card"><strong>Material Information</strong><span>Trade Name, Grade/Size, Batch No, MFG Month, Standard</span></div>
        <div className="metric-card"><strong>Analysis Blocks</strong><span>Physical, Chemical, and Sieve Analysis with methods</span></div>
      </div>
    </section>
  </div>
);

export default DashboardPage;
