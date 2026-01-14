import { Redirect } from 'expo-router';
import { useFinance } from '@/contexts/FinanceContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AppColors } from '@/constants/colors';

export default function Index() {
  const { isAuthenticated, hasCompletedOnboarding, isLoading } = useFinance();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/landing" />;
  }

  if (hasCompletedOnboarding) {
    return <Redirect href="/(tabs)/(home)/home" />;
  }

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
