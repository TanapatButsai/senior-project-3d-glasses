import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import CameraPage from './pages/CameraPage';
import ModelViewerPage from "./pages/ModelViewerPage";
import ModelUploadPage from './pages/ModelUploadPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/camera" element={<CameraPage />} />
        <Route path="/model-viewer" element={<ModelViewerPage />} />
        <Route path="/model-upload" element={<ModelUploadPage />} />
      </Routes>
    </Router>
  );
};

export default App;

