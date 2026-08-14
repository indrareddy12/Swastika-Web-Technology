import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { 
  Table as TableIcon, 
  Grid, Plus, Trash2, Edit, Eye, X 
} from 'lucide-react';

import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Table from '../components/ui/Table';
import Pagination from '../components/ui/Pagination';
import StatusBadge from '../components/ui/StatusBadge';
import PriorityBadge from '../components/ui/PriorityBadge';
import TaskCard from '../components/TaskCard';

const TaskList = ({ users, onViewDetails, onCreateTrigger, onEditTrigger }) => {
  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [assignee, setAssignee] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('table'); // table or grid

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Build query string
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      params.append('sort_by', sortBy);
      params.append('sort_order', sortOrder);
      
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (priority) params.append('priority', priority);
      if (assignee) params.append('assignee', assignee);

      const response = await axios.get(`/api/tasks?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTasks(response.data.tasks);
      setTotalPages(response.data.pages);
    } catch (err) {
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, priority, assignee, sortBy, sortOrder]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Reset page to 1 when filters change
  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setPriority('');
    setAssignee('');
    setSortBy('created_at');
    setSortOrder('desc');
    setPage(1);
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete the task: "${title}"?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert('Failed to delete task.');
    }
  };

  const handleSort = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

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

  const headers = [
    { key: 'title', label: 'Task Name', sortable: true },
    { key: 'assignee', label: 'Assignee', sortable: false },
    { key: 'priority', label: 'Priority', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'due_date', label: 'Due Date', sortable: true },
    { key: 'created_at', label: 'Created', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
            Task Repository
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
            Search, sort, filter, and modify project deliverables.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="hidden sm:flex border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 bg-slate-100/50 dark:bg-slate-950/40">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md ${viewMode === 'table' ? 'bg-white dark:bg-slate-850 shadow-sm text-brand-650' : 'text-slate-400'}`}
              title="Table View"
            >
              <TableIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white dark:bg-slate-850 shadow-sm text-brand-650' : 'text-slate-400'}`}
              title="Grid View"
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>

          <Button onClick={onCreateTrigger}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Filter Board */}
      <div className="glass-panel border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-5 flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5 items-end">
          
          {/* Search bar */}
          <div className="md:col-span-2 relative">
            <Input
              label="Search keyword"
              value={search}
              onChange={(e) => handleFilterChange(setSearch, e.target.value)}
              placeholder="Search in title or description..."
            />
          </div>

          {/* Status filter */}
          <Select
            label="Status"
            value={status}
            onChange={(e) => handleFilterChange(setStatus, e.target.value)}
            options={statusOptions}
            placeholder="All Statuses"
          />

          {/* Priority filter */}
          <Select
            label="Priority"
            value={priority}
            onChange={(e) => handleFilterChange(setPriority, e.target.value)}
            options={priorityOptions}
            placeholder="All Priorities"
          />

          {/* Assignee filter */}
          <Select
            label="Assignee"
            value={assignee}
            onChange={(e) => handleFilterChange(setAssignee, e.target.value)}
            options={userOptions}
            placeholder="All Assignees"
          />

        </div>

        {/* Clear Filters indicator */}
        {(search || status || priority || assignee || sortBy !== 'created_at' || sortOrder !== 'desc') && (
          <div className="flex justify-end">
            <button
              onClick={handleClearFilters}
              className="text-xs font-bold text-slate-400 hover:text-brand-500 flex items-center gap-1 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Data display */}
      {viewMode === 'table' ? (
        <Table
          headers={headers}
          loading={loading}
          emptyMessage="No tasks found matching filter criteria."
          onSort={handleSort}
          currentSort={{ by: sortBy, order: sortOrder }}
        >
          {tasks.map((task) => (
            <tr
              key={task.id}
              className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 cursor-pointer transition-colors"
              onClick={() => onViewDetails(task.id)}
            >
              <td className="px-5 py-4 font-bold text-slate-700 dark:text-slate-200 max-w-xs truncate">
                {task.title}
              </td>
              
              <td className="px-5 py-4">
                {task.assignee ? (
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-brand-500/10 text-brand-650 flex items-center justify-center text-[10px] font-bold">
                      {task.assignee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <span className="text-slate-600 dark:text-slate-400">{task.assignee.name}</span>
                  </div>
                ) : (
                  <span className="text-slate-400 dark:text-slate-650">Unassigned</span>
                )}
              </td>
              
              <td className="px-5 py-4">
                <PriorityBadge priority={task.priority} />
              </td>
              
              <td className="px-5 py-4">
                <StatusBadge status={task.status} />
              </td>
              
              <td className="px-5 py-4 text-slate-500 dark:text-slate-400 font-medium">
                {formatDate(task.due_date)}
              </td>
              
              <td className="px-5 py-4 text-slate-400 dark:text-slate-500 text-xs">
                {formatDate(task.created_at)}
              </td>
              
              <td className="px-5 py-4">
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onViewDetails(task.id)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEditTrigger(task)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-500 transition-colors"
                    title="Edit Task"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id, task.title)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors"
                    title="Delete Task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      ) : (
        /* Grid card representation */
        loading ? (
          <div className="text-center py-20 text-xs font-semibold text-slate-400">
            Fetching project deliverables...
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-20 text-slate-400 dark:text-slate-600 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            No tasks found matching filter criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={onViewDetails}
              />
            ))}
          </div>
        )
      )}

      {/* Pagination Footer */}
      {!loading && totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export default TaskList;
