

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast'; // or adjust if using a different toast library

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const handleConfirm = async () => {
      const { error } = await supabase.auth.getSessionFromUrl();

      if (!error) {
        toast.success('Email confirmed!');
      } else {
        toast.error('There was a problem confirming your email.');
      }

      // Redirect to login after delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    };

    handleConfirm();
  }, []);

  return <p className="text-white text-center mt-10">Confirming your email...</p>;
}