import React, { useState } from "react";
import VirtualGlasses from "../components/VirtualGlasses";
// import styles from "./ShopPage.module.css";

const glassesList = [
  { id: 1, name: "vinyl", model: "/models/vinyl.glb" },
  { id: 2, name: "st_michel", model: "/models/st_michel.glb" },
  { id: 3, name: "romy", model: "/models/romy.glb" },
];

const ShopPage = () => {
    const [selectedGlasses, setSelectedGlasses] = useState(null);
  
    return (
      <div>
        <h2>Shop Glasses</h2>
        <div style={{ display: "flex", gap: "20px" }}>
          {glasses.map((glass) => (
            <div key={glass.id} style={{ textAlign: "center" }}>
              <img src={glass.image} alt={glass.name} width="150" />
              <h4>{glass.name}</h4>
              <button onClick={() => setSelectedGlasses(glass.id)}>Try-On</button>
            </div>
          ))}
        </div>
  
        {selectedGlasses && (
          <div className="popup">
            <iframe src="/camera" width="800" height="600"></iframe>
            <button onClick={() => setSelectedGlasses(null)}>Close</button>
          </div>
        )}
      </div>
    );
  };
  
  export default ShopPage;