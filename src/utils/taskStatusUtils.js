// src/utils/taskStatusUtils.js

export const getRemarksStatusInfo = (remarks, deadline, now) => {
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