// src/api/taskApi.js
import config from "../config";

export const fetchTaskDetails = async (taskId, schoolUserId, token) => {
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
    throw new Error("Task not found.");
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

  return {
    ...foundTask,
    assigned_response: currentUserAssignment,
    all_assignments: assignments
  };
};

export const updateTaskStatus = async (payload, token) => {
  const response = await fetch(
    `${config.API_BASE_URL}/school/update/task/status`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update task status: ${response.status} ${errorText}`);
  }

  return await response.json();
};

export const revertTaskStatus = async (taskId, schoolUserId, token) => {
  const response = await fetch(`${config.API_BASE_URL}/school/update/task/status?status=INCOMPLETE`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      task_id: taskId,
      school_id: schoolUserId,
      status: 'INCOMPLETE',
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to revert task status.");
  }

  return await response.json();
};