

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleReset(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://simvora.com/update-password',
    });
    if (error) {
      setError(error.message);
    } else {
      setMessage('Check your email for a password reset link.');
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#121212] text-gray-300 p-6">
      <div className="bg-[#1e1e1e] p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-white text-center">Reset Password</h1>
        <form onSubmit={handleReset}>
          <label className="block mb-2 text-gray-300">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full p-3 mb-4 bg-[#2a2a2a] text-white border border-[#2a2a2a] rounded-md"
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md">
            Send Reset Link
          </button>
        </form>
        {message && <p className="mt-4 text-green-400 text-sm">{message}</p>}
        {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
      </div>
    </main>
  );
}