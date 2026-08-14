import React, { useEffect, useState } from 'react';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';

const TaskFormModal = ({ isOpen, onClose, onSubmit, task = null, users = [] }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [priority, setPriority] = useState('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Initialize fields on open or task update
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'pending');
      setPriority(task.priority || 'medium');
      setAssignedTo(task.assigned_to || '');
      
      if (task.due_date) {
        // Convert to YYYY-MM-DD for date input
        const date = new Date(task.due_date);
        setDueDate(date.toISOString().split('T')[0]);
      } else {
        setDueDate('');
      }
    } else {
      // Clear form for creation
      setTitle('');
      setDescription('');
      setStatus('pending');
      setPriority('medium');
      setAssignedTo('');
      setDueDate('');
    }
    setErrors({});
  }, [task, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        title,
        description: description || null,
        status,
        priority,
        assigned_to: assignedTo ? parseInt(assignedTo) : null,
        due_date: dueDate ? new Date(dueDate).toISOString() : null
      };
      
      await onSubmit(payload);
      onClose();
    } catch (err) {
      console.error(err);
      setErrors({ api: err.response?.data?.detail || 'An error occurred.' });
    } finally {
      setSubmitting(false);
    }
  };

  const userOptions = users.map(u => ({
    value: u.id,
    label: u.name
  }));

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'Create New Task'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {errors.api && (
          <div className="p-3 text-xs font-semibold text-red-700 bg-red-50 dark:bg-red-950/20 dark:text-red-300 rounded-lg">
            {errors.api}
          </div>
        )}

        <Input
          label="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          placeholder="e.g. Set up API endpoints"
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="px-3.5 py-2 w-full text-sm rounded-lg border border-slate-200 focus:ring-brand-500/25 focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 h-24 resize-none"
            placeholder="Add detailed task notes..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={statusOptions}
          />

          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            options={priorityOptions}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Assignee"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            options={userOptions}
            placeholder="Unassigned"
          />

          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {task ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskFormModal;
