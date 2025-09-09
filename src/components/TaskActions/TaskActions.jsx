// src/components/TaskActions/TaskActions.jsx
import React, { useState, useRef } from "react";
import "./TaskActions.css";
// Icons
import { FaPaperclip } from "react-icons/fa";
import { MdOutlineDoneOutline, MdCancel } from "react-icons/md";
import { IoMdLink, IoMdArrowDropdown } from "react-icons/io";

// Components
import SharedButton from "../SharedButton/SharedButton";
import useClickOutside from "../../hooks/useClickOutside";
import AttachedLinks from "../AttachedFiles/AttachedLinks/AttachedLinks";

const TaskActions = ({
  onFileChange,
  onComplete,
  onIncomplete,
  isCompleted,
  onLinksChange,
  links = []
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useClickOutside(dropdownRef, () => {
    if (isDropdownOpen) setIsDropdownOpen(false);
  });

  const toggleDropdown = () => {
    if (isCompleted) return;
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleFileClick = () => {
    document.getElementById("file-upload").click();
    setIsDropdownOpen(false);
  };

  const handleLinkClick = () => {
    setIsLinkModalOpen(true);
    setIsDropdownOpen(false);
  };

  const handleAddLink = (newLink) => {
    const updatedLinks = [...links, newLink];
    onLinksChange(updatedLinks);
  };

  const handleCloseModal = () => {
    setIsLinkModalOpen(false);
  };

  return (
    <div className="task-actions">
      {/* Attachment Dropdown */}
      {isCompleted ? (
        <div className="task-actions-attachment-plain">
          <FaPaperclip className="task-actions-icon" />
          Add attachment
        </div>
      ) : (
        <div className="task-actions-attachment-dropdown" ref={dropdownRef}>
          <button
            type="button"
            className="task-actions-attachment-toggle"
            onClick={toggleDropdown}
            disabled={isCompleted}
          >
            <FaPaperclip className="task-actions-icon" />
            Add attachment
            <IoMdArrowDropdown className="dropdown-arrow" />
          </button>

          {isDropdownOpen && (
            <div className="attachment-dropdown-menu">
              <button
                type="button"
                className="attach-dropdown-item"
                onClick={handleFileClick}
              >
                <FaPaperclip className="attach-dropdown-icon" />
                Upload file
              </button>
              <button
                type="button"
                className="attach-dropdown-item"
                onClick={handleLinkClick}
              >
                <IoMdLink className="attach-dropdown-icon" />
                Add link
              </button>
            </div>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        id="file-upload"
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        onChange={onFileChange}
        disabled={isCompleted}
      />

      {/* Link Modal */}
      <AttachedLinks
        isOpen={isLinkModalOpen}
        onClose={handleCloseModal}
        onAddLink={handleAddLink}
      />

      {/* Complete / Cancel Buttons */}
      {isCompleted ? (
        <>
          <div className="task-actions-status-completed">
            <MdOutlineDoneOutline className="task-actions-icon" />
            Completed
          </div>
          <SharedButton
            variant="danger"
            size="medium"
            onClick={onIncomplete}
            className="task-actions-cancel-btn"
          >
            <MdCancel className="task-actions-icon" />
            Cancel
          </SharedButton>
        </>
      ) : (
        <SharedButton
          variant="primary"
          size="medium"
          onClick={onComplete}
          className="task-actions-complete-btn"
        >
          <MdOutlineDoneOutline className="task-actions-icon" />
          Complete
        </SharedButton>
      )}
    </div>
  );
};

export default TaskActions;