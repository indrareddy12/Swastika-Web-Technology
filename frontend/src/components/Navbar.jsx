import React, { useEffect, useState } from 'react';
import { LayoutDashboard, CheckSquare, Users, LogOut, Sun, Moon, Sparkles } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab, user, onLogout }) => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Task Manager', icon: CheckSquare },
    { id: 'external', label: 'Partner Directory', icon: Users },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200/50 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Links */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="bg-brand-600 p-2 rounded-xl text-white shadow-md shadow-brand-500/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-400 dark:to-indigo-400 bg-clip-text text-transparent">
                WebVory Portal
              </span>
            </div>
            
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                      ${isActive
                        ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Profile Dropdown info */}
            <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-4">
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {user?.name || 'User'}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                  {user?.role || 'Member'}
                </span>
              </div>
              
              {/* User Initial Avatar */}
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-brand-500/10">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all duration-150"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation tab list */}
      <div className="flex md:hidden border-t border-slate-100 dark:border-slate-800 px-4 py-2 justify-around bg-white dark:bg-slate-900">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-semibold transition-all duration-200
                ${isActive
                  ? 'text-brand-600 dark:text-brand-400'
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-500'
                }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;
