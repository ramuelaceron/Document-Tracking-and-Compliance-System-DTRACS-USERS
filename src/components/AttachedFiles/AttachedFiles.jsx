// src/components/AttachedFiles/AttachedFiles.jsx
import React from 'react';
import { FaFilePdf, FaFileWord, FaFileImage, FaFile, FaTrash } from "react-icons/fa";
import { IoMdLink } from "react-icons/io";
import './AttachedFiles.css';

const AttachedFiles = ({ files, links = [], onRemoveFile, onRemoveLink, isCompleted }) => {
  const getFileIcon = (file) => {
    const ext = file?.name.split('.').pop().toLowerCase();
    if (ext === 'pdf') return <FaFilePdf />;
    if (ext === 'doc' || ext === 'docx') return <FaFileWord />;
    if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') return <FaFileImage />;
    return <FaFile />;
  };

  const getFileType = (file) => {
    const ext = file?.name.split('.').pop().toLowerCase();
    if (ext === 'pdf') return 'PDF';
    if (ext === 'doc' || ext === 'docx') return 'DOC';
    if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') return 'Image';
    return ext?.toUpperCase() || 'FILE';
  };

  // Check if there are any attachments to display
  const hasAttachments = files.length > 0 || links.length > 0;
  if (!hasAttachments) return null;

  return (
    <div className="attached-items-container">
      {/* Files Section */}
      {files.length > 0 && (
        <div className="attached-section">
          <h4 className="attached-section-title">Attached Files</h4>
          <div className={`attached-files-list ${isCompleted ? 'is-completed' : ''}`}>
            {files.map(({ id, name, type, icon }) => (
              <div className="attached-file-item" key={id}>
                <div className="file-icon-wrapper">
                  {icon || getFileIcon({ name })}
                </div>
                <div className="file-info">
                  <div className="file-name">{name}</div>
                  <div className="file-type">{getFileType({ name })}</div>
                </div>
                {!isCompleted && (
                  <button
                    type="button"
                    className="attached-item-remove-btn"
                    onClick={() => onRemoveFile(id)}
                    title="Remove file"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Links Section - Updated to handle object format */}
      {links.length > 0 && (
        <div className="attached-section">
          <h4 className="attached-section-title">Attached Links</h4>
          <div className="attached-links-list">
            {links.map((link, index) => (
              <div key={link.id || index} className="attached-link-item">
                <IoMdLink className="attached-link-icon" />
                <div className="link-info">
                  <a 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="attached-link-url"
                    title={link.url}
                  >
                    {link.displayText || link.title || link.url}
                  </a>
                </div>
                {!isCompleted && (
                  <button
                    type="button"
                    className="attached-item-remove-btn"
                    onClick={() => onRemoveLink(index)}
                    title="Remove link"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttachedFiles;