import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useFinance } from '@/contexts/FinanceContext';
import { fontFamily } from '@/constants/Typography';
import { AppColors } from '@/constants/colors';
import SuccessAnimation from './SuccessAnimation';

const GOAL_CATEGORIES = [
  'Emergency Fund',
  'Vacation',
  'Home Purchase',
  'Education',
  'Retirement',
  'Vehicle',
  'Investment',
  'Debt Payoff',
  'Wedding',
  'Other',
];

const GOAL_COLORS = [
  AppColors.primary,
  AppColors.blue[400],
  AppColors.blue[300],
  '#10B981',
  '#14B8A6',
  '#06B6D4',
  '#8B5CF6',
  '#6366F1',
  '#EC4899',
  '#F59E0B',
];

interface AddGoalModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddGoalModal({ visible, onClose }: AddGoalModalProps) {
  const { addGoal } = useFinance();
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [category, setCategory] = useState('Other');
  const [deadline, setDeadline] = useState('');
  const [selectedColor, setSelectedColor] = useState(GOAL_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const resetForm = () => {
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    setCategory('Other');
    setDeadline('');
    setSelectedColor(GOAL_COLORS[0]);
    setIsSubmitting(false);
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

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a goal title');
      return;
    }

    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid target amount');
      return;
    }

    const currentAmountValue = currentAmount ? parseFloat(currentAmount) : 0;
    const targetAmountValue = parseFloat(targetAmount);

    if (currentAmountValue < 0) {
      Alert.alert('Invalid Amount', 'Current amount cannot be negative');
      return;
    }

    if (currentAmountValue > targetAmountValue) {
      Alert.alert('Invalid Amount', 'Current amount cannot exceed target amount');
      return;
    }

    setIsSubmitting(true);

    try {
      addGoal({
        title: title.trim(),
        targetAmount: targetAmountValue,
        currentAmount: currentAmountValue,
        category,
        color: selectedColor,
        deadline: deadline || undefined,
      });

      setShowSuccess(true);
    } catch (error) {
      console.error('Error adding goal:', error);
      Alert.alert('Error', 'Failed to create goal. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create Goal</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose} activeOpacity={0.7}>
            <X color={AppColors.textSecondary} size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.label}>Goal Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Summer Vacation"
              placeholderTextColor={AppColors.textLight}
              maxLength={50}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryGrid}>
              {GOAL_CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    category === cat && styles.categoryButtonActive,
                  ]}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      category === cat && styles.categoryButtonTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Target Amount (JD)</Text>
            <TextInput
              style={styles.input}
              value={targetAmount}
              onChangeText={setTargetAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={AppColors.textLight}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Current Amount (JD) - Optional</Text>
            <TextInput
              style={styles.input}
              value={currentAmount}
              onChangeText={setCurrentAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={AppColors.textLight}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Deadline (Optional)</Text>
            <TextInput
              style={styles.input}
              value={deadline}
              onChangeText={setDeadline}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={AppColors.textLight}
            />
            <Text style={styles.helpText}>Format: YYYY-MM-DD (e.g., 2025-12-31)</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Color Theme</Text>
            <View style={styles.colorGrid}>
              {GOAL_COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorButtonActive,
                  ]}
                  onPress={() => setSelectedColor(color)}
                  activeOpacity={0.7}
                />
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.7}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Creating...' : 'Create Goal'}
            </Text>
          </TouchableOpacity>
        </View>

        <SuccessAnimation
          visible={showSuccess}
          type="goal"
          onComplete={handleSuccessComplete}
          autoHide={true}
          autoHideDelay={2000}
        />
      </View>
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
    paddingTop: Platform.OS === 'ios' ? 20 : 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  headerTitle: {
    fontFamily,
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: AppColors.textPrimary,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: AppColors.surfaceLight,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  label: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600' as const,
    color: AppColors.textPrimary,
    marginBottom: 12,
  },
  input: {
    fontFamily,
    backgroundColor: AppColors.surfaceLight,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: AppColors.textPrimary,
  },
  helpText: {
    fontFamily,
    fontSize: 12,
    color: AppColors.textLight,
    marginTop: 6,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: AppColors.surfaceLight,
    borderWidth: 1.5,
    borderColor: AppColors.border,
  },
  categoryButtonActive: {
    backgroundColor: AppColors.blue[50],
    borderColor: AppColors.primary,
  },
  categoryButtonText: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600' as const,
    color: AppColors.textSecondary,
  },
  categoryButtonTextActive: {
    color: AppColors.primary,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorButtonActive: {
    borderColor: AppColors.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    gap: 12,
    backgroundColor: AppColors.background,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: AppColors.surfaceLight,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600' as const,
    color: AppColors.textPrimary,
  },
  submitButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
