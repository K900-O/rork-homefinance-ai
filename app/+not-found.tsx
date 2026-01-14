import { Link, Stack } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { AppColors } from '@/constants/colors';
import { fontFamily } from '@/constants/Typography';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn&apos;t exist.</Text>
        <Link href="/onboarding" asChild style={styles.link}>
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: AppColors.background,
  },
  title: {
    fontFamily,
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginBottom: 16,
    color: AppColors.textPrimary,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontFamily,
    fontSize: 14,
    color: AppColors.primary,
    textDecorationLine: 'underline' as const,
  },
});
