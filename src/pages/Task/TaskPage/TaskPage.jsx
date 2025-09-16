// src/pages/Task/TaskPage/TaskPage.jsx
import React, { useMemo, useState, useEffect } from "react";
import { Outlet } from "react-router-dom"; // ✅ Removed unused useNavigate
import TaskTabs from "../../../components/TaskTabs/TaskTabs";
import { createSlug } from "../../../utils/idGenerator";
import config from "../../../config"; // ✅ Import config for API_BASE_URL
import "./TaskPage.css";

const TaskPage = () => {
  const [selectedSort, setSelectedSort] = useState("newest");
  const [tasks, setTasks] = useState({}); // ✅ Will hold real data from API
  const [loading, setLoading] = useState(true); // ✅ Add loading state
  const [error, setError] = useState(null); // ✅ Add error state

  // ✅ Get currentUser from sessionStorage
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

  // ✅ Check if user is office and has no valid section
  const isOfficeWithoutSection =
    currentUser?.role === "office" &&
    (!currentUser.section_designation ||
      currentUser.section_designation === "Not specified" ||
      currentUser.section_designation === "" ||
      currentUser.section_designation === "NULL");

  // ✅ Get focal_id (creator_id) of current user
  const focalId = currentUser?.user_id;

  // ✅ Fetch tasks from backend
  useEffect(() => {
    const fetchTasks = async () => {
      if (!focalId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = currentUser?.token;

        const response = await fetch(
          `${config.API_BASE_URL}/focal/tasks/all`,
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

        const rawData = await response.json();
        console.log("📡 Raw tasks from backend:", rawData);

        // ✅ Filter: Only tasks created by current user
        const filteredTasks = rawData.filter(task => task.creator_id === focalId);
        console.log(`✅ Filtered tasks for focalId ${focalId}:`, filteredTasks);

        // ✅ Group by section
        const groupedBySection = filteredTasks.reduce((acc, task) => {
          const sectionName = task.section || "General";
          if (!acc[sectionName]) {
            acc[sectionName] = [
              {
                section_name: sectionName,
                section_designation: sectionName,
                tasklist: [],
              },
            ];
          }
          acc[sectionName][0].tasklist.push(task);
          return acc;
        }, {});

        setTasks(groupedBySection);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError(err.message || "Failed to load tasks. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();

    // ✅ Optional: Poll every 30 seconds
    const intervalId = setInterval(fetchTasks, 30_000);
    return () => clearInterval(intervalId);
  }, [focalId, currentUser?.token]);

  // ✅ Extract all offices (from real data)
  const allOffices = useMemo(
    () =>
      [
        ...new Set(
          Object.values(tasks)
            .flat()
            .flatMap((section) =>
              section.tasklist.map((task) => task.office)
            )
        ),
      ].sort(),
    [tasks] // ✅ Depend on tasks
  );

  // ✅ Flatten and categorize tasks based on deadline
  const { upcomingTasks, pastDueTasks, completedTasks } = useMemo(() => {
    const upcoming = [];
    const pastDue = [];
    const completed = [];
    const now = new Date();

    // ✅ Safety check
    if (!tasks || typeof tasks !== 'object') {
      return { upcomingTasks: [], pastDueTasks: [], completedTasks: [] };
    }

    Object.entries(tasks).forEach(([sectionId, sections]) => {
      if (!Array.isArray(sections)) return;

      sections.forEach((section) => {
        if (!section.tasklist || !Array.isArray(section.tasklist)) return;

        section.tasklist.forEach((task) => {
          if (!task) return;

          const taskDeadline = task.deadline ? new Date(task.deadline) : null;
          const taskStatus = task.task_status || "Ongoing";

          const taskDataObj = {
            id: task.creator_id,
            task_id: task.task_id,
            title: task.title || "Untitled Task",
            deadline: task.deadline,
            office: task.office || "Unknown Office",
            creation_date: task.creation_date,
            completion_date: task.completion_date,
            sectionId,
            sectionName:
              section.section_name ||
              section.section_designation ||
              "General",
            taskSlug: createSlug(task.title || "untitled-task"),
            creator_name: task.creator_name || "Unknown Creator",
            description: task.description || "",
            task_status: taskStatus,
            section_designation: section.section_designation || "General",
            schools_required: task.schools_required || [],
            accounts_required: task.accounts_required || [],
            originalTask: task,
          };

          if (taskStatus === "Completed") {
            completed.push({
              ...taskDataObj,
              completedTime:
                task.completion_date ||
                task.modified_date ||
                task.creation_date,
            });
          } else if (taskStatus === "Incomplete") {
            pastDue.push(taskDataObj);
          } else if (taskDeadline && taskDeadline < now) {
            pastDue.push(taskDataObj);
          } else {
            upcoming.push(taskDataObj);
          }
        });
      });
    });

    return {
      upcomingTasks: upcoming,
      pastDueTasks: pastDue,
      completedTasks: completed,
    };
  }, [tasks]);

  // ✅ Sort tasks based on selected option
  const sortTasks = (tasks, sortOption) => {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOfWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay()
    );
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    switch (sortOption) {
      case "newest":
        return [...tasks].sort(
          (a, b) =>
            new Date(b.creation_date) - new Date(a.creation_date)
        );
      case "oldest":
        return [...tasks].sort(
          (a, b) =>
            new Date(a.creation_date) - new Date(b.creation_date)
        );
      case "today":
        return tasks.filter((task) => {
          const taskDate = new Date(task.deadline);
          return (
            taskDate >= startOfDay &&
            taskDate <
              new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
          );
        });
      case "week":
        return tasks.filter((task) => {
          const taskDate = new Date(task.deadline);
          const nextWeek = new Date(
            startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000
          );
          return taskDate >= startOfWeek && taskDate < nextWeek;
        });
      case "month":
        return tasks.filter((task) => {
          const taskDate = new Date(task.deadline);
          const nextMonth = new Date(
            startOfMonth.getFullYear(),
            startOfMonth.getMonth() + 1,
            1
          );
          return taskDate >= startOfMonth && taskDate < nextMonth;
        });
      default:
        return tasks;
    }
  };

  // ✅ Render UI
  if (isOfficeWithoutSection) {
    return (
      <div className="no-section-page">
        <div className="no-section-container">
          <h2>⏳ Section Not Assigned Yet</h2>
          <p>
            Your account has not been assigned to a section by the
            administrator.
          </p>
          <p>
            Please wait for admin approval or contact support for
            assistance.
          </p>
          <p className="note">
            <strong>Note:</strong> You will not be able to view or
            manage tasks until your section is assigned.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="task-layout">
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="task-layout">
        <div className="error-container" style={{ padding: "2rem", textAlign: "center", color: "red" }}>
          <p>❌ Failed to load tasks: {error}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="task-layout">
      <TaskTabs
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
        showUpcomingIndicator={upcomingTasks.length > 0}
        showPastDueIndicator={pastDueTasks.length > 0}
        showCompletedIndicator={completedTasks.length > 0}
      />

      {/* Pass sorted tasks and sorting function down via Outlet context */}
      <Outlet
        context={{
          upcomingTasks: sortTasks(upcomingTasks, selectedSort),
          pastDueTasks: sortTasks(pastDueTasks, selectedSort),
          completedTasks: sortTasks(completedTasks, selectedSort),
          selectedSort,
          allOffices, // ✅ Pass offices from real data
        }}
      />
    </div>
  );
};

export default TaskPage;