import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/router';

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSignup(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Check your email for a confirmation link!');
      setEmail('');
      setPassword('');
      setTimeout(() => {
        router.push('/login'); // Redirect to login page after a few seconds
      }, 3000);
    }
  }

  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center justify-center min-h-screen bg-[#121212] text-gray-300 p-8">
        <h1 className="text-3xl font-bold mb-8">Create Your Account</h1>

        <form onSubmit={handleSignup} className="bg-[#1e1e1e] p-8 rounded-lg shadow-md w-full max-w-sm">
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
          {message && <p className="text-green-500 mb-4">{message}</p>}

          <button
            type="submit"
            className="w-full bg-[#475569] text-white font-semibold py-3 rounded-md hover:bg-[#3b4a5a] transition"
          >
            Create Account
          </button>
        </form>
        <div className="w-full max-w-sm mt-4">
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="w-full bg-[#2a2a2a] text-gray-300 font-semibold py-2 rounded-md hover:bg-gray-600 transition"
          >
            Already have an account? Log in
          </button>
        </div>
      </main>
    </>
  );
}