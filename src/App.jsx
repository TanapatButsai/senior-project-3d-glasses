import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import CameraPage from './pages/CameraPage';
import ModelViewerPage from "./pages/ModelViewerPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/camera" element={<CameraPage />} />
        <Route path="/model-viewer" element={<ModelViewerPage />} />
      </Routes>
    </Router>
  );
};

export default App;

