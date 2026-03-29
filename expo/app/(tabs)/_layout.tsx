import { Tabs } from "expo-router";
import React from "react";
import { View, StyleSheet } from "react-native";
import { useAppMode } from "@/contexts/AppModeContext";
import {
  GlassHomeIcon,
  GlassTransactionsIcon,
  GlassOptimizerIcon,
  GlassGoalsIcon,
  GlassInsightsIcon,
  GlassScheduleIcon,
  GlassHabitsIcon,
  GlassCoachIcon,
  GlassProfileIcon,
} from "@/components/GlassmorphicIcons";

export default function TabLayout() {
  const { isFinancialMode } = useAppMode();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#A1A1AA',
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <View style={styles.tabBackground} />
        ),
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          href: isFinancialMode ? "/(tabs)/(home)/home" : null,
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <GlassHomeIcon size={28} focused={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          href: isFinancialMode ? "/(tabs)/transactions" : null,
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <GlassTransactionsIcon size={28} focused={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="optimizer"
        options={{
          href: isFinancialMode ? "/(tabs)/optimizer" : null,
          tabBarIcon: () => (
            <View style={[styles.optimizerButton]}>
              <GlassOptimizerIcon size={28} focused={true} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          href: isFinancialMode ? "/(tabs)/goals" : null,
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <GlassGoalsIcon size={28} focused={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          href: isFinancialMode ? "/(tabs)/insights" : null,
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <GlassInsightsIcon size={28} focused={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="(personal)"
        options={{
          href: !isFinancialMode ? "/(tabs)/(personal)/personal" : null,
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <GlassHomeIcon size={28} focused={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          href: !isFinancialMode ? "/(tabs)/schedule" : null,
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <GlassScheduleIcon size={28} focused={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          href: !isFinancialMode ? "/(tabs)/habits" : null,
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <GlassHabitsIcon size={28} focused={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          href: !isFinancialMode ? "/(tabs)/coach" : null,
          tabBarIcon: () => (
            <View style={[styles.coachButton]}>
              <GlassCoachIcon size={28} focused={true} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <GlassProfileIcon size={28} focused={focused} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 85,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    paddingTop: 10,
  },
  tabBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(219, 234, 254, 0.5)',
  },
  optimizerButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  coachButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
});
