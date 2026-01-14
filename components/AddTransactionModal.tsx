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
import { X, AlertTriangle, AlertCircle, TrendingUp, Shield } from 'lucide-react-native';
import { useFinance } from '@/contexts/FinanceContext';
import type { TransactionType, TransactionCategory, BudgetImpact, BudgetCategory } from '@/constants/types';
import { fontFamily } from '@/constants/Typography';

const BASE_CATEGORIES: { value: TransactionCategory; label: string }[] = [
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

const BUDGET_TO_TRANSACTION_CATEGORY: Record<BudgetCategory, TransactionCategory> = {
  groceries: 'food',
  dining: 'food',
  transport: 'transport',
  entertainment: 'entertainment',
  personal: 'shopping',
  utilities: 'bills',
  household: 'other',
  other: 'other',
};

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
}

export default function AddTransactionModal({ visible, onClose, defaultType = 'expense' }: AddTransactionModalProps) {
  const { addTransaction, checkBudgetImpact, checkRuleViolation, budgets } = useFinance();
  const [type, setType] = useState<TransactionType>(defaultType);
  const [category, setCategory] = useState<TransactionCategory>('other');
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWarningConfirm, setShowWarningConfirm] = useState(false);

  const budgetImpact = useMemo<BudgetImpact | null>(() => {
    if (type !== 'expense' || !amount || parseFloat(amount) <= 0) return null;
    
    return checkBudgetImpact({
      type,
      category,
      amount: parseFloat(amount),
      description: description.trim() || 'Transaction',
      date: new Date().toISOString(),
    });
  }, [type, category, amount, description, checkBudgetImpact]);

  const ruleViolations = useMemo(() => {
    if (type !== 'expense' || !amount || parseFloat(amount) <= 0) return [];
    
    return checkRuleViolation({
      type,
      category,
      amount: parseFloat(amount),
      description: description.trim() || 'Transaction',
      date: new Date().toISOString(),
    });
  }, [type, category, amount, description, checkRuleViolation]);

  const hasBlockingViolation = ruleViolations.some(v => v.isBlocking);
  const hasWarnings = ruleViolations.length > 0 || (budgetImpact && (budgetImpact.willExceed || budgetImpact.status === 'danger'));

  const resetForm = () => {
    setType(defaultType);
    setCategory('other');
    setSelectedBudgetId(null);
    setAmount('');
    setDescription('');
    setNotes('');
    setIsSubmitting(false);
    setShowWarningConfirm(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Missing Description', 'Please enter a description');
      return;
    }

    if (hasBlockingViolation) {
      Alert.alert(
        'Transaction Blocked',
        'This transaction violates a strict budget rule and cannot be added. Please adjust the amount or change your budget rules.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (hasWarnings && !showWarningConfirm) {
      setShowWarningConfirm(true);
      return;
    }

    setIsSubmitting(true);

    try {
      addTransaction({
        type,
        category,
        amount: parseFloat(amount),
        description: description.trim(),
        date: new Date().toISOString(),
        notes: notes.trim() || undefined,
      });

      Alert.alert(
        'Success',
        'Transaction added successfully',
        [{ text: 'OK', onPress: handleClose }]
      );
    } catch (error) {
      console.error('Error adding transaction:', error);
      Alert.alert('Error', 'Failed to add transaction. Please try again.');
      setIsSubmitting(false);
    }
  };

  const budgetCategories = useMemo(() => {
    return budgets.map(budget => ({
      budgetId: budget.id,
      value: BUDGET_TO_TRANSACTION_CATEGORY[budget.category],
      label: budget.name,
      color: budget.color,
      isBudget: true,
    }));
  }, [budgets]);

  const filteredCategories = useMemo(() => {
    const baseFiltered = BASE_CATEGORIES.filter(cat => {
      if (type === 'income') return cat.value === 'income';
      return cat.value !== 'income';
    });
    return baseFiltered;
  }, [type]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'danger': return '#EF4444';
      case 'exceeded': return '#DC2626';
      default: return '#71717A';
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
          <Text style={styles.headerTitle}>Add Transaction</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose} activeOpacity={0.7}>
            <X color="#FFFFFF" size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.label}>Type</Text>
            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
                onPress={() => {
                  setType('expense');
                  if (category === 'income') setCategory('other');
                  setShowWarningConfirm(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.typeButtonText, type === 'expense' && styles.typeButtonTextActive]}>
                  Expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
                onPress={() => {
                  setType('income');
                  setCategory('income');
                  setShowWarningConfirm(false);
                }}
                activeOpacity={0.7}
              >
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
              onChangeText={(text) => {
                setAmount(text);
                setShowWarningConfirm(false);
              }}
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
              placeholder="e.g., Grocery shopping"
              placeholderTextColor="#52525B"
              maxLength={100}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            
            {type === 'expense' && budgetCategories.length > 0 && (
              <View style={styles.budgetCategorySection}>
                <Text style={styles.budgetCategoryLabel}>From Your Budgets</Text>
                <View style={styles.categoryGrid}>
                  {budgetCategories.map(budget => (
                    <TouchableOpacity
                      key={budget.budgetId}
                      style={[
                        styles.categoryButton,
                        styles.budgetCategoryButton,
                        selectedBudgetId === budget.budgetId && styles.budgetCategoryButtonActive,
                        { borderColor: selectedBudgetId === budget.budgetId ? budget.color : '#333' },
                      ]}
                      onPress={() => {
                        setSelectedBudgetId(budget.budgetId);
                        setCategory(budget.value);
                        setShowWarningConfirm(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.budgetDot, { backgroundColor: budget.color }]} />
                      <Text
                        style={[
                          styles.categoryButtonText,
                          selectedBudgetId === budget.budgetId && { color: budget.color },
                        ]}
                      >
                        {budget.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <Text style={[styles.budgetCategoryLabel, type === 'expense' && budgetCategories.length > 0 && { marginTop: 16 }]}>
              {type === 'expense' && budgetCategories.length > 0 ? 'Or Select Category' : 'Select Category'}
            </Text>
            <View style={styles.categoryGrid}>
              {filteredCategories.map(cat => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryButton,
                    category === cat.value && !selectedBudgetId && styles.categoryButtonActive,
                  ]}
                  onPress={() => {
                    setCategory(cat.value);
                    setSelectedBudgetId(null);
                    setShowWarningConfirm(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      category === cat.value && !selectedBudgetId && styles.categoryButtonTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {budgetImpact && (
            <View style={styles.budgetImpactSection}>
              <View style={styles.impactHeader}>
                <TrendingUp size={18} color={getStatusColor(budgetImpact.status)} />
                <Text style={styles.impactTitle}>Budget Impact</Text>
              </View>
              
              <View style={styles.impactCard}>
                <View style={styles.impactRow}>
                  <Text style={styles.impactLabel}>{budgetImpact.budget.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(budgetImpact.status)}20` }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(budgetImpact.status) }]}>
                      {budgetImpact.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${Math.min(budgetImpact.currentPercentage, 100)}%`, backgroundColor: '#52525B' }
                      ]} 
                    />
                    <View 
                      style={[
                        styles.progressFillNew, 
                        { 
                          left: `${Math.min(budgetImpact.currentPercentage, 100)}%`,
                          width: `${Math.min(budgetImpact.newPercentage - budgetImpact.currentPercentage, 100 - budgetImpact.currentPercentage)}%`,
                          backgroundColor: getStatusColor(budgetImpact.status)
                        }
                      ]} 
                    />
                  </View>
                </View>
                
                <View style={styles.impactDetails}>
                  <View style={styles.impactDetailItem}>
                    <Text style={styles.impactDetailLabel}>Current</Text>
                    <Text style={styles.impactDetailValue}>{budgetImpact.currentSpent.toFixed(0)} USD</Text>
                  </View>
                  <View style={styles.impactDetailItem}>
                    <Text style={styles.impactDetailLabel}>After</Text>
                    <Text style={[styles.impactDetailValue, { color: getStatusColor(budgetImpact.status) }]}>
                      {budgetImpact.newSpent.toFixed(0)} USD
                    </Text>
                  </View>
                  <View style={styles.impactDetailItem}>
                    <Text style={styles.impactDetailLabel}>Remaining</Text>
                    <Text style={styles.impactDetailValue}>{budgetImpact.remaining.toFixed(0)} USD</Text>
                  </View>
                </View>

                {budgetImpact.willExceed && (
                  <View style={styles.warningBox}>
                    <AlertTriangle size={16} color="#DC2626" />
                    <Text style={styles.warningText}>This will exceed your budget limit!</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {ruleViolations.length > 0 && (
            <View style={styles.violationsSection}>
              <View style={styles.impactHeader}>
                <Shield size={18} color="#EF4444" />
                <Text style={styles.violationsTitle}>Rule Violations</Text>
              </View>
              
              {ruleViolations.map((violation, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.violationCard,
                    violation.isBlocking && styles.violationCardBlocking
                  ]}
                >
                  <View style={styles.violationHeader}>
                    {violation.isBlocking ? (
                      <AlertCircle size={18} color="#DC2626" />
                    ) : (
                      <AlertTriangle size={18} color="#F59E0B" />
                    )}
                    <Text style={[
                      styles.violationRuleName,
                      violation.isBlocking && styles.violationRuleNameBlocking
                    ]}>
                      {violation.rule.name}
                    </Text>
                    {violation.isBlocking && (
                      <View style={styles.blockingBadge}>
                        <Text style={styles.blockingBadgeText}>BLOCKED</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.violationMessage}>{violation.message}</Text>
                </View>
              ))}
            </View>
          )}

          {showWarningConfirm && hasWarnings && !hasBlockingViolation && (
            <View style={styles.confirmSection}>
              <View style={styles.confirmCard}>
                <AlertTriangle size={24} color="#F59E0B" />
                <Text style={styles.confirmTitle}>Confirm Transaction</Text>
                <Text style={styles.confirmText}>
                  This transaction has warnings. Are you sure you want to proceed?
                </Text>
                <View style={styles.confirmButtons}>
                  <TouchableOpacity 
                    style={styles.confirmCancelButton}
                    onPress={() => setShowWarningConfirm(false)}
                  >
                    <Text style={styles.confirmCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.confirmProceedButton}
                    onPress={() => {
                      setIsSubmitting(true);
                      addTransaction({
                        type,
                        category,
                        amount: parseFloat(amount),
                        description: description.trim(),
                        date: new Date().toISOString(),
                        notes: notes.trim() || undefined,
                      });
                      Alert.alert('Success', 'Transaction added successfully', [{ text: 'OK', onPress: handleClose }]);
                    }}
                  >
                    <Text style={styles.confirmProceedText}>Proceed Anyway</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any additional notes..."
              placeholderTextColor="#52525B"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
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
            style={[
              styles.submitButton, 
              isSubmitting && styles.submitButtonDisabled,
              hasBlockingViolation && styles.submitButtonBlocked
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting || hasBlockingViolation}
            activeOpacity={0.7}
          >
            {hasBlockingViolation ? (
              <View style={styles.blockedButtonContent}>
                <AlertCircle size={18} color="#71717A" />
                <Text style={styles.blockedButtonText}>Blocked</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Adding...' : hasWarnings ? 'Review & Add' : 'Add Transaction'}
              </Text>
            )}
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
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
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
    minHeight: 100,
    paddingTop: 14,
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
  budgetCategorySection: {
    marginBottom: 8,
  },
  budgetCategoryLabel: {
    fontFamily,
    fontSize: 13,
    fontWeight: '500' as const,
    color: '#71717A',
    marginBottom: 10,
  },
  budgetCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  budgetCategoryButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  budgetDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  budgetImpactSection: {
    marginTop: 24,
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  impactTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  impactCard: {
    backgroundColor: '#18181B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  impactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  impactLabel: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontFamily,
    fontSize: 11,
    fontWeight: '700' as const,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#27272A',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    height: '100%',
    borderRadius: 4,
    left: 0,
    top: 0,
  },
  progressFillNew: {
    position: 'absolute',
    height: '100%',
    top: 0,
  },
  impactDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  impactDetailItem: {
    alignItems: 'center',
  },
  impactDetailLabel: {
    fontFamily,
    fontSize: 12,
    color: '#71717A',
    marginBottom: 4,
  },
  impactDetailValue: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  warningText: {
    fontFamily,
    fontSize: 13,
    color: '#DC2626',
    flex: 1,
  },
  violationsSection: {
    marginTop: 24,
  },
  violationsTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#EF4444',
  },
  violationCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  violationCardBlocking: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  violationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  violationRuleName: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#F59E0B',
    flex: 1,
  },
  violationRuleNameBlocking: {
    color: '#DC2626',
  },
  blockingBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  blockingBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  violationMessage: {
    fontFamily,
    fontSize: 13,
    color: '#A1A1AA',
  },
  confirmSection: {
    marginTop: 24,
  },
  confirmCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  confirmTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#F59E0B',
    marginTop: 12,
    marginBottom: 8,
  },
  confirmText: {
    fontFamily,
    fontSize: 14,
    color: '#A1A1AA',
    textAlign: 'center',
    marginBottom: 16,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#27272A',
    alignItems: 'center',
  },
  confirmCancelText: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  confirmProceedButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
  },
  confirmProceedText: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#000000',
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
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonBlocked: {
    backgroundColor: '#27272A',
    opacity: 1,
  },
  submitButtonText: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#000000',
  },
  blockedButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  blockedButtonText: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#71717A',
  },
});
