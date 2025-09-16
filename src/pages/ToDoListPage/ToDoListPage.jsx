// src/pages/ToDoListPage/ToDoListPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createSlug } from '../../utils/idGenerator';
import { generateAvatar } from '../../utils/iconGenerator';
import './ToDoListPage.css';
import config from '../../config';

const ToDoListPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { state } = location;
  const { section_designation, full_name, user_id } = state || {};
  const pageTitle = section_designation || 'Task List';
  const person = full_name || 'Unknown Focal]]';

  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  const schoolUserId = user_id || currentUser?.user_id;

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { initials, color } = generateAvatar(full_name);

  const extractTimeFromDate = (dateString) => {
    if (!dateString) return 'No deadline';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return 'Invalid date';
    }
  };

  useEffect(() => {
    const fetchTasksBySection = async () => {
      if (!schoolUserId || !section_designation) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = currentUser?.token;

        const response = await fetch(
          `${config.API_BASE_URL}/school/all/tasks?user_id=${encodeURIComponent(schoolUserId)}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch tasks: ${response.status} - ${errorText}`);
        }

        const allAssignedTasks = await response.json();
        const filteredTasks = allAssignedTasks.filter(
          (task) => task.section === section_designation
        );

        setTasks(filteredTasks);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError(err.message || "Failed to load tasks. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasksBySection();
  }, [schoolUserId, section_designation, currentUser?.token]);

  const handleViewTask = (task) => {
    const slug = createSlug(section_designation);
    navigate(`${slug}`, {
      state: {
        ...state,
        taskTitle: task.title,
        deadline: task.deadline,
        creation_date: task.creation_date,
        taskDescription: task.description,
        taskId: task.task_id,
      },
    });
  };

  return (
    <div className="task-list-page">
      <div className="header">
        <div className="avatar">
          {currentUser?.avatar ? (
            <img src={currentUser.avatar} alt={`${person}'s avatar`} />
          ) : (
            <div className="avatar-fallback" style={{ backgroundColor: color }}>
              {initials}
            </div>
          )}
        </div>
        <div className="header-info">
          <h1>{pageTitle}</h1>
          <p>{person}</p>
        </div>
      </div>

      {loading ? (
        <div className="no-tasks-container">
          <p className="no-tasks">Loading tasks...</p>
        </div>
      ) : error ? (
        <div className="no-tasks-container">
          <p className="no-tasks" style={{ color: 'red' }}>{error}</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="no-tasks-container">
          <p className="no-tasks">No tasks assigned for this section.</p>
        </div>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <div key={task.task_id} className="task-item">
              <div className="task-content">
                <h3>{task.title}</h3>
                <p className="due-time">Due at {extractTimeFromDate(task.deadline)}</p>
              </div>
              <button
                className="view-task-btn"
                onClick={() => handleViewTask(task)}
                aria-label={`View details for ${task.title}`}
              >
                View Task
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ToDoListPage;