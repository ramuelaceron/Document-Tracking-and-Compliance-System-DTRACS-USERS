import React from "react";
import "./OfficeSidebar.css";
import { FaTasks } from "react-icons/fa"; // Task icon
import { RiSchoolFill } from "react-icons/ri"; // Schools icon
import { MdManageAccounts } from "react-icons/md"; // Manage Account icon
import { NavLink , useLocation} from "react-router-dom";

const OfficeSidebar = ({ isExpanded }) => {
  const location = useLocation();

const isActive = (path, exact = true) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
};

  return (
    <aside className={`sidebar ${isExpanded ? "expanded" : ""}`}>
      <nav className="sidebar-nav">
        <ul>
          {/* Task */}
          <li>
            <NavLink
              to="/task/ongoing"
              className={`sidebar-link ${isActive("/task/", false) ? "active" : ""}`}
            >
              <FaTasks className="sidebar-icon" />
              {isExpanded && <span className="sidebar-text">Task</span>}
            </NavLink>
          </li>

          {/* Schools */}
          <li>
            <NavLink
              to="/schools"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <RiSchoolFill className="sidebar-icon" />
              {isExpanded && <span className="sidebar-text">Schools</span>}
            </NavLink>
          </li>

          {/* Manage Account */}
          <li>
            <NavLink
              to="/o-manage-account"
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            >
              <MdManageAccounts className="sidebar-icon" />
              {isExpanded && <span className="sidebar-text">Manage Account</span>}
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default OfficeSidebar;
