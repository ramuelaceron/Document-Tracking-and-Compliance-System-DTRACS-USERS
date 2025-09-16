// src/utils/taskUtils.js

/**
 * Enrich tasks with assignment data for current user
 * @param {Array} tasks - Raw tasks from /school/all/tasks
 * @param {Array} assignments - Raw assignments from /school/all/task/assignments
 * @param {string} currentSchoolId - Current user's school_id
 * @returns {Array} Enriched tasks with assigned_response
 */
export const mergeTasksWithAssignments = (tasks, assignments, currentSchoolId) => {
  if (!Array.isArray(tasks) || !Array.isArray(assignments) || !currentSchoolId) {
    console.warn("⚠️ Invalid inputs to mergeTasksWithAssignments", { tasks, assignments, currentSchoolId });
    return [];
  }

  // ✅ Pre-filter assignments for current school only (performance + clarity)
  const currentUserAssignments = assignments.filter(
    assignment => assignment.school_id === currentSchoolId
  );

  // ✅ Create lookup map for O(1) access
  const assignmentMap = new Map();
  currentUserAssignments.forEach(assignment => {
    assignmentMap.set(assignment.task_id, assignment);
  });

  return tasks.map(task => {
    // ✅ Get assignment for this task (if exists)
    const assignment = assignmentMap.get(task.task_id) || null;

    return {
      ...task,
      assigned_response: assignment, // null if no assignment found
      // Optional: keep all assignments for debugging or admin views
      // all_assignments: assignments.filter(a => a.task_id === task.task_id)
    };
  });
};