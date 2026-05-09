import { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('admin');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [register, setRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    setLoading(true);
    setError('');

    try {
      let res;

      if (mode === 'admin') {
        res = await api.post('/auth/admin/login', {
          email: form.email,
          password: form.password
        });
        localStorage.setItem(res.data.admin._id, res.data.token);
        localStorage.setItem('role', 'admin');
        localStorage.setItem('user', JSON.stringify(res.data.admin));
        navigate('/dashboard');
        return;
      }

      if (register) {
        res = await api.post('/auth/register', {
          name: form.name,
          email: form.email,
          password: form.password
        });
      } else {
        res = await api.post('/auth/login', {
          email: form.email,
          password: form.password
        });
      }

      localStorage.setItem(res.data.user._id, res.data.token);
      localStorage.setItem('role', 'user');
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (nextMode) => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    setMode(nextMode);
    setRegister(false);
    setForm({ name: '', email: '', password: '' });
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md rounded-[32px] border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-lg">
        <div className="mb-8 text-center">
          <div className="mb-6 flex items-center justify-center gap-2 rounded-full bg-slate-800 p-2">
            <button
              type="button"
              onClick={() => switchMode('admin')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                mode === 'admin' ? 'bg-indigo-500 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => switchMode('user')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                mode === 'user' ? 'bg-indigo-500 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              User
            </button>
          </div>
          <p className="text-sm uppercase tracking-[0.32em] text-slate-400">
            {mode === 'admin' ? 'Admin panel' : 'User chat'}
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-400">
            {mode === 'admin'
              ? 'Sign in to manage conversations and reply instantly.'
              : register
              ? 'Create your user account and start chatting with the admin.'
              : 'Sign in to chat with the admin in real time.'}
          </p>
        </div>

        {error && <div className="mb-4 rounded-3xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

        <form onSubmit={submit} className="space-y-5">
          {mode === 'user' && register && (
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">Name</span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                required
                className="w-full rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </label>
          )}

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder={mode === 'admin' ? 'admin@example.com' : 'user@example.com'}
              required
              className="w-full rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              required
              className="w-full rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-3xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-700"
          >
            {loading
              ? mode === 'admin'
                ? 'Signing in...'
                : register
                ? 'Creating account...'
                : 'Signing in...'
              : mode === 'admin'
              ? 'Sign in as Admin'
              : register
              ? 'Register user'
              : 'Sign in as User'}
          </button>
        </form>

        {mode === 'user' && (
          <div className="mt-5 rounded-3xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-400">
            <p>
              {register ? 'Already have an account?' : 'New to chat?'}{' '}
              <button
                type="button"
                onClick={() => setRegister(!register)}
                className="font-semibold text-indigo-400 hover:text-indigo-300"
              >
                {register ? 'Sign in' : 'Create an account'}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
