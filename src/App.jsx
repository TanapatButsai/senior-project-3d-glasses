import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import CameraPage from './pages/CameraPage';
import ModelViewerPage from "./pages/ModelViewerPage";
import ModelUploadPage from './pages/ModelUploadPage';
import ManagementPage from './pages/ManagementPage';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/camera" element={<CameraPage />} />
        <Route path="/model-viewer" element={<ModelViewerPage />} />
        <Route path="/model-upload" element={<ModelUploadPage />} />
        <Route path="/model-management" element={<ManagementPage />} />

      </Routes>
    </Router>
  );
};

export default App;

