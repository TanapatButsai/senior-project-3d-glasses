import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";

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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#326a72",
        padding: "20px",
      }}
    >
      <Header title={isSignUp ? "Sign Up" : "Sign In"} />

      <div
        style={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "40%",
            padding: "20px",
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
          }}
        >
          <h2 style={{ color: "#000", marginBottom: "20px" }}>
            {isSignUp ? "Create an Account" : "Sign in to Your Account"}
          </h2>

          {isSignUp && (
            <>
              <label
                htmlFor="name"
                style={{ color: "#000", marginBottom: "5px", fontWeight: "bold", alignSelf: "flex-start" }}
              >
                Full Name:
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                }}
              />
            </>
          )}

          <label
            htmlFor="email"
            style={{ color: "#000", marginBottom: "5px", fontWeight: "bold", alignSelf: "flex-start" }}
          >
            Email Address:
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />

          <label
            htmlFor="password"
            style={{ color: "#000", marginBottom: "5px", fontWeight: "bold", alignSelf: "flex-start" }}
          >
            Password:
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "20px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />

          <button
            type="submit"
            style={{
              backgroundColor: "#1DB954",
              color: "#fff",
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>

          <p
            onClick={() => setIsSignUp(!isSignUp)}
            style={{
              marginTop: "10px",
              color: "#1DB954",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            {isSignUp ? "Already have an account? Sign In" : "No account? Sign Up"}
          </p>
        </form>
      </div>

      {/* Status Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "400px",
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h2 style={{ color: "#333" }}>Status</h2>
            <p style={{ margin: "20px 0", color: "#555" }}>{message}</p>
            <button
              onClick={() => setShowModal(false)}
              style={{
                backgroundColor: "#1DB954",
                color: "#fff",
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AuthorizationPage;
