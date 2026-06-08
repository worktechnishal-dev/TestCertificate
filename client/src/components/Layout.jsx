import { NavLink } from "react-router-dom";

const Layout = ({ children }) => (
  <div className="app-shell">
    <aside className="sidebar">
      <div>
        <p className="eyebrow">Certificate Suite</p>
        <h1>Material Test Certificate Generator</h1>
      </div>
      <nav className="nav-list">
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/new-certificate">New Certificate</NavLink>
        <NavLink to="/certificates">Certificates</NavLink>
        <NavLink to="/masters">Customer Master</NavLink>
        <NavLink to="/product-master">Product Master</NavLink>
      </nav>
      <div className="sidebar-note">
        Automatic serial numbers, customer dropdowns, product templates, standards, and analysis entry in one workflow.
      </div>
    </aside>
    <main className="main-panel">
      {children}
    </main>
  </div>
);

export default Layout;
