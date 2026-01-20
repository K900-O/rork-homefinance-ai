import { Redirect } from 'expo-router';
import { useFinance } from '@/contexts/FinanceContext';
import { useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AppColors } from '@/constants/colors';

export default function Index() {
  const { isLoading: authLoading, isAuthenticated: authIsAuthenticated } = useAuth();
  const { hasCompletedOnboarding, isLoading: financeLoading } = useFinance();

  console.log('Index - authLoading:', authLoading, 'authIsAuthenticated:', authIsAuthenticated, 'financeLoading:', financeLoading);

  // Show loading only while auth is being checked
  if (authLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  // Not authenticated - go to landing
  if (!authIsAuthenticated) {
    console.log('Index - Redirecting to landing (not authenticated)');
    return <Redirect href="/landing" />;
  }

  // Authenticated but still loading finance data
  if (financeLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  // Authenticated and has completed onboarding - go to home
  if (hasCompletedOnboarding) {
    console.log('Index - Redirecting to home (onboarding complete)');
    return <Redirect href="/(tabs)/(home)/home" />;
  }

  // Authenticated but hasn't completed onboarding
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
