import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://fbcputajwslvijicostj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiY3B1dGFqd3NsdmlqaWNvc3RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMTI4NzYsImV4cCI6MjA3MDY4ODg3Nn0.9N16p1KkrIgLLjKn8Q4mJX7Gqiuj8sF0mzXcJTl0d98',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    },
    realtime: {
      params: { eventsPerSecond: 10 }
    }
  }
);
