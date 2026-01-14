import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Activity, Habit, DailySummary, ActivityCategory } from '@/constants/personalTypes';

const STORAGE_KEYS = {
  ACTIVITIES: '@domusiq_activities',
  HABITS: '@domusiq_habits',
};

export const [PersonalProvider, usePersonal] = createContextHook(() => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [activitiesData, habitsData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ACTIVITIES),
        AsyncStorage.getItem(STORAGE_KEYS.HABITS),
      ]);

      if (activitiesData) {
        setActivities(JSON.parse(activitiesData));
      }

      if (habitsData) {
        setHabits(JSON.parse(habitsData));
      }
    } catch (error) {
      console.error('Error loading personal data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveActivities = async (newActivities: Activity[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(newActivities));
      setActivities(newActivities);
    } catch (error) {
      console.error('Error saving activities:', error);
    }
  };

  const saveHabits = async (newHabits: Habit[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(newHabits));
      setHabits(newHabits);
    } catch (error) {
      console.error('Error saving habits:', error);
    }
  };

  const addActivity = useCallback((activity: Omit<Activity, 'id' | 'createdAt'>) => {
    const newActivity: Activity = {
      ...activity,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    const updated = [newActivity, ...activities];
    saveActivities(updated);
  }, [activities]);

  const updateActivity = useCallback((id: string, updates: Partial<Activity>) => {
    const updated = activities.map(a => a.id === id ? { ...a, ...updates } : a);
    saveActivities(updated);
  }, [activities]);

  const deleteActivity = useCallback((id: string) => {
    const updated = activities.filter(a => a.id !== id);
    saveActivities(updated);
  }, [activities]);

  const completeActivity = useCallback((id: string) => {
    const updated = activities.map(a => 
      a.id === id ? { ...a, status: 'completed' as const, completedAt: new Date().toISOString() } : a
    );
    saveActivities(updated);
  }, [activities]);

  const addHabit = useCallback((habit: Omit<Habit, 'id' | 'createdAt' | 'currentStreak' | 'longestStreak' | 'completedDates' | 'successDates' | 'daysClean' | 'totalRelapses'>) => {
    const newHabit: Habit = {
      ...habit,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      currentStreak: 0,
      longestStreak: 0,
      completedDates: [],
      successDates: [],
      daysClean: 0,
      totalRelapses: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = [...habits, newHabit];
    saveHabits(updated);
  }, [habits]);

  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    const updated = habits.map(h => h.id === id ? { ...h, ...updates } : h);
    saveHabits(updated);
  }, [habits]);

  const deleteHabit = useCallback((id: string) => {
    const updated = habits.filter(h => h.id !== id);
    saveHabits(updated);
  }, [habits]);

  const completeHabitForToday = useCallback((id: string) => {
    const today = new Date().toISOString().split('T')[0];
    const updated = habits.map(h => {
      if (h.id !== id) return h;
      
      if (h.completedDates.includes(today)) return h;
      
      const newCompletedDates = [...h.completedDates, today].sort();
      
      let newStreak = 1;
      const sortedDates = newCompletedDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      
      for (let i = 0; i < sortedDates.length - 1; i++) {
        const current = new Date(sortedDates[i]);
        const next = new Date(sortedDates[i + 1]);
        const diffDays = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          newStreak++;
        } else {
          break;
        }
      }
      
      return {
        ...h,
        completedDates: newCompletedDates,
        currentStreak: newStreak,
        longestStreak: Math.max(h.longestStreak, newStreak),
      };
    });
    saveHabits(updated);
  }, [habits]);

  const relapseBadHabit = useCallback((id: string) => {
    const today = new Date().toISOString().split('T')[0];
    const updated = habits.map(h => {
      if (h.id !== id || h.type !== 'bad') return h;
      
      return {
        ...h,
        lastRelapsedDate: today,
        totalRelapses: h.totalRelapses + 1,
        daysClean: 0,
        currentStreak: 0,
      };
    });
    saveHabits(updated);
  }, [habits]);

  const calculateDaysClean = useCallback((habit: Habit) => {
    if (habit.type !== 'bad') return 0;
    
    const lastRelapse = habit.lastRelapsedDate;
    const createdAt = habit.createdAt.split('T')[0];
    const startDate = lastRelapse || createdAt;
    
    const start = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }, []);

  const isHabitCompletedToday = useCallback((id: string) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return false;
    const today = new Date().toISOString().split('T')[0];
    return habit.completedDates.includes(today);
  }, [habits]);

  const logSuccessBadHabit = useCallback((id: string) => {
    const today = new Date().toISOString().split('T')[0];
    const updated = habits.map(h => {
      if (h.id !== id || h.type !== 'bad') return h;
      
      const successDates = h.successDates || [];
      if (successDates.includes(today)) return h;
      
      const newSuccessDates = [...successDates, today].sort();
      
      let newStreak = 1;
      const sortedDates = newSuccessDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      
      for (let i = 0; i < sortedDates.length - 1; i++) {
        const current = new Date(sortedDates[i]);
        const next = new Date(sortedDates[i + 1]);
        const diffDays = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          newStreak++;
        } else {
          break;
        }
      }
      
      return {
        ...h,
        successDates: newSuccessDates,
        currentStreak: newStreak,
        longestStreak: Math.max(h.longestStreak, newStreak),
      };
    });
    saveHabits(updated);
  }, [habits]);

  const isBadHabitSuccessToday = useCallback((id: string) => {
    const habit = habits.find(h => h.id === id);
    if (!habit || habit.type !== 'bad') return false;
    const today = new Date().toISOString().split('T')[0];
    const successDates = habit.successDates || [];
    return successDates.includes(today);
  }, [habits]);

  const getTodayActivities = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return activities.filter(a => a.date.startsWith(today));
  }, [activities]);

  const getActivitiesForDate = useCallback((date: string) => {
    return activities.filter(a => a.date.startsWith(date));
  }, [activities]);

  const dailySummary = useMemo<DailySummary>(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayActivities = activities.filter(a => a.date.startsWith(today));
    const completedToday = todayActivities.filter(a => a.status === 'completed');
    
    const totalDuration = todayActivities.reduce((sum, a) => sum + (a.duration || 0), 0);
    
    const categoryMap = new Map<ActivityCategory, { count: number; duration: number }>();
    todayActivities.forEach(a => {
      const current = categoryMap.get(a.category) || { count: 0, duration: 0 };
      categoryMap.set(a.category, {
        count: current.count + 1,
        duration: current.duration + (a.duration || 0),
      });
    });
    
    const completionRate = todayActivities.length > 0 
      ? (completedToday.length / todayActivities.length) * 100 
      : 0;
    
    const habitsCompletedToday = habits.filter(h => {
      const todayStr = today;
      return h.completedDates.includes(todayStr);
    }).length;
    
    const habitCompletionRate = habits.length > 0 
      ? (habitsCompletedToday / habits.length) * 100 
      : 0;
    
    const productivityScore = Math.round((completionRate * 0.6) + (habitCompletionRate * 0.4));
    
    return {
      date: today,
      totalActivities: todayActivities.length,
      completedActivities: completedToday.length,
      totalDuration,
      productivityScore,
      categoryBreakdown: Array.from(categoryMap.entries()).map(([category, data]) => ({
        category,
        ...data,
      })),
    };
  }, [activities, habits]);

  const upcomingActivities = useMemo(() => {
    const now = new Date();
    return activities
      .filter(a => {
        const activityDate = new Date(a.date);
        return activityDate >= now && a.status !== 'completed' && a.status !== 'cancelled';
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [activities]);

  const activeHabits = useMemo(() => {
    return habits.filter(h => h.isActive);
  }, [habits]);

  const goodHabits = useMemo(() => {
    return habits.filter(h => h.isActive && h.type === 'good');
  }, [habits]);

  const badHabits = useMemo(() => {
    return habits.filter(h => h.isActive && h.type === 'bad').map(h => ({
      ...h,
      daysClean: calculateDaysClean(h),
    }));
  }, [habits, calculateDaysClean]);

  return useMemo(() => ({
    activities,
    habits,
    isLoading,
    addActivity,
    updateActivity,
    deleteActivity,
    completeActivity,
    addHabit,
    updateHabit,
    deleteHabit,
    completeHabitForToday,
    relapseBadHabit,
    logSuccessBadHabit,
    isHabitCompletedToday,
    isBadHabitSuccessToday,
    getTodayActivities,
    getActivitiesForDate,
    dailySummary,
    upcomingActivities,
    activeHabits,
    goodHabits,
    badHabits,
  }), [
    activities,
    habits,
    isLoading,
    addActivity,
    updateActivity,
    deleteActivity,
    completeActivity,
    addHabit,
    updateHabit,
    deleteHabit,
    completeHabitForToday,
    relapseBadHabit,
    logSuccessBadHabit,
    isHabitCompletedToday,
    isBadHabitSuccessToday,
    getTodayActivities,
    getActivitiesForDate,
    dailySummary,
    upcomingActivities,
    activeHabits,
    goodHabits,
    badHabits,
  ]);
});
