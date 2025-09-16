import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FaHome, FaBriefcase } from "react-icons/fa";
import { FiCheckSquare } from "react-icons/fi";
import { MdManageAccounts } from "react-icons/md";
import { IoChevronDown } from "react-icons/io5";
import { useSidebar } from "../../context/SidebarContext";
import "./SchoolSidebar.css"; // ⚠️ Class names updated below too!

const SchoolSidebar = ({ isExpanded }) => {
  const { toggleSidebar, openDropdown, toggleDropdown } = useSidebar();
  const location = useLocation();

  const handleOfficesClick = () => {
    if (!isExpanded) toggleSidebar(true);
    toggleDropdown("offices");
  };

  const isActive = (path, exact = true) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className={`side-bar ${isExpanded ? "side-expanded" : ""}`}>
      <nav className="side-nav">
        <ul>
          {/* Home */}
          <li>
            <NavLink
              to="/home"
              className={`side-link ${isActive("/home") ? "side-active" : ""}`}
              end
            >
              <FaHome className="side-icon" />
              {isExpanded && <span className="side-text">Home</span>}
            </NavLink>
          </li>

          {/* To-do */}
          <li>
            <NavLink
              to="/to-do/upcoming"
              className={`side-link ${isActive("/to-do/", false) ? "side-active" : ""}`}
            >
              <FiCheckSquare className="side-icon" />
              {isExpanded && <span className="side-text">To-do</span>}
            </NavLink>
          </li>

          {/* Offices dropdown */}
          <li>
            <button
              className="side-link side-dropdown-toggle"
              onClick={handleOfficesClick}
            >
              <FaBriefcase className="side-icon" />
              {isExpanded && (
                <>
                  <span className="side-text">Offices</span>
                  <IoChevronDown
                    className={`side-dropdown-icon ${openDropdown === "offices" ? "side-open" : ""}`}
                  />
                </>
              )}
            </button>

            {isExpanded && openDropdown === "offices" && (
              <ul className="side-submenu">
                <li>
                  <NavLink
                    to="/SGOD"
                    className={`side-link side-sub-link ${isActive("/SGOD") ? "side-active" : ""}`}
                  >
                    <span className="side-text">SGOD (School Gover…)</span>
                  </NavLink>
                </li>
              </ul>
            )}
          </li>

          {/* Manage Account */}
          <li>
            <NavLink
              to="/s-manage-account"
              className={`side-link ${isActive("/manage-account") ? "side-active" : ""}`}
            >
              <MdManageAccounts className="side-icon" />
              {isExpanded && <span className="side-text">Manage Account</span>}
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default SchoolSidebar;