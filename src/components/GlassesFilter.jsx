import React, { useState } from "react";
import "./GlassesFilter.css";

const GlassesFilter = ({ setFilter }) => {
  const [selectedType, setSelectedType] = useState("all");

  const handleSelect = (type) => {
    setSelectedType(type);
    setFilter(type); // ✅ ส่งค่าประเภทแว่นไปยังหน้า ShopPage
  };

  return (
    <div className="glasses-filter">
      <button 
        className={`filter-btn ${selectedType === "all" ? "active" : ""}`} 
        onClick={() => handleSelect("all")}
      >
        All
      </button>
      <button 
        className={`filter-btn ${selectedType === "Sunglasses" ? "active" : ""}`} 
        onClick={() => handleSelect("Sunglasses")}
      >
        Sunglasses
      </button>
      <button 
        className={`filter-btn ${selectedType === "Prescription Glasses" ? "active" : ""}`} 
        onClick={() => handleSelect("Prescription Glasses")}
      >
        Prescription Glasses
      </button>
    </div>
  );
};

export default GlassesFilter;
