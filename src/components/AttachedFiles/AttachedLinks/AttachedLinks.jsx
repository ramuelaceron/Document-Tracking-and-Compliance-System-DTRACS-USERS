// src/components/AttachedLinks/AttachedLinks.jsx
import React, { useState, useRef } from "react";
import { MdClose } from "react-icons/md";
import { IoMdLink } from "react-icons/io";
import SharedButton from "../../SharedButton/SharedButton";
import useClickOutside from "../../../hooks/useClickOutside";
import "./AttachedLinks.css";

const AttachedLinks = ({ isOpen, onClose, onAddLink }) => {
  const [linkData, setLinkData] = useState({
    url: "",
    title: ""
  });
  const [isLinkValid, setIsLinkValid] = useState(true);
  const modalRef = useRef(null);

  // Close modal when clicking outside
  useClickOutside(modalRef, () => {
    if (isOpen) handleClose();
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLinkData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate URL when url field changes
    if (name === "url" && value) {
      setIsLinkValid(/^(https?:\/\/)/i.test(value.trim()));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!linkData.url.trim()) {
      setIsLinkValid(false);
      return;
    }

    if (!/^(https?:\/\/)/i.test(linkData.url.trim())) {
      setIsLinkValid(false);
      return;
    }

    // Create link object with URL and optional title
    const newLink = {
      id: Date.now(),
      url: linkData.url.trim(),
      title: linkData.title.trim() || linkData.url.trim(), // Use URL as fallback title
      displayText: linkData.title.trim() || (linkData.url.length > 40 ? `${linkData.url.substring(0, 40)}...` : linkData.url)
    };

    onAddLink(newLink);
    handleClose();
  };

  const handleClose = () => {
    setLinkData({ url: "", title: "" });
    setIsLinkValid(true);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="attached-links-modal-overlay">
      <div className="attached-links-modal" ref={modalRef}>
        <div className="attached-links-modal-header">
          <div className="modal-title-section">
            <IoMdLink className="modal-title-icon" />
            <h3>Add Website Link</h3>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={handleClose}
          >
            <MdClose />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="attached-links-modal-form">
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="link-url" className="form-label">
                Website URL *
              </label>
              <input
                id="link-url"
                type="url"
                name="url"
                placeholder="https://example.com"
                value={linkData.url}
                onChange={handleInputChange}
                className={`form-input ${!isLinkValid ? 'invalid' : ''}`}
                required
              />
              {!isLinkValid && (
                <p className="form-error">
                  Please enter a valid URL starting with http:// or https://
                </p>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <SharedButton
              type="button"
              variant="secondary"
              size="medium"
              onClick={handleClose}
            >
              Cancel
            </SharedButton>
            <SharedButton
              type="submit"
              variant="primary"
              size="medium"
              disabled={!linkData.url.trim()}
            >
              Add Link
            </SharedButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttachedLinks;