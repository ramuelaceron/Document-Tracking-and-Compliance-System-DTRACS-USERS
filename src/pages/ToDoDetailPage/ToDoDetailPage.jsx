// TaskDetailPage.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "./ToDoDetailPage.css";
import { FaFilePdf, FaFileWord, FaFileImage, FaFile } from "react-icons/fa";
import { IoChevronBackOutline } from "react-icons/io5";
import { RiAccountPinBoxLine } from "react-icons/ri";
import { PiClipboardTextBold } from "react-icons/pi";
import CommentBox from "../../components/CommentBox/CommentBox";
import AttachedFiles from "../../components/AttachedFiles/AttachedFiles";
import TaskActions from "../../components/TaskActions/TaskActions";
import CommentList from "../../components/CommentList/CommentList";
import SharedButton from "../../components/SharedButton/SharedButton";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useClickOutside from "../../hooks/useClickOutside";
import { taskData } from "../../data/taskData";

const ToDoDetailPage = () => {
  const navigate = useNavigate();
  const { sectionId, taskSlug } = useParams();
  const { state } = useLocation(); // Get state from navigation

  // State
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [attachedLinks, setAttachedLinks] = useState([]); // New state for links
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLate, setIsLate] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comments, setComments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  // Refs
  const commentBoxRef = useRef(null);
  const editTextareaRef = useRef(null);

  // Close comment box when clicking outside
  useClickOutside(commentBoxRef, () => {
    if (showCommentBox) setShowCommentBox(false);
  });

  // Get task data from navigation state or find it in taskData
  const taskTitle = state?.taskTitle;
  const taskDeadline = state?.deadline;
  const taskCreationDate = state?.creation_date;
  const taskDescription = state?.taskDescription;
  const taskId = state?.taskId;

  // 🔍 Find the task and focal entry using the task ID from state
  const section = taskData[sectionId];
  let focalEntry = null;
  let task = null;

  if (section && Array.isArray(section) && taskId) {
    for (const item of section) {
      const match = item.tasklist?.find(t => t.task_id === taskId);
      if (match) {
        focalEntry = item;
        task = match;
        break;
      }
    }
  }

  // If task not found by ID, try to find it by title (fallback)
  if (!task && taskTitle && section && Array.isArray(section)) {
    for (const item of section) {
      const match = item.tasklist?.find(t => t.title === taskTitle);
      if (match) {
        focalEntry = item;
        task = match;
        break;
      }
    }
  }

  // Extract task and focal data
  const creator_name = task?.creator_name || state?.creator_name || "Unknown Creator";

  // Format date functions
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return "Invalid date";
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return "Invalid time";
    }
  };

  // Get status color based on task status
  const getStatusColor = (status) => {
    switch (status) {
      case "Incomplete":
        return "#D32F2F"; // Red for incomplete
      case "Completed":
        return "#333"; // Dark gray for completed
      case "Ongoing":
        return "#2196F3"; // Blue for ongoing
      case "Late":
        return "#FF9800"; // Orange for late
      default:
        return "#333"; // Default dark gray
    }
  };

  // Get status display text
  const getStatusText = (status) => {
    switch (status) {
      case "Incomplete":
        return "Past Due";
      case "Completed":
        return "Completed";
      case "Ongoing":
        return "Assigned";
      case "Late":
        return "Late Submission";
      default:
        return status || "Assigned";
    }
  };

  // Sync completion status from data
  useEffect(() => {
    if (task?.task_status === "Completed") {
      setIsCompleted(true);
    } else if (task?.task_status === "Incomplete") {
      setIsLate(false);
    }
  }, [task?.task_status]);

  // Handlers
  const handleBack = () => navigate(-1);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length + attachedFiles.length > 6) {
      toast.warn("You can only attach up to 6 files.");
      return;
    }

    const newFiles = files.map((file) => ({
      id: URL.createObjectURL(file),
      file,
      name: file.name,
      type: getFileType(file),
      icon: getFileIcon(file),
    }));

    setAttachedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (fileId) => {
    const fileToRemove = attachedFiles.find((f) => f.id === fileId);
    if (fileToRemove) URL.revokeObjectURL(fileToRemove.id);
    setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Updated: Handle link changes as an array
  const handleLinksChange = (links) => {
    setAttachedLinks(links);
  };

  // New: Handle removing individual links
  const handleRemoveLink = (index) => {
    setAttachedLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleComplete = () => {
    // Validate all links if any are provided
    const invalidLinks = attachedLinks.filter(link => 
      link && !/^(https?:\/\/)/i.test(link.trim())
    );
    
    if (invalidLinks.length > 0) {
      toast.error("Please enter valid URLs starting with http:// or https://");
      return;
    }
    
    if (attachedFiles.length === 0 && attachedLinks.length === 0) {
      const confirmed = window.confirm(
        "You haven't attached any files or added any links. Are you sure you want to mark this task as completed?"
      );
      if (!confirmed) return;
    }
    
    // Check if task was originally incomplete (past due)
    if (task?.task_status === "Incomplete") {
      setIsLate(true);
      setIsCompleted(false);
      toast.success("Task marked as late submission!");
    } else {
      setIsCompleted(true);
      setIsLate(false);
      toast.success("Task marked as completed!");
    }
    
    // Log submission details
    console.log("Submission includes:", {
      files: attachedFiles.length,
      links: attachedLinks
    });
  };

  const handleIncomplete = () => {
    setIsCompleted(false);
    setIsLate(false);
    toast.info("Task status reverted.");
  };

  // Get current user once
  const savedUser = sessionStorage.getItem("currentUser");
  const currentUser = savedUser
    ? JSON.parse(savedUser)
    : { first_name: "Unknown", last_Name: "User", middle_name: "", email: "unknown@deped.gov.ph" };

  const fullName = `${currentUser.first_name} ${currentUser.middle_name ? currentUser.middle_name + " " : ""}${currentUser.last_name}`.trim();

  const handleCommentSubmit = (html) => {
    if (!html || !html.trim() || html === "<p><br></p>") {
      toast.warn("Please enter a comment.");
      return;
    }

    const newComment = {
      id: Date.now(),
      author: fullName,
      email: currentUser.email,
      first_name: currentUser.first_name,
      last_name: currentUser.last_name,
      time: new Date().toLocaleString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).replace(/,/g, ""),
      text: html,
      isEdited: false,
    };

    setComments((prev) => [...prev, newComment]);
    setShowCommentBox(false);
    toast.success("Comment added successfully!");
  };

  const handleEditStart = (comment) => {
    setEditingId(comment.id);
    setEditText(comment.text);
    setTimeout(() => {
      if (editTextareaRef.current) {
        editTextareaRef.current.style.height = "auto";
        editTextareaRef.current.style.height = `${editTextareaRef.current.scrollHeight}px`;
        editTextareaRef.current.focus();
      }
    }, 0);
  };

  const handleEditSave = () => {
    if (!editText.trim()) {
      toast.warn("Comment cannot be empty.");
      return;
    }
    setComments((prev) =>
      prev.map((c) =>
        c.id === editingId ? { ...c, text: editText.trim(), isEdited: true } : c
      )
    );
    setEditingId(null);
    setEditText("");
    toast.info("Comment updated!");
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleDeleteComment = (id) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      setComments((prev) => prev.filter((c) => c.id !== id));
      toast.error("Comment deleted.");
    }
  };

  const toggleCommentBox = () => {
    setShowCommentBox(!showCommentBox);
  };

  // File helpers
  const getFileIcon = (file) => {
    const ext = file?.name.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return <FaFilePdf />;
    if (["doc", "docx"].includes(ext)) return <FaFileWord />;
    if (["jpg", "jpeg", "png"].includes(ext)) return <FaFileImage />;
    return <FaFile />;
  };

  const getFileType = (file) => {
    const ext = file?.name.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "PDF";
    if ("doc docx".includes(ext)) return "DOC";
    if (["jpg", "jpeg", "png"].includes(ext)) return "Image";
    return ext?.toUpperCase() || "FILE";
  };

  // Handle task not found
  if (!task) {
    return (
      <div className="task-detail-app">
        <main className="task-detail-main">
          <button className="back-button" onClick={() => navigate(-1)}>
            <IoChevronBackOutline className="icon-md" /> Back
          </button>
          <div className="error-container">
            <p>⚠️ Task not found.</p>
            <small>Please go back and try again.</small>
          </div>
        </main>
      </div>
    );
  }

  const taskStatus = task.task_status || "Ongoing";
  const statusColor = getStatusColor(isLate ? "Late" : isCompleted ? "Completed" : taskStatus);
  const statusText = getStatusText(isLate ? "Late" : isCompleted ? "Completed" : taskStatus);

  return (
    <div className="todo-detail-app">
      <main className="todo-detail-main">
        {/* Back Button */}
        <button className="todo-back-btn" onClick={handleBack}>
          <IoChevronBackOutline className="icon-md" /> Back
        </button>

        {/* Header */}
        <div className="todo-header">
          <div 
            className="todo-icon" 
            style={{ 
              background: statusColor,
              transition: "background 0.3s ease"
            }}
          >
            <PiClipboardTextBold 
              className="icon-lg" 
              style={{ 
                color: "white" 
              }} 
            />
          </div>
          <h1 className="todo-title">{task.title || taskTitle}</h1>
          <div className="todo-status">
            {isCompleted ? (
              // Completed
              <span style={{ color: "#4CAF50", display: "flex", alignItems: "center", gap: "4px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
                Completed
              </span>
            ) : isLate ? (
              // Late submission
              <span style={{ color: "#FF9800", display: "flex", alignItems: "center", gap: "4px", fontWeight: "bold" }}>
                ⚠️ Late Submission
              </span>
            ) : (
              // Status based on task_status
              <span style={{ color: statusColor, display: "flex", alignItems: "center", gap: "4px", fontWeight: "bold" }}>
                {taskStatus === "Incomplete" && "⚠️ "}
                {statusText}
              </span>
            )}
          </div>
        </div>

        {/* Meta Info */}
        <div className="todo-meta">
          <div className="todo-category">{task.section}</div>
          <div className="todo-due">
            Due {formatDate(task.deadline || taskDeadline)} at {formatTime(task.deadline || taskDeadline)}
          </div>
        </div>

        <div className="divider" />

        {/* Author & Date */}
        <div className="todo-author">
          {creator_name} • Posted on {formatDate(task.creation_date || taskCreationDate)}
        </div>

        {/* Description */}
        <div className="todo-description">{task.description || taskDescription}</div>

        {/* Actions */}
        <TaskActions
          onFileChange={handleFileChange}
          onComplete={handleComplete}
          onIncomplete={handleIncomplete}
          isCompleted={isCompleted || isLate}
          isLate={isLate}
          onLinksChange={handleLinksChange} // Changed from onLinksChange to onLinkChange
          links={attachedLinks} // Pass links array
        />

        {/* Attached Files & Links - Updated to use the integrated component */}
        {(attachedFiles.length > 0 || attachedLinks.length > 0) && (
          <AttachedFiles 
            files={attachedFiles} 
            links={attachedLinks}
            onRemoveFile={handleRemoveFile}
            onRemoveLink={handleRemoveLink}
            isCompleted={isCompleted || isLate} 
          />
        )}

        {/* Add Comment Button */}
        <SharedButton variant="text" size="medium" onClick={toggleCommentBox} aria-label="Add comment">
          <RiAccountPinBoxLine className="icon-md" /> Add comment
        </SharedButton>

        {/* Comment Input */}
        {showCommentBox && (
          <div ref={commentBoxRef}>
            <CommentBox onSubmit={handleCommentSubmit} />
          </div>
        )}

        {/* Comment List */}
        {comments.length > 0 && (
          <CommentList
            comments={comments}
            editingId={editingId}
            editText={editText}
            setEditText={setEditText}
            onEdit={handleEditStart}
            onSaveEdit={handleEditSave}
            onCancelEdit={handleEditCancel}
            onDelete={handleDeleteComment}
            currentUser={currentUser}
          />
        )}
      </main>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default ToDoDetailPage;