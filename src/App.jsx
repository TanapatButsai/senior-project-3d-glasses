import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomePage from './components/WelcomePage';
import CameraPage from './components/CameraPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/camera" element={<CameraPage />} />
      </Routes>
    </Router>
  );
};

export default App;

