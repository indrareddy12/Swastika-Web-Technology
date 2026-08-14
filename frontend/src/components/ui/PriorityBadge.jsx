import React from 'react';

const PriorityBadge = ({ priority = 'medium', className = '' }) => {
  const styles = {
    low: 'bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400 border-slate-200/40 dark:border-slate-800/30',
    medium: 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-300 border-amber-100/50 dark:border-amber-900/30',
    high: 'bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-300 border-orange-100/50 dark:border-orange-900/30',
    urgent: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300 border-red-100/50 dark:border-red-900/30 font-bold shadow-[0_0_8px_rgba(239,68,68,0.15)] animate-pulse',
  };

  const labels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
  };

  const currentStyle = styles[priority.toLowerCase()] || styles.medium;
  const currentLabel = labels[priority.toLowerCase()] || priority;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full border transition-all duration-150 ${currentStyle} ${className}`}>
      {currentLabel}
    </span>
  );
};

export default PriorityBadge;
