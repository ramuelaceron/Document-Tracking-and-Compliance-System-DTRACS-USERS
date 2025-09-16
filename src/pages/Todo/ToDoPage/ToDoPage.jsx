// src/pages/Todo/ToDoPage/ToDoPage.jsx
import { useMemo, useState, useEffect, useCallback } from "react"; // ✅ Added useCallback
import { Outlet } from "react-router-dom";
import ToDoTabs from "../../../components/ToDoTabs/ToDoTabs";
import { createSlug } from "../../../utils/idGenerator";
import config from "../../../config";
import "./ToDoPage.css";

const ToDoPage = () => {
  const [selectedSort, setSelectedSort] = useState("newest");
  const [tasks, setTasks] = useState({});
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming");

  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  const isOfficeWithoutSection = currentUser?.role === "office" && (
    !currentUser.section_designation ||
    currentUser.section_designation === "Not specified" ||
    currentUser.section_designation === "" ||
    currentUser.section_designation === "NULL"
  );

  const schoolUserId = currentUser?.user_id;
  const isSchoolUser = currentUser?.role === "school";

  // ✅ Wrap in useCallback so it's stable and can be safely used in useEffect
  const fetchTasks = useCallback(async () => {
    if (!isSchoolUser || !schoolUserId) {
      return;
    }

    try {
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

      const rawData = await response.json();
      console.log("📡 Raw tasks from backend:", rawData);

      const groupedBySection = rawData.reduce((acc, task) => {
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
    }
  }, [isSchoolUser, schoolUserId, currentUser?.token]); // ✅ Dependencies for useCallback

  useEffect(() => {
    fetchTasks();
    const intervalId = setInterval(fetchTasks, 30_000);
    return () => clearInterval(intervalId);
  }, [fetchTasks]); // ✅ Now depends only on stable fetchTasks

  const allOffices = useMemo(() => {
    return [
      ...new Set(
        Object.values(tasks)
          .flat()
          .flatMap((section) => section.tasklist.map((task) => task.office))
      ),
    ].sort();
  }, [tasks]);

const { upcomingTasks, pastDueTasks, completedTasks } = useMemo(() => {
  const upcoming = [];
  const pastDue = [];
  const completed = [];
  const now = new Date();

  if (!tasks || typeof tasks !== 'object') {
    return { upcomingTasks: [], pastDueTasks: [], completedTasks: [] };
  }

  Object.entries(tasks).forEach(([sectionName, sections]) => {
    if (!Array.isArray(sections)) return;

    sections.forEach((section) => {
      if (!section.tasklist || !Array.isArray(section.tasklist)) return;

      section.tasklist.forEach((task) => {
        if (!task) return;

        const taskDeadline = task.deadline ? new Date(task.deadline) : null;
        // ✅ USE REMARKS FIELD FROM ASSIGNED_RESPONSE
        const remarks = task.assigned_response?.remarks || 'PENDING';

        let uiStatus = "Upcoming";
        let category = "upcoming";

        // ✅ Categorize based on remarks
        if (remarks === 'TURNED IN ON TIME' || remarks === 'TURNED IN LATE') {
          uiStatus = "Completed";
          category = "completed";
        } else if (remarks === 'MISSING') {
          uiStatus = "Past Due";
          category = "pastDue";
        } else if (remarks === 'PENDING') {
          if (taskDeadline && taskDeadline < now) {
            uiStatus = "Past Due";
            category = "pastDue";
          } else {
            uiStatus = "Upcoming";
            category = "upcoming";
          }
        }

        const taskDataObj = {
          id: task.creator_id,
          task_id: task.task_id,
          title: task.title || "Untitled Task",
          deadline: task.deadline,
          office: task.office || "Unknown Office",
          creation_date: task.creation_date,
          completion_date: task.completion_date,
          sectionId: sectionName,
          sectionName: sectionName,
          taskSlug: createSlug(task.title || "untitled-task"),
          creator_name: task.creator_name || "Unknown Creator",
          description: task.description || "",
          task_status: uiStatus,
          section_designation: sectionName,
          originalTask: task,
          assignment_status: remarks, // ✅ Keep raw remarks value
        };

        if (category === "completed") {
          completed.push({
            ...taskDataObj,
            completedTime: task.completion_date || task.modified_date || task.creation_date,
          });
        } else if (category === "pastDue") {
          pastDue.push(taskDataObj);
        } else {
          upcoming.push(taskDataObj);
        }
      });
    });
  });

  return { upcomingTasks: upcoming, pastDueTasks: pastDue, completedTasks: completed };
}, [tasks]);

  if (isOfficeWithoutSection) {
    return (
      <div className="no-section-page">
        <div className="no-section-container">
          <h2>⏳ Section Not Assigned Yet</h2>
          <p>Your account has not been assigned to a section by the administrator.</p>
          <p>Please wait for admin approval or contact support for assistance.</p>
          <p className="note">
            <strong>Note:</strong> You will not be able to view or manage tasks until your section is assigned.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container" style={{ padding: "2rem", textAlign: "center", color: "red" }}>
        <p>❌ Failed to load tasks: {error}</p>
        <button onClick={() => window.location.reload()} style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>
          Retry
        </button>
      </div>
    );
  }

  const sortTasks = (tasks, sortOption) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    switch (sortOption) {
      case "newest":
        return [...tasks].sort((a, b) => new Date(b.creation_date) - new Date(a.creation_date));
      case "oldest":
        return [...tasks].sort((a, b) => new Date(a.creation_date) - new Date(b.creation_date));
      case "today":
        return tasks.filter((task) => {
          const taskDate = new Date(task.deadline);
          return taskDate >= startOfDay && taskDate < new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
        });
      case "week":
        return tasks.filter((task) => {
          const taskDate = new Date(task.deadline);
          const nextWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
          return taskDate >= startOfWeek && taskDate < nextWeek;
        });
      case "month":
        return tasks.filter((task) => {
          const taskDate = new Date(task.deadline);
          const nextMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 1);
          return taskDate >= startOfMonth && taskDate < nextMonth;
        });
      default:
        return tasks;
    }
  };

  return (
    <div className="task-layout">
      <ToDoTabs
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
        showUpcomingIndicator={upcomingTasks.length > 0}
        showPastDueIndicator={pastDueTasks.length > 0}
        showCompletedIndicator={completedTasks.length > 0}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <Outlet
        context={{
          upcomingTasks: sortTasks(upcomingTasks, selectedSort),
          pastDueTasks: sortTasks(pastDueTasks, selectedSort),
          completedTasks: sortTasks(completedTasks, selectedSort),
          selectedSort,
          allOffices,
          activeTab,
          refetchTasks: fetchTasks, // ✅ Stable function, safe to pass
        }}
      />
    </div>
  );
};

export default ToDoPage;