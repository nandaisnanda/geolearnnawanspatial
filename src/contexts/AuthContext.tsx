
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  username: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  tier_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  signInWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetch to avoid blocking auth state changes
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      console.log('Profile data:', data);

      // Properly type the profile data with validation
      const profileData: Profile = {
        id: data.id,
        username: data.username || '',
        email: data.email || '',
        full_name: data.full_name || '',
        avatar_url: data.avatar_url,
        tier_level: (['beginner', 'intermediate', 'advanced', 'expert'].includes(data.tier_level) 
          ? data.tier_level 
          : 'beginner') as 'beginner' | 'intermediate' | 'advanced' | 'expert',
        role: (['user', 'admin'].includes(data.role) 
          ? data.role 
          : 'user') as 'user' | 'admin',
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setProfile(profileData);
      console.log('Profile set:', profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      console.log('Attempting email sign-in for:', email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Email sign-in error:', error);
      }
      
      return { error };
    } catch (err) {
      console.error('Email sign-in exception:', err);
      return { error: err };
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    try {
      console.log('Attempting email sign-up for:', email);
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            username: email.split('@')[0]
          }
        }
      });
      
      if (error) {
        console.error('Email sign-up error:', error);
      }
      
      return { error };
    } catch (err) {
      console.error('Email sign-up exception:', err);
      return { error: err };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('Attempting password reset for:', email);
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });
      
      if (error) {
        console.error('Password reset error:', error);
      }
      
      return { error };
    } catch (err) {
      console.error('Password reset exception:', err);
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
      console.log('User signed out');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      signInWithEmail,
      signUpWithEmail,
      resetPassword,
      signOut,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
