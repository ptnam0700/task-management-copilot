import React from 'react';
import LoginForm from '../components/LoginForm';

export default function LoginRoute() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <LoginForm />
    </main>
  );
}
