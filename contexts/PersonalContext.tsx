import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Activity, Habit, DailySummary, ActivityCategory } from '@/constants/personalTypes';

export const [PersonalProvider, usePersonal] = createContextHook(() => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      const [activitiesResult, habitsResult] = await Promise.all([
        supabase
          .from('activities')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false }),
        supabase
          .from('habits')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      if (activitiesResult.data) {
        const mappedActivities: Activity[] = activitiesResult.data.map(a => ({
          id: a.id,
          title: a.title,
          description: a.description || undefined,
          category: a.category as ActivityCategory,
          priority: a.priority as 'high' | 'medium' | 'low',
          status: a.status as 'pending' | 'in_progress' | 'completed' | 'cancelled',
          startTime: a.start_time || undefined,
          endTime: a.end_time || undefined,
          date: a.date,
          duration: a.duration || undefined,
          location: a.location || undefined,
          isAllDay: a.is_all_day,
          reminders: a.reminders || [],
          tags: a.tags || [],
          createdAt: a.created_at,
          completedAt: a.completed_at || undefined,
        }));
        setActivities(mappedActivities);
      }

      if (habitsResult.data) {
        const mappedHabits: Habit[] = habitsResult.data.map(h => ({
          id: h.id,
          title: h.title,
          description: h.description || undefined,
          category: h.category as ActivityCategory,
          type: h.type as 'good' | 'bad',
          frequency: h.frequency as 'daily' | 'weekly' | 'monthly',
          targetCount: h.target_count,
          currentStreak: h.current_streak,
          longestStreak: h.longest_streak,
          completedDates: h.completed_dates || [],
          successDates: h.success_dates || [],
          lastRelapsedDate: h.last_relapsed_date || undefined,
          totalRelapses: h.total_relapses,
          daysClean: h.days_clean,
          color: h.color,
          icon: h.icon,
          reminders: h.reminders || [],
          createdAt: h.created_at,
          isActive: h.is_active,
        }));
        setHabits(mappedHabits);
      }
    } catch (error) {
      console.error('Error loading personal data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addActivity = useCallback(async (activity: Omit<Activity, 'id' | 'createdAt'>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert({
          user_id: user.id,
          title: activity.title,
          description: activity.description,
          category: activity.category,
          priority: activity.priority,
          status: activity.status,
          start_time: activity.startTime,
          end_time: activity.endTime,
          date: activity.date,
          duration: activity.duration,
          location: activity.location,
          is_all_day: activity.isAllDay,
          reminders: activity.reminders || [],
          tags: activity.tags || [],
          completed_at: activity.completedAt,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newActivity: Activity = {
          id: data.id,
          title: data.title,
          description: data.description || undefined,
          category: data.category as ActivityCategory,
          priority: data.priority as 'high' | 'medium' | 'low',
          status: data.status as 'pending' | 'in_progress' | 'completed' | 'cancelled',
          startTime: data.start_time || undefined,
          endTime: data.end_time || undefined,
          date: data.date,
          duration: data.duration || undefined,
          location: data.location || undefined,
          isAllDay: data.is_all_day,
          reminders: data.reminders || [],
          tags: data.tags || [],
          createdAt: data.created_at,
          completedAt: data.completed_at || undefined,
        };
        setActivities(prev => [newActivity, ...prev]);
      }
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  }, [user]);

  const updateActivity = useCallback(async (id: string, updates: Partial<Activity>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('activities')
        .update({
          title: updates.title,
          description: updates.description,
          category: updates.category,
          priority: updates.priority,
          status: updates.status,
          start_time: updates.startTime,
          end_time: updates.endTime,
          date: updates.date,
          duration: updates.duration,
          location: updates.location,
          is_all_day: updates.isAllDay,
          reminders: updates.reminders,
          tags: updates.tags,
          completed_at: updates.completedAt,
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setActivities(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  }, [user]);

  const deleteActivity = useCallback(async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setActivities(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  }, [user]);

  const completeActivity = useCallback(async (id: string) => {
    if (!user) return;
    
    const completedAt = new Date().toISOString();
    
    try {
      const { error } = await supabase
        .from('activities')
        .update({
          status: 'completed',
          completed_at: completedAt,
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setActivities(prev => prev.map(a => 
        a.id === id ? { ...a, status: 'completed' as const, completedAt } : a
      ));
    } catch (error) {
      console.error('Error completing activity:', error);
    }
  }, [user]);

  const addHabit = useCallback(async (habit: Omit<Habit, 'id' | 'createdAt' | 'currentStreak' | 'longestStreak' | 'completedDates' | 'successDates' | 'daysClean' | 'totalRelapses'>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          title: habit.title,
          description: habit.description,
          category: habit.category,
          type: habit.type,
          frequency: habit.frequency,
          target_count: habit.targetCount,
          current_streak: 0,
          longest_streak: 0,
          completed_dates: [],
          success_dates: [],
          days_clean: 0,
          total_relapses: 0,
          color: habit.color,
          icon: habit.icon,
          reminders: habit.reminders || [],
          is_active: habit.isActive,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newHabit: Habit = {
          id: data.id,
          title: data.title,
          description: data.description || undefined,
          category: data.category as ActivityCategory,
          type: data.type as 'good' | 'bad',
          frequency: data.frequency as 'daily' | 'weekly' | 'monthly',
          targetCount: data.target_count,
          currentStreak: data.current_streak,
          longestStreak: data.longest_streak,
          completedDates: data.completed_dates || [],
          successDates: data.success_dates || [],
          lastRelapsedDate: data.last_relapsed_date || undefined,
          totalRelapses: data.total_relapses,
          daysClean: data.days_clean,
          color: data.color,
          icon: data.icon,
          reminders: data.reminders || [],
          createdAt: data.created_at,
          isActive: data.is_active,
        };
        setHabits(prev => [...prev, newHabit]);
      }
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  }, [user]);

  const updateHabit = useCallback(async (id: string, updates: Partial<Habit>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('habits')
        .update({
          title: updates.title,
          description: updates.description,
          category: updates.category,
          type: updates.type,
          frequency: updates.frequency,
          target_count: updates.targetCount,
          current_streak: updates.currentStreak,
          longest_streak: updates.longestStreak,
          completed_dates: updates.completedDates,
          success_dates: updates.successDates,
          last_relapsed_date: updates.lastRelapsedDate,
          total_relapses: updates.totalRelapses,
          days_clean: updates.daysClean,
          color: updates.color,
          icon: updates.icon,
          reminders: updates.reminders,
          is_active: updates.isActive,
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
    } catch (error) {
      console.error('Error updating habit:', error);
    }
  }, [user]);

  const deleteHabit = useCallback(async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setHabits(prev => prev.filter(h => h.id !== id));
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  }, [user]);

  const completeHabitForToday = useCallback(async (id: string) => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const habit = habits.find(h => h.id === id);
    
    if (!habit || habit.completedDates.includes(today)) return;
    
    const newCompletedDates = [...habit.completedDates, today].sort();
    
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
    
    try {
      const { error } = await supabase
        .from('habits')
        .update({
          completed_dates: newCompletedDates,
          current_streak: newStreak,
          longest_streak: Math.max(habit.longestStreak, newStreak),
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setHabits(prev => prev.map(h => {
        if (h.id !== id) return h;
        return {
          ...h,
          completedDates: newCompletedDates,
          currentStreak: newStreak,
          longestStreak: Math.max(h.longestStreak, newStreak),
        };
      }));
    } catch (error) {
      console.error('Error completing habit:', error);
    }
  }, [user, habits]);

  const relapseBadHabit = useCallback(async (id: string) => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const habit = habits.find(h => h.id === id);
    
    if (!habit || habit.type !== 'bad') return;
    
    try {
      const { error } = await supabase
        .from('habits')
        .update({
          last_relapsed_date: today,
          total_relapses: habit.totalRelapses + 1,
          days_clean: 0,
          current_streak: 0,
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setHabits(prev => prev.map(h => {
        if (h.id !== id || h.type !== 'bad') return h;
        return {
          ...h,
          lastRelapsedDate: today,
          totalRelapses: h.totalRelapses + 1,
          daysClean: 0,
          currentStreak: 0,
        };
      }));
    } catch (error) {
      console.error('Error recording relapse:', error);
    }
  }, [user, habits]);

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

  const logSuccessBadHabit = useCallback(async (id: string) => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const habit = habits.find(h => h.id === id);
    
    if (!habit || habit.type !== 'bad') return;
    
    const successDates = habit.successDates || [];
    if (successDates.includes(today)) return;
    
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
    
    try {
      const { error } = await supabase
        .from('habits')
        .update({
          success_dates: newSuccessDates,
          current_streak: newStreak,
          longest_streak: Math.max(habit.longestStreak, newStreak),
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setHabits(prev => prev.map(h => {
        if (h.id !== id || h.type !== 'bad') return h;
        return {
          ...h,
          successDates: newSuccessDates,
          currentStreak: newStreak,
          longestStreak: Math.max(h.longestStreak, newStreak),
        };
      }));
    } catch (error) {
      console.error('Error logging success:', error);
    }
  }, [user, habits]);

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
