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

  // Handle ESC key
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && onCancel) {
      console.log('ESC pressed → calling onCancel');
      onCancel();
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && onCancel) {
      console.log('Backdrop clicked → calling onCancel');
      onCancel();
    }
  };

  // Handle Confirm click
  const handleConfirmClick = () => {
    console.log('Confirm button clicked → calling onConfirm');
    if (onConfirm) onConfirm();
  };

  // Handle Cancel click
  const handleCancelClick = () => {
    console.log('Cancel button clicked → calling onCancel');
    if (onCancel) onCancel();
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
            onClick={handleCancelClick} // ✅ Call handleCancelClick
          >
            {cancelText}
          </button>
          <button 
            className="confirm-dialog-btn confirm-btn"
            onClick={handleConfirmClick} // ✅ Call handleConfirmClick
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