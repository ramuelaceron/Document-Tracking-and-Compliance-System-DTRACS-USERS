// src/pages/TaskDetailPage/TaskDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SchoolStats from "../../components/TaskDetailComponents/SchoolStats/SchoolStats";
import TaskActions from "../../components/TaskActions/TaskActions";
import AttachedFiles from "../../components/AttachedFiles/AttachedFiles";
import { FaFilePdf, FaFileWord, FaFileImage, FaFile } from "react-icons/fa";
import { IoChevronBackOutline } from "react-icons/io5";
import { PiClipboardTextBold } from "react-icons/pi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./TaskDetailPage.css";
import config from "../../config";

const TaskDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;

  // State
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [attachedLinks, setAttachedLinks] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLate, setIsLate] = useState(false);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract task info from state
  const taskId = state?.taskId;
  const taskTitle = state?.taskTitle;
  const taskDeadline = state?.deadline;
  const taskCreationDate = state?.creation_date;
  const taskDescription = state?.taskDescription;

  // Get current user
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  const focalId = currentUser?.user_id;

  // Format date/time
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return "Invalid time";
    }
  };

  // Status helpers
  const getStatusColor = (status) => {
    switch (status) {
      case "Incomplete":
        return "#D32F2F";
      case "Completed":
        return "#333";
      case "Ongoing":
        return "#2196F3";
      case "Late":
        return "#FF9800";
      default:
        return "#333";
    }
  };

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
    if (["doc", "docx"].includes(ext)) return "DOC";
    if (["jpg", "jpeg", "png"].includes(ext)) return "Image";
    return ext?.toUpperCase() || "FILE";
  };

  // Fetch task details
  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (!taskId || !focalId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = currentUser?.token;

        const response = await fetch(`${config.API_BASE_URL}/focal/tasks/all`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch tasks: ${response.statusText}`);
        }

        const allTasks = await response.json();
        const foundTask = allTasks.find(
          (t) => t.task_id === taskId && t.creator_id === focalId
        );

        if (!foundTask) {
          setError("Task not found or you don't have permission to view it.");
          return;
        }

        setTask(foundTask);
        if (foundTask.task_status === "Completed") {
          setIsCompleted(true);
        }
      } catch (err) {
        console.error("Error fetching task:", err);
        setError(err.message || "Failed to load task details.");
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [taskId, focalId, currentUser?.token]); // ✅ added token

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

  const handleLinksChange = (links) => {
    setAttachedLinks(links);
  };

  const handleRemoveLink = (index) => {
    setAttachedLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleComplete = () => {
    const invalidLinks = attachedLinks.filter(
      (link) => link && link.url && !/^(https?:\/\/)/i.test(link.url.trim())
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

    if (task?.task_status === "Incomplete") {
      setIsLate(true);
      setIsCompleted(false);
      toast.success("Task marked as late submission!");
    } else {
      setIsCompleted(true);
      setIsLate(false);
      toast.success("Task marked as completed!");
    }
  };

  const handleIncomplete = () => {
    setIsCompleted(false);
    setIsLate(false);
    toast.info("Task status reverted.");
  };

  // Loading/Error states
  if (loading) {
    return (
      <div className="task-detail-app">
        <main className="task-detail-main">
          <button className="task-back-btn" onClick={handleBack}>
            <IoChevronBackOutline className="icon-md" /> Back
          </button>
          <div className="loading-container">
            <p>Loading details...</p>
          </div>
        </main>
        <ToastContainer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="task-detail-app">
        <main className="task-detail-main">
          <button className="task-back-btn" onClick={handleBack}>
            <IoChevronBackOutline className="icon-md" /> Back
          </button>
          <div className="error-container">
            <p>⚠️ {error}</p>
          </div>
        </main>
        <ToastContainer />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="task-detail-app">
        <main className="task-detail-main">
          <button className="task-back-btn" onClick={handleBack}>
            <IoChevronBackOutline className="icon-md" /> Back
          </button>
          <div className="error-container">
            <p>⚠️ Task not found.</p>
          </div>
        </main>
        <ToastContainer />
      </div>
    );
  }

  const taskStatus = task.task_status || "Ongoing";
  const statusColor = getStatusColor(
    isLate ? "Late" : isCompleted ? "Completed" : taskStatus
  );
  const statusText = getStatusText(
    isLate ? "Late" : isCompleted ? "Completed" : taskStatus
  );

  return (
    <div className="task-detail-app">
      <main className="task-detail-main">
        <button className="task-back-btn" onClick={handleBack}>
          <IoChevronBackOutline className="icon-md" /> Back
        </button>

        <div className="task-header">
          <div className="task-icon" style={{ background: statusColor }}>
            <PiClipboardTextBold
              className="icon-lg"
              style={{ color: "white" }}
            />
          </div>
          <h1 className="task-title">{task.title || taskTitle}</h1>
          <div className="task-status">
            {isCompleted ? (
              <span
                style={{
                  color: "#4CAF50",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
                Completed
              </span>
            ) : isLate ? (
              <span
                style={{
                  color: "#FF9800",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontWeight: "bold",
                }}
              >
                ⚠️ Late Submission
              </span>
            ) : (
              <span
                style={{
                  color: statusColor,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontWeight: "bold",
                }}
              >
                {taskStatus === "Incomplete" && "⚠️ "}
                {statusText}
              </span>
            )}
          </div>
        </div>

        <div className="task-meta">
          <div className="task-category">{task.section}</div>
          <div className="task-due">
            Due {formatDate(task.deadline || taskDeadline)} at{" "}
            {formatTime(task.deadline || taskDeadline)}
          </div>
        </div>

        <div className="divider" />

        <div className="task-author">
          {task.creator_name || "Unknown Creator"} • Posted on{" "}
          {formatDate(task.creation_date || taskCreationDate)}
        </div>

        <div className="task-description">
          {task.description || taskDescription}
        </div>

        <SchoolStats
          schoolsRequired={task.schools_required}
          accountsRequired={task.accounts_required}
        />

        <TaskActions
          onFileChange={handleFileChange}
          onComplete={handleComplete}
          onIncomplete={handleIncomplete}
          isCompleted={isCompleted || isLate}
          isLate={isLate}
          onLinksChange={handleLinksChange}
          links={attachedLinks}
        />

        {(attachedFiles.length > 0 || attachedLinks.length > 0) && (
          <AttachedFiles
            files={attachedFiles}
            links={attachedLinks}
            onRemoveFile={handleRemoveFile}
            onRemoveLink={handleRemoveLink}
            isCompleted={isCompleted || isLate}
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

export default TaskDetailPage;
