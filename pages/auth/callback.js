import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession();
      router.replace(error ? '/login' : '/');
    };

    run();
  }, [router]);

  return null;
}