// src/components/TaskForm/TaskForm.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FiUpload } from "react-icons/fi";
import { IoMdLink } from "react-icons/io";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { useQuill } from 'react-quilljs';
import AttachedFiles from '../AttachedFiles/AttachedFiles';
import 'quill/dist/quill.snow.css';
import './TaskForm.css';
import { schoolAccounts } from '../../data/schoolAccounts';

// ✅ Rich Text Editor Component using useQuill
const RichTextEditor = ({ value, onChange }) => {
  const { quill, quillRef } = useQuill({
    theme: 'snow',
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['clean']
      ]
    },
    placeholder: 'Enter task description with formatting...'
  });

  const hasSetContent = useRef(false);

  // ✅ Set initial value
  useEffect(() => {
    if (quill && !hasSetContent.current) {
      quill.clipboard.dangerouslyPasteHTML(value || '');
      hasSetContent.current = true;
    }
  }, [quill, value]);

  // ✅ Listen for changes
  useEffect(() => {
    if (quill) {
      const handler = () => {
        const html = quill.root.innerHTML;
        onChange(html);
      };
      quill.on('text-change', handler);
      return () => {
        quill.off('text-change', handler);
      };
    }
  }, [quill, onChange]);

  return (
    <div style={{ height: '150px', marginBottom: '50px' }}>
      <div ref={quillRef} style={{ height: '100%' }} />
    </div>
  );
};

// Custom Dropdown Component for Multiple Selection
const MultiSelectDropdown = ({ 
  label, 
  options, 
  selectedValues, 
  onSelectionChange, 
  placeholder = "Select options",
  disabled = false,
  isAccountDropdown = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleCheckboxChange = (value) => {
    const newSelection = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    
    onSelectionChange(newSelection);
  };

  const selectAll = () => {
    onSelectionChange(options.map(opt => opt.value));
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === options.length) return "All selected";
    if (selectedValues.length === 1) {
      const selectedOption = options.find(opt => opt.value === selectedValues[0]);
      return selectedOption ? selectedOption.label : selectedValues[0];
    }
    return `${selectedValues.length} selected`;
  };

  return (
    <div className="multi-select-dropdown">
      <label>{label}</label>
      <div 
        className={`dropdown-toggle ${disabled ? 'disabled' : ''} ${isOpen ? 'open' : ''}`}
        onClick={toggleDropdown}
      >
        <span className="dropdown-selected-text">{getDisplayText()}</span>
        {!disabled && (
          <span className="dropdown-arrow">
            {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
          </span>
        )}
      </div>
      
      {isOpen && !disabled && (
        <div className="dropdown-menu">
          <div className="dropdown-actions">
            <button type="button" onClick={selectAll} className="dropdown-action-btn">
              Select All
            </button>
            <button type="button" onClick={clearAll} className="dropdown-action-btn">
              Clear All
            </button>
          </div>
          
          <div className="dropdown-options">
            {options.map((option) => (
              <label key={option.value} className="dropdown-option">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={() => handleCheckboxChange(option.value)}
                />
                <span className="checkbox-label">
                  {isAccountDropdown ? (
                    <>
                      {option.label} {option.position && `(${option.position})`}
                    </>
                  ) : (
                    option.label
                  )}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const TaskForm = ({ onClose, onTaskCreated = () => {} }) => {
  const [formData, setFormData] = useState({
    for: [], // Changed to array for multiple selection
    assignedTo: [], // Changed to array for multiple selection
    dueDate: '', 
    dueTime: '17:00', // Default to 5:00 PM
    title: '',
    description: '',
    linkUrl: ''
  });

  const [isLinkInputVisible, setIsLinkInputVisible] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [attachedLinks, setAttachedLinks] = useState([]);
  const [isLinkValid, setIsLinkValid] = useState(true);
  const [availableUsers, setAvailableUsers] = useState([]);
  const formContainerRef = useRef(null);

  // Prepare school options - REMOVED "All schools" option
  const schoolOptions = schoolAccounts.map(school => ({
    value: school.school_name,
    label: school.school_name
  }));

  // Update available users when selected schools change
  useEffect(() => {
    if (formData.for.length === 0) {
      setAvailableUsers([]);
      setFormData(prev => ({ ...prev, assignedTo: [] }));
    } else {
      const users = [];
      
      formData.for.forEach(schoolName => {
        const selectedSchool = schoolAccounts.find(school => 
          school.school_name === schoolName
        );
        
        if (selectedSchool && selectedSchool.accounts) {
          selectedSchool.accounts.forEach(account => {
            users.push({
              id: account.user_id,
              value: `${account.first_name} ${account.middle_name} ${account.last_name}`.trim(),
              label: `${account.first_name} ${account.middle_name} ${account.last_name}`.trim(),
              position: account.position
            });
          });
        }
      });
      
      // Remove duplicates by user id
      const uniqueUsers = users.filter((user, index, self) => 
        index === self.findIndex(u => u.id === user.id)
      );
      
      setAvailableUsers(uniqueUsers);
      
      // Filter out assigned users that are no longer available
      const validAssignedUsers = formData.assignedTo.filter(assignedUser => 
        uniqueUsers.some(user => user.value === assignedUser)
      );
      
      if (validAssignedUsers.length !== formData.assignedTo.length) {
        setFormData(prev => ({ ...prev, assignedTo: validAssignedUsers }));
      }
    }
  }, [formData.for]);

  const handleSchoolSelection = (selectedSchools) => {
    setFormData(prev => ({ ...prev, for: selectedSchools }));
  };

  const handleUserSelection = (selectedUsers) => {
    setFormData(prev => ({ ...prev, assignedTo: selectedUsers }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'linkUrl') {
      const isValid = value === '' || /^(https?:\/\/)/i.test(value.trim());
      setIsLinkValid(isValid);
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 5) {
      console.warn("You can only upload up to 5 files.");
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        console.warn(`${file.name} is too large (max 10MB).`);
        return false;
      }
      return true;
    });

    const newFiles = validFiles.map(file => ({
      id: URL.createObjectURL(file),
      name: file.name,
      file
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  const addLink = () => {
    if (!formData.linkUrl.trim()) {
      setIsLinkValid(false);
      return;
    }

    if (!/^(https?:\/\/)/i.test(formData.linkUrl.trim())) {
      setIsLinkValid(false);
      return;
    }

    const newLink = {
      id: Date.now(),
      url: formData.linkUrl.trim(),
      title: formData.linkUrl.trim().replace(/^(https?:\/\/)?(www\.)?/i, ''),
      displayText: formData.linkUrl.trim().replace(/^(https?:\/\/)?(www\.)?/i, '')
    };

    setAttachedLinks(prev => [...prev, newLink]);
    setFormData(prev => ({ ...prev, linkUrl: '' }));
    setIsLinkValid(true);
  };

  const removeLink = (index) => {
    setAttachedLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      console.warn("Task title is required.");
      return;
    }

    if (!formData.dueDate) {
      console.warn("Please select a due date.");
      return;
    }

    if (formData.for.length === 0) {
      console.warn("Please select at least one school.");
      return;
    }

    // Combine date and time
    const dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime}`);
    
    const formattedDate = dueDateTime.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    
    const formattedTime = dueDateTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    onTaskCreated({
      id: Date.now(),
      title: formData.title,
      description: formData.description,
      dueDate: formData.dueDate,
      dueTime: formData.dueTime,
      dueDateTime: dueDateTime.toISOString(),
      formattedDate,
      formattedTime,
      office: formData.for.length > 0 ? formData.for.join(', ') : 'All schools',
      assignedTo: formData.assignedTo.length > 0 ? formData.assignedTo.join(', ') : 'All accounts',
      taskSlug: `task-${Date.now()}`,
      links: attachedLinks,
      attachments: uploadedFiles.map(f => f.name)
    });

    setUploadedFiles([]);
    setAttachedLinks([]);
    setIsLinkInputVisible(false);
    onClose();
  };

  const toggleLinkInput = () => {
    setIsLinkInputVisible(prev => !prev);
    if (!isLinkInputVisible && formData.linkUrl) {
      setIsLinkValid(/^(https?:\/\/)/i.test(formData.linkUrl.trim()));
    }
  };

  // Prepare user options - REMOVED "All accounts" option
  const userOptions = availableUsers.map(user => ({
    value: user.value,
    label: user.value,
    position: user.position
  }));

  return (
    <div className="task-form-overlay" onClick={onClose}>
      <div 
        className="task-form-container" 
        ref={formContainerRef}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="task-form-close" onClick={onClose}>×</button>

        <form onSubmit={handleSubmit} className="task-form">
          {/* Row 1 */}
          <div className="task-form-row">
            <div className="task-form-group">
              <MultiSelectDropdown
                label="For"
                options={schoolOptions}
                selectedValues={formData.for}
                onSelectionChange={handleSchoolSelection}
                placeholder="Select schools"
              />
            </div>
            <div className="task-form-group">
              <MultiSelectDropdown
                label="Assigned to"
                options={userOptions}
                selectedValues={formData.assignedTo}
                onSelectionChange={handleUserSelection}
                placeholder={availableUsers.length > 0 ? "Select accounts" : "Select schools first"}
                disabled={formData.for.length === 0 || availableUsers.length === 0}
                isAccountDropdown={true}
              />
            </div>
            <div className="task-form-group">
              <label htmlFor="dueDate">Due Date</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
                className="date-picker-input"
              />
            </div>
            <div className="task-form-group">
              <label htmlFor="dueTime">Due Time</label>
              <input
                type="time"
                id="dueTime"
                name="dueTime"
                value={formData.dueTime}
                onChange={handleChange}
                className="time-picker-input"
              />
            </div>
          </div>

          {/* Title */}
          <div className="task-form-group">
            <label htmlFor="title">Title*</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title"
              required
            />
          </div>

          {/* Description with Quill Editor */}
          <div className="task-form-group">
            <label>Description (optional)</label>
            <RichTextEditor
              value={formData.description}
              onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
            />
          </div>

          {/* Attach */}
          <div className="task-form-group">
            <label>Attach</label>
            <div className="task-form-attach">
              <div className="upload-link-container">
                <div className="upload-item">
                  <input
                    type="file"
                    id="upload"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <button
                    type="button"
                    className="upload-circle"
                    onClick={() => document.getElementById('upload').click()}
                  >
                    <FiUpload size={20} />
                  </button>
                  <span className="upload-label">Upload</span>
                </div>

                <div className="link-item">
                  <button type="button" className="link-circle" onClick={toggleLinkInput}>
                    <IoMdLink size={20} />
                  </button>
                  <span className="link-label">Link</span>
                </div>
              </div>

              {/* Show attached files and links */}
              {(uploadedFiles.length > 0 || attachedLinks.length > 0) && (
                <AttachedFiles
                  files={uploadedFiles}
                  links={attachedLinks}
                  onRemoveFile={removeFile}
                  onRemoveLink={removeLink}
                  isCompleted={false}
                />
              )}

              {/* Link Input - Always visible when adding links */}
              {isLinkInputVisible && (
                <div className="link-input-container">
                  <div className="link-input-group">
                    <input
                      type="text"
                      placeholder="https://example.com"
                      value={formData.linkUrl}
                      name="linkUrl"
                      onChange={handleChange}
                      className={`link-input ${!isLinkValid ? 'invalid' : ''}`}
                      aria-invalid={!isLinkValid}
                    />
                    <button 
                      type="button" 
                      className="add-link-btn"
                      onClick={addLink}
                      disabled={!formData.linkUrl.trim() || !isLinkValid}
                    >
                      Add Link
                    </button>
                    <button 
                      type="button" 
                      className="cancel-link-btn"
                      onClick={() => setIsLinkInputVisible(false)}
                    >
                      Cancel
                    </button>
                  </div>
                  
                  {/* Error Message */}
                  {!isLinkValid && formData.linkUrl && (
                    <p className="error-text link-error-below">
                      Please enter a valid link starting with <strong>http://</strong> or <strong>https://</strong>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="assign-btn">Assign Task</button>
          </div>
        </form>
      </div>
    </div>
  );  
};

export default TaskForm;