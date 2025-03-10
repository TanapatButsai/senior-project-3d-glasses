import React from "react";
import { useNavigate } from "react-router-dom";
import "./WelcomePage.css";
import Navbar from "../components/Navbar"; // Import Navbar

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      {/* Navigation Bar */}
      <Navbar />
      {/* Main Content */}
      <div className="main-content">
        {/* Left Section - Instructions */}
        <div className="text-content">
          <h2>Virtual Try On Glasses</h2>
          <p className="sub-text">
            You can virtually try on as many pairs as you want with our
            innovative virtual mirror tool from the comfort of your home or
            wherever you may be.
          </p>

          <div className="instructions">
            <p>👓 Select a pair you love from the listing below</p>
            <p>⬇️ Click “Try them on” and follow the on-screen instructions.</p>
            <p>📸 See how they look and shop your favorite styles.</p>
          </div>

          <button onClick={() => navigate("/camera")} className="cta-button">
            Try On Glasses
          </button>
        </div>

        {/* Right Section - Image */}
        <div className="image-container">
          <img src="/image/image-welcome.png" alt="Virtual Try-On" />
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
