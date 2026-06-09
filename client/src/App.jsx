import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import CertificatesPage from "./pages/CertificatesPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import MastersPage from "./pages/MastersPage";
import NewCertificatePage from "./pages/NewCertificatePage";
import ProductMasterPage from "./pages/ProductMasterPage";
import RegisterPage from "./pages/RegisterPage";

const App = () => (
  <AuthProvider>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/new-certificate" element={<NewCertificatePage />} />
        <Route path="/certificates" element={<CertificatesPage />} />
        <Route path="/masters" element={<MastersPage />} />
        <Route path="/product-master" element={<ProductMasterPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </AuthProvider>
);

export default App;
