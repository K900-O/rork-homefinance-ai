import React, { useState, useMemo } from 'react';
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
  KeyboardAvoidingView,
} from 'react-native';
import { X, Calendar, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react-native';
import { useFinance } from '@/contexts/FinanceContext';
import type { TransactionType, TransactionCategory, RecurrenceType } from '@/constants/types';
import { sfProDisplayBold, sfProDisplayMedium, sfProDisplayRegular } from '@/constants/Typography';
import { AppColors } from '@/constants/colors';

const CATEGORIES: { value: TransactionCategory; label: string }[] = [
  { value: 'food', label: 'Food & Dining' },
  { value: 'transport', label: 'Transportation' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'bills', label: 'Bills & Utilities' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'investment', label: 'Investment' },
  { value: 'savings', label: 'Savings' },
  { value: 'income', label: 'Income' },
  { value: 'other', label: 'Other' },
];

const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string; description: string }[] = [
  { value: 'once', label: 'Once', description: 'One-time transaction' },
  { value: 'daily', label: 'Daily', description: 'Every day' },
  { value: 'weekly', label: 'Weekly', description: 'Every week' },
  { value: 'biweekly', label: 'Bi-weekly', description: 'Every 2 weeks' },
  { value: 'monthly', label: 'Monthly', description: 'Every month' },
  { value: 'yearly', label: 'Yearly', description: 'Every year' },
];

interface AddPlannedTransactionModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddPlannedTransactionModal({ visible, onClose }: AddPlannedTransactionModalProps) {
  const { addPlannedTransaction } = useFinance();
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<TransactionCategory>('other');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('monthly');
  const [scheduledDate, setScheduledDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCategories = useMemo(() => {
    return CATEGORIES.filter(cat => {
      if (type === 'income') return cat.value === 'income';
      return cat.value !== 'income';
    });
  }, [type]);

  const resetForm = () => {
    setType('expense');
    setCategory('other');
    setAmount('');
    setDescription('');
    setNotes('');
    setRecurrence('monthly');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduledDate(tomorrow.toISOString().split('T')[0]);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Missing Description', 'Please enter a description');
      return;
    }

    if (!scheduledDate) {
      Alert.alert('Missing Date', 'Please select a scheduled date');
      return;
    }

    setIsSubmitting(true);

    try {
      const dateObj = new Date(scheduledDate);
      dateObj.setHours(12, 0, 0, 0);

      addPlannedTransaction({
        type,
        category,
        amount: parseFloat(amount),
        description: description.trim(),
        scheduledDate: dateObj.toISOString(),
        recurrence,
        notes: notes.trim() || undefined,
      });

      Alert.alert(
        'Success',
        'Planned transaction added successfully',
        [{ text: 'OK', onPress: handleClose }]
      );
    } catch (error) {
      console.error('Error adding planned transaction:', error);
      Alert.alert('Error', 'Failed to add planned transaction. Please try again.');
      setIsSubmitting(false);
    }
  };

  const formatDateDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Plan Transaction</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose} activeOpacity={0.7}>
            <X color={AppColors.textPrimary} size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.label}>Transaction Type</Text>
            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[styles.typeButton, type === 'expense' && styles.typeButtonActiveExpense]}
                onPress={() => {
                  setType('expense');
                  if (category === 'income') setCategory('other');
                }}
                activeOpacity={0.7}
              >
                <TrendingDown size={18} color={type === 'expense' ? AppColors.danger : AppColors.textLight} />
                <Text style={[styles.typeButtonText, type === 'expense' && styles.typeButtonTextActiveExpense]}>
                  Expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, type === 'income' && styles.typeButtonActiveIncome]}
                onPress={() => {
                  setType('income');
                  setCategory('income');
                }}
                activeOpacity={0.7}
              >
                <TrendingUp size={18} color={type === 'income' ? AppColors.primary : AppColors.textLight} />
                <Text style={[styles.typeButtonText, type === 'income' && styles.typeButtonTextActiveIncome]}>
                  Income
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Amount (USD)</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={AppColors.textLight}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="e.g., Monthly rent, Salary"
                placeholderTextColor={AppColors.textLight}
                maxLength={100}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Scheduled Date</Text>
            <View style={styles.dateInputContainer}>
              <Calendar size={20} color={AppColors.primary} />
              <TextInput
                style={styles.dateInput}
                value={scheduledDate}
                onChangeText={setScheduledDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={AppColors.textLight}
              />
            </View>
            {scheduledDate && (
              <Text style={styles.datePreview}>{formatDateDisplay(scheduledDate)}</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Recurrence</Text>
            <View style={styles.recurrenceGrid}>
              {RECURRENCE_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.recurrenceButton,
                    recurrence === option.value && styles.recurrenceButtonActive,
                  ]}
                  onPress={() => setRecurrence(option.value)}
                  activeOpacity={0.7}
                >
                  <RefreshCw 
                    size={16} 
                    color={recurrence === option.value ? AppColors.primary : AppColors.textLight} 
                  />
                  <Text
                    style={[
                      styles.recurrenceButtonText,
                      recurrence === option.value && styles.recurrenceButtonTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.recurrenceDescription}>
              {RECURRENCE_OPTIONS.find(r => r.value === recurrence)?.description}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryGrid}>
              {filteredCategories.map(cat => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryButton,
                    category === cat.value && styles.categoryButtonActive,
                  ]}
                  onPress={() => setCategory(cat.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      category === cat.value && styles.categoryButtonTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any additional notes..."
                placeholderTextColor={AppColors.textLight}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Type</Text>
                <View style={[
                  styles.summaryBadge,
                  type === 'income' ? styles.incomeBadge : styles.expenseBadge
                ]}>
                  <Text style={[
                    styles.summaryBadgeText,
                    type === 'income' ? styles.incomeText : styles.expenseText
                  ]}>
                    {type === 'income' ? 'Income' : 'Expense'}
                  </Text>
                </View>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Amount</Text>
                <Text style={[
                  styles.summaryValue,
                  type === 'income' ? styles.incomeText : styles.expenseText
                ]}>
                  {type === 'income' ? '+' : '-'}{amount || '0.00'} USD
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Frequency</Text>
                <Text style={styles.summaryValue}>
                  {RECURRENCE_OPTIONS.find(r => r.value === recurrence)?.label}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Starting</Text>
                <Text style={styles.summaryValue}>
                  {scheduledDate ? formatDateDisplay(scheduledDate) : 'Not set'}
                </Text>
              </View>
            </View>
          </View>
          <View style={{ height: 40 }} />
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
              {isSubmitting ? 'Adding...' : 'Plan Transaction'}
            </Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: Platform.OS === 'ios' ? 20 : 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  headerTitle: {
    fontFamily: sfProDisplayBold,
    fontSize: 24,
    fontWeight: '700',
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
    fontFamily: sfProDisplayMedium,
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 10,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: AppColors.surfaceLight,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  typeButtonActiveExpense: {
    backgroundColor: AppColors.dangerLight,
    borderColor: AppColors.dangerLight,
  },
  typeButtonActiveIncome: {
    backgroundColor: AppColors.blue[50],
    borderColor: AppColors.blue[100],
  },
  typeButtonText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.textLight,
  },
  typeButtonTextActiveExpense: {
    color: AppColors.danger,
  },
  typeButtonTextActiveIncome: {
    color: AppColors.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surfaceLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    paddingHorizontal: 16,
    height: 56,
  },
  inputWrapper: {
    backgroundColor: AppColors.surfaceLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    overflow: 'hidden',
  },
  currencySymbol: {
    fontFamily: sfProDisplayMedium,
    fontSize: 20,
    color: AppColors.textPrimary,
    marginRight: 8,
  },
  amountInput: {
    fontFamily: sfProDisplayBold,
    flex: 1,
    fontSize: 24,
    color: AppColors.textPrimary,
    paddingVertical: 10,
  },
  input: {
    fontFamily: sfProDisplayRegular,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: AppColors.textPrimary,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surfaceLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    paddingHorizontal: 16,
    gap: 12,
    height: 52,
  },
  dateInput: {
    fontFamily: sfProDisplayRegular,
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: AppColors.textPrimary,
  },
  datePreview: {
    fontFamily: sfProDisplayMedium,
    fontSize: 13,
    color: AppColors.primary,
    marginTop: 8,
    marginLeft: 4,
  },
  recurrenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  recurrenceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: AppColors.surfaceLight,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  recurrenceButtonActive: {
    backgroundColor: AppColors.blue[50],
    borderColor: AppColors.blue[200],
  },
  recurrenceButtonText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 14,
    fontWeight: '500',
    color: AppColors.textLight,
  },
  recurrenceButtonTextActive: {
    color: AppColors.primary,
    fontWeight: '600',
  },
  recurrenceDescription: {
    fontFamily: sfProDisplayRegular,
    fontSize: 13,
    color: AppColors.textLight,
    marginTop: 10,
    marginLeft: 4,
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
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  categoryButtonActive: {
    backgroundColor: AppColors.textPrimary,
    borderColor: AppColors.textPrimary,
  },
  categoryButtonText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 14,
    fontWeight: '500',
    color: AppColors.textLight,
  },
  categoryButtonTextActive: {
    color: AppColors.textInverse,
  },
  summarySection: {
    marginTop: 32,
    marginBottom: 24,
  },
  summaryTitle: {
    fontFamily: sfProDisplayBold,
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: AppColors.surfaceLight,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: AppColors.border,
    gap: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontFamily: sfProDisplayMedium,
    fontSize: 14,
    color: AppColors.textLight,
  },
  summaryValue: {
    fontFamily: sfProDisplayBold,
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  summaryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  incomeBadge: {
    backgroundColor: AppColors.blue[50],
  },
  expenseBadge: {
    backgroundColor: AppColors.dangerLight,
  },
  summaryBadgeText: {
    fontFamily: sfProDisplayBold,
    fontSize: 12,
    fontWeight: '600',
  },
  incomeText: {
    color: AppColors.primary,
  },
  expenseText: {
    color: AppColors.danger,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopWidth: 1,
    borderTopColor: AppColors.borderDark,
    backgroundColor: AppColors.background,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: AppColors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontFamily: sfProDisplayBold,
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textLight,
  },
  submitButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 16,
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
    fontFamily: sfProDisplayBold,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
