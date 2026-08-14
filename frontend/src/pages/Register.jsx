import React, { useState } from 'react';
import axios from 'axios';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import { Sparkles } from 'lucide-react';

const Register = ({ onRegisterSuccess, onToggleLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('member');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // 1. Register User
      await axios.post('/api/auth/register', { name, email, password, role });
      
      // 2. Automaticaly login after registration
      const loginRes = await axios.post('/api/auth/login', { email, password });
      const { access_token, user } = loginRes.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      onRegisterSuccess(user);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Registration failed. Email might already be taken.');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'member', label: 'Team Member' },
    { value: 'admin', label: 'Administrator' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0b0f19] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]">
      <div className="w-full max-w-md p-8 glass-panel border border-slate-200/50 dark:border-slate-800/80 rounded-2xl shadow-xl flex flex-col gap-6">
        
        {/* Header Logo */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="bg-brand-600 p-3 rounded-2xl text-white shadow-lg shadow-brand-500/25">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">
            Create Account
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Join WebVory and start tracking team work
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="p-3 text-xs font-semibold text-red-700 bg-red-50 dark:bg-red-950/20 dark:text-red-300 rounded-lg">
              {error}
            </div>
          )}

          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. John Doe"
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. john@webvory.com"
            required
          />

          <Select
            label="Default Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={roleOptions}
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
          />

          <Button
            type="submit"
            className="w-full mt-2"
            loading={loading}
          >
            Get Started
          </Button>
        </form>

        {/* Footer Toggle */}
        <div className="text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-2">
          Already have an account?{' '}
          <button
            onClick={onToggleLogin}
            className="font-bold text-brand-600 hover:text-brand-500 transition-colors"
          >
            Sign in
          </button>
        </div>

      </div>
    </div>
  );
};

export default Register;
