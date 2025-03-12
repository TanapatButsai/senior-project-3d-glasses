import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
const ManagementPage = () => {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch models from backend
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch("http://localhost:5050/models");
        if (!response.ok) throw new Error("Failed to fetch");
  
        const data = await response.json();
        console.log("Fetched Models:", data); // 🔍 Debugging
        setModels(data);
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    };
  
    fetchModels();
  }, []);
  
  // Function to delete a model
  const handleDelete = async () => {
    if (!selectedModel || !selectedModel.glasses_id) return;

    try {
      const response = await fetch(`http://localhost:5050/models/${selectedModel.glasses_id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete model");

      // Remove the deleted item from the list
      setModels(models.filter((model) => model.glasses_id !== selectedModel.glasses_id));
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting model:", error);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#ffffff",
        padding: "20px",
      }}
    >
      <Navbar/>

      <Footer />
    </div>
  );
};

export default ManagementPage;
