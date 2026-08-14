import React, { useState } from 'react';
import axios from 'axios';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Sparkles } from 'lucide-react';

const Login = ({ onLoginSuccess, onToggleRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { access_token, user } = response.data;
      
      // Save token and user details
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      onLoginSuccess(user);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Incorrect email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0b0f19] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]">
      <div className="w-full max-w-md p-8 glass-panel border border-slate-200/50 dark:border-slate-800/80 rounded-2xl shadow-xl flex flex-col gap-6">
        
        {/* Header Logo */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="bg-brand-600 p-3 rounded-2xl text-white shadow-lg shadow-brand-500/25">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">
            Welcome Back
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Sign in to access your WebVory team dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="p-3 text-xs font-semibold text-red-700 bg-red-50 dark:bg-red-950/20 dark:text-red-300 rounded-lg">
              {error}
            </div>
          )}

          <div className="relative">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. member@webvory.com"
              required
            />
          </div>

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Button
            type="submit"
            className="w-full mt-2"
            loading={loading}
          >
            Sign In
          </Button>
        </form>

        {/* Footer Toggle */}
        <div className="text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-2">
          Don't have an account?{' '}
          <button
            onClick={onToggleRegister}
            className="font-bold text-brand-600 hover:text-brand-500 transition-colors"
          >
            Create account
          </button>
        </div>

        {/* Default credentials banner */}
        <div className="p-3 text-[11px] text-slate-500 bg-slate-100 dark:bg-slate-900/60 dark:text-slate-400 rounded-xl leading-relaxed">
          <div className="font-bold mb-1 uppercase tracking-wider text-[9px] text-slate-400">Default Sandbox Credentials:</div>
          <div><strong className="text-slate-700 dark:text-slate-300">Admin:</strong> admin@webvory.com / admin123</div>
          <div><strong className="text-slate-700 dark:text-slate-300">Member:</strong> member@webvory.com / member123</div>
        </div>

      </div>
    </div>
  );
};

export default Login;
