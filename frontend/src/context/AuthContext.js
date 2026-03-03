import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  useEffect(() => {
    // Check for existing session on mount
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        }
      } catch (err) {
        console.error('Session error:', err);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        if (session?.user) {
          setUser(session.user);
          const profileData = await fetchUserProfile(session.user.id);
          
          // Check if phone number is missing - show phone modal
          if (profileData && !profileData.phone_number) {
            setShowPhoneModal(true);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Profile doesn't exist yet, create it
        if (error.code === 'PGRST116') {
          const { data: userData } = await supabase.auth.getUser();
          const newProfile = {
            id: userId,
            email: userData?.user?.email,
            full_name: userData?.user?.user_metadata?.full_name || userData?.user?.user_metadata?.name || '',
            avatar_url: userData?.user?.user_metadata?.avatar_url || userData?.user?.user_metadata?.picture || '',
          };
          
          const { data: insertedProfile, error: insertError } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select()
            .single();
          
          if (!insertError) {
            setProfile(insertedProfile);
            return insertedProfile;
          }
        }
        throw error;
      }
      
      setProfile(data);
      return data;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  };

  const signUpWithEmail = async (email, password, metadata = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata.full_name || '',
            phone_number: metadata.phone_number || '',
          },
        },
      });
      if (error) throw error;
      
      // Update profile with phone number
      if (data.user && metadata.phone_number) {
        await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: email,
            full_name: metadata.full_name || '',
            phone_number: metadata.phone_number,
          });
      }
      
      return data;
    } catch (err) {
      throw err;
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    } catch (err) {
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/emi-simulator`,
        },
      });
      if (error) throw error;
      return data;
    } catch (err) {
      throw err;
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in');

      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      
      // Close phone modal if phone was updated
      if (updates.phone_number) {
        setShowPhoneModal(false);
      }
      
      return data;
    } catch (err) {
      throw err;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
    } catch (err) {
      throw err;
    }
  };

  const openAuthModal = () => {
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  const closePhoneModal = () => {
    setShowPhoneModal(false);
  };

  // Check if user needs to provide phone number
  const needsPhoneNumber = user && profile && !profile.phone_number;

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile,
      loading, 
      signUpWithEmail,
      signInWithEmail,
      signInWithGoogle,
      updateProfile,
      signOut, 
      isAuthenticated: !!user,
      needsPhoneNumber,
      showAuthModal,
      openAuthModal,
      closeAuthModal,
      showPhoneModal,
      closePhoneModal,
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
