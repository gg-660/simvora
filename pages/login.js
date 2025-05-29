import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/');
      }
    };
    checkSession();
  }, []);

  async function handleLogin() {
    setError('');
    setLoading(true);

    console.log('Attempting login with:', { email, password });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log('Login result:', { data, error });

    setLoading(false);

    if (error) {
      setError(error.message || 'Login failed');
      return;
    }

    if (data.session) {
      console.log('Login successful, redirecting...');
      toast.success('Login successful!', {
        icon: '✅',
        duration: 3000,
        style: {
          background: '#1e1e1e',
          color: '#22c55e', // Tailwind green-500
        },
      });
      router.replace('/');
    } else {
      setError('Login succeeded but no session found.');
    }
  }

  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center justify-center min-h-screen bg-[#121212] text-white text-gray-300 p-8">
        <h1 className="text-3xl font-bold mb-8">
          Login to Your Account
        </h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="bg-[#1e1e1e] p-8 rounded-lg shadow-md w-full max-w-sm"
        >
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
            disabled={loading}
            className="w-full bg-[#475569] text-white font-semibold py-3 rounded-md hover:bg-[#3b4a5a] transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log In'}
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