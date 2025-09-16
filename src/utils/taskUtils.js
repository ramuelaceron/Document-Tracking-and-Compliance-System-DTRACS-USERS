// src/utils/taskUtils.js

/**
 * Enrich tasks with assignment data for current user
 * @param {Array} tasks - Raw tasks from /school/all/tasks
 * @param {Array} assignments - Raw assignments from /school/all/task/assignments
 * @param {string} currentSchoolId - Current user's school_id
 * @returns {Array} Enriched tasks with assigned_response
 */
export const mergeTasksWithAssignments = (tasks, assignments, currentSchoolId) => {
  if (!Array.isArray(tasks) || !Array.isArray(assignments)) {
    return [];
  }

  return tasks.map(task => {
    // Find assignment matching this task AND current school
    const assignment = assignments.find(
      a => a.task_id === task.task_id && a.school_id === currentSchoolId
    );

    // Return enriched task
    return {
      ...task,
      // Inject assignment as assigned_response
      assigned_response: assignment || null,
      // Optional: keep all assignments if needed elsewhere
      all_assignments: assignments.filter(a => a.task_id === task.task_id)
    };
  });
};