import React, { useState } from 'react';
import { useAuth } from '../lib/authContext';
import { Input } from './ui/input';
import { Button } from './ui/button';

const RegisterForm: React.FC = () => {
  const { register, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    if (!email || !password || !name) {
      setFormError('All fields are required');
      return;
    }
    setLoading(true);
    await register(email, password, name);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
        required
      />
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
      <Button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</Button>
    </form>
  );
};

export default RegisterForm;
