import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Plus, 
  CheckCircle2, 
  Clock, 
  Flame,
  Calendar,
  ChevronRight,
  Award,
  Target,
  BarChart3,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  ListTodo,
  Heart,
} from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { usePersonal } from '@/contexts/PersonalContext';
import { useFinance } from '@/contexts/FinanceContext';
import { useAppMode } from '@/contexts/AppModeContext';
import { ACTIVITY_COLORS } from '@/constants/personalTypes';
import type { Activity, Habit } from '@/constants/personalTypes';
import AddActivityModal from '@/components/AddActivityModal';
import { sfProDisplayBold, sfProDisplayMedium, sfProDisplayRegular } from '@/constants/Typography';
import { BlueGlow } from '@/components/BlueGlow';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const CircularProgress = ({ 
  size = 80, 
  strokeWidth = 8, 
  progress = 0, 
  color = '#2563EB',
  label = '',
  value = ''
}: { 
  size?: number; 
  strokeWidth?: number; 
  progress?: number; 
  color?: string;
  label?: string;
  value?: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            opacity={0.15}
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>
        <View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center' }]} pointerEvents="none">
          <Text style={{ 
            color: '#1A1A1A', 
            fontFamily: sfProDisplayBold, 
            fontSize: size * 0.22,
            textAlign: 'center'
          }}>
            {value}
          </Text>
        </View>
      </View>
      <Text style={{ 
        color: '#71717A', 
        fontFamily: sfProDisplayMedium, 
        fontSize: 11, 
        marginTop: 8,
        textAlign: 'center',
      }}>
        {label}
      </Text>
    </View>
  );
};

export default function PersonalHomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userProfile } = useFinance();
  const { toggleMode } = useAppMode();
  const { 
    dailySummary, 
    getTodayActivities, 
    goodHabits,
    badHabits,
    upcomingActivities,
    completeActivity,
    isHabitCompletedToday,
    completeHabitForToday,
  } = usePersonal();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
  }, [dailySummary, goodHabits, badHabits, upcomingActivities, getTodayActivities]);

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

  const formattedDate = useMemo(() => {
    const date = new Date();
    return date.toLocaleDateString('en-GB', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  }, []);

  const habitsCompletion = useMemo(() => {
    if (goodHabits.length === 0) return 0;
    const completed = goodHabits.filter(h => isHabitCompletedToday(h.id)).length;
    return Math.round((completed / goodHabits.length) * 100);
  }, [goodHabits, isHabitCompletedToday]);

  const tasksCompletion = useMemo(() => {
    if (dailySummary.totalActivities === 0) return 0;
    return Math.round((dailySummary.completedActivities / dailySummary.totalActivities) * 100);
  }, [dailySummary]);

  const totalStreak = useMemo(() => {
    if (goodHabits.length === 0) return 0;
    return Math.max(...goodHabits.map(h => h.currentStreak), 0);
  }, [goodHabits]);

  const longestCleanStreak = useMemo(() => {
    if (badHabits.length === 0) return 0;
    return Math.max(...badHabits.map(h => h.daysClean || 0), 0);
  }, [badHabits]);

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
          <View>
            <Text style={styles.greetingText}>{getGreeting()}</Text>
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
          <TouchableOpacity onPress={toggleMode} style={styles.avatarContainer}>
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>{userProfile?.name?.[0] || 'U'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
        >
          
          <View style={styles.mainCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <View style={styles.iconBadge}>
                  <BarChart3 size={16} color="#2563EB" />
                </View>
                <Text style={styles.cardTitle}>Daily Progress</Text>
              </View>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreValue}>{dailySummary.productivityScore}</Text>
                <Text style={styles.scoreLabel}>Score</Text>
              </View>
            </View>

            <View style={styles.ringsRow}>
              <CircularProgress 
                progress={tasksCompletion} 
                value={`${dailySummary.completedActivities}/${dailySummary.totalActivities}`}
                label="Tasks Done"
                color="#2563EB"
              />
              <CircularProgress 
                progress={habitsCompletion} 
                value={`${habitsCompletion}%`}
                label="Habits"
                color="#3B82F6"
              />
              <CircularProgress 
                progress={Math.min(totalStreak * 10, 100)} 
                value={`${totalStreak}d`}
                label="Best Streak"
                color="#F59E0B"
              />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.insightRow}>
              <Sparkles size={14} color="#2563EB" />
              <Text style={styles.insightText}>
                {dailySummary.productivityScore >= 70 
                  ? "You're on fire today! Keep up the momentum."
                  : dailySummary.productivityScore >= 40
                  ? "Good progress! A few more tasks to hit your goal."
                  : "Let's get started! Complete some tasks to boost your score."}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
                <Flame size={18} color="#F59E0B" />
              </View>
              <Text style={styles.statValue}>{totalStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
                <ShieldCheck size={18} color="#2563EB" />
              </View>
              <Text style={styles.statValue}>{longestCleanStreak}</Text>
              <Text style={styles.statLabel}>Days Clean</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#EDE9FE' }]}>
                <Award size={18} color="#8B5CF6" />
              </View>
              <Text style={styles.statValue}>{goodHabits.length + badHabits.length}</Text>
              <Text style={styles.statLabel}>Active Habits</Text>
            </View>
          </View>

          {goodHabits.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <View style={[styles.sectionDot, { backgroundColor: '#2563EB' }]} />
                  <Text style={styles.sectionTitle}>Build Habits</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/habits')} style={styles.seeAllBtn}>
                  <Text style={styles.seeAllText}>See All</Text>
                  <ChevronRight size={14} color="#2563EB" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.habitsList}>
                {goodHabits.slice(0, 3).map((habit, index) => (
                  <HabitCard 
                    key={habit.id} 
                    habit={habit} 
                    isCompleted={isHabitCompletedToday(habit.id)}
                    onComplete={() => completeHabitForToday(habit.id)}
                    index={index}
                  />
                ))}
              </View>
            </View>
          )}

          {badHabits.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <View style={[styles.sectionDot, { backgroundColor: '#EF4444' }]} />
                  <Text style={styles.sectionTitle}>Breaking Habits</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/habits')} style={styles.seeAllBtn}>
                  <Text style={styles.seeAllText}>See All</Text>
                  <ChevronRight size={14} color="#2563EB" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.habitsList}>
                {badHabits.slice(0, 2).map((habit) => (
                  <BadHabitCard key={habit.id} habit={habit} />
                ))}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={[styles.sectionDot, { backgroundColor: '#2563EB' }]} />
                <Text style={styles.sectionTitle}>Today&apos;s Tasks</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/schedule')} style={styles.seeAllBtn}>
                <Text style={styles.seeAllText}>Schedule</Text>
                <ChevronRight size={14} color="#2563EB" />
              </TouchableOpacity>
            </View>

            {getTodayActivities.length > 0 ? (
              <View style={styles.activitiesList}>
                {getTodayActivities.slice(0, 4).map((activity, index) => (
                  <ActivityRow 
                    key={activity.id} 
                    activity={activity} 
                    onComplete={() => completeActivity(activity.id)}
                    index={index}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Calendar size={32} color="#A1A1AA" />
                <Text style={styles.emptyTitle}>No tasks for today</Text>
                <Text style={styles.emptySubtitle}>Add activities to stay productive</Text>
              </View>
            )}
          </View>

          {upcomingActivities.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <View style={[styles.sectionDot, { backgroundColor: '#8B5CF6' }]} />
                  <Text style={styles.sectionTitle}>Coming Up</Text>
                </View>
              </View>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 20 }}
              >
                {upcomingActivities.slice(0, 5).map((activity) => (
                  <UpcomingCard key={activity.id} activity={activity} />
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.quickActions}>
            <Text style={styles.quickActionsTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity 
                style={styles.actionBtn} 
                onPress={() => setShowAddModal(true)}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#DBEAFE' }]}>
                  <Plus size={20} color="#2563EB" />
                </View>
                <Text style={styles.actionLabel}>Add Task</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionBtn}
                onPress={() => router.push('/habits')}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#DBEAFE' }]}>
                  <Target size={20} color="#1D4ED8" />
                </View>
                <Text style={styles.actionLabel}>Habits</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionBtn}
                onPress={() => router.push('/schedule')}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Calendar size={20} color="#F59E0B" />
                </View>
                <Text style={styles.actionLabel}>Schedule</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionBtn}
                onPress={() => router.push('/coach')}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#EDE9FE' }]}>
                  <Heart size={20} color="#8B5CF6" />
                </View>
                <Text style={styles.actionLabel}>Coach</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </Animated.View>

      <AddActivityModal visible={showAddModal} onClose={() => setShowAddModal(false)} />
    </View>
  );
}

function HabitCard({ habit, isCompleted, onComplete, index }: { habit: Habit; isCompleted: boolean; onComplete: () => void; index: number }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;
  const prevCompleted = useRef(isCompleted);

  useEffect(() => {
    const delay = index * 60;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 50,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  useEffect(() => {
    if (isCompleted && !prevCompleted.current) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.04,
          friction: 3,
          tension: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
    prevCompleted.current = isCompleted;
  }, [isCompleted, scaleAnim]);

  return (
    <Animated.View style={{
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
    }}>
    <TouchableOpacity 
      style={[styles.habitCard, isCompleted && styles.habitCardCompleted]} 
      onPress={onComplete}
      activeOpacity={0.7}
    >
      <View style={styles.habitLeft}>
        <View style={[styles.habitIcon, { backgroundColor: habit.color + '20' }]}>
          <CheckCircle2 size={18} color={habit.color} />
        </View>
        <View style={styles.habitInfo}>
          <Text style={[styles.habitTitle, isCompleted && styles.habitTitleCompleted]}>
            {habit.title}
          </Text>
          <View style={styles.habitMeta}>
            <Flame size={12} color="#F59E0B" />
            <Text style={styles.habitStreak}>{habit.currentStreak} day streak</Text>
          </View>
        </View>
      </View>
      <View style={[styles.habitCheck, isCompleted && styles.habitCheckDone]}>
        {isCompleted && <CheckCircle2 size={16} color="#FFF" />}
      </View>
    </TouchableOpacity>
    </Animated.View>
  );
}

function BadHabitCard({ habit }: { habit: Habit & { daysClean: number } }) {
  const progress = Math.min((habit.daysClean / 30) * 100, 100);
  
  return (
    <View style={styles.badHabitCard}>
      <View style={styles.badHabitHeader}>
        <View style={styles.badHabitLeft}>
          <View style={[styles.habitIcon, { backgroundColor: '#FEE2E2' }]}>
            <AlertTriangle size={18} color="#EF4444" />
          </View>
          <View>
            <Text style={styles.habitTitle}>{habit.title}</Text>
            <Text style={styles.badHabitSubtitle}>Stay strong!</Text>
          </View>
        </View>
        <View style={styles.daysCleanBadge}>
          <Text style={styles.daysCleanValue}>{habit.daysClean}</Text>
          <Text style={styles.daysCleanLabel}>days clean</Text>
        </View>
      </View>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressText}>
        {habit.daysClean >= 30 ? '🎉 1 month milestone reached!' : `${30 - habit.daysClean} days to 1 month milestone`}
      </Text>
    </View>
  );
}

function ActivityRow({ activity, onComplete, index }: { activity: Activity; onComplete: () => void; index: number }) {
  const isCompleted = activity.status === 'completed';
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;
  const prevCompleted = useRef(isCompleted);

  useEffect(() => {
    const delay = index * 50;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 50,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  useEffect(() => {
    if (isCompleted && !prevCompleted.current) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.03,
          friction: 3,
          tension: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
    prevCompleted.current = isCompleted;
  }, [isCompleted, scaleAnim]);

  return (
    <Animated.View style={{
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
    }}>
    <TouchableOpacity style={styles.activityRow} onPress={onComplete} activeOpacity={0.7}>
      <View style={[styles.activityIcon, { backgroundColor: ACTIVITY_COLORS[activity.category] + '20' }]}>
        <ListTodo size={16} color={ACTIVITY_COLORS[activity.category]} />
      </View>
      <View style={styles.activityContent}>
        <Text style={[styles.activityTitle, isCompleted && styles.completedText]}>{activity.title}</Text>
        <View style={styles.activityMetaRow}>
          <Clock size={12} color="#71717A" />
          <Text style={styles.activityTime}>
            {activity.startTime ? new Date(activity.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'All Day'}
          </Text>
          <View style={[styles.categoryTag, { backgroundColor: ACTIVITY_COLORS[activity.category] + '20' }]}>
            <Text style={[styles.categoryText, { color: ACTIVITY_COLORS[activity.category] }]}>
              {activity.category}
            </Text>
          </View>
        </View>
      </View>
      <View style={[styles.checkBox, isCompleted && styles.checkBoxChecked]}>
        {isCompleted && <CheckCircle2 size={16} color="#FFF" />}
      </View>
    </TouchableOpacity>
    </Animated.View>
  );
}

function UpcomingCard({ activity }: { activity: Activity }) {
  const activityDate = new Date(activity.date);
  const dayName = activityDate.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNum = activityDate.getDate();

  return (
    <View style={styles.upcomingCard}>
      <View style={styles.upcomingDate}>
        <Text style={styles.upcomingDay}>{dayName}</Text>
        <Text style={styles.upcomingNum}>{dayNum}</Text>
      </View>
      <Text style={styles.upcomingTitle} numberOfLines={2}>{activity.title}</Text>
      <View style={[styles.upcomingCategory, { backgroundColor: ACTIVITY_COLORS[activity.category] + '20' }]}>
        <Text style={[styles.upcomingCategoryText, { color: ACTIVITY_COLORS[activity.category] }]}>
          {activity.category}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    marginTop: 8,
  },
  greetingText: {
    fontFamily: sfProDisplayRegular,
    fontSize: 14,
    color: '#71717A',
    marginBottom: 2,
  },
  dateText: {
    fontFamily: sfProDisplayBold,
    fontSize: 20,
    color: '#1A1A1A',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontFamily: sfProDisplayBold,
    color: '#FFF',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  mainCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: sfProDisplayBold,
    fontSize: 18,
    color: '#1A1A1A',
  },
  scoreBox: {
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scoreValue: {
    fontFamily: sfProDisplayBold,
    fontSize: 20,
    color: '#2563EB',
  },
  scoreLabel: {
    fontFamily: sfProDisplayRegular,
    fontSize: 10,
    color: '#1D4ED8',
  },
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginBottom: 16,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#DBEAFE',
    padding: 12,
    borderRadius: 12,
  },
  insightText: {
    flex: 1,
    fontFamily: sfProDisplayRegular,
    fontSize: 13,
    color: '#1D4ED8',
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontFamily: sfProDisplayBold,
    fontSize: 20,
    color: '#1A1A1A',
  },
  statLabel: {
    fontFamily: sfProDisplayRegular,
    fontSize: 11,
    color: '#71717A',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontFamily: sfProDisplayBold,
    fontSize: 16,
    color: '#1A1A1A',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 13,
    color: '#2563EB',
  },
  habitsList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  habitCardCompleted: {
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
  },
  habitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  habitIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontFamily: sfProDisplayMedium,
    fontSize: 15,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  habitTitleCompleted: {
    color: '#2563EB',
  },
  habitMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  habitStreak: {
    fontFamily: sfProDisplayRegular,
    fontSize: 12,
    color: '#71717A',
  },
  habitCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D4D4D4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitCheckDone: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  badHabitCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginHorizontal: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  badHabitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badHabitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badHabitSubtitle: {
    fontFamily: sfProDisplayRegular,
    fontSize: 12,
    color: '#71717A',
    marginTop: 2,
  },
  daysCleanBadge: {
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  daysCleanValue: {
    fontFamily: sfProDisplayBold,
    fontSize: 18,
    color: '#2563EB',
  },
  daysCleanLabel: {
    fontFamily: sfProDisplayRegular,
    fontSize: 10,
    color: '#1D4ED8',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#F5F5F5',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 3,
  },
  progressText: {
    fontFamily: sfProDisplayRegular,
    fontSize: 12,
    color: '#71717A',
    textAlign: 'center',
  },
  activitiesList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontFamily: sfProDisplayMedium,
    fontSize: 15,
    color: '#1A1A1A',
    marginBottom: 6,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#A1A1AA',
  },
  activityMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activityTime: {
    fontFamily: sfProDisplayRegular,
    fontSize: 12,
    color: '#71717A',
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 4,
  },
  categoryText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 10,
    textTransform: 'capitalize',
  },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D4D4D4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxChecked: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    marginHorizontal: 20,
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  emptyTitle: {
    fontFamily: sfProDisplayMedium,
    fontSize: 15,
    color: '#71717A',
    marginTop: 12,
  },
  emptySubtitle: {
    fontFamily: sfProDisplayRegular,
    fontSize: 13,
    color: '#A1A1AA',
    marginTop: 4,
  },
  upcomingCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginLeft: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  upcomingDate: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 10,
  },
  upcomingDay: {
    fontFamily: sfProDisplayMedium,
    fontSize: 12,
    color: '#71717A',
  },
  upcomingNum: {
    fontFamily: sfProDisplayBold,
    fontSize: 18,
    color: '#1A1A1A',
  },
  upcomingTitle: {
    fontFamily: sfProDisplayMedium,
    fontSize: 13,
    color: '#52525B',
    marginBottom: 10,
    lineHeight: 18,
  },
  upcomingCategory: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  upcomingCategoryText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 10,
    textTransform: 'capitalize',
  },
  quickActions: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  quickActionsTitle: {
    fontFamily: sfProDisplayBold,
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontFamily: sfProDisplayMedium,
    fontSize: 12,
    color: '#52525B',
  },
});
