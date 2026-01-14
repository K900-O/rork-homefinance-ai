import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Clock, MapPin, Flag } from 'lucide-react-native';
import { usePersonal } from '@/contexts/PersonalContext';
import { ACTIVITY_COLORS, type ActivityCategory, type ActivityPriority } from '@/constants/personalTypes';
import { fontFamily } from '@/constants/Typography';

interface AddActivityModalProps {
  visible: boolean;
  onClose: () => void;
  initialDate?: string;
}

const CATEGORIES: ActivityCategory[] = [
  'work', 'exercise', 'leisure', 'social', 'health', 
  'learning', 'chores', 'personal', 'travel', 'other'
];

const PRIORITIES: { value: ActivityPriority; label: string; color: string }[] = [
  { value: 'high', label: 'High', color: '#EF4444' },
  { value: 'medium', label: 'Medium', color: '#F59E0B' },
  { value: 'low', label: 'Low', color: '#10B981' },
];

export default function AddActivityModal({ visible, onClose, initialDate }: AddActivityModalProps) {
  const { addActivity } = usePersonal();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('work');
  const [priority, setPriority] = useState<ActivityPriority>('medium');
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);

  const handleSubmit = () => {
    if (!title.trim()) return;

    const today = initialDate || new Date().toISOString().split('T')[0];
    
    addActivity({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      priority,
      status: 'pending',
      date: today,
      duration: duration ? parseInt(duration, 10) : undefined,
      location: location.trim() || undefined,
      isAllDay,
    });

    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('work');
    setPriority('medium');
    setDuration('');
    setLocation('');
    setIsAllDay(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X color="#FFF" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Activity</Text>
          <TouchableOpacity 
            onPress={handleSubmit} 
            style={[styles.saveButton, !title.trim() && styles.saveButtonDisabled]}
            disabled={!title.trim()}
          >
            <Text style={[styles.saveButtonText, !title.trim() && styles.saveButtonTextDisabled]}>
              Add
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="What do you need to do?"
              placeholderTextColor="#52525B"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add more details..."
              placeholderTextColor="#52525B"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      category === cat && { backgroundColor: ACTIVITY_COLORS[cat], borderColor: ACTIVITY_COLORS[cat] }
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      category === cat && styles.categoryChipTextActive
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityRow}>
              {PRIORITIES.map((p) => (
                <TouchableOpacity
                  key={p.value}
                  style={[
                    styles.priorityChip,
                    priority === p.value && { backgroundColor: p.color, borderColor: p.color }
                  ]}
                  onPress={() => setPriority(p.value)}
                >
                  <Flag size={14} color={priority === p.value ? '#000' : p.color} />
                  <Text style={[
                    styles.priorityChipText,
                    priority === p.value && styles.priorityChipTextActive
                  ]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
              <Text style={styles.label}>Duration (min)</Text>
              <View style={styles.inputWithIcon}>
                <Clock size={18} color="#71717A" />
                <TextInput
                  style={styles.inputSmall}
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="30"
                  placeholderTextColor="#52525B"
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1.5 }]}>
              <Text style={styles.label}>Location (optional)</Text>
              <View style={styles.inputWithIcon}>
                <MapPin size={18} color="#71717A" />
                <TextInput
                  style={styles.inputSmall}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Where?"
                  placeholderTextColor="#52525B"
                />
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.allDayToggle}
            onPress={() => setIsAllDay(!isAllDay)}
          >
            <View style={[styles.toggleCircle, isAllDay && styles.toggleCircleActive]}>
              {isAllDay && <View style={styles.toggleInner} />}
            </View>
            <Text style={styles.allDayText}>All day activity</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#18181B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  saveButtonDisabled: {
    backgroundColor: '#27272A',
  },
  saveButtonText: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#000000',
  },
  saveButtonTextDisabled: {
    color: '#52525B',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontFamily,
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#A1A1AA',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#18181B',
    borderRadius: 12,
    padding: 16,
    fontFamily,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  categoryChipText: {
    fontFamily,
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#A1A1AA',
    textTransform: 'capitalize',
  },
  categoryChipTextActive: {
    color: '#000000',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  priorityChipText: {
    fontFamily,
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#A1A1AA',
  },
  priorityChipTextActive: {
    color: '#000000',
  },
  row: {
    flexDirection: 'row',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#27272A',
    gap: 10,
  },
  inputSmall: {
    flex: 1,
    paddingVertical: 14,
    fontFamily,
    fontSize: 16,
    color: '#FFFFFF',
  },
  allDayToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#52525B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleCircleActive: {
    borderColor: '#10B981',
  },
  toggleInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
  },
  allDayText: {
    fontFamily,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
