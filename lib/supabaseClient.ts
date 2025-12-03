
import { createClient } from '@supabase/supabase-js';
import { APP_CONFIG } from '../config';

// Check for override in local storage (Admin configured)
const storedConfig = typeof window !== 'undefined' ? localStorage.getItem('lumina_db_config') : null;
const customDB = storedConfig ? JSON.parse(storedConfig) : null;

// Safe access to environment variables or hardcoded values provided by user
// Prioritize Custom (Admin Panel) -> Env Vars (Deployment) -> Explicit Hardcoded (User Provided)
// This ensures the app works in all environments: Local, Cloud, and Demo.
const SUPABASE_URL = customDB?.url || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wnumllyicvloascctlqk.supabase.co';
const SUPABASE_ANON_KEY = customDB?.key || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndudW1sbHlpY3Zsb2FzY2N0bHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0Nzg5MjksImV4cCI6MjA4MDA1NDkyOX0.WpcfkD5qRlGBLi1q8PhSfJiD5wMskuvY0QbF_53xeV0';

// Create client
export const supabase = createClient(
  SUPABASE_URL, 
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true
    }
  }
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

// Return types for diagnosis
type ConnectionStatus = {
  success: boolean;
  message?: string;
  code?: string;
  url?: string;
  syncError?: string;
};

// Helper to check connection with detailed diagnostics
export const diagnoseConnection = async (): Promise<ConnectionStatus> => {
  const maskedUrl = SUPABASE_URL.replace(/^(https?:\/\/)([^.]+)(.*)$/, '$1*****$3');
  
  try {
    if (APP_CONFIG.useMockData) return { success: true, message: "Mock Mode", url: 'Internal Mock DB' };
    
    if (!isSupabaseConfigured()) {
      return { success: false, message: "Missing API Credentials", url: 'Not Configured' };
    }

    // 1. Check Auth / Reachability (Does not require tables)
    // This confirms the URL and Key are correct.
    const { error: authError } = await supabase.auth.getSession();
    if (authError) {
       console.error("Supabase Auth Check Failed:", authError);
       return { success: false, message: `Auth Failed: ${authError.message}`, code: 'AUTH_FAIL', url: maskedUrl };
    }

    // 2. Check Database Schema (Requires 'app_settings' table)
    // We select '*' to ensure we just check table existence, avoiding column naming mismatch (snake_case vs camelCase)
    const { data, error } = await supabase.from('app_settings').select('*').maybeSingle();
    
    if (error) {
      // Code 42P01 means "relation does not exist" -> Connected, but tables missing.
      if (error.code === '42P01') {
         return { success: false, message: "Tables Missing (Run SQL Schema)", code: 'NO_SCHEMA', url: maskedUrl };
      }
      return { success: false, message: `DB Error: ${error.message}`, code: error.code, url: maskedUrl };
    }
    
    return { success: true, message: "Connected", url: maskedUrl };
  } catch (e: any) {
    return { success: false, message: `Exception: ${e.message}`, code: 'EXCEPTION', url: maskedUrl };
  }
};

// Backward compatible check
export const checkConnection = async () => {
  const result = await diagnoseConnection();
  return result.success;
};

// --- Dynamic Config Helpers ---

export const updateDatabaseConfig = (url: string, key: string) => {
  if (!url || !key) return;
  // Trim whitespace just in case of copy-paste errors
  const cleanUrl = url.trim();
  const cleanKey = key.trim();
  localStorage.setItem('lumina_db_config', JSON.stringify({ url: cleanUrl, key: cleanKey }));
  window.location.reload();
};

export const resetDatabaseConfig = () => {
  localStorage.removeItem('lumina_db_config');
  window.location.reload();
};

export const getDatabaseConfig = () => ({
  url: SUPABASE_URL,
  key: SUPABASE_ANON_KEY,
  isCustom: !!customDB
});
