'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseBrowserClient, isSupabaseConfigured } from './client';
import { Profile, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password?: string) => Promise<{ error?: string }>;
  signUp: (email: string, password?: string, fullName?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  setDemoRole: (role: UserRole) => void;
  syncLocalProgressToSupabase: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isAdmin: false,
  isLoading: true,
  isConfigured: false,
  signIn: async () => ({}),
  signUp: async () => ({}),
  signOut: async () => {},
  signInWithGoogle: async () => ({}),
  setDemoRole: () => {},
  syncLocalProgressToSupabase: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const configured = isSupabaseConfigured();

  // Sync localStorage progress into Supabase user_progress table
  const syncLocalProgressToSupabase = async (activeUser?: User | null) => {
    const targetUser = activeUser || user;
    if (!targetUser || !configured) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    try {
      // Find all localStorage items for completed lessons
      const recordsToInsert: { user_id: string; course_slug: string; item_key: string; completed: boolean }[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cyber_lms_completed_')) {
          const courseSlug = key.replace('cyber_lms_completed_', '');
          try {
            const completedItems: string[] = JSON.parse(localStorage.getItem(key) || '[]');
            completedItems.forEach((itemKey) => {
              recordsToInsert.push({
                user_id: targetUser.id,
                course_slug: courseSlug,
                item_key: itemKey,
                completed: true,
              });
            });
          } catch {
            // ignore JSON parse error
          }
        }
      }

      if (recordsToInsert.length > 0) {
        // Upsert into Supabase user_progress
        await supabase
          .from('user_progress')
          .upsert(recordsToInsert, { onConflict: 'user_id,item_key' });
      }
    } catch (err) {
      console.warn('Could not sync localStorage progress to Supabase:', err);
    }
  };

  // Fetch or create profile
  const fetchProfile = async (supabase: SupabaseClient, currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (data && !error) {
        setProfile(data as Profile);
      } else {
        // Fallback default student profile
        const defaultProf: Profile = {
          id: currentUser.id,
          email: currentUser.email || '',
          full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0],
          role: 'student',
          created_at: new Date().toISOString(),
        };
        setProfile(defaultProf);
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    if (!configured) {
      // Check for saved demo session in localStorage
      setTimeout(() => {
        try {
          const savedDemo = localStorage.getItem('cyber_lms_demo_profile');
          if (savedDemo) {
            const parsed = JSON.parse(savedDemo);
            setProfile(parsed);
            setUser({
              id: parsed.id || 'demo-user-id',
              email: parsed.email,
              app_metadata: {},
              user_metadata: { full_name: parsed.full_name },
              aud: 'authenticated',
              created_at: parsed.created_at,
            } as User);
          }
        } catch {
          // ignore
        }
        setIsLoading(false);
      }, 0);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(supabase, session.user);
        syncLocalProgressToSupabase(session.user);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(supabase, session.user);
        await syncLocalProgressToSupabase(session.user);
      } else {
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [configured]);

  const signIn = async (email: string, password?: string) => {
    if (!configured) {
      // Demo login
      const demoRole: UserRole = email.toLowerCase().includes('admin') ? 'admin' : 'student';
      const demoUser: Profile = {
        id: 'demo-' + Math.random().toString(36).substring(2, 9),
        email,
        full_name: email.split('@')[0],
        role: demoRole,
        created_at: new Date().toISOString(),
      };
      setProfile(demoUser);
      setUser({
        id: demoUser.id,
        email: demoUser.email,
        app_metadata: {},
        user_metadata: { full_name: demoUser.full_name },
        aud: 'authenticated',
        created_at: demoUser.created_at,
      } as User);
      localStorage.setItem('cyber_lms_demo_profile', JSON.stringify(demoUser));
      return {};
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return { error: 'Supabase client unavailable' };

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: password || 'cyber-password-123',
    });

    if (error) return { error: error.message };
    return {};
  };

  const signUp = async (email: string, password?: string, fullName?: string) => {
    if (!configured) {
      return signIn(email, password);
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return { error: 'Supabase client unavailable' };

    const { error } = await supabase.auth.signUp({
      email,
      password: password || 'cyber-password-123',
      options: {
        data: {
          full_name: fullName || email.split('@')[0],
        },
      },
    });

    if (error) return { error: error.message };
    return {};
  };

  const signOut = async () => {
    if (!configured) {
      setUser(null);
      setProfile(null);
      localStorage.removeItem('cyber_lms_demo_profile');
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
  };

  const signInWithGoogle = async () => {
    if (!configured) {
      return signIn('google-user@cyberacademy.org');
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return { error: 'Supabase client unavailable' };

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) return { error: error.message };
    return {};
  };

  const setDemoRole = (role: UserRole) => {
    if (profile) {
      const updated = { ...profile, role };
      setProfile(updated);
      localStorage.setItem('cyber_lms_demo_profile', JSON.stringify(updated));
    }
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        isLoading,
        isConfigured: configured,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        setDemoRole,
        syncLocalProgressToSupabase: () => syncLocalProgressToSupabase(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
