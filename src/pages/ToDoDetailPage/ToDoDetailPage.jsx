// src/pages/ToDoDetailPage/ToDoDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useOutletContext } from "react-router-dom";
import { IoChevronBackOutline } from "react-icons/io5";
import { PiClipboardTextBold } from "react-icons/pi";
import AttachedFiles from "../../components/AttachedFiles/AttachedFiles";
import TaskActions from "../../components/TaskActions/TaskActions";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ToDoDetailPage.css";
import config from "../../config";

const ToDoDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refetchTasks } = useOutletContext();
  const { state } = location;

  // State
  const [attachedLinks, setAttachedLinks] = useState([]);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [revisionLinks, setRevisionLinks] = useState([]);

  // Extract task info from state
  const taskId = state?.taskId;
  const taskTitle = state?.taskTitle;
  const taskDeadline = state?.deadline;
  const taskCreationDate = state?.creation_date;
  const taskDescription = state?.taskDescription;

  console.log("📍 Location state:", state);

  // Get current user
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  const schoolUserId = currentUser?.user_id;

  // Format date/time
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
      return "Invalid time";
    }
  };

  // Status mapping
  const getRemarksStatusInfo = (remarks, deadline, now) => {
    if (remarks === 'TURNED IN ON TIME') {
      return {
        color: '#4CAF50',
        text: 'Turned in on Time',
        isCompleted: true,
        isLate: false,
        isPastDue: false,
        isOverdue: false
      };
    }

    if (remarks === 'TURNED IN LATE') {
      return {
        color: '#FF9800',
        text: 'Turned in Late',
        isCompleted: true,
        isLate: true,
        isPastDue: false,
        isOverdue: false
      };
    }

    if (remarks === 'MISSING') {
      return {
        color: '#D32F2F',
        text: 'Missing',
        isCompleted: false,
        isLate: false,
        isPastDue: true,
        isOverdue: true
      };
    }

    const isDeadlinePassed = deadline && new Date(deadline) < now;
    const isPending = remarks === 'PENDING';

    if (isDeadlinePassed && isPending) {
      return {
        color: '#D32F2F',
        text: 'Past Due',
        isCompleted: false,
        isLate: false,
        isPastDue: true,
        isOverdue: true
      };
    }

    return {
      color: '#2196F3',
      text: 'Pending',
      icon: null,
      isCompleted: false,
      isLate: false,
      isPastDue: false,
      isOverdue: false
    };
  };

  // Auto-refresh logic
  useEffect(() => {
    let intervalId;

    if (task?.deadline) {
      const checkDeadline = () => {
        const now = new Date();
        const deadline = new Date(task.deadline);
        const isDeadlinePassed = deadline < now;
        const isPending = task.assigned_response?.remarks === 'PENDING';

        if (isDeadlinePassed && isPending) {
          setTask(prev => ({
            ...prev,
            _autoOverdue: true
          }));
        }
      };

      checkDeadline();
      intervalId = setInterval(checkDeadline, 30000);
      return () => clearInterval(intervalId);
    }
  }, [task?.deadline, task?.assigned_response?.remarks]);

  // Fetch task details
  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (!taskId || !schoolUserId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = currentUser?.token;

        // ✅ Fetch task
        const tasksResponse = await fetch(
          `${config.API_BASE_URL}/school/all/tasks?user_id=${encodeURIComponent(schoolUserId)}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
              "Content-Type": "application/json",
            },
          }
        );

        if (!tasksResponse.ok) {
          throw new Error(`Failed to fetch tasks: ${tasksResponse.statusText}`);
        }

        const allTasks = await tasksResponse.json();
        const foundTask = allTasks.find(t => t.task_id === taskId);

        if (!foundTask) {
          setError("Task not found.");
          return;
        }

        // ✅ Fetch assignments for this task
        const assignmentsResponse = await fetch(
          `${config.API_BASE_URL}/school/all/task/assignments?task_id=${encodeURIComponent(taskId)}`,
          {
            method: 'GET',
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
              "Content-Type": "application/json",
            },
          }
        );

        if (!assignmentsResponse.ok) {
          throw new Error(`Failed to fetch assignments: ${assignmentsResponse.status} ${await assignmentsResponse.text()}`);
        }

        const assignments = await assignmentsResponse.json();

        // ✅ Filter for current user
        const currentUserAssignment = assignments.find(a => a.school_id === schoolUserId) || null;

        const enrichedTask = {
          ...foundTask,
          assigned_response: currentUserAssignment,
          all_assignments: assignments
        };

        setTask(enrichedTask);
        setIsCompleted(
          enrichedTask.assigned_response?.remarks === 'TURNED IN ON TIME' || 
          enrichedTask.assigned_response?.remarks === 'TURNED IN LATE'
        );

      } catch (err) {
        console.error("Error fetching task:", err);
        setError(err.message || "Failed to load task details.");
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [taskId, schoolUserId, currentUser?.token]);

  // Handlers
  const handleBack = () => navigate(-1);

  const handleLinksChange = (links) => {
    setAttachedLinks(links);
  };

  const handleRemoveLink = (index) => {
    setAttachedLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddRevision = (newLink) => {
    setRevisionLinks(prev => [...prev, { ...newLink, id: Date.now() }]);
    toast.info("Revision link added!");
  };

  // Submit task logic
  const handleComplete = async () => {
    const invalidLinks = attachedLinks.filter(link =>
      link && link.url && !/^(https?:\/\/)/i.test(link.url.trim())
    );

    if (invalidLinks.length > 0) {
      toast.error("Please enter valid URLs starting with http:// or https://");
      return;
    }

    const wasPreviouslyCompleted = task?.assigned_response?.remarks === 'TURNED IN ON TIME' || 
                                  task?.assigned_response?.remarks === 'TURNED IN LATE';

    if (wasPreviouslyCompleted) {
      const confirmed = window.confirm(
        "You're about to resubmit this task. This will replace your previous submission. Continue?"
      );
      if (!confirmed) return;
    }

    const remarks = task?.assigned_response?.remarks;
    if (remarks === 'MISSING') {
      const confirmed = window.confirm(
        "You marked this task as missing. Are you sure you want to submit it now?"
      );
      if (!confirmed) return;
    }

    if (attachedLinks.length === 0) {
      const confirmed = window.confirm(
        "You haven't added any links. Are you sure you want to submit this task?"
      );
      if (!confirmed) return;
    }

    const now = new Date();
    const deadline = new Date(task.deadline);
    const isOnTime = now <= deadline;
    const submissionRemarks = isOnTime ? 'TURNED IN ON TIME' : 'TURNED IN LATE';
    const submissionLink = attachedLinks.length > 0 ? attachedLinks[0].url : '';

    const updatePayload = {
      task_id: task.task_id,
      school_id: schoolUserId,
      status: 'COMPLETE',
      remarks: submissionRemarks,
      link: submissionLink,
      revision_links: revisionLinks.map(link => link.url)
    };

    try {
      setIsSubmitting(true);
      const token = currentUser?.token;

      const response = await fetch(
        `${config.API_BASE_URL}/school/update/task/status`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatePayload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update task status: ${response.status} ${errorText}`);
      }

      // ✅ UPDATE LOCAL STATE
      setTask(prevTask => ({
        ...prevTask,
        assigned_response: {
          ...prevTask.assigned_response,
          remarks: submissionRemarks
        }
      }));

      setRevisionLinks([]);
      setIsCompleted(true);
      setIsSubmitting(false);

      const successMessage = wasPreviouslyCompleted ? "Task resubmitted successfully!" : "Task submitted successfully!";
      toast.success(successMessage);

      if (refetchTasks) {
        await refetchTasks();
      }

    } catch (err) {
      console.error("Submission error:", err);
      toast.error(err.message || "Failed to submit task. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Cancel submission function
  const handleIncomplete = async () => {
    const remarks = task?.assigned_response?.remarks;
    if (remarks === 'TURNED IN ON TIME' || remarks === 'TURNED IN LATE') {
      const confirmed = window.confirm(
        "Are you sure you want to cancel this submission? This will reset the task status and allow you to make changes."
      );
      if (!confirmed) return;

      try {
        const token = currentUser?.token;

        const response = await fetch(`${config.API_BASE_URL}/school/update/task/status?status=INCOMPLETE`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            task_id: task.task_id,
            school_id: schoolUserId,
            status: 'INCOMPLETE',
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to revert task status.");
        }

        setTask(prevTask => ({
          ...prevTask,
          assigned_response: {
            ...prevTask.assigned_response,
            remarks: 'PENDING'
          }
        }));

        setAttachedLinks([]);
        setRevisionLinks([]);
        setIsCompleted(false);
        
        toast.info("Submission cancelled. Task is now pending.");
        
        if (refetchTasks) {
          await refetchTasks();
        }

      } catch (err) {
        console.error("Revert error:", err);
        toast.error("Failed to cancel submission. Please try again.");
      }

    } else {
      toast.info("Task is already in a non-submitted state.");
    }
  };

  // Calculate status info
  const now = new Date();
  const remarks = task?.assigned_response?.remarks || 'PENDING';
  const statusInfo = getRemarksStatusInfo(remarks, task?.deadline, now);
  const isDeadlinePassed = task?.deadline && new Date(task.deadline) < now;

  // Loading/Error states
  if (loading) {
    return (
      <div className="todo-detail-app">
        <main className="todo-detail-main">
          <button className="todo-back-btn" onClick={handleBack}>
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
      <div className="todo-detail-app">
        <main className="todo-detail-main">
          <button className="todo-back-btn" onClick={handleBack}>
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
      <div className="todo-detail-app">
        <main className="todo-detail-main">
          <button className="todo-back-btn" onClick={handleBack}>
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

  return (
    <div className="todo-detail-app">
      <main className="todo-detail-main">
        <button 
        className={`todo-back-btn`} 
        onClick={handleBack}>
          <IoChevronBackOutline className="icon-md" /> Back
        </button>

        <div className="todo-header">
          <div className="todo-icon" style={{ background: statusInfo.color }}>
            <PiClipboardTextBold className="icon-lg" style={{ color: "white" }} />
          </div>
          <h1 className="todo-title">{task.title || taskTitle}</h1>
          <div className="todo-status">
            {statusInfo.isCompleted ? (
              <span style={{ color: statusInfo.color, display: "flex", alignItems: "center", gap: "4px" }}>
                {statusInfo.text}
              </span>
            ) : statusInfo.isPastDue ? (
              <span style={{ color: statusInfo.color, display: "flex", alignItems: "center", gap: "4px", fontWeight: "bold" }}>
                {statusInfo.text}
              </span>
            ) : (
              <span style={{ color: statusInfo.color, display: "flex", alignItems: "center", gap: "4px", fontWeight: "bold" }}>
                {isDeadlinePassed && remarks === 'PENDING' && "⚠️ "}
                {statusInfo.text}
              </span>
            )}
          </div>
        </div>

        <div className="todo-meta">
          <div className="todo-category">{task.section}</div>
          <div className="todo-due">
            Due {formatDate(task.deadline || taskDeadline)} at {formatTime(task.deadline || taskDeadline)}
            {isDeadlinePassed && remarks === 'PENDING' && (
              <span style={{ color: '#D32F2F', marginLeft: '8px', fontWeight: 'bold', animation: 'pulse 1.5s infinite' }}>
                (Overdue)
              </span>
            )}
          </div>
        </div>

        <div className="divider" />

        <div className="todo-author">
          {task.creator_name || "Unknown Creator"} • Posted on {formatDate(task.creation_date || taskCreationDate)}
        </div>

        <div className="todo-description">
          {task.description || taskDescription || "No description provided."}
        </div>

        <TaskActions
          onComplete={handleComplete}
          onIncomplete={handleIncomplete}
          isCompleted={isCompleted}
          onLinksChange={handleLinksChange}
          links={attachedLinks}
          isSubmitDisabled={isCompleted || isSubmitting}
          isSubmitting={isSubmitting}
          onAddRevision={handleAddRevision}
        />

        {/* Original Links */}
        {attachedLinks.length > 0 && (
          <AttachedFiles
            links={attachedLinks}
            onRemoveLink={handleRemoveLink}
            isCompleted={isCompleted}
          />
        )}

        {/* Revision Links */}
        {revisionLinks.length > 0 && (
          <div className="revision-section">
            <h3 className="revision-title">Revision Links</h3>
            <AttachedFiles
              links={revisionLinks}
              onRemoveLink={(index) => {
                setRevisionLinks(prev => prev.filter((_, i) => i !== index));
              }}
              isCompleted={isCompleted}
            />
          </div>
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