import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Plus, 
  CheckCircle2, 
  Clock, 
  Flame,
  Zap,
  Shield,
  Activity as ActivityIcon,
  ChevronDown,
  Cloud,
  Target,
  Layout,
  ListTodo
} from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { usePersonal } from '@/contexts/PersonalContext';
import { useFinance } from '@/contexts/FinanceContext';
import { useAppMode } from '@/contexts/AppModeContext';
import { ACTIVITY_COLORS } from '@/constants/personalTypes';
import type { Activity } from '@/constants/personalTypes';
import AddActivityModal from '@/components/AddActivityModal';
import { sfProDisplayBold, sfProDisplayMedium, sfProDisplayRegular } from '@/constants/Typography';
import { BlueGlow } from '@/components/BlueGlow';

// Bevel-style Circular Progress
const CircularProgress = ({ 
  size = 80, 
  strokeWidth = 8, 
  progress = 0, 
  color = '#3B82F6',
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
          {/* Background Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            opacity={0.2}
          />
          {/* Progress Circle */}
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
            color: '#FFF', 
            fontFamily: sfProDisplayBold, 
            fontSize: size * 0.22,
            textAlign: 'center'
          }}>
            {value}
          </Text>
        </View>
      </View>
      <Text style={{ 
        color: '#A1A1AA', 
        fontFamily: sfProDisplayMedium, 
        fontSize: 12, 
        marginTop: 8 
      }}>
        {label}
      </Text>
    </View>
  );
};

export default function PersonalHomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useFinance();
  const { toggleMode } = useAppMode();
  const { 
    dailySummary, 
    getTodayActivities, 
    goodHabits,
    completeActivity,
    isHabitCompletedToday,
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

  const formattedDate = useMemo(() => {
    const date = new Date();
    return date.toLocaleDateString('en-GB', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  }, []);

  const productivityColor = '#3B82F6'; // Blue
  const habitsColor = '#60A5FA'; // Lighter Blue
  const tasksColor = '#2563EB'; // Darker Blue

  const habitsCompletion = useMemo(() => {
    if (goodHabits.length === 0) return 0;
    const completed = goodHabits.filter(h => isHabitCompletedToday(h.id)).length;
    return Math.round((completed / goodHabits.length) * 100);
  }, [goodHabits, isHabitCompletedToday]);

  const tasksCompletion = useMemo(() => {
    if (dailySummary.totalActivities === 0) return 0;
    return Math.round((dailySummary.completedActivities / dailySummary.totalActivities) * 100);
  }, [dailySummary]);

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
        
        {/* Header - Bevel Style */}
        <View style={styles.header}>
          <View>
            <TouchableOpacity style={styles.dateSelector}>
              <Text style={styles.dateText}>{formattedDate}</Text>
              <ChevronDown size={16} color="#A1A1AA" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={toggleMode} style={styles.avatarContainer}>
             <View style={styles.avatarFallback}>
               <Text style={styles.avatarText}>{user?.name?.[0] || 'U'}</Text>
             </View>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />}
        >
          
          {/* Status Pills */}
          <View style={styles.statusRow}>
            <View style={styles.statusPill}>
              <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.statusText}>Focus Mode</Text>
              <ChevronDown size={14} color="#71717A" style={{ marginLeft: 4 }} />
            </View>
            <View style={styles.statusPill}>
              <Cloud size={14} color="#A1A1AA" />
              <Text style={styles.statusText}>22°C Clear</Text>
            </View>
          </View>

          {/* Main Metrics Card */}
          <View style={styles.mainCard}>
            <View style={styles.ringsRow}>
              <CircularProgress 
                progress={dailySummary.productivityScore} 
                value={`${dailySummary.productivityScore}%`}
                label="Productivity"
                color={productivityColor}
              />
              <CircularProgress 
                progress={habitsCompletion} 
                value={`${habitsCompletion}%`}
                label="Habits"
                color={habitsColor}
              />
              <CircularProgress 
                progress={tasksCompletion} 
                value={`${tasksCompletion}%`}
                label="Tasks"
                color={tasksColor}
              />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.insightContainer}>
              <View style={styles.insightHeader}>
                <ActivityIcon size={16} color={productivityColor} />
                <Text style={styles.insightTitle}>Daily Progress</Text>
              </View>
              <Text style={styles.insightText}>
                Great momentum! You&apos;ve completed {dailySummary.completedActivities} out of {dailySummary.totalActivities} tasks today. 
                Keep pushing to reach your daily goals.
              </Text>
            </View>
          </View>

          {/* Secondary Section - "Stress & Energy" equivalent */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
               <View style={styles.sectionTitleRow}>
                  <View style={[styles.sectionIcon, { backgroundColor: '#3B82F620' }]}>
                    <Target size={16} color="#3B82F6" />
                  </View>
                  <Text style={styles.sectionTitle}>Today&apos;s Focus</Text>
               </View>
               <View style={styles.scoreContainer}>
                  <Text style={styles.scoreValue}>{dailySummary.productivityScore}</Text>
                  <Text style={styles.scoreLabel}>Score</Text>
               </View>
            </View>

            <View style={styles.gaugeContainer}>
               <View style={styles.gaugeRow}>
                 <Text style={styles.gaugeLabel}>Highest</Text>
                 <Text style={styles.gaugeLabel}>Lowest</Text>
                 <Text style={styles.gaugeLabel}>Average</Text>
               </View>
               <View style={styles.gaugeValues}>
                 <Text style={[styles.gaugeValue, { color: '#EAB308' }]}>85</Text>
                 <Text style={[styles.gaugeValue, { color: '#3B82F6' }]}>42</Text>
                 <Text style={[styles.gaugeValue, { color: '#10B981' }]}>64</Text>
               </View>
               
               {/* Mock Bar Chart */}
               <View style={styles.barChart}>
                  {[40, 60, 30, 80, 50, 70, 45, 90, 60, 40, 55, 75, 50, 65, 45, 80, 60, 40, 30, 50, 70, 60, 80, 40].map((h, i) => (
                    <View 
                      key={i} 
                      style={[
                        styles.bar, 
                        { 
                          height: `${h}%`, 
                          backgroundColor: h > 70 ? '#3B82F6' : '#27272A' 
                        }
                      ]} 
                    />
                  ))}
               </View>
            </View>
            
            <View style={styles.energyBarContainer}>
               <Zap size={16} color="#EAB308" fill="#EAB308" />
               <View style={styles.energyBarBg}>
                  <View style={[styles.energyBarFill, { width: `${dailySummary.productivityScore}%` }]} />
               </View>
               <Text style={styles.energyValue}>{dailySummary.productivityScore}%</Text>
            </View>
          </View>

          {/* Activities / Habits List */}
          <View style={styles.listSection}>
             <Text style={styles.listHeader}>Priorities</Text>
             
             <View style={styles.menuGrid}>
                <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
                   <Layout size={24} color="#FFF" />
                   <Text style={styles.menuLabel}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
                   <ListTodo size={24} color="#A1A1AA" />
                   <Text style={styles.menuLabel}>Tasks</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItemActive} onPress={() => setShowAddModal(true)}>
                   <Plus size={24} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
                   <Flame size={24} color="#A1A1AA" />
                   <Text style={styles.menuLabel}>Habits</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
                   <Shield size={24} color="#A1A1AA" />
                   <Text style={styles.menuLabel}>Focus</Text>
                </TouchableOpacity>
             </View>

             {/* Recent Items List */}
             <View style={styles.activitiesList}>
                {getTodayActivities.slice(0, 3).map((activity) => (
                   <ActivityRow 
                      key={activity.id} 
                      activity={activity} 
                      onComplete={() => completeActivity(activity.id)} 
                    />
                ))}
                {getTodayActivities.length === 0 && (
                  <Text style={styles.emptyText}>No activities scheduled for today</Text>
                )}
             </View>
          </View>

        </ScrollView>
      </Animated.View>

      <AddActivityModal visible={showAddModal} onClose={() => setShowAddModal(false)} />
    </View>
  );
}

function ActivityRow({ activity, onComplete }: { activity: Activity; onComplete: () => void }) {
  const isCompleted = activity.status === 'completed';
  return (
    <TouchableOpacity style={styles.activityRow} onPress={onComplete} activeOpacity={0.7}>
      <View style={[styles.activityIcon, { backgroundColor: ACTIVITY_COLORS[activity.category] + '20' }]}>
        <Clock size={16} color={ACTIVITY_COLORS[activity.category]} />
      </View>
      <View style={styles.activityContent}>
        <Text style={[styles.activityTitle, isCompleted && styles.completedText]}>{activity.title}</Text>
        <Text style={styles.activityTime}>
          {activity.startTime ? new Date(activity.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'All Day'}
           {' • '}
          <Text style={{color: ACTIVITY_COLORS[activity.category], textTransform: 'capitalize'}}>{activity.category}</Text>
        </Text>
      </View>
      <View style={[styles.checkBox, isCompleted && styles.checkBoxChecked]}>
        {isCompleted && <CheckCircle2 size={16} color="#FFF" />}
      </View>
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
    marginBottom: 16,
    marginTop: 8,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontFamily: sfProDisplayBold,
    fontSize: 22,
    color: '#FFFFFF',
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontFamily: sfProDisplayMedium,
    color: '#FFF',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 13,
    color: '#E4E4E7',
  },
  mainCard: {
    marginHorizontal: 20,
    backgroundColor: '#121212',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#27272A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#27272A',
    marginBottom: 16,
  },
  insightContainer: {
    gap: 8,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  insightTitle: {
    fontFamily: sfProDisplayBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  insightText: {
    fontFamily: sfProDisplayRegular,
    fontSize: 15,
    color: '#A1A1AA',
    lineHeight: 22,
  },
  sectionContainer: {
    marginHorizontal: 20,
    backgroundColor: '#121212',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionIcon: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  sectionTitle: {
    fontFamily: sfProDisplayBold,
    fontSize: 17,
    color: '#FFFFFF',
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#27272A',
    borderRightColor: '#EAB308',
    borderTopColor: '#EAB308',
  },
  scoreValue: {
    fontFamily: sfProDisplayBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  scoreLabel: {
    fontFamily: sfProDisplayRegular,
    fontSize: 9,
    color: '#EAB308',
  },
  gaugeContainer: {
    marginBottom: 20,
  },
  gaugeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  gaugeLabel: {
    fontFamily: sfProDisplayRegular,
    fontSize: 12,
    color: '#71717A',
    width: '30%',
  },
  gaugeValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gaugeValue: {
    fontFamily: sfProDisplayBold,
    fontSize: 20,
    width: '30%',
  },
  barChart: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 2,
  },
  bar: {
    flex: 1,
    borderRadius: 2,
  },
  energyBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#18181B',
    padding: 12,
    borderRadius: 16,
  },
  energyBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#27272A',
    borderRadius: 3,
    overflow: 'hidden',
  },
  energyBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  energyValue: {
    fontFamily: sfProDisplayBold,
    fontSize: 14,
    color: '#FFFFFF',
    width: 40,
    textAlign: 'right',
  },
  listSection: {
    paddingHorizontal: 20,
  },
  listHeader: {
    fontFamily: sfProDisplayBold,
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  menuGrid: {
    flexDirection: 'row',
    backgroundColor: '#18181B',
    borderRadius: 30,
    padding: 6,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  menuItem: {
    alignItems: 'center',
    padding: 10,
    gap: 4,
  },
  menuItemActive: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  menuLabel: {
    fontFamily: sfProDisplayMedium,
    fontSize: 10,
    color: '#A1A1AA',
  },
  activitiesList: {
    gap: 12,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#27272A',
    gap: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontFamily: sfProDisplayMedium,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#71717A',
  },
  activityTime: {
    fontFamily: sfProDisplayRegular,
    fontSize: 12,
    color: '#71717A',
  },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3F3F46',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxChecked: {
    borderColor: '#3B82F6',
    backgroundColor: '#3B82F6',
  },
  emptyText: {
    color: '#52525B',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: sfProDisplayRegular,
  }
});
