// src/components/ConfirmDialog/ConfirmDialog.jsx
import React from 'react';
import './ConfirmDialog.css';

const ConfirmDialog = ({ 
  isOpen, 
  title = "Confirm Action", 
  message, 
  confirmText = "Yes", 
  cancelText = "No",
  onConfirm, 
  onCancel 
}) => {
  if (!isOpen) return null;

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && onCancel) {
      onCancel();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && onCancel) {
      onCancel();
    }
  };

  return (
    <div 
      className="confirm-dialog-overlay" 
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      tabIndex="-1"
    >
      <div 
        className="confirm-dialog-container" 
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="confirm-dialog-title" className="confirm-dialog-title">
          {title}
        </h3>
        
        <div className="confirm-dialog-message">
          {message}
        </div>

        <div className="confirm-dialog-actions">
          <button 
            className="confirm-dialog-btn cancel-btn"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className="confirm-dialog-btn confirm-btn"
            onClick={onConfirm}
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;