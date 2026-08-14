import React from 'react';

const StatusBadge = ({ status = 'pending', className = '' }) => {
  const styles = {
    pending: 'bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 border-slate-200/50 dark:border-slate-800/40',
    in_progress: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-100/50 dark:border-blue-900/30 shadow-[0_0_8px_rgba(59,130,246,0.1)]',
    completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-100/50 dark:border-emerald-900/30 shadow-[0_0_8px_rgba(16,185,129,0.1)]',
    blocked: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-100/50 dark:border-rose-900/30 shadow-[0_0_8px_rgba(244,63,94,0.1)]',
  };

  const labels = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
    blocked: 'Blocked',
  };

  const currentStyle = styles[status.toLowerCase()] || styles.pending;
  const currentLabel = labels[status.toLowerCase()] || status;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full border transition-all duration-200 ${currentStyle} ${className}`}>
      {currentLabel}
    </span>
  );
};

export default StatusBadge;
