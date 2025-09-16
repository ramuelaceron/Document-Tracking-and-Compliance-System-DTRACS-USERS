// src/components/ToDoTabs/ToDoTabs.jsx
import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ToDoTabs.css';

const ToDoTabs = ({ 
  selectedOffice, 
  onOfficeChange, 
  allOffices = [], 
  showUpcomingIndicator = false,
  showPastDueIndicator = false,
  showCompletedIndicator = false,
  activeTab = "upcoming",
  onTabChange = () => {}
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Memoize mapping objects
  const tabToPath = useMemo(() => ({
    "upcoming": "/to-do/upcoming",
    "past-due": "/to-do/past-due",
    "completed": "/to-do/completed"
  }), []);

  const pathToTab = useMemo(() => ({
    "/to-do/upcoming": "upcoming",
    "/to-do/past-due": "past-due",
    "/to-do/completed": "completed"
  }), []);

  // Sync activeTab with URL if user navigates manually
  useEffect(() => {
    const currentTab = pathToTab[location.pathname] || "upcoming";
    if (currentTab !== activeTab) {
      onTabChange(currentTab);
    }
  }, [location.pathname, activeTab, onTabChange, pathToTab]);

  // ✅ Handle click — no flicker, no conflicts
  const handleTabClick = (tab) => {
    if (activeTab === tab) return;
    onTabChange(tab);
    navigate(tabToPath[tab]);
  };

  // ✅ Reusable tab renderer
  const renderTab = (tabKey, label, showIndicator, indicatorClass) => {
    const isActive = activeTab === tabKey;
    return (
      <button
        key={tabKey}
        className={`todo-tab ${isActive ? 'active' : ''}`}
        onClick={() => handleTabClick(tabKey)}
        role="link"
        aria-current={isActive ? 'page' : undefined}
        tabIndex={0}
      >
        {label}
        {showIndicator && <span className={`todo-indicator ${indicatorClass}`}></span>}
      </button>
    );
  };

  return (
    <div className="todo-tabs-container">
      {/* ✅ Key forces re-render when activeTab changes — fixes stuck underline */}
      <div className="todo-tabs" key={activeTab}>
        {renderTab('upcoming', 'Upcoming', showUpcomingIndicator, 'todo-blue')}
        {renderTab('past-due', 'Past due', showPastDueIndicator, 'todo-red')}
        {renderTab('completed', 'Completed', showCompletedIndicator, 'todo-green')}
      </div>

      <select
        className="todo-dropdown"
        value={selectedOffice}
        onChange={(e) => onOfficeChange(e.target.value)}
      >
        <option>All Offices</option>
        {allOffices.map(office => (
          <option key={office} value={office}>
            {office}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ToDoTabs;