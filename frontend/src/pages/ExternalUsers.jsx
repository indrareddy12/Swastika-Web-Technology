import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Globe, Building, Mail, ShieldCheck, RefreshCw, MapPin } from 'lucide-react';
import Button from '../components/ui/Button';

const ExternalUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromCache, setFromCache] = useState(false);

  const fetchExternalUsers = async () => {
    setLoading(true);
    setError(null);
    const start = performance.now();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/external/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const duration = performance.now() - start;
      // If the response took less than 20ms, it was almost certainly cached on our backend!
      setFromCache(duration < 45);
      
      setUsers(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to fetch external partner directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExternalUsers();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
            Partner Directory
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
            External team integrations loaded in real-time from partner APIs.
          </p>
        </div>
        <Button onClick={fetchExternalUsers} disabled={loading} variant="outline" className="h-9">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refetch API
        </Button>
      </div>

      {/* Integration details banner */}
      <div className="p-4 rounded-2xl glass-panel border border-brand-500/10 dark:border-brand-500/20 bg-brand-500/5 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-brand-650 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1 text-xs">
          <span className="font-extrabold text-slate-700 dark:text-slate-300">
            API Gateway Integration Active
          </span>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
            Data is retrieved securely by our backend via an HTTPX async proxy calling a public endpoint. 
            To prevent rate limits, a 60-second in-memory server cache is active. Network requests feature a 
            5-second gateway timeout protect wrapper.
            {fromCache && (
              <span className="block mt-1.5 font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">
                ✓ Delivered instantly from server cache.
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Data display */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin h-8 w-8 text-brand-650" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-xs font-semibold text-slate-400">Querying partner server...</span>
          </div>
        </div>
      ) : error ? (
        <div className="p-6 text-center max-w-lg mx-auto bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 rounded-2xl border border-red-200/50 my-10">
          <h3 className="font-bold text-base">Connection timed out or failed</h3>
          <p className="text-xs mt-1 leading-relaxed">{error}</p>
          <Button variant="outline" className="mt-4" onClick={fetchExternalUsers}>
            Retry Request
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((u) => (
            <div key={u.id} className="glass-card p-6 flex flex-col justify-between gap-5 relative overflow-hidden group">
              
              {/* Badge & Avatar Header */}
              <div className="flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 flex items-center justify-center font-extrabold text-sm border border-slate-200/50 dark:border-slate-700/60">
                  {u.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-brand-500 transition-colors truncate">
                    {u.name}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    @{u.username}
                  </span>
                </div>
              </div>

              {/* Specifications list */}
              <div className="flex flex-col gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{u.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{u.company}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{u.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <a 
                    href={`https://${u.website}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="truncate hover:text-brand-500 font-semibold"
                  >
                    {u.website}
                  </a>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExternalUsers;
