import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./AuthorizationPage.css"; // Import CSS

const AuthorizationPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isSignUp ? "http://localhost:5050/auth/signup" : "http://localhost:5050/auth/signin";
    const payload = isSignUp ? { name, email, password } : { email, password };

    try {
      const response = await axios.post(url, payload);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      setMessage(response.data.message);
      setShowModal(true);

      setTimeout(() => {
        setShowModal(false);
        navigate("/welcome");
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || "An error occurred.");
      setShowModal(true);
    }
  };

  return (
    <div className="auth-container">
      <Header title={isSignUp ? "Sign Up" : "Sign In"} />

      <div className="auth-form-wrapper">
        <form onSubmit={handleSubmit} className="auth-form">
          <h2>{isSignUp ? "Create an Account" : "Sign in to Your Account"}</h2>

          {isSignUp && (
            <div className="auth-input-group">
              <label htmlFor="name" className="auth-label">Full Name:</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="auth-input"
              />
            </div>
          )}

          <div className="auth-input-group">
            <label htmlFor="email" className="auth-label">Email Address:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="auth-input"
            />
          </div>

          <div className="auth-input-group">
            <label htmlFor="password" className="auth-label">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="auth-input"
            />
          </div>

          <button type="submit" className="auth-button">
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>

          <p onClick={() => setIsSignUp(!isSignUp)} className="auth-toggle">
            {isSignUp ? "Already have an account? Sign In" : "No account? Sign Up"}
          </p>
        </form>
      </div>

      {/* Status Modal */}
      {showModal && (
        <div className="auth-modal">
          <div className="auth-modal-content">
            <h2>Status</h2>
            <p>{message}</p>
            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AuthorizationPage;
