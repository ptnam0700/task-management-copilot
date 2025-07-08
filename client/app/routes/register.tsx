import React from 'react';
import RegisterForm from '../components/RegisterForm';

export default function RegisterRoute() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <RegisterForm />
    </main>
  );
}
