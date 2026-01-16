import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Plus, 
  Flame, 
  Trophy, 
  CheckCircle2,
  Circle,
  Trash2,
  TrendingUp,
  Shield,
  AlertTriangle,
  Calendar,
} from 'lucide-react-native';
import { usePersonal } from '@/contexts/PersonalContext';
import { ACTIVITY_COLORS } from '@/constants/personalTypes';
import type { Habit } from '@/constants/personalTypes';
import AddHabitModal from '@/components/AddHabitModal';
import { sfProDisplayBold, sfProDisplayMedium, sfProDisplayRegular } from '@/constants/Typography';
import { BlueGlow } from '@/components/BlueGlow';
import { LinearGradient } from 'expo-linear-gradient';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function HabitsScreen() {
  const insets = useSafeAreaInsets();
  const { 
    goodHabits,
    badHabits,
    completeHabitForToday, 
    relapseBadHabit,
    logSuccessBadHabit,
    isHabitCompletedToday,
    isBadHabitSuccessToday,
    deleteHabit,
  } = usePersonal();
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'good' | 'bad'>('good');

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

  const handleDeleteHabit = (habit: Habit) => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteHabit(habit.id) },
      ]
    );
  };

  const handleRelapse = (habit: Habit) => {
    Alert.alert(
      'Log Relapse',
      `Did you relapse on "${habit.title}"? This will reset your clean streak.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes, Log It', style: 'destructive', onPress: () => relapseBadHabit(habit.id) },
      ]
    );
  };

  const handleLogSuccess = (habit: Habit) => {
    Alert.alert(
      'Log Success',
      `Great job resisting "${habit.title}" today! Keep going!`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Success', onPress: () => logSuccessBadHabit(habit.id) },
      ]
    );
  };

  const switchTab = (tab: 'good' | 'bad') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(tab);
  };

  const completedGoodToday = goodHabits.filter(h => isHabitCompletedToday(h.id)).length;
  const goodCompletionRate = goodHabits.length > 0 
    ? Math.round((completedGoodToday / goodHabits.length) * 100) 
    : 0;

  const totalGoodStreak = goodHabits.reduce((sum, h) => sum + h.currentStreak, 0);
  const longestGoodStreak = Math.max(...goodHabits.map(h => h.longestStreak), 0);

  const totalDaysClean = badHabits.reduce((sum, h) => sum + h.daysClean, 0);
  const longestCleanStreak = Math.max(...badHabits.map(h => h.daysClean), 0);
  const totalRelapses = badHabits.reduce((sum, h) => sum + h.totalRelapses, 0);

  return (
    <View style={styles.container}>
      <BlueGlow />
      <Animated.View style={[
        styles.contentContainer, 
        { 
          paddingTop: insets.top,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}>
        <View style={styles.header}>
          <Text style={styles.title}>Habits</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus color="#000" size={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'good' && styles.tabActiveGood]}
            onPress={() => switchTab('good')}
          >
            <TrendingUp size={18} color={activeTab === 'good' ? '#000' : '#71717A'} />
            <Text style={[styles.tabText, activeTab === 'good' && styles.tabTextActiveGood]}>
              Good Habits
            </Text>
            {goodHabits.length > 0 && (
              <View style={[styles.tabBadge, activeTab === 'good' && styles.tabBadgeActiveGood]}>
                <Text style={[styles.tabBadgeText, activeTab === 'good' && styles.tabBadgeTextActive]}>
                  {goodHabits.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'bad' && styles.tabActiveBad]}
            onPress={() => switchTab('bad')}
          >
            <Shield size={18} color={activeTab === 'bad' ? '#000' : '#71717A'} />
            <Text style={[styles.tabText, activeTab === 'bad' && styles.tabTextActiveBad]}>
              Breaking
            </Text>
            {badHabits.length > 0 && (
              <View style={[styles.tabBadge, activeTab === 'bad' && styles.tabBadgeActiveBad]}>
                <Text style={[styles.tabBadgeText, activeTab === 'bad' && styles.tabBadgeTextActive]}>
                  {badHabits.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFF" />}
        >
          {activeTab === 'good' ? (
            <>
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: '#F59E0B20' }]}>
                    <Flame size={20} color="#F59E0B" />
                  </View>
                  <Text style={styles.statValue}>{totalGoodStreak}</Text>
                  <Text style={styles.statLabel}>Total Streak</Text>
                </View>
                
                <View style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: '#10B98120' }]}>
                    <TrendingUp size={20} color="#10B981" />
                  </View>
                  <Text style={styles.statValue}>{goodCompletionRate}%</Text>
                  <Text style={styles.statLabel}>Today</Text>
                </View>
                
                <View style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: '#8B5CF620' }]}>
                    <Trophy size={20} color="#8B5CF6" />
                  </View>
                  <Text style={styles.statValue}>{longestGoodStreak}</Text>
                  <Text style={styles.statLabel}>Best Streak</Text>
                </View>
              </View>

              <View style={styles.todaySection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Today&apos;s Progress</Text>
                  <Text style={styles.progressText}>{completedGoodToday}/{goodHabits.length}</Text>
                </View>

                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={[styles.progressFill, { width: `${goodCompletionRate}%` }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>
              </View>

              <View style={styles.habitsList}>
                {goodHabits.length > 0 ? (
                  goodHabits.map((habit) => (
                    <GoodHabitCard
                      key={habit.id}
                      habit={habit}
                      isCompleted={isHabitCompletedToday(habit.id)}
                      onComplete={() => completeHabitForToday(habit.id)}
                      onDelete={() => handleDeleteHabit(habit)}
                    />
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <TrendingUp size={48} color="#10B981" />
                    <Text style={styles.emptyStateText}>No good habits yet</Text>
                    <Text style={styles.emptyStateSubtext}>Start building positive habits</Text>
                    <TouchableOpacity 
                      style={styles.emptyButton}
                      onPress={() => setShowAddModal(true)}
                    >
                      <Text style={styles.emptyButtonText}>Add Good Habit</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </>
          ) : (
            <>
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: '#10B98120' }]}>
                    <Shield size={20} color="#10B981" />
                  </View>
                  <Text style={styles.statValue}>{totalDaysClean}</Text>
                  <Text style={styles.statLabel}>Days Clean</Text>
                </View>
                
                <View style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: '#3B82F620' }]}>
                    <Calendar size={20} color="#3B82F6" />
                  </View>
                  <Text style={styles.statValue}>{longestCleanStreak}</Text>
                  <Text style={styles.statLabel}>Best Streak</Text>
                </View>
                
                <View style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: '#EF444420' }]}>
                    <AlertTriangle size={20} color="#EF4444" />
                  </View>
                  <Text style={styles.statValue}>{totalRelapses}</Text>
                  <Text style={styles.statLabel}>Relapses</Text>
                </View>
              </View>

              <View style={styles.motivationCard}>
                <Text style={styles.motivationText}>
                  Every day without these habits is a victory. Stay strong!
                </Text>
              </View>

              <View style={styles.habitsList}>
                {badHabits.length > 0 ? (
                  badHabits.map((habit) => (
                    <BadHabitCard
                      key={habit.id}
                      habit={habit}
                      isSuccessToday={isBadHabitSuccessToday(habit.id)}
                      onLogSuccess={() => handleLogSuccess(habit)}
                      onRelapse={() => handleRelapse(habit)}
                      onDelete={() => handleDeleteHabit(habit)}
                    />
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Shield size={48} color="#EF4444" />
                    <Text style={styles.emptyStateText}>No habits to break</Text>
                    <Text style={styles.emptyStateSubtext}>Track habits you want to quit</Text>
                    <TouchableOpacity 
                      style={[styles.emptyButton, styles.emptyButtonBad]}
                      onPress={() => setShowAddModal(true)}
                    >
                      <Text style={styles.emptyButtonText}>Add Bad Habit</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>

        <AddHabitModal visible={showAddModal} onClose={() => setShowAddModal(false)} />
      </Animated.View>
    </View>
  );
}

function GoodHabitCard({ 
  habit, 
  isCompleted, 
  onComplete,
  onDelete,
}: { 
  habit: Habit;
  isCompleted: boolean;
  onComplete: () => void;
  onDelete: () => void;
}) {
  const categoryColor = ACTIVITY_COLORS[habit.category] || habit.color || '#A1A1AA';

  const getWeekProgress = () => {
    const today = new Date();
    const weekDays: boolean[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      weekDays.push(habit.completedDates.includes(dateStr));
    }
    
    return weekDays;
  };

  const weekProgress = getWeekProgress();

  return (
    <View style={[styles.habitCard, { borderLeftColor: categoryColor }]}>
      <View style={styles.habitMain}>
        <TouchableOpacity 
          style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}
          onPress={onComplete}
        >
          {isCompleted ? (
            <CheckCircle2 size={28} color="#10B981" fill="#10B981" />
          ) : (
            <Circle size={28} color="#52525B" />
          )}
        </TouchableOpacity>
        
        <View style={styles.habitInfo}>
          <Text style={[styles.habitTitle, isCompleted && styles.habitTitleCompleted]}>
            {habit.title}
          </Text>
          <View style={styles.habitMeta}>
            <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
              <Text style={[styles.categoryText, { color: categoryColor }]}>
                {habit.category}
              </Text>
            </View>
            <View style={styles.streakBadge}>
              <Flame size={12} color="#F59E0B" />
              <Text style={styles.streakText}>{habit.currentStreak} day streak</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Trash2 size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.weekProgress}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
          <View key={index} style={styles.weekDay}>
            <Text style={styles.weekDayLabel}>{day}</Text>
            <View 
              style={[
                styles.weekDot, 
                weekProgress[index] && { backgroundColor: categoryColor }
              ]} 
            />
          </View>
        ))}
      </View>
    </View>
  );
}

function BadHabitCard({ 
  habit, 
  isSuccessToday,
  onLogSuccess,
  onRelapse,
  onDelete,
}: { 
  habit: Habit;
  isSuccessToday: boolean;
  onLogSuccess: () => void;
  onRelapse: () => void;
  onDelete: () => void;
}) {
  const daysClean = habit.daysClean;
  const milestone = daysClean >= 30 ? 30 : daysClean >= 7 ? 7 : daysClean >= 3 ? 3 : 1;
  const nextMilestone = milestone === 30 ? 60 : milestone === 7 ? 30 : milestone === 3 ? 7 : 3;
  const progress = Math.min((daysClean / nextMilestone) * 100, 100);

  const getMilestoneLabel = () => {
    if (daysClean >= 30) return '30+ days - Amazing!';
    if (daysClean >= 7) return '1 week strong!';
    if (daysClean >= 3) return '3 days - Great start!';
    if (daysClean >= 1) return 'Day ' + daysClean;
    return 'Start today';
  };

  return (
    <View style={styles.badHabitCard}>
      <View style={styles.badHabitHeader}>
        <View style={styles.badHabitLeft}>
          <View style={styles.badHabitIconWrap}>
            <Shield size={24} color="#EF4444" />
          </View>
          <View style={styles.badHabitInfo}>
            <Text style={styles.badHabitTitle}>{habit.title}</Text>
            <Text style={styles.badHabitCategory}>{habit.category}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Trash2 size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.daysCleanSection}>
        <Text style={styles.daysCleanLabel}>Days Clean</Text>
        <Text style={styles.daysCleanValue}>{daysClean}</Text>
        <Text style={styles.milestoneLabel}>{getMilestoneLabel()}</Text>
      </View>

      <View style={styles.badProgressContainer}>
        <View style={styles.badProgressBar}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={[styles.badProgressFill, { width: `${progress}%` }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
        <Text style={styles.badProgressText}>
          {daysClean} / {nextMilestone} days to next milestone
        </Text>
      </View>

      <View style={styles.badHabitStats}>
        <View style={styles.badStatItem}>
          <Text style={styles.badStatValue}>{habit.totalRelapses}</Text>
          <Text style={styles.badStatLabel}>Relapses</Text>
        </View>
        <View style={styles.badStatDivider} />
        <View style={styles.badStatItem}>
          <Text style={styles.badStatValue}>{habit.longestStreak || daysClean}</Text>
          <Text style={styles.badStatLabel}>Best Streak</Text>
        </View>
      </View>

      <View style={styles.badHabitActions}>
        <TouchableOpacity 
          style={[styles.successButton, isSuccessToday && styles.successButtonActive]} 
          onPress={onLogSuccess}
          disabled={isSuccessToday}
        >
          <CheckCircle2 size={16} color={isSuccessToday ? "#000" : "#10B981"} />
          <Text style={[styles.successButtonText, isSuccessToday && styles.successButtonTextActive]}>
            {isSuccessToday ? 'Success Logged!' : 'Log Success'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.relapseButton} onPress={onRelapse}>
          <AlertTriangle size={16} color="#EF4444" />
          <Text style={styles.relapseButtonText}>Log Relapse</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontFamily: sfProDisplayBold,
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#18181B',
  },
  tabActiveGood: {
    backgroundColor: '#10B981',
  },
  tabActiveBad: {
    backgroundColor: '#EF4444',
  },
  tabText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 14,
    fontWeight: '600',
    color: '#71717A',
  },
  tabTextActiveGood: {
    color: '#000',
  },
  tabTextActiveBad: {
    color: '#000',
  },
  tabBadge: {
    backgroundColor: '#27272A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabBadgeActiveGood: {
    backgroundColor: '#05966930',
  },
  tabBadgeActiveBad: {
    backgroundColor: '#DC262630',
  },
  tabBadgeText: {
    fontFamily: sfProDisplayBold,
    fontSize: 12,
    fontWeight: '600',
    color: '#71717A',
  },
  tabBadgeTextActive: {
    color: '#000',
  },
  content: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#18181B',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontFamily: sfProDisplayBold,
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: sfProDisplayRegular,
    fontSize: 11,
    color: '#71717A',
  },
  todaySection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: sfProDisplayBold,
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#27272A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  motivationCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#18181B',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  motivationText: {
    fontFamily: sfProDisplayRegular,
    fontSize: 14,
    color: '#A1A1AA',
    fontStyle: 'italic',
  },
  habitsList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 16,
  },
  habitCard: {
    backgroundColor: '#18181B',
    borderRadius: 20,
    padding: 20,
    borderLeftWidth: 4,
  },
  habitMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkbox: {
    marginRight: 16,
  },
  checkboxCompleted: {},
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontFamily: sfProDisplayBold,
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  habitTitleCompleted: {
    color: '#71717A',
    textDecorationLine: 'line-through',
  },
  habitMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
  },
  weekProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#27272A',
  },
  weekDay: {
    alignItems: 'center',
    gap: 8,
  },
  weekDayLabel: {
    fontFamily: sfProDisplayRegular,
    fontSize: 11,
    color: '#71717A',
    fontWeight: '500',
  },
  weekDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#27272A',
  },
  badHabitCard: {
    backgroundColor: '#18181B',
    borderRadius: 20,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  badHabitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  badHabitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  badHabitIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EF444420',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  badHabitInfo: {
    flex: 1,
  },
  badHabitTitle: {
    fontFamily: sfProDisplayBold,
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  badHabitCategory: {
    fontFamily: sfProDisplayRegular,
    fontSize: 13,
    color: '#71717A',
    textTransform: 'capitalize',
  },
  daysCleanSection: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#0F0F0F',
    borderRadius: 16,
    marginBottom: 16,
  },
  daysCleanLabel: {
    fontFamily: sfProDisplayRegular,
    fontSize: 12,
    color: '#71717A',
    marginBottom: 4,
  },
  daysCleanValue: {
    fontFamily: sfProDisplayBold,
    fontSize: 56,
    fontWeight: '700',
    color: '#10B981',
  },
  milestoneLabel: {
    fontFamily: sfProDisplayRegular,
    fontSize: 14,
    color: '#A1A1AA',
    marginTop: 4,
  },
  badProgressContainer: {
    marginBottom: 16,
  },
  badProgressBar: {
    height: 6,
    backgroundColor: '#27272A',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  badProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  badProgressText: {
    fontFamily: sfProDisplayRegular,
    fontSize: 12,
    color: '#52525B',
    textAlign: 'center',
  },
  badHabitStats: {
    flexDirection: 'row',
    backgroundColor: '#0F0F0F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  badStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  badStatDivider: {
    width: 1,
    backgroundColor: '#27272A',
  },
  badStatValue: {
    fontFamily: sfProDisplayBold,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  badStatLabel: {
    fontFamily: sfProDisplayRegular,
    fontSize: 12,
    color: '#71717A',
  },
  relapseButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#EF444420',
    borderWidth: 1,
    borderColor: '#EF444440',
  },
  relapseButtonText: {
    fontFamily: sfProDisplayBold,
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  badHabitActions: {
    flexDirection: 'row',
    gap: 12,
  },
  successButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#10B98120',
    borderWidth: 1,
    borderColor: '#10B98140',
  },
  successButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  successButtonText: {
    fontFamily: sfProDisplayBold,
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  successButtonTextActive: {
    color: '#000',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontFamily: sfProDisplayBold,
    fontSize: 18,
    fontWeight: '600',
    color: '#71717A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontFamily: sfProDisplayRegular,
    fontSize: 14,
    color: '#52525B',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emptyButtonBad: {
    backgroundColor: '#EF4444',
  },
  emptyButtonText: {
    fontFamily: sfProDisplayBold,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});
