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
} from 'react-native';
import { X, Calendar, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react-native';
import { useFinance } from '@/contexts/FinanceContext';
import type { TransactionType, TransactionCategory, RecurrenceType } from '@/constants/types';
import { fontFamily } from '@/constants/Typography';

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
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Plan Transaction</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose} activeOpacity={0.7}>
            <X color="#FFFFFF" size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.label}>Type</Text>
            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[styles.typeButton, type === 'expense' && styles.typeButtonActiveExpense]}
                onPress={() => {
                  setType('expense');
                  if (category === 'income') setCategory('other');
                }}
                activeOpacity={0.7}
              >
                <TrendingDown size={18} color={type === 'expense' ? '#000' : '#A1A1AA'} />
                <Text style={[styles.typeButtonText, type === 'expense' && styles.typeButtonTextActive]}>
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
                <TrendingUp size={18} color={type === 'income' ? '#000' : '#A1A1AA'} />
                <Text style={[styles.typeButtonText, type === 'income' && styles.typeButtonTextActive]}>
                  Income
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Amount (USD)</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#52525B"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholder="e.g., Monthly rent, Salary"
              placeholderTextColor="#52525B"
              maxLength={100}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Scheduled Date</Text>
            <View style={styles.dateInputContainer}>
              <Calendar size={20} color="#10B981" />
              <TextInput
                style={styles.dateInput}
                value={scheduledDate}
                onChangeText={setScheduledDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#52525B"
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
                    color={recurrence === option.value ? '#10B981' : '#71717A'} 
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
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any additional notes..."
              placeholderTextColor="#52525B"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
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
      </View>
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
    paddingTop: Platform.OS === 'ios' ? 20 : 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#18181B',
  },
  headerTitle: {
    fontFamily,
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#FFFFFF',
    marginBottom: 12,
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
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#333',
  },
  typeButtonActiveExpense: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  typeButtonActiveIncome: {
    backgroundColor: '#D1FAE5',
    borderColor: '#6EE7B7',
  },
  typeButtonText: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#A1A1AA',
  },
  typeButtonTextActive: {
    color: '#000000',
  },
  input: {
    fontFamily,
    backgroundColor: '#18181B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 14,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 16,
    gap: 12,
  },
  dateInput: {
    fontFamily,
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
  },
  datePreview: {
    fontFamily,
    fontSize: 13,
    color: '#10B981',
    marginTop: 8,
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
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#333',
  },
  recurrenceButtonActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  recurrenceButtonText: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#71717A',
  },
  recurrenceButtonTextActive: {
    color: '#10B981',
  },
  recurrenceDescription: {
    fontFamily,
    fontSize: 13,
    color: '#52525B',
    marginTop: 10,
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
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#333',
  },
  categoryButtonActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  categoryButtonText: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#A1A1AA',
  },
  categoryButtonTextActive: {
    color: '#000000',
  },
  summarySection: {
    marginTop: 32,
    marginBottom: 24,
  },
  summaryTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: '#18181B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272A',
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontFamily,
    fontSize: 14,
    color: '#71717A',
  },
  summaryValue: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  summaryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  incomeBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  expenseBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  summaryBadgeText: {
    fontFamily,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  incomeText: {
    color: '#10B981',
  },
  expenseText: {
    color: '#EF4444',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderTopWidth: 1,
    borderTopColor: '#18181B',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  submitButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#000000',
  },
});
