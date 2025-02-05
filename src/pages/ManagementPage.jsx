import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const ManagementPage = () => {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch models from backend
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch("http://localhost:5050/models");
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setModels(data);
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    };
    fetchModels();
  }, []);

  // Function to delete a model
  const handleDelete = async () => {
    if (!selectedModel) return;

    try {
      const response = await fetch(`http://localhost:5050/models/${selectedModel.glasses_id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete model");

      // ✅ Remove the deleted item from the list
      setModels(models.filter((model) => model.glasses_id !== selectedModel.glasses_id));
      setShowDeleteModal(false);
      setShowModal(false);
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
        boxSizing: "border-box",
      }}
    >
      <Header title="Manage 3D Glasses Models" />

      <div
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "80%",
          backgroundColor: "#ffffff",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
        }}
      >
        <h2 style={{ color: "#333", marginBottom: "20px" }}>3D Glasses Models</h2>

        {models.length === 0 ? (
          <p style={{ color: "#555" }}>No models found.</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr>
                <th style={{ padding: "10px", borderBottom: "2px solid #ccc" }}>Name</th>
                <th style={{ padding: "10px", borderBottom: "2px solid #ccc" }}>Type</th>
                <th style={{ padding: "10px", borderBottom: "2px solid #ccc" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {models.map((model) => (
                <tr 
                  key={model.glasses_id} 
                  style={{ cursor: "pointer" }} 
                  onClick={() => {
                    setSelectedModel(model);
                    setShowModal(true);
                  }}
                >
                  <td style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>{model.name}</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>{model.type}</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click triggering
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
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal to show Model Details */}
      {showModal && selectedModel && (
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
            <h2 style={{ color: "#333" }}>Model Information</h2>
            <p><b>Name:</b> {selectedModel.name}</p>
            <p><b>Type:</b> {selectedModel.type}</p>
            <p><b>Try Count:</b> {selectedModel.try_count}</p>
            <p><b>Uploaded:</b> {new Date(selectedModel.created_at).toLocaleString()}</p>

            <button
              onClick={() => setShowModal(false)}
              style={{
                backgroundColor: "#ccc",
                color: "#000",
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px",
                fontSize: "16px",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
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
            <h2 style={{ color: "#333" }}>Confirm Deletion</h2>
            <p style={{ margin: "20px 0", color: "#555" }}>
              Are you sure you want to delete <b>{selectedModel?.name}</b>?
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
              <button
                onClick={handleDelete}
                style={{
                  backgroundColor: "#E53935",
                  color: "#fff",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "5px",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  backgroundColor: "#ccc",
                  color: "#000",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "5px",
                  fontSize: "16px",
                  cursor: "pointer",
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

