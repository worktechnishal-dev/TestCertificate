import { Navigate, Outlet, useLocation } from "react-router-dom";
import Layout from "./Layout";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="auth-loading">Loading application...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default ProtectedRoute;
