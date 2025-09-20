// src/components/TaskConfirmations/TaskConfirmations.jsx
import React from 'react';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';

const TaskConfirmations = ({
  showResubmitConfirm,
  showMissingConfirm,
  showEmptyLinksConfirm,
  showCancelConfirm,
  onResubmitConfirm,
  onResubmitCancel,
  onMissingConfirm,
  onMissingCancel,
  onEmptyLinksConfirm,
  onEmptyLinksCancel,
  onCancelConfirm,
  onCancelCancel
}) => {
  return (
    <>
      <ConfirmDialog
        isOpen={showResubmitConfirm}
        title="Confirm Resubmission"
        message="You're about to resubmit this task. This will replace your previous submission. Continue?"
        confirmText="Yes, Resubmit"
        cancelText="Cancel"
        onConfirm={onResubmitConfirm}
        onCancel={onResubmitCancel}
      />

      <ConfirmDialog
        isOpen={showMissingConfirm}
        title="Confirm Submission"
        message="You marked this task as missing. Are you sure you want to submit it now?"
        confirmText="Yes, Submit"
        cancelText="Cancel"
        onConfirm={onMissingConfirm}
        onCancel={onMissingCancel}
      />

      <ConfirmDialog
        isOpen={showEmptyLinksConfirm}
        title="Confirm Submission"
        message="You haven't added any links. Are you sure you want to submit this task?"
        confirmText="Yes, Submit"
        cancelText="Cancel"
        onConfirm={onEmptyLinksConfirm}
        onCancel={onEmptyLinksCancel}
      />

      <ConfirmDialog
        isOpen={showCancelConfirm}
        title="Confirm Cancellation"
        message="Are you sure you want to cancel this submission? This will reset the task status and allow you to make changes."
        confirmText="Yes, Cancel"
        cancelText="No, Keep"
        onConfirm={onCancelConfirm}
        onCancel={onCancelCancel}
      />
    </>
  );
};

export default TaskConfirmations;