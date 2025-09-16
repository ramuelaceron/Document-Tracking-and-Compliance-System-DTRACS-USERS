// src/pages/Todo/PastDue/PastDue.jsx
import React, { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { PiClipboardTextBold } from "react-icons/pi";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import "./ToDoPastDue.css";

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

const ToDoPastDue = () => {
  // ✅ Get pre-filtered past-due tasks from ToDoPage layout
  const { pastDueTasks } = useOutletContext();

  // Group tasks by formatted creation date
  const groupedByDate = pastDueTasks.reduce((groups, task) => {
    const formattedDate = formatDate(task.creation_date);
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
    <div className="pastdue-app">
      <main className="pastdue-main">
        {/* Task List Grouped by creation date */}
        {sortedDates.length > 0 ? (
          sortedDates.map((date) => {
            const tasks = groupedByDate[date];
            const weekday = getWeekday(date);
            const isOpen = openGroups[date];

            return (
              <div key={date} className="pastdue-date-group">
                <div
                  className="pastdue-date-header"
                  onClick={() => toggleGroup(date)}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  <span className="pastdue-date-bold">{date}</span>
                  <span className="pastdue-weekday"> ({weekday})</span>

                  <div className="header-actions">
                    <span className="pastdue-task-count">{tasks.length}</span>
                    <span
                      className="pastdue-dropdown-arrow"
                      aria-label={isOpen ? "Collapse" : "Expand"}
                    >
                      {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
                    </span>
                  </div>
                </div>

                {isOpen && (
                  <div className="pastdue-task-list">
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
                          section_designation: task.section_designation,
                          full_name: task.creator_name
                        }}
                        className="pastdue-task-link"
                        key={`${task.task_id}-${task.title}`}
                      >
                        <div className="pastdue-card">
                          <div className="pastdue-card-content">
                            <div className="pastdue-card-text">
                              <div className="pastdue-task-icon">
                                <PiClipboardTextBold className="icon-lg" />
                              </div>
                              <div>
                                <div className="pastdue-card-title">
                                  {task.title}
                                </div>
                                <div className="pastdue-card-meta">
                                  <span className="pastdue-office">
                                    {task.office}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="pastdue-card-deadline">
                              <span className="deadline-text">
                                Was due on {formatDate(task.deadline)} at{" "}
                                <span className="time">{formatTime(task.deadline)}</span>
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
          <div className="pastdue-no-tasks">No past-due tasks.</div>
        )}
      </main>
    </div>
  );
};

export default ToDoPastDue;