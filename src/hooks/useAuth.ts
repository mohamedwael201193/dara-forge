import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';

export interface UserProfile {
  id: string;
  email: string;
}

export const useAuth = () => {
  const [user] = useState<UserProfile | null>(null);
  const [loading] = useState(false);
  const { toast } = useToast();

  // Stub out authentication functions
  const signUp = async (_email: string, _password: string, _userData: Partial<UserProfile>) => {
    toast({
      title: "Feature Disabled",
      description: "User sign-up is currently disabled.",
      variant: "destructive"
    });
    return { data: null, error: new Error("Sign up disabled") };
  };

  const signIn = async (_email: string, _password: string) => {
    toast({
      title: "Feature Disabled",
      description: "User sign-in is currently disabled.",
      variant: "destructive"
    });
    return { data: null, error: new Error("Sign in disabled") };
  };

  const signOut = async () => {
    toast({
      title: "Feature Disabled",
      description: "User sign-out is currently disabled.",
      variant: "destructive"
    });
  };

  const updateProfile = async (_updates: Partial<UserProfile>) => {
    toast({
      title: "Feature Disabled",
      description: "Profile updates are currently disabled.",
      variant: "destructive"
    });
    return { data: null, error: new Error("Profile update disabled") };
  };

  const fetchProfile = async (_userId: string) => {
    // Profile fetching is disabled
    return null;
  };

  return {
    user,
    profile: null, // Profile is not used without Supabase
    session: null, // Session is not used without Supabase
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    fetchProfile,
  };
};

