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
import { X } from 'lucide-react-native';
import { usePersonal } from '@/contexts/PersonalContext';
import { type ActivityCategory, type HabitType } from '@/constants/personalTypes';
import { fontFamily } from '@/constants/Typography';
import { AppColors } from '@/constants/colors';
import SuccessAnimation from './SuccessAnimation';

interface AddHabitModalProps {
  visible: boolean;
  onClose: () => void;
}

const CATEGORIES: ActivityCategory[] = [
  'health', 'exercise', 'learning', 'personal', 'work',
  'social', 'chores', 'leisure', 'other'
];

const FREQUENCIES = [
  { value: 'daily' as const, label: 'Daily' },
  { value: 'weekly' as const, label: 'Weekly' },
  { value: 'monthly' as const, label: 'Monthly' },
];

const HABIT_TYPES: { value: HabitType; label: string; description: string }[] = [
  { value: 'good', label: 'Good Habit', description: 'Build positive habits' },
  { value: 'bad', label: 'Bad Habit', description: 'Break negative habits' },
];

const COLORS = [
  AppColors.primary, AppColors.blue[400], '#10B981', '#14B8A6', '#06B6D4',
  '#8B5CF6', '#6366F1', '#EC4899', '#F59E0B', '#F97316'
];

export default function AddHabitModal({ visible, onClose }: AddHabitModalProps) {
  const { addHabit } = usePersonal();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [habitType, setHabitType] = useState<HabitType>('good');
  const [category, setCategory] = useState<ActivityCategory>('health');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [targetCount, setTargetCount] = useState('1');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = () => {
    if (!title.trim()) return;

    addHabit({
      title: title.trim(),
      description: description.trim() || undefined,
      type: habitType,
      category,
      frequency,
      targetCount: parseInt(targetCount, 10) || 1,
      color: habitType === 'good' ? selectedColor : '#EF4444',
      icon: 'circle',
      isActive: true,
    });

    setShowSuccess(true);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setHabitType('good');
    setCategory('health');
    setFrequency('daily');
    setTargetCount('1');
    setSelectedColor(COLORS[0]);
    setShowSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSuccessComplete = () => {
    setShowSuccess(false);
    handleClose();
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
            <X color={AppColors.textSecondary} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Habit</Text>
          <TouchableOpacity 
            onPress={handleSubmit} 
            style={[styles.saveButton, !title.trim() && styles.saveButtonDisabled]}
            disabled={!title.trim()}
          >
            <Text style={[styles.saveButtonText, !title.trim() && styles.saveButtonTextDisabled]}>
              Create
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Habit Name</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Drink 8 glasses of water"
              placeholderTextColor={AppColors.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Why is this habit important to you?"
              placeholderTextColor={AppColors.textLight}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Habit Type</Text>
            <View style={styles.habitTypeRow}>
              {HABIT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.habitTypeCard,
                    habitType === type.value && (
                      type.value === 'good' 
                        ? styles.habitTypeCardGoodActive 
                        : styles.habitTypeCardBadActive
                    )
                  ]}
                  onPress={() => setHabitType(type.value)}
                >
                  <Text style={[
                    styles.habitTypeLabel,
                    habitType === type.value && styles.habitTypeLabelActive
                  ]}>
                    {type.label}
                  </Text>
                  <Text style={[
                    styles.habitTypeDesc,
                    habitType === type.value && styles.habitTypeDescActive
                  ]}>
                    {type.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
                      category === cat && styles.categoryChipActive
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
            <Text style={styles.label}>Frequency</Text>
            <View style={styles.frequencyRow}>
              {FREQUENCIES.map((f) => (
                <TouchableOpacity
                  key={f.value}
                  style={[
                    styles.frequencyChip,
                    frequency === f.value && styles.frequencyChipActive
                  ]}
                  onPress={() => setFrequency(f.value)}
                >
                  <Text style={[
                    styles.frequencyChipText,
                    frequency === f.value && styles.frequencyChipTextActive
                  ]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Target per {frequency === 'daily' ? 'day' : frequency === 'weekly' ? 'week' : 'month'}</Text>
            <TextInput
              style={[styles.input, styles.inputSmall]}
              value={targetCount}
              onChangeText={setTargetCount}
              placeholder="1"
              placeholderTextColor={AppColors.textLight}
              keyboardType="number-pad"
            />
          </View>

          {habitType === 'good' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Color</Text>
              <View style={styles.colorGrid}>
                {COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorChip,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorChipSelected
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>
            </View>
          )}

          <View style={styles.previewSection}>
            <Text style={styles.label}>Preview</Text>
            <View style={[styles.previewCard, { borderLeftColor: habitType === 'good' ? selectedColor : '#EF4444' }]}>
              <View style={[styles.previewIcon, { backgroundColor: (habitType === 'good' ? selectedColor : '#EF4444') + '15' }]}>
                <View style={[styles.previewDot, { backgroundColor: habitType === 'good' ? selectedColor : '#EF4444' }]} />
              </View>
              <View style={styles.previewInfo}>
                <Text style={styles.previewTitle}>{title || 'Your habit name'}</Text>
                <Text style={styles.previewCategory}>
                  {habitType === 'good' ? '✓ Build' : '✗ Break'} • {category} • {frequency}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <SuccessAnimation
          visible={showSuccess}
          type="habit"
          onComplete={handleSuccessComplete}
          autoHide={true}
          autoHideDelay={2000}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: '600' as const,
    color: AppColors.textPrimary,
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: AppColors.primary,
  },
  saveButtonDisabled: {
    backgroundColor: AppColors.border,
  },
  saveButtonText: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  saveButtonTextDisabled: {
    color: AppColors.textLight,
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
    fontWeight: '600' as const,
    color: AppColors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: AppColors.surfaceLight,
    borderRadius: 12,
    padding: 16,
    fontFamily,
    fontSize: 16,
    color: AppColors.textPrimary,
    borderWidth: 1.5,
    borderColor: AppColors.border,
  },
  inputSmall: {
    width: 100,
    textAlign: 'center',
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
    backgroundColor: AppColors.surfaceLight,
    borderWidth: 1.5,
    borderColor: AppColors.border,
  },
  categoryChipActive: {
    backgroundColor: AppColors.blue[50],
    borderColor: AppColors.primary,
  },
  categoryChipText: {
    fontFamily,
    fontSize: 14,
    fontWeight: '500' as const,
    color: AppColors.textSecondary,
    textTransform: 'capitalize',
  },
  categoryChipTextActive: {
    color: AppColors.primary,
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: 12,
  },
  frequencyChip: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: AppColors.surfaceLight,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: AppColors.border,
  },
  frequencyChipActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  frequencyChipText: {
    fontFamily,
    fontSize: 14,
    fontWeight: '500' as const,
    color: AppColors.textSecondary,
  },
  frequencyChipTextActive: {
    color: '#FFFFFF',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  colorChipSelected: {
    borderWidth: 3,
    borderColor: AppColors.textPrimary,
  },
  habitTypeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  habitTypeCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: AppColors.surfaceLight,
    borderWidth: 2,
    borderColor: AppColors.border,
  },
  habitTypeCardGoodActive: {
    backgroundColor: AppColors.blue[50],
    borderColor: AppColors.primary,
  },
  habitTypeCardBadActive: {
    backgroundColor: AppColors.dangerLight,
    borderColor: AppColors.danger,
  },
  habitTypeLabel: {
    fontFamily,
    fontSize: 15,
    fontWeight: '600' as const,
    color: AppColors.textSecondary,
    marginBottom: 4,
  },
  habitTypeLabelActive: {
    color: AppColors.textPrimary,
  },
  habitTypeDesc: {
    fontFamily,
    fontSize: 12,
    color: AppColors.textLight,
  },
  habitTypeDescActive: {
    color: AppColors.textSecondary,
  },
  previewSection: {
    marginBottom: 40,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surfaceLight,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  previewIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  previewDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  previewInfo: {
    flex: 1,
  },
  previewTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600' as const,
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  previewCategory: {
    fontFamily,
    fontSize: 13,
    color: AppColors.textLight,
    textTransform: 'capitalize',
  },
});
