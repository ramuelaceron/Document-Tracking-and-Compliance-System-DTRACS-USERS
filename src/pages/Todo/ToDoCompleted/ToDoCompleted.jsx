// src/pages/Todo/Completed/ToDoCompleted.jsx
import React, { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { PiClipboardTextBold } from "react-icons/pi";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import "./ToDoCompleted.css";

// Helper: Format date from ISO string to readable format
const formatDate = (dateString) => {
  if (!dateString) return "No date";
  
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

// Helper: Format time from ISO string
const formatTime = (dateString) => {
  if (!dateString) return 'No time';
  
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

// Helper: Get weekday from date string
const getWeekday = (dateStr) => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date)) return "";
    return date.toLocaleDateString("en-US", { weekday: "long" });
  } catch (error) {
    console.error('Error getting weekday:', error);
    return "";
  }
};

const ToDoCompleted = () => {
  // ✅ Get pre-filtered completed tasks from ToDoPage layout
  const { completedTasks } = useOutletContext();

  // Group tasks by formatted completion date
  const groupedByDate = completedTasks.reduce((groups, task) => {
    const formattedDate = formatDate(task.completedTime || task.creation_date);
    if (!groups[formattedDate]) groups[formattedDate] = [];
    groups[formattedDate].push(task);
    return groups;
  }, {});

  // Sort dates: newest first
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
    try {
      return new Date(b) - new Date(a);
    } catch (error) {
      return 0;
    }
  });

  // Track open/closed state for each group
  const [openGroups, setOpenGroups] = useState(() =>
    sortedDates.reduce((acc, date) => ({ ...acc, [date]: true }), {})
  );

  const toggleGroup = (date) => {
    setOpenGroups((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  return (
    <div className="completed-app">
      <main className="completed-main">
        {/* Task List Grouped by completion date */}
        {sortedDates.length > 0 ? (
          sortedDates.map((date) => {
            const tasks = groupedByDate[date];
            const weekday = getWeekday(date);
            const isOpen = openGroups[date];

            return (
              <div key={date} className="completed-date-group">
                <div
                  className="completed-date-header"
                  onClick={() => toggleGroup(date)}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  <span className="completed-date-bold">{date}</span>
                  <span className="completed-weekday"> ({weekday})</span>

                  <div className="header-actions">
                    <span className="completed-task-count">{tasks.length}</span>
                    <span
                      className="completed-dropdown-arrow"
                      aria-label={isOpen ? "Collapse" : "Expand"}
                    >
                      {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
                    </span>
                  </div>
                </div>

                {isOpen && (
                  <div className="completed-task-list">
                    {tasks.map((task) => (
                      <Link
                        to={`/todo/${task.sectionId}/${task.taskSlug}`}
                        state={{
                          taskTitle: task.title,
                          deadline: task.deadline,
                          creation_date: task.creation_date,
                          taskDescription: task.description,
                          taskId: task.task_id,
                          creator_name: task.creator_name,
                          section_designation: task.section_designation
                        }}
                        className="completed-task-link"
                        key={`${task.task_id}-${task.title}`}
                      >
                        <div className="completed-card">
                          <div className="completed-card-content">
                            <div className="completed-card-text">
                              {/* ✅ Clipboard icon with dynamic background color - CIRCULAR */}
                              <div 
                                className={`completed-task-icon status-${task.assignment_status === 'TURNED IN ON TIME' ? 'on-time' : 
                                         task.assignment_status === 'TURNED IN LATE' ? 'late' : 
                                         task.assignment_status === 'MISSING' ? 'missing' : 'pending'}`}
                              >
                                <PiClipboardTextBold className="icon-lg" />
                              </div>
                              <div>
                                <div className="completed-card-title">
                                  {task.title}
                                </div>
                                <div className="completed-card-meta">
                                  <span className="completed-office">
                                    {task.office}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="completed-card-completion">
                              <span className="completion-text">
                                ✔ Completed on {formatDate(task.completedTime)} at{" "}
                                <span className="time">{formatTime(task.completedTime)}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="completed-no-tasks">No completed tasks.</div>
        )}
      </main>
    </div>
  );
};

export default ToDoCompleted;