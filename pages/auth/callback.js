import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    console.log("callback page hit");

    const run = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession();
      if (!error) {
        sessionStorage.setItem('emailConfirmed', '1');
      }
      router.push('/');
    };

    run();
  }, [router]);

  return null;
}