import React from 'react';
import { Calendar, User, AlertTriangle } from 'lucide-react';
import StatusBadge from './ui/StatusBadge';
import PriorityBadge from './ui/PriorityBadge';

const TaskCard = ({ task, onClick }) => {
  const formatDueDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isOverdue = (task) => {
    if (!task.due_date || task.status === 'completed') return false;
    return new Date(task.due_date) < new Date();
  };

  return (
    <div
      onClick={() => onClick && onClick(task.id)}
      className="glass-card p-5 cursor-pointer flex flex-col justify-between h-52 group relative overflow-hidden"
    >
      {/* Top badges */}
      <div className="flex justify-between items-start gap-2 mb-3">
        <PriorityBadge priority={task.priority} />
        <StatusBadge status={task.status} />
      </div>

      {/* Task Content */}
      <div className="flex-1 flex flex-col justify-start mb-4">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-500 transition-colors line-clamp-1 mb-1.5">
          {task.title}
        </h4>
        <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2">
          {task.description || 'No description provided.'}
        </p>
      </div>

      {/* Card Footer */}
      <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800/60 mt-auto">
        {/* Due Date */}
        <div className={`flex items-center gap-1.5 text-xs font-semibold
          ${isOverdue(task) 
            ? 'text-red-500 animate-pulse' 
            : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          {isOverdue(task) ? <AlertTriangle className="h-3.5 w-3.5" /> : <Calendar className="h-3.5 w-3.5" />}
          <span>{formatDueDate(task.due_date)}</span>
        </div>

        {/* Assignee Indicator */}
        <div className="flex items-center gap-1.5">
          {task.assignee ? (
            <div
              className="h-6.5 w-6.5 rounded-full bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center text-[10px] font-bold border border-brand-500/20"
              title={`Assigned to ${task.assignee.name}`}
            >
              {task.assignee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
          ) : (
            <div
              className="h-6.5 w-6.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center border border-slate-200 dark:border-slate-800"
              title="Unassigned"
            >
              <User className="h-3 w-3" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
