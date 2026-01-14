import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
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
import { fontFamily } from '@/constants/Typography';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const { activities, getActivitiesForDate, completeActivity } = usePersonal();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Schedule</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus color="#000" size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.monthNavigation}>
        <TouchableOpacity onPress={goToPreviousWeek} style={styles.navButton}>
          <ChevronLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
        </Text>
        <TouchableOpacity onPress={goToNextWeek} style={styles.navButton}>
          <ChevronRight color="#FFF" size={24} />
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFF" />}
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
              <Clock size={48} color="#333" />
              <Text style={styles.emptyStateText}>No activities scheduled</Text>
              <Text style={styles.emptyStateSubtext}>Tap + to add an activity</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <AddActivityModal 
        visible={showAddModal} 
        onClose={() => setShowAddModal(false)}
        initialDate={selectedDateStr}
      />
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
              <CheckCircle2 size={24} color="#10B981" fill="#10B981" />
            ) : (
              <Circle size={24} color="#52525B" />
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
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontFamily,
    fontSize: 32,
    fontWeight: '700' as const,
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
    backgroundColor: '#18181B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFFFFF',
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
    backgroundColor: '#18181B',
  },
  dayItemSelected: {
    backgroundColor: '#FFFFFF',
  },
  dayItemToday: {
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  dayName: {
    fontFamily,
    fontSize: 11,
    color: '#71717A',
    marginBottom: 4,
  },
  dayNameSelected: {
    color: '#000',
  },
  dayNumber: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  dayNumberSelected: {
    color: '#000',
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginTop: 4,
  },
  activityDotSelected: {
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dateHeader: {
    marginBottom: 20,
  },
  selectedDateText: {
    fontFamily,
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  activityCount: {
    fontFamily,
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
    fontFamily,
    fontSize: 13,
    fontWeight: '500' as const,
    color: '#FFFFFF',
  },
  timeTextEnd: {
    fontFamily,
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
    backgroundColor: '#27272A',
  },
  activityCard: {
    flex: 1,
    marginLeft: 16,
    backgroundColor: '#18181B',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  activityTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    flex: 1,
    marginRight: 12,
  },
  activityTitleCompleted: {
    color: '#71717A',
    textDecorationLine: 'line-through',
  },
  activityDescription: {
    fontFamily,
    fontSize: 14,
    color: '#A1A1AA',
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
    fontFamily,
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'capitalize',
  },
  durationText: {
    fontFamily,
    fontSize: 12,
    color: '#71717A',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#71717A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontFamily,
    fontSize: 14,
    color: '#52525B',
  },
});
