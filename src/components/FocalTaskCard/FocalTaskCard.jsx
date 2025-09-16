// src/components/FocalTaskCard/FocalTaskCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./FocalTaskCard.css";

const FocalTaskCard = ({ section_designation, full_name, path }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    const slug = section_designation.toLowerCase().replace(/\s+/g, "-");
    navigate(`${slug}`, {
      state: {
        section_designation,
        full_name,
      },
    });
  };

  return (
    <div className="focal-card" onClick={handleClick}>
      <div className="focal-card-content">
        <h3>{section_designation}</h3>
        <p>{full_name}</p>
      </div>
    </div>
  );
};

export default FocalTaskCard;