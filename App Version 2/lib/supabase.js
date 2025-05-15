// lib/supabase.js
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://jhziwykxnejkgmuksngm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impoeml3eWt4bmVqa2dtdWtzbmdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3NzAxOTAsImV4cCI6MjA2MjM0NjE5MH0.MpvVd1uWpvr6YrHE166Ne_K_fp2iDcbX-7QNAgG4jO4';

// Create a custom storage interface for AsyncStorage
const AsyncStorageAdapter = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Add an auth state change listener to help debug auth issues
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth event:', event);
  if (session) {
    console.log('User is authenticated with ID:', session.user.id);
  } else {
    console.log('No active session found');
  }
});