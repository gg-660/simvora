import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';

export default function Callback() {
  const router = useRouter();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let isMounted = true;

    const handleAuth = async () => {
      try {
        const { error } = await supabase.auth.exchangeCodeForSession();
        if (error) {
          if (isMounted) router.replace('/login');
        } else {
          if (isMounted) setStatus('confirmed');
          setTimeout(() => {
            if (isMounted) router.replace('/');
          }, 15000);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        if (isMounted) router.replace('/login');
      }
    };

    handleAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (status === 'loading') {
    return (
      <main className="flex items-center justify-center min-h-screen bg-[#121212] text-white">
        <p className="text-gray-400 text-sm">Verifying your email...</p>
      </main>
    );
  }

  if (status === 'confirmed') {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-[#121212] text-white p-8">
        <div className="bg-[#1e1e1e] p-8 rounded-lg shadow-md w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold mb-4">✅ Email Confirmed</h1>
          <p className="text-gray-300">
            You will be redirected to the homepage shortly.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            If you are not redirected within 15 seconds, please reload the page.
          </p>
        </div>
      </main>
    );
  }

  return null;
}