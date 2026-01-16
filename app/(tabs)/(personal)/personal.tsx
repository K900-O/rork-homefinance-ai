import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Plus, 
  Bell, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Flame,
  ArrowRight,
  Zap,
  Shield,
} from 'lucide-react-native';
import { usePersonal } from '@/contexts/PersonalContext';
import { useFinance } from '@/contexts/FinanceContext';
import { useAppMode } from '@/contexts/AppModeContext';
import { ACTIVITY_COLORS } from '@/constants/personalTypes';
import type { Activity, Habit } from '@/constants/personalTypes';
import AddActivityModal from '@/components/AddActivityModal';
import { sfProDisplayBold, sfProDisplayMedium, sfProDisplayRegular } from '@/constants/Typography';
import { BlueGlow } from '@/components/BlueGlow';

export default function PersonalHomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useFinance();
  const { toggleMode } = useAppMode();
  const { 
    dailySummary, 
    getTodayActivities, 
    goodHabits,
    badHabits,
    completeActivity,
    completeHabitForToday,
    logSuccessBadHabit,
    isHabitCompletedToday,
    isBadHabitSuccessToday,
  } = usePersonal();
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={styles.container}>
      <BlueGlow />
      
      <Animated.View style={[
        styles.animatedContainer, 
        { 
          opacity: fadeAnim, 
          transform: [{ translateY: slideAnim }],
          paddingTop: insets.top 
        }
      ]}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }} 
              style={styles.avatar} 
            />
            <View>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{user?.name || 'User'}!</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.modeButton} onPress={toggleMode}>
              <Text style={styles.modeButtonText}>$</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Bell color="#FFF" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFF" />}
        >
          <View style={styles.statsSection}>
            <LinearGradient
              colors={['#18181B', '#09090B']}
              style={styles.statsCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.statsHeader}>
                <View style={styles.statsIconContainer}>
                  <Zap color="#F59E0B" size={24} fill="#F59E0B" />
                </View>
                <Text style={styles.statsTitle}>Todays Progress</Text>
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{dailySummary.completedActivities}</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{dailySummary.totalActivities}</Text>
                  <Text style={styles.statLabel}>Total Tasks</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{dailySummary.productivityScore}%</Text>
                  <Text style={styles.statLabel}>Score</Text>
                </View>
              </View>

              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBg}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { width: `${Math.min(dailySummary.productivityScore, 100)}%` }
                    ]} 
                  />
                </View>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.habitsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Good Habits</Text>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>See All</Text>
                <ArrowRight size={14} color="#71717A" />
              </TouchableOpacity>
            </View>

            {goodHabits.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.habitsScroll}>
                {goodHabits.map((habit) => (
                  <HabitCard 
                    key={habit.id} 
                    habit={habit} 
                    isCompleted={isHabitCompletedToday(habit.id)}
                    onComplete={() => completeHabitForToday(habit.id)}
                  />
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyHabits}>
                <Text style={styles.emptyText}>No good habits yet</Text>
                <Text style={styles.emptySubtext}>Go to Habits tab to add some</Text>
              </View>
            )}
          </View>

          <View style={styles.habitsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Breaking Habits</Text>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>See All</Text>
                <ArrowRight size={14} color="#71717A" />
              </TouchableOpacity>
            </View>

            {badHabits.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.habitsScroll}>
                {badHabits.map((habit) => (
                  <BadHabitHomeCard 
                    key={habit.id} 
                    habit={habit} 
                    isSuccessToday={isBadHabitSuccessToday(habit.id)}
                    onLogSuccess={() => logSuccessBadHabit(habit.id)}
                  />
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyHabits}>
                <Text style={styles.emptyText}>No habits to break</Text>
                <Text style={styles.emptySubtext}>Go to Habits tab to add some</Text>
              </View>
            )}
          </View>

          <View style={styles.activitiesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Todays Activities</Text>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>See All</Text>
                <ArrowRight size={14} color="#71717A" />
              </TouchableOpacity>
            </View>

            <View style={styles.activitiesList}>
              {getTodayActivities.length > 0 ? (
                getTodayActivities.slice(0, 5).map((activity) => (
                  <ActivityItem 
                    key={activity.id} 
                    activity={activity}
                    onComplete={() => completeActivity(activity.id)}
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Clock size={48} color="#333" />
                  <Text style={styles.emptyStateText}>No activities for today</Text>
                  <Text style={styles.emptyStateSubtext}>Tap + to add your first activity</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </Animated.View>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.8}
      >
        <Plus color="#000" size={32} />
      </TouchableOpacity>

      <AddActivityModal visible={showAddModal} onClose={() => setShowAddModal(false)} />
    </View>
  );
}

function HabitCard({ 
  habit, 
  isCompleted, 
  onComplete 
}: { 
  habit: Habit; 
  isCompleted: boolean;
  onComplete: () => void;
}) {
  return (
    <TouchableOpacity 
      style={[
        styles.habitCard, 
        { borderColor: isCompleted ? '#10B981' : habit.color }
      ]}
      onPress={onComplete}
      activeOpacity={0.8}
    >
      <View style={[styles.habitIconBg, { backgroundColor: habit.color + '20' }]}>
        {isCompleted ? (
          <CheckCircle2 size={24} color="#10B981" fill="#10B981" />
        ) : (
          <Circle size={24} color={habit.color} />
        )}
      </View>
      <Text style={[styles.habitTitle, isCompleted && styles.habitTitleCompleted]}>
        {habit.title}
      </Text>
      <View style={styles.streakContainer}>
        <Flame size={14} color="#F59E0B" />
        <Text style={styles.streakText}>{habit.currentStreak}</Text>
      </View>
    </TouchableOpacity>
  );
}

function BadHabitHomeCard({ 
  habit, 
  isSuccessToday, 
  onLogSuccess 
}: { 
  habit: Habit & { daysClean: number }; 
  isSuccessToday: boolean;
  onLogSuccess: () => void;
}) {
  return (
    <TouchableOpacity 
      style={[
        styles.badHabitCard, 
        { borderColor: isSuccessToday ? '#10B981' : '#EF4444' }
      ]}
      onPress={onLogSuccess}
      activeOpacity={0.8}
      disabled={isSuccessToday}
    >
      <View style={[styles.habitIconBg, { backgroundColor: '#EF444420' }]}>
        {isSuccessToday ? (
          <CheckCircle2 size={24} color="#10B981" fill="#10B981" />
        ) : (
          <Shield size={24} color="#EF4444" />
        )}
      </View>
      <Text style={[styles.habitTitle, isSuccessToday && styles.habitTitleCompleted]} numberOfLines={1}>
        {habit.title}
      </Text>
      <View style={styles.daysCleanContainer}>
        <Text style={styles.daysCleanText}>{habit.daysClean} days</Text>
      </View>
    </TouchableOpacity>
  );
}

function ActivityItem({ 
  activity, 
  onComplete 
}: { 
  activity: Activity;
  onComplete: () => void;
}) {
  const isCompleted = activity.status === 'completed';
  const categoryColor = ACTIVITY_COLORS[activity.category] || '#A1A1AA';

  return (
    <TouchableOpacity 
      style={styles.activityItem}
      onPress={onComplete}
      activeOpacity={0.8}
    >
      <View style={[styles.activityIndicator, { backgroundColor: categoryColor }]} />
      <TouchableOpacity 
        style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}
        onPress={onComplete}
      >
        {isCompleted && <CheckCircle2 size={20} color="#10B981" fill="#10B981" />}
      </TouchableOpacity>
      <View style={styles.activityInfo}>
        <Text style={[styles.activityTitle, isCompleted && styles.activityTitleCompleted]}>
          {activity.title}
        </Text>
        <View style={styles.activityMeta}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {activity.category}
            </Text>
          </View>
          {activity.startTime && (
            <View style={styles.timeContainer}>
              <Clock size={12} color="#71717A" />
              <Text style={styles.timeText}>
                {new Date(activity.startTime).toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </Text>
            </View>
          )}
        </View>
      </View>
      {activity.priority === 'high' && (
        <View style={styles.priorityBadge}>
          <Text style={styles.priorityText}>!</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  animatedContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#333',
  },
  greeting: {
    fontFamily: sfProDisplayRegular,
    fontSize: 14,
    color: '#A1A1AA',
  },
  userName: {
    fontFamily: sfProDisplayBold,
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modeButtonText: {
    fontFamily: sfProDisplayBold,
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#000',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#18181B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  content: {
    flex: 1,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statsCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  statsIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F59E0B20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsTitle: {
    fontFamily: sfProDisplayBold,
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#333',
  },
  statValue: {
    fontFamily: sfProDisplayBold,
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: sfProDisplayRegular,
    fontSize: 12,
    color: '#71717A',
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#27272A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
  habitsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: sfProDisplayBold,
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontFamily: sfProDisplayRegular,
    fontSize: 14,
    color: '#71717A',
  },
  habitsScroll: {
    paddingLeft: 20,
  },
  habitCard: {
    width: 120,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#18181B',
    marginRight: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  habitIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  habitTitle: {
    fontFamily: sfProDisplayMedium,
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  habitTitleCompleted: {
    color: '#71717A',
    textDecorationLine: 'line-through',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakText: {
    fontFamily: sfProDisplayBold,
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#F59E0B',
  },
  emptyHabits: {
    marginHorizontal: 20,
    padding: 24,
    backgroundColor: '#18181B',
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#71717A',
    marginBottom: 4,
  },
  emptySubtext: {
    fontFamily: sfProDisplayRegular,
    fontSize: 14,
    color: '#52525B',
  },
  badHabitCard: {
    width: 120,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#18181B',
    marginRight: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  daysCleanContainer: {
    backgroundColor: '#10B98120',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  daysCleanText: {
    fontFamily: sfProDisplayBold,
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#10B981',
  },
  activitiesSection: {
    paddingBottom: 120,
  },
  activitiesList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  activityIndicator: {
    position: 'absolute',
    left: 0,
    top: 12,
    bottom: 12,
    width: 4,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#52525B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    borderColor: '#10B981',
    backgroundColor: 'transparent',
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontFamily: sfProDisplayMedium,
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  activityTitleCompleted: {
    color: '#71717A',
    textDecorationLine: 'line-through',
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 11,
    fontWeight: '600' as const,
    textTransform: 'capitalize',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontFamily: sfProDisplayRegular,
    fontSize: 12,
    color: '#71717A',
  },
  priorityBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityText: {
    fontFamily: sfProDisplayBold,
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#71717A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontFamily: sfProDisplayRegular,
    fontSize: 14,
    color: '#52525B',
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
});
