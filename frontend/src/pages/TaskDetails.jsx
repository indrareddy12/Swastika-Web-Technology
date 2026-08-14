import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { ArrowLeft, Calendar, Info, Trash2, ShieldAlert } from 'lucide-react';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import CommentSection from '../components/CommentSection';

const TaskDetails = ({ taskId, users, onBack, onDeleted }) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingField, setSavingField] = useState(null); // 'status', 'priority', 'assignee'

  const fetchTaskDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTask(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve task details.');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (taskId) {
      fetchTaskDetails();
    }
  }, [taskId, fetchTaskDetails]);

  const handleFieldChange = async (fieldName, value) => {
    setSavingField(fieldName);
    try {
      const token = localStorage.getItem('token');
      const payload = {};
      
      if (fieldName === 'assigned_to') {
        payload.assigned_to = value ? parseInt(value) : null;
      } else {
        payload[fieldName] = value;
      }

      const response = await axios.put(`/api/tasks/${taskId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state with response
      setTask(response.data);
    } catch (err) {
      console.error(err);
      alert(`Failed to update task ${fieldName}.`);
    } finally {
      setSavingField(null);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete this task?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (onDeleted) onDeleted();
      onBack();
    } catch (err) {
      console.error(err);
      alert('Failed to delete task.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-brand-650" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm font-semibold text-slate-400">Opening task file...</span>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="p-6 text-center max-w-lg mx-auto bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 rounded-2xl border border-red-200/50 mt-12">
        <ShieldAlert className="h-10 w-10 mx-auto mb-2 text-red-500" />
        <h3 className="font-bold text-lg">Failed to retrieve task details</h3>
        <p className="text-sm mt-1">{error || 'Task file not found.'}</p>
        <Button variant="outline" className="mt-4" onClick={onBack}>
          Back to List
        </Button>
      </div>
    );
  }

  const userOptions = users.map(u => ({ value: u.id, label: u.name }));
  
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'blocked', label: 'Blocked' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  const currentUser = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Back Header */}
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Task Repository
        </button>
        <Button
          variant="outline"
          className="hover:text-red-500 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Task
        </Button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Details & Comments */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-panel border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-6 flex flex-col gap-4">
            
            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
              {task.title}
            </h1>
            
            {/* Description */}
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Task Description
              </span>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {task.description || 'No description provided for this task.'}
              </p>
            </div>
          </div>

          {/* Comments Section */}
          <div className="glass-panel border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-6">
            <CommentSection taskId={task.id} currentUser={currentUser} />
          </div>
        </div>

        {/* Right Column: Settings & Side Cards */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-6 flex flex-col gap-5">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-3">
              <Info className="h-4 w-4 text-brand-500" />
              Task Specifications
            </h3>

            {/* Inline selectors */}
            <div className="flex flex-col gap-4">
              
              {/* Status Selector */}
              <div className="flex flex-col gap-1.5 relative">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Status</span>
                  {savingField === 'status' && <span className="text-[10px] text-brand-500 font-semibold animate-pulse">Saving...</span>}
                </div>
                <Select
                  value={task.status}
                  onChange={(e) => handleFieldChange('status', e.target.value)}
                  options={statusOptions}
                  disabled={savingField !== null}
                />
              </div>

              {/* Priority Selector */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Priority</span>
                  {savingField === 'priority' && <span className="text-[10px] text-brand-500 font-semibold animate-pulse">Saving...</span>}
                </div>
                <Select
                  value={task.priority}
                  onChange={(e) => handleFieldChange('priority', e.target.value)}
                  options={priorityOptions}
                  disabled={savingField !== null}
                />
              </div>

              {/* Assignee Selector */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Assigned User</span>
                  {savingField === 'assigned_to' && <span className="text-[10px] text-brand-500 font-semibold animate-pulse">Saving...</span>}
                </div>
                <Select
                  value={task.assigned_to || ''}
                  onChange={(e) => handleFieldChange('assigned_to', e.target.value)}
                  options={userOptions}
                  placeholder="Unassigned"
                  disabled={savingField !== null}
                />
              </div>

              {/* Due Date Indicator */}
              <div className="flex flex-col gap-1.5 border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-2">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Due date</span>
                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 font-medium bg-slate-50/50 dark:bg-slate-950/40 p-3 rounded-lg border border-slate-200/30 dark:border-slate-800/50">
                  <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>
                    {task.due_date 
                      ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                      : 'No due date specified.'
                    }
                  </span>
                </div>
              </div>

              {/* Creation metrics */}
              <div className="flex flex-col gap-2 text-[11px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-1 leading-normal">
                <div>Created: {new Date(task.created_at).toLocaleString()}</div>
                <div>Last updated: {new Date(task.updated_at).toLocaleString()}</div>
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default TaskDetails;
