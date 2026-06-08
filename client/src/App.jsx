import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import CertificatesPage from "./pages/CertificatesPage";
import DashboardPage from "./pages/DashboardPage";
import MastersPage from "./pages/MastersPage";
import NewCertificatePage from "./pages/NewCertificatePage";
import ProductMasterPage from "./pages/ProductMasterPage";

const App = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/new-certificate" element={<NewCertificatePage />} />
      <Route path="/certificates" element={<CertificatesPage />} />
      <Route path="/masters" element={<MastersPage />} />
      <Route path="/product-master" element={<ProductMasterPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Layout>
);

export default App;
