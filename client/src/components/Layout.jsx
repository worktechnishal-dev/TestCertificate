import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = ({ children }) => {
  const { logout, user } = useAuth();

  return (
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
          <NavLink to="/profile">Profile</NavLink>
        </nav>
        <div className="sidebar-user">
          <span>{user?.name}</span>
          <button type="button" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>
      <main className="main-panel">
        {children}
      </main>
    </div>
  );
};

export default Layout;
