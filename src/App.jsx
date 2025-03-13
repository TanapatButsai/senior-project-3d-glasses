import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import CameraPage from './pages/CameraPage';
import ModelViewerPage from "./pages/ModelViewerPage";
import ModelUploadPage from './pages/ModelUploadPage';
import ModelManagementPage from './pages/ModelManagementPage';
import AuthorizationPage from './pages/AuthorizationPage';
import AdminPage from "./pages/AdminPage";
import ShopPage from "./pages/ShopPage"
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />WelcomePage
        <Route path="/login" element={<AuthorizationPage />} />
        <Route path="/camera" element={<CameraPage />} />
        <Route path="/model-viewer" element={<ModelViewerPage />} />
        <Route path="/model-upload" element={<ModelUploadPage />} />
        <Route path="/model-management" element={<ModelManagementPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/shop" element={<ShopPage />} />
      </Routes>
    </Router>
  );
};

export default App;

