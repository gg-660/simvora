import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uendmjowzfqiwmxbnnmo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlbmRtam93emZxaXdteGJubm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4MDQyMDEsImV4cCI6MjA2MTM4MDIwMX0.xPGw3pC7t7okH7ZyRBhsZ3OZfN9wzvRte25_WqYkP-Y';

export const supabase = createClient(supabaseUrl, supabaseKey);
console.log('Supabase client initialized with URL:', supabaseUrl);