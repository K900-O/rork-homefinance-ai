import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  UIManager,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  CheckCircle2,
  Circle,
} from 'lucide-react-native';
import { usePersonal } from '@/contexts/PersonalContext';
import { ACTIVITY_COLORS } from '@/constants/personalTypes';
import type { Activity } from '@/constants/personalTypes';
import AddActivityModal from '@/components/AddActivityModal';
import { sfProDisplayBold, sfProDisplayMedium, sfProDisplayRegular } from '@/constants/Typography';
import { BlueGlow } from '@/components/BlueGlow';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const { activities, getActivitiesForDate, completeActivity } = usePersonal();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

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

  const weekDates = useMemo(() => {
    const dates: Date[] = [];
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [selectedDate]);

  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const dayActivities = getActivitiesForDate(selectedDateStr);

  const goToPreviousWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const hasActivities = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return activities.some(a => a.date.startsWith(dateStr));
  };

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
          <Text style={styles.title}>Schedule</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus color="#FFF" size={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.monthNavigation}>
          <TouchableOpacity onPress={goToPreviousWeek} style={styles.navButton}>
            <ChevronLeft color="#2563EB" size={24} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
          </Text>
          <TouchableOpacity onPress={goToNextWeek} style={styles.navButton}>
            <ChevronRight color="#2563EB" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.weekContainer}>
          {weekDates.map((date, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayItem,
                isSelected(date) && styles.dayItemSelected,
                isToday(date) && styles.dayItemToday,
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[styles.dayName, isSelected(date) && styles.dayNameSelected]}>
                {DAYS[date.getDay()]}
              </Text>
              <Text style={[styles.dayNumber, isSelected(date) && styles.dayNumberSelected]}>
                {date.getDate()}
              </Text>
              {hasActivities(date) && (
                <View style={[styles.activityDot, isSelected(date) && styles.activityDotSelected]} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
        >
          <View style={styles.dateHeader}>
            <Text style={styles.selectedDateText}>
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
            <Text style={styles.activityCount}>
              {dayActivities.length} {dayActivities.length === 1 ? 'activity' : 'activities'}
            </Text>
          </View>

          <View style={styles.activitiesList}>
            {dayActivities.length > 0 ? (
              dayActivities.map((activity) => (
                <ScheduleActivityItem 
                  key={activity.id} 
                  activity={activity}
                  onComplete={() => completeActivity(activity.id)}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Clock size={48} color="#A1A1AA" />
                <Text style={styles.emptyStateText}>No activities scheduled</Text>
                <Text style={styles.emptyStateSubtext}>Tap + to add an activity</Text>
              </View>
            )}
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>

        <AddActivityModal 
          visible={showAddModal} 
          onClose={() => setShowAddModal(false)}
          initialDate={selectedDateStr}
        />
      </Animated.View>
    </View>
  );
}

function ScheduleActivityItem({ 
  activity, 
  onComplete 
}: { 
  activity: Activity;
  onComplete: () => void;
}) {
  const isCompleted = activity.status === 'completed';
  const categoryColor = ACTIVITY_COLORS[activity.category] || '#A1A1AA';

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <View style={styles.scheduleItem}>
      <View style={styles.timeColumn}>
        {activity.startTime && (
          <Text style={styles.timeText}>{formatTime(activity.startTime)}</Text>
        )}
        {activity.endTime && (
          <Text style={styles.timeTextEnd}>{formatTime(activity.endTime)}</Text>
        )}
      </View>
      
      <View style={[styles.timelineDot, { backgroundColor: categoryColor }]} />
      <View style={styles.timelineLine} />
      
      <TouchableOpacity 
        style={[styles.activityCard, { borderLeftColor: categoryColor }]}
        onPress={onComplete}
        activeOpacity={0.8}
      >
        <View style={styles.activityHeader}>
          <Text style={[styles.activityTitle, isCompleted && styles.activityTitleCompleted]}>
            {activity.title}
          </Text>
          <TouchableOpacity onPress={onComplete}>
            {isCompleted ? (
              <CheckCircle2 size={24} color="#2563EB" fill="#2563EB" />
            ) : (
              <Circle size={24} color="#A1A1AA" />
            )}
          </TouchableOpacity>
        </View>
        
        {activity.description && (
          <Text style={styles.activityDescription} numberOfLines={2}>
            {activity.description}
          </Text>
        )}
        
        <View style={styles.activityFooter}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {activity.category}
            </Text>
          </View>
          {activity.duration && (
            <Text style={styles.durationText}>{activity.duration} min</Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontFamily: sfProDisplayBold,
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontFamily: sfProDisplayBold,
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  dayItem: {
    width: 44,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  dayItemSelected: {
    backgroundColor: '#2563EB',
  },
  dayItemToday: {
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  dayName: {
    fontFamily: sfProDisplayMedium,
    fontSize: 11,
    color: '#71717A',
    marginBottom: 4,
  },
  dayNameSelected: {
    color: '#FFFFFF',
  },
  dayNumber: {
    fontFamily: sfProDisplayBold,
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  dayNumberSelected: {
    color: '#FFFFFF',
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
    marginTop: 4,
  },
  activityDotSelected: {
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dateHeader: {
    marginBottom: 20,
  },
  selectedDateText: {
    fontFamily: sfProDisplayBold,
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  activityCount: {
    fontFamily: sfProDisplayRegular,
    fontSize: 14,
    color: '#71717A',
  },
  activitiesList: {
    paddingBottom: 100,
  },
  scheduleItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timeColumn: {
    width: 60,
    alignItems: 'flex-end',
    paddingRight: 12,
  },
  timeText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 13,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  timeTextEnd: {
    fontFamily: sfProDisplayRegular,
    fontSize: 11,
    color: '#71717A',
    marginTop: 2,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    zIndex: 1,
  },
  timelineLine: {
    position: 'absolute',
    left: 65,
    top: 16,
    bottom: -20,
    width: 2,
    backgroundColor: '#E5E5E5',
  },
  activityCard: {
    flex: 1,
    marginLeft: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  activityTitle: {
    fontFamily: sfProDisplayBold,
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 12,
  },
  activityTitleCompleted: {
    color: '#71717A',
    textDecorationLine: 'line-through',
  },
  activityDescription: {
    fontFamily: sfProDisplayRegular,
    fontSize: 14,
    color: '#71717A',
    marginBottom: 12,
  },
  activityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  durationText: {
    fontFamily: sfProDisplayRegular,
    fontSize: 12,
    color: '#71717A',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontFamily: sfProDisplayBold,
    fontSize: 16,
    fontWeight: '600',
    color: '#71717A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontFamily: sfProDisplayRegular,
    fontSize: 14,
    color: '#A1A1AA',
  },
});
