

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uendmjowzfqiwmxbnnmo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlbmRtam93emZxaXdteGJubm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4MDQyMDEsImV4cCI6MjA2MTM4MDIwMX0.xPGw3pC7t7okH7ZyRBhsZ3OZfN9wzvRte25_WqYkP-Y';

export async function middleware(req) {
  const accessToken = req.cookies.get('sb-access-token')?.value;

  if (!accessToken) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data?.user) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/scorecard', '/deals', '/simulations', '/profile'],
};