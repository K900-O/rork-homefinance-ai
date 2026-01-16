import { Tabs } from "expo-router";
import { Home, TrendingUp, Target, PieChart, Sparkles, Calendar, CheckSquare, MessageCircle, User } from "lucide-react-native";
import React from "react";
import { View, StyleSheet } from "react-native";
import { useAppMode } from "@/contexts/AppModeContext";

export default function TabLayout() {
  const { isFinancialMode } = useAppMode();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#52525B',
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
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Home color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          href: isFinancialMode ? "/(tabs)/transactions" : null,
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <TrendingUp color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="optimizer"
        options={{
          href: isFinancialMode ? "/(tabs)/optimizer" : null,
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.optimizerButton]}>
              <Sparkles color="#000" size={24} fill="#000" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          href: isFinancialMode ? "/(tabs)/goals" : null,
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Target color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          href: isFinancialMode ? "/(tabs)/insights" : null,
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <PieChart color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="(personal)"
        options={{
          href: !isFinancialMode ? "/(tabs)/(personal)/personal" : null,
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Home color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          href: !isFinancialMode ? "/(tabs)/schedule" : null,
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Calendar color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          href: !isFinancialMode ? "/(tabs)/habits" : null,
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <CheckSquare color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          href: !isFinancialMode ? "/(tabs)/coach" : null,
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.coachButton]}>
              <MessageCircle color="#000" size={24} fill="#000" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <User color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
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
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#18181B',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  activeIconContainer: {
    backgroundColor: '#18181B',
  },
  optimizerButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  coachButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
});
