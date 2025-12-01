
import { createClient } from '@supabase/supabase-js';
import { APP_CONFIG } from '../config';

// Safe access to environment variables or hardcoded values provided by user
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://wnumllyicvloascctlqk.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndudW1sbHlpY3Zsb2FzY2N0bHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0Nzg5MjksImV4cCI6MjA4MDA1NDkyOX0.WpcfkD5qRlGBLi1q8PhSfJiD5wMskuvY0QbF_53xeV0';

// Create client
export const supabase = createClient(
  SUPABASE_URL, 
  SUPABASE_ANON_KEY
);

export const isSupabaseConfigured = () => {
  return (
    SUPABASE_URL && 
    SUPABASE_URL.startsWith('http') && 
    SUPABASE_ANON_KEY && 
    SUPABASE_ANON_KEY.length > 20 &&
    SUPABASE_URL !== 'https://placeholder.supabase.co'
  );
};

// Helper to check connection
export const checkConnection = async () => {
  try {
    if (APP_CONFIG.useMockData) return true;
    
    // If keys are missing/placeholder, fail fast without network request
    if (!isSupabaseConfigured()) {
      console.warn("Supabase not configured. Missing valid URL or Key.");
      return false;
    }

    // Attempt simple query
    const { data, error } = await supabase.from('app_settings').select('store_name').maybeSingle();
    
    if (error) {
      // If table doesn't exist (error code 42P01) or other DB error, consider connection failed
      // This triggers fallback to local storage
      console.warn("Supabase Connection Check Failed:", error.message);
      return false;
    }
    
    // If we get here, connection is good (even if data is null)
    return true;
  } catch (e: any) {
    console.error("Supabase Connection Exception:", e.message || JSON.stringify(e));
    return false;
  }
};
