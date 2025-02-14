import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

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
        backgroundColor: "#326a72",
        padding: "20px",
      }}
    >
      <Header title="Manage 3D Glasses Models" />

      <div
        style={{
          flexGrow: 1,
          width: "80%",
          backgroundColor: "#ffffff",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
          overflowY: "auto",
        }}
      >
        <h2 style={{ color: "#333", marginBottom: "20px" }}>3D Glasses Models</h2>
        {models.length === 0 ? (
          <p style={{ color: "#555" }}>No models found.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ padding: "10px", borderBottom: "2px solid #ccc" }}>Preview</th>
                <th style={{ padding: "10px", borderBottom: "2px solid #ccc" }}>Name</th>
                <th style={{ padding: "10px", borderBottom: "2px solid #ccc" }}>Type</th>
                <th style={{ padding: "10px", borderBottom: "2px solid #ccc" }}>Try Count</th>
                <th style={{ padding: "10px", borderBottom: "2px solid #ccc" }}>Uploaded</th>
                <th style={{ padding: "10px", borderBottom: "2px solid #ccc" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
  {models.length === 0 ? (
    <tr>
      <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "#555" }}>
        No models found.
      </td>
    </tr>
  ) : (
    models.map((model) => (
      <tr key={model.glasses_id}>
        <td style={{ padding: "10px", borderBottom: "1px solid #ccc", textAlign: "center" }}>
          {model.preview_image ? (
            <img
              src={`http://localhost:5050/uploads/${model.preview_image}`}
              alt={model.name}
              style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "5px" }}
            />
          ) : (
            "No Image"
          )}
        </td>
        <td style={{ padding: "10px", borderBottom: "1px solid #ccc", fontWeight: "bold" }}>
          {model.name || "Unknown Name"}
        </td>
        <td style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>{model.type}</td>
        <td style={{ padding: "10px", borderBottom: "1px solid #ccc", textAlign: "center" }}>
          {model.try_count}
        </td>
        <td style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
          {new Date(model.created_at).toLocaleString()}
        </td>
        <td style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
          <button
            onClick={() => {
              setSelectedModel(model);
              setShowDeleteModal(true);
            }}
            style={{
              backgroundColor: "#E53935",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </td>
      </tr>
    ))
  )}
</tbody>

          </table>
        )}
      </div>

      {showDeleteModal && selectedModel && (
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
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete <b>{selectedModel.name}</b>?</p>
            {selectedModel.preview_image && (
              <img
                src={`http://localhost:5050/uploads/${selectedModel.preview_image}`}
                alt="Model Preview"
                style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "5px", marginTop: "10px" }}
              />
            )}
            <div style={{ display: "flex", justifyContent: "space-around", marginTop: "20px" }}>
              <button
                onClick={handleDelete}
                style={{
                  backgroundColor: "#E53935",
                  color: "#fff",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "5px",
                }}
              >
                Yes
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  backgroundColor: "#ccc",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "5px",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ManagementPage;
