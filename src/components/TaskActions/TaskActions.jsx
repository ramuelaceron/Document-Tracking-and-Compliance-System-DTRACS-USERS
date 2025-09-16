// src/components/TaskActions/TaskActions.jsx
import React, { useState } from "react";
import "./TaskActions.css";
import { IoMdLink } from "react-icons/io";
import { MdOutlineDoneOutline, MdCancel } from "react-icons/md";
import SharedButton from "../SharedButton/SharedButton";
import AttachedLinks from "../AttachedFiles/AttachedLinks/AttachedLinks";

const TaskActions = ({
  onComplete,
  onIncomplete,
  isCompleted,
  onLinksChange,
  links = [],
  isSubmitDisabled,
  isSubmitting
}) => {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  const handleLinkClick = () => {
    setIsLinkModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsLinkModalOpen(false);
  };

  const handleAddLink = (newLink) => {
    const updatedLinks = [...links, newLink];
    onLinksChange(updatedLinks);
  };

  return (
    <div className={`task-actions ${isCompleted ? 'is-completed' : ''}`}>
      {/* ✅ ALWAYS show "Add Link" button — disabled if completed */}
      <button
        type="button"
        className="task-actions-link-btn"
        onClick={handleLinkClick}
        disabled={isCompleted}
      >
        <IoMdLink className="task-actions-icon" />
        Add Link
      </button>

      {/* Link Modal */}
      <AttachedLinks
        isOpen={isLinkModalOpen}
        onClose={handleCloseModal}
        onAddLink={handleAddLink}
      />

      {/* Complete / Cancel Buttons - STAY IN PLACE */}
      <div className="task-actions-buttons-container">
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
            disabled={isSubmitDisabled || isSubmitting}
          >
            <MdOutlineDoneOutline className="task-actions-icon" />
            {isSubmitting ? 'Submitting...' : 'Complete'}
          </SharedButton>
        )}
      </div>
    </div>
  );
};

export default TaskActions;