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
      {/* ✅ Show "Add Link" button only when task is NOT completed */}
      {!isCompleted && (
        <button
          type="button"
          className="task-actions-link-btn"
          onClick={handleLinkClick}
          disabled={isCompleted}
        >
          <IoMdLink className="task-actions-icon" />
          Add Link
        </button>
      )}

      {/* Link Modal */}
      <AttachedLinks
        isOpen={isLinkModalOpen}
        onClose={handleCloseModal}
        onAddLink={handleAddLink}
      />

      {/* Complete / Cancel Buttons */}
      <div className="task-actions-buttons-container">
        {isCompleted ? (
          <>
            {/* ✅ Show "Cancel" button when task is completed */}
            <SharedButton
              variant="secondary"
              size="medium"
              onClick={onIncomplete}
              className="task-actions-cancel-btn"
            >
              <MdCancel className="task-actions-icon" />
              Cancel
            </SharedButton>
          </>
        ) : (
          <>
            {/* ✅ Show "Complete" button when task is pending */}
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
          </>
        )}
      </div>
    </div>
  );
};

export default TaskActions;