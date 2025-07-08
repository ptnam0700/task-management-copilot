import React, { useState } from 'react';
import { useAuth } from '../lib/authContext';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useNavigate } from 'react-router';

const LoginForm: React.FC = () => {
  const { login, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    if (!email || !password) {
      setFormError('Email and password are required');
      return;
    }
    setLoading(true);
    await login(email, password);
    setLoading(false);
    if (!error) {
      navigate('/tasks/list');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        required
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        required
      />
      {(formError || error) && <div style={{ color: 'red' }}>{formError || error}</div>}
      <Button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</Button>
    </form>
  );
};

export default LoginForm;
