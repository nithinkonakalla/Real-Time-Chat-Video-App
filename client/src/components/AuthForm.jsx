import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const AuthForm = () => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(form, mode);
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <form className="auth-card" onSubmit={submit}>
      <h1>{mode === 'login' ? 'Welcome Back' : 'Create account'}</h1>
      {error && <p className="error">{error}</p>}
      {mode === 'register' && (
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          required
        />
      )}
      <input
        placeholder="Email"
        type="email"
        value={form.email}
        onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
        required
      />
      <input
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
        required
      />
      <button type="submit">{mode === 'login' ? 'Login' : 'Register'}</button>
      <button type="button" className="link-button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? 'Need an account?' : 'Already have an account?'}
      </button>
    </form>
  );
};
