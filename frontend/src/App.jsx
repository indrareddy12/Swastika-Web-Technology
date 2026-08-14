import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import TaskList from './pages/TaskList';
import TaskDetails from './pages/TaskDetails';
import ExternalUsers from './pages/ExternalUsers';
import Login from './pages/Login';
import Register from './pages/Register';
import TaskFormModal from './components/TaskFormModal';

const App = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [booting, setBooting] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Check auth on boot
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          // Verify token validity with backend
          const response = await axios.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data);
          
          // Load system users for assignments
          const usersRes = await axios.get('/api/users', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUsers(usersRes.data);
        } catch (err) {
          console.error('Session validation failed:', err);
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setBooting(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = async (loggedInUser) => {
    setUser(loggedInUser);
    setIsRegisterMode(false);
    
    // Fetch users immediately on login success
    try {
      const token = localStorage.getItem('token');
      const usersRes = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Error fetching users on login:', err);
    }
    
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setUsers([]);
    setActiveTab('dashboard');
    setSelectedTaskId(null);
  };

  const handleViewDetails = (taskId) => {
    setSelectedTaskId(taskId);
    setActiveTab('details');
  };

  const handleBackToTasks = () => {
    setSelectedTaskId(null);
    setActiveTab('tasks');
  };

  const openModal = (mode, taskToEdit = null) => {
    if (mode === 'edit') {
      setEditingTask(taskToEdit);
    } else {
      setEditingTask(null);
    }
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (taskPayload) => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    if (editingTask) {
      // Edit mode
      await axios.put(`/api/tasks/${editingTask.id}`, taskPayload, { headers });
    } else {
      // Create mode
      await axios.post('/api/tasks', taskPayload, { headers });
    }

    // Refresh active tab or trigger state update
    // If details are open, refresh it
    if (selectedTaskId && selectedTaskId === editingTask?.id) {
      // TaskDetails will fetch itself on taskId trigger, we toggle selectedTaskId to force updates
      setSelectedTaskId(null);
      setTimeout(() => setSelectedTaskId(editingTask.id), 10);
    }
    
    // Quick refresh of task repositories
    // We toggle state in lists or force re-fetch by triggering tab reset
    const prevTab = activeTab;
    setActiveTab('dashboard');
    setTimeout(() => setActiveTab(prevTab), 10);
  };

  if (booting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b0f19]">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-brand-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Initialising System Portal...
          </span>
        </div>
      </div>
    );
  }

  // Renders Authentication pages if not logged in
  if (!user) {
    return isRegisterMode ? (
      <Register 
        onRegisterSuccess={handleLoginSuccess} 
        onToggleLogin={() => setIsRegisterMode(false)} 
      />
    ) : (
      <Login 
        onLoginSuccess={handleLoginSuccess} 
        onToggleRegister={() => setIsRegisterMode(true)} 
      />
    );
  }

  return (
    <div className="min-h-screen pb-16 bg-[#f8fafc] dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Navbar 
        activeTab={activeTab === 'details' ? 'tasks' : activeTab} 
        setActiveTab={(tab) => {
          setSelectedTaskId(null);
          setActiveTab(tab);
        }} 
        user={user} 
        onLogout={handleLogout} 
      />

      <main>
        {activeTab === 'dashboard' && (
          <Dashboard 
            user={user} 
            onViewDetails={handleViewDetails} 
            onCreateTrigger={() => openModal('create')} 
          />
        )}
        
        {activeTab === 'tasks' && (
          <TaskList 
            users={users} 
            onViewDetails={handleViewDetails} 
            onCreateTrigger={() => openModal('create')} 
            onEditTrigger={(task) => openModal('edit', task)} 
          />
        )}

        {activeTab === 'external' && (
          <ExternalUsers />
        )}

        {activeTab === 'details' && selectedTaskId && (
          <TaskDetails 
            taskId={selectedTaskId} 
            users={users} 
            onBack={handleBackToTasks}
            onDeleted={handleBackToTasks}
          />
        )}
      </main>

      {/* Global Form Modal */}
      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        task={editingTask}
        users={users}
      />
    </div>
  );
};

export default App;
