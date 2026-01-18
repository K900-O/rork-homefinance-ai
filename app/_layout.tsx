import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FinanceProvider } from "@/contexts/FinanceContext";
import { PersonalProvider } from "@/contexts/PersonalContext";
import { AppModeProvider } from "@/contexts/AppModeContext";
import { trpc, trpcClient } from "@/lib/trpc";
import ModeTransitionOverlay from "@/components/ModeTransitionOverlay";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack 
      screenOptions={{ 
        headerBackTitle: "Back",
        animation: 'slide_from_right',
        animationDuration: 350,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="landing" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen 
        name="login" 
        options={{ 
          headerShown: false, 
          animation: 'slide_from_bottom',
          animationDuration: 400,
        }} 
      />
      <Stack.Screen 
        name="signup" 
        options={{ 
          headerShown: false, 
          animation: 'slide_from_bottom',
          animationDuration: 400,
        }} 
      />
      <Stack.Screen 
        name="onboarding" 
        options={{ 
          headerShown: false, 
          animation: 'fade_from_bottom',
          animationDuration: 500,
        }} 
      />
      <Stack.Screen 
        name="(tabs)" 
        options={{ 
          headerShown: false, 
          animation: 'fade',
          animationDuration: 300,
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AppModeProvider>
          <FinanceProvider>
            <PersonalProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <RootLayoutNav />
                <ModeTransitionOverlay />
              </GestureHandlerRootView>
            </PersonalProvider>
          </FinanceProvider>
        </AppModeProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
