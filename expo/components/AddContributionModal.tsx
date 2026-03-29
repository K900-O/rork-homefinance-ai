import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useFinance } from '@/contexts/FinanceContext';
import type { SavingsGoal } from '@/constants/types';
import { fontFamily } from '@/constants/Typography';
import { AppColors } from '@/constants/colors';
import SuccessAnimation from './SuccessAnimation';

interface AddContributionModalProps {
  visible: boolean;
  onClose: () => void;
  goal: SavingsGoal;
}

export default function AddContributionModal({ visible, onClose, goal }: AddContributionModalProps) {
  const { updateGoal } = useFinance();
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successTitle, setSuccessTitle] = useState('');
  const [successSubtitle, setSuccessSubtitle] = useState('');

  const resetForm = () => {
    setAmount('');
    setIsSubmitting(false);
    setShowSuccess(false);
    setSuccessTitle('');
    setSuccessSubtitle('');
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
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid contribution amount');
      return;
    }

    const contributionAmount = parseFloat(amount);
    const newCurrentAmount = goal.currentAmount + contributionAmount;

    if (newCurrentAmount > goal.targetAmount) {
      Alert.alert(
        'Amount Exceeds Target',
        `This contribution would exceed your goal. Maximum contribution: JD ${(goal.targetAmount - goal.currentAmount).toFixed(2)}`,
      );
      return;
    }

    setIsSubmitting(true);

    try {
      updateGoal(goal.id, {
        currentAmount: newCurrentAmount,
      });

      const remaining = goal.targetAmount - newCurrentAmount;
      const isCompleted = remaining === 0;

      if (isCompleted) {
        setSuccessTitle('Goal Completed! 🎉');
        setSuccessSubtitle(`Congratulations! You've reached your "${goal.title}" goal!`);
      } else {
        setSuccessTitle('Contribution Added!');
        setSuccessSubtitle(`You added JD ${contributionAmount.toFixed(2)} to "${goal.title}". Keep going!`);
      }

      setShowSuccess(true);
    } catch (error) {
      console.error('Error adding contribution:', error);
      Alert.alert('Error', 'Failed to add contribution. Please try again.');
      setIsSubmitting(false);
    }
  };

  const remaining = goal.targetAmount - goal.currentAmount;
  const progress = (goal.currentAmount / goal.targetAmount) * 100;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add Contribution</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose} activeOpacity={0.7}>
            <X color={AppColors.textSecondary} size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.goalInfo}>
            <View style={[styles.goalIcon, { backgroundColor: AppColors.blue[50] }]}>
              <Text style={[styles.goalIconText, { color: AppColors.primary }]}>
                {goal.title.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.goalDetails}>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              <Text style={styles.goalCategory}>{goal.category}</Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Current Progress</Text>
              <Text style={[styles.progressValue, { color: AppColors.primary }]}>
                {progress.toFixed(0)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min(100, progress)}%`, backgroundColor: AppColors.primary },
                ]}
              />
            </View>
            <View style={styles.amountInfo}>
              <View style={styles.amountItem}>
                <Text style={styles.amountLabel}>Current</Text>
                <Text style={styles.amountValue}>
                  JD {goal.currentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={styles.amountItem}>
                <Text style={styles.amountLabel}>Target</Text>
                <Text style={styles.amountValue}>
                  JD {goal.targetAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={styles.amountItem}>
                <Text style={styles.amountLabel}>Remaining</Text>
                <Text style={[styles.amountValue, { color: AppColors.textLight }]}>
                  JD {remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Contribution Amount (JD)</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={AppColors.textLight}
              autoFocus
            />
            <Text style={styles.helpText}>
              Maximum: JD {remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.quickAmounts}>
            <Text style={styles.quickAmountsLabel}>Quick amounts:</Text>
            <View style={styles.quickAmountsRow}>
              {[10, 25, 50, 100].map(quickAmount => {
                const isAvailable = quickAmount <= remaining;
                return (
                  <TouchableOpacity
                    key={quickAmount}
                    style={[
                      styles.quickAmountButton,
                      !isAvailable && styles.quickAmountButtonDisabled,
                    ]}
                    onPress={() => isAvailable && setAmount(quickAmount.toString())}
                    disabled={!isAvailable}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.quickAmountText,
                        !isAvailable && styles.quickAmountTextDisabled,
                      ]}
                    >
                      JD {quickAmount}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.7}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Adding...' : 'Add Contribution'}
            </Text>
          </TouchableOpacity>
        </View>

        <SuccessAnimation
          visible={showSuccess}
          type="contribution"
          title={successTitle}
          subtitle={successSubtitle}
          onComplete={handleSuccessComplete}
          autoHide={true}
          autoHideDelay={2500}
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
    paddingTop: 24,
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surfaceLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  goalIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  goalIconText: {
    fontFamily,
    fontSize: 24,
    fontWeight: 'bold' as const,
  },
  goalDetails: {
    flex: 1,
  },
  goalTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: '700' as const,
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  goalCategory: {
    fontFamily,
    fontSize: 14,
    color: AppColors.textLight,
  },
  progressSection: {
    backgroundColor: AppColors.surfaceLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontFamily,
    fontSize: 14,
    color: AppColors.textLight,
  },
  progressValue: {
    fontFamily,
    fontSize: 24,
    fontWeight: 'bold' as const,
  },
  progressBar: {
    height: 12,
    backgroundColor: AppColors.border,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  amountInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountItem: {
    flex: 1,
    alignItems: 'center',
  },
  amountLabel: {
    fontFamily,
    fontSize: 12,
    color: AppColors.textLight,
    marginBottom: 4,
  },
  amountValue: {
    fontFamily,
    fontSize: 14,
    fontWeight: '700' as const,
    color: AppColors.textPrimary,
  },
  inputSection: {
    marginBottom: 24,
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
    fontSize: 20,
    fontWeight: '600' as const,
    color: AppColors.textPrimary,
  },
  helpText: {
    fontFamily,
    fontSize: 12,
    color: AppColors.textLight,
    marginTop: 8,
  },
  quickAmounts: {
    marginBottom: 24,
  },
  quickAmountsLabel: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600' as const,
    color: AppColors.textLight,
    marginBottom: 12,
  },
  quickAmountsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickAmountButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: AppColors.surfaceLight,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    alignItems: 'center',
  },
  quickAmountButtonDisabled: {
    opacity: 0.4,
  },
  quickAmountText: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600' as const,
    color: AppColors.textPrimary,
  },
  quickAmountTextDisabled: {
    color: AppColors.textLight,
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
