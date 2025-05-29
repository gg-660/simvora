import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast';

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const { error } = await supabase.auth.exchangeCodeForSession();
        if (error) {
          console.error("Auth exchange error:", error.message);
          toast.error("There was a problem confirming your email.");
          router.replace('/login');
        } else {
          toast.success("Email confirmed!");
          router.replace('/');
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        router.replace('/login');
      }
    };

    handleAuth();
  }, [router]);

  return null;
}