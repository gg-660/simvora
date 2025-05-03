import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const result = await res.json();

    if (!res.ok) {
      setError(result.error || 'Login failed');
      return;
    }

    router.push('/deals'); // Redirect after successful login
  }

  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center justify-center min-h-screen bg-[#121212] text-white text-gray-300 p-8">
        <h1 className="text-3xl font-bold mb-8">
          Login to Your Account
        </h1>

        <form onSubmit={handleLogin} className="bg-[#1e1e1e] p-8 rounded-lg shadow-md w-full max-w-sm">
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-300" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 border border-[#2a2a2a] rounded-md bg-[#2a2a2a] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-8">
            <label className="block mb-2 font-semibold text-gray-300" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 border border-[#2a2a2a] rounded-md bg-[#2a2a2a] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <button
            type="submit"
            className="w-full bg-[#475569] text-white font-semibold py-3 rounded-md hover:bg-[#3b4a5a] transition"
          >
            Log In
          </button>
        </form>

        <p className="mt-4 text-center">
          <Link href="/reset-password" className="text-sm text-blue-500 hover:underline">
            Forgot your password?
          </Link>
        </p>

        <div className="w-full max-w-sm mt-4">
          <button
            type="button"
            onClick={() => router.push('/signup')}
            className="w-full bg-[#475569] text-white font-semibold py-2 rounded-md hover:bg-[#3b4a5a] transition"
          >
            No account? Sign up here
          </button>
        </div>
      </main>
    </>
  );
}