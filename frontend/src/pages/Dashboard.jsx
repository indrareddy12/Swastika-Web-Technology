import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  CheckSquare, Play, CheckCircle2, AlertOctagon, 
  UserCheck, ClipboardList, Plus, ArrowUpRight, ShieldAlert 
} from 'lucide-react';
import Button from '../components/ui/Button';

const Dashboard = ({ user, onViewDetails, onCreateTrigger }) => {
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch stats
      const statsRes = await axios.get('/api/dashboard', { headers });
      setStats(statsRes.data);

      // Fetch top 5 recent tasks
      const tasksRes = await axios.get('/api/tasks?limit=5', { headers });
      setRecentTasks(tasksRes.data.tasks);
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-brand-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm font-semibold text-slate-400">Assembling your workspace...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center max-w-lg mx-auto bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 rounded-2xl border border-red-200/50 mt-12">
        <ShieldAlert className="h-10 w-10 mx-auto mb-2 text-red-500" />
        <h3 className="font-bold text-lg">System Synchronisation Failure</h3>
        <p className="text-sm mt-1">{error}</p>
        <Button variant="outline" className="mt-4" onClick={fetchDashboardData}>
          Try Reconnecting
        </Button>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Scope',
      value: stats?.total_tasks || 0,
      icon: ClipboardList,
      color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/60 dark:text-slate-300',
      glow: 'shadow-sm',
    },
    {
      label: 'Pending Tasks',
      value: stats?.pending_tasks || 0,
      icon: CheckSquare,
      color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
      glow: 'shadow-sm hover:shadow-glow-warning',
    },
    {
      label: 'In Progress',
      value: stats?.in_progress_tasks || 0,
      icon: Play,
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
      glow: 'shadow-sm hover:shadow-glow-brand',
    },
    {
      label: 'Completed Tasks',
      value: stats?.completed_tasks || 0,
      icon: CheckCircle2,
      color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
      glow: 'shadow-sm hover:shadow-glow-success',
    },
    {
      label: 'Overdue Milestones',
      value: stats?.overdue_tasks || 0,
      icon: AlertOctagon,
      color: 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400',
      glow: 'shadow-sm hover:shadow-glow-danger',
    },
    {
      label: 'My Assignments',
      value: stats?.user_tasks || 0,
      icon: UserCheck,
      color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400',
      glow: 'shadow-sm hover:shadow-glow-brand',
    },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Welcome Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100">
            Welcome back, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
            Here is a review of your team's status and deliverables for today.
          </p>
        </div>
        <Button onClick={onCreateTrigger} className="shadow-lg hover:shadow-glow-brand transition-all">
          <Plus className="h-4 w-4 mr-2" />
          Create Task
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className={`glass-card p-5 flex flex-col justify-between ${c.glow} cursor-default`}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                  {c.label}
                </span>
                <div className={`p-1.5 rounded-lg ${c.color}`}>
                  <Icon className="h-4 w-4 shrink-0" />
                </div>
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-4">
                {c.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Recents & Quick-Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recents list */}
        <div className="glass-panel border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-6 lg:col-span-2 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Recent Task Feed
          </h3>

          <div className="flex flex-col gap-3">
            {recentTasks.length === 0 ? (
              <div className="text-center py-12 text-slate-400 dark:text-slate-600 text-xs">
                No active tasks found in scope. Create one to begin.
              </div>
            ) : (
              recentTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onViewDetails(t.id)}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 cursor-pointer group transition-all duration-150"
                >
                  <div className="flex flex-col gap-1 pr-4 truncate">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate group-hover:text-brand-500 transition-colors">
                      {t.title}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate">
                      {t.description || 'No description added.'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase
                      ${t.status === 'completed' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                        : 'bg-amber-50 text-amber-700 border-amber-100/50 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'
                      }`}
                    >
                      {t.status}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Info panel */}
        <div className="glass-panel border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-6 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Collaboration Guidelines
          </h3>
          <div className="flex flex-col gap-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <div className="flex gap-2">
              <span className="h-2 w-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
              <p>Keep task priority labels up-to-date to flag bottlenecks quickly for the administration team.</p>
            </div>
            <div className="flex gap-2">
              <span className="h-2 w-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
              <p>Use the comment/notes log under each task to communicate deliverables or specify blocker dependencies.</p>
            </div>
            <div className="flex gap-2">
              <span className="h-2 w-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
              <p>Sync external partners via the Partner Directory tab to view integrations contact information.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
