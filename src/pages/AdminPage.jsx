import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPage.css";
import NavbarAdmin from "../components/NavbarAdmin"; // Import Navbar
import Footer from "../components/Footer";
import { motion } from "framer-motion"; // ✅ Import Framer Motion

const AdminPage = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
      className="welcome-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      <NavbarAdmin />
      
      <motion.div 
        className="main-content"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
      >
        <div className="text-content">
          <h2>Virtual Try On Glasses</h2>
          <p className="sub-text">
            You can virtually try on as many pairs as you want with our
            innovative virtual mirror tool from the comfort of your home.
          </p>

          <div className="instructions">
            <p>👓 Select a pair you love from the listing below</p>
            <p>⬇️ Click “Try them on” and follow the on-screen instructions.</p>
            <p>📸 See how they look and shop your favorite styles.</p>
          </div>

          <motion.button 
            onClick={() => navigate("/shop-admin")} 
            className="cta-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            Try On Glasses
          </motion.button>
        </div>

        <motion.div 
          className="image-container"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
        >
          <img src="/src/assets/welcome-image.png" alt="Virtual Try-On" />
        </motion.div>
      </motion.div>
      <motion.div>
      <Footer/>
      </motion.div>
    </motion.div>
  );
};

export default AdminPage;
