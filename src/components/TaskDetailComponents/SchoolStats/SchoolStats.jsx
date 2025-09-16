// src/components/TaskDetailComponents/SchoolStats/SchoolStats.jsx
import React from "react";
import "./SchoolStats.css";

const SchoolStats = ({ schoolsRequired, accountsRequired }) => {
  const totalSchools = schoolsRequired?.length || 0;
  const totalAccounts = accountsRequired?.length || 0;

  return (
    <div className="school-stats">
      <div className="stat-item">
        <div className="stat-number">{totalSchools}</div>
        <div className="stat-label">Schools Assigned</div>
      </div>
      <div className="stat-item">
        <div className="stat-number">{totalAccounts}</div>
        <div className="stat-label">Accounts Assigned</div>
      </div>
    </div>
  );
};

export default SchoolStats;