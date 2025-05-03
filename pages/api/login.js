import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(401).json({ error: error.message });
  }

  const { user } = data;
  if (!user || !user.email_confirmed_at) {
    return res.status(403).json({ error: 'Email not verified' });
  }

  return res.status(200).json({ user });
}
