import { Redirect } from 'expo-router';
import { useFinance } from '@/contexts/FinanceContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAppMode } from '@/contexts/AppModeContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AppColors } from '@/constants/colors';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Index() {
  const { isLoading: authLoading, isAuthenticated: authIsAuthenticated, user } = useAuth();
  const { hasCompletedOnboarding, isLoading: financeLoading } = useFinance();
  const { mode, isLoading: modeLoading } = useAppMode();
  const [preferredMode, setPreferredMode] = useState<'financial' | 'personal' | 'both' | null>(null);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  useEffect(() => {
    const checkUserProfile = async () => {
      if (authIsAuthenticated && user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('preferred_mode, has_completed_onboarding')
            .eq('user_id', user.id)
            .single();
          
          if (profile) {
            setPreferredMode(profile.preferred_mode as 'financial' | 'personal' | 'both');
          }
        } catch (error) {
          console.error('Error checking user profile:', error);
        }
      }
      setIsCheckingProfile(false);
    };

    checkUserProfile();
  }, [authIsAuthenticated, user]);

  console.log('Index - authLoading:', authLoading, 'authIsAuthenticated:', authIsAuthenticated, 'financeLoading:', financeLoading, 'preferredMode:', preferredMode);

  if (authLoading || modeLoading || isCheckingProfile) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  if (!authIsAuthenticated) {
    console.log('Index - Redirecting to landing (not authenticated)');
    return <Redirect href="/landing" />;
  }

  if (financeLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  if (hasCompletedOnboarding && preferredMode) {
    console.log('Index - Redirecting to home (onboarding complete), preferredMode:', preferredMode);
    
    if (preferredMode === 'personal') {
      return <Redirect href="/(tabs)/(personal)/personal" />;
    } else {
      return <Redirect href="/(tabs)/(home)/home" />;
    }
  }

  console.log('Index - Redirecting to onboarding');
  return <Redirect href="/onboarding" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.background,
  },
});
