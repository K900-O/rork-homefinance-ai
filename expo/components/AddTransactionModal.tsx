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
import { AppColors } from '@/constants/colors';
import SuccessAnimation from './SuccessAnimation';

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
  const [showSuccess, setShowSuccess] = useState(false);

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

      setShowSuccess(true);
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
      case 'safe': return AppColors.primary;
      case 'warning': return AppColors.warning;
      case 'danger': return AppColors.danger;
      case 'exceeded': return '#DC2626';
      default: return AppColors.textLight;
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
            <X color={AppColors.textSecondary} size={24} />
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
              placeholderTextColor={AppColors.textLight}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholder="e.g., Grocery shopping"
              placeholderTextColor={AppColors.textLight}
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
                        { borderColor: selectedBudgetId === budget.budgetId ? AppColors.primary : AppColors.border },
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
                          selectedBudgetId === budget.budgetId && { color: AppColors.primary },
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
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(budgetImpact.status)}15` }]}>
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
                        { width: `${Math.min(budgetImpact.currentPercentage, 100)}%`, backgroundColor: AppColors.blue[200] }
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
                    <AlertTriangle size={16} color={AppColors.danger} />
                    <Text style={styles.warningText}>This will exceed your budget limit!</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {ruleViolations.length > 0 && (
            <View style={styles.violationsSection}>
              <View style={styles.impactHeader}>
                <Shield size={18} color={AppColors.danger} />
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
                      <AlertCircle size={18} color={AppColors.danger} />
                    ) : (
                      <AlertTriangle size={18} color={AppColors.warning} />
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
                <AlertTriangle size={24} color={AppColors.warning} />
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
                      setShowSuccess(true);
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
              placeholderTextColor={AppColors.textLight}
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
                <AlertCircle size={18} color={AppColors.textLight} />
                <Text style={styles.blockedButtonText}>Blocked</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Adding...' : hasWarnings ? 'Review & Add' : 'Add Transaction'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <SuccessAnimation
          visible={showSuccess}
          type="transaction"
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
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: AppColors.surfaceLight,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  typeButtonText: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600' as const,
    color: AppColors.textSecondary,
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
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
  budgetCategorySection: {
    marginBottom: 8,
  },
  budgetCategoryLabel: {
    fontFamily,
    fontSize: 13,
    fontWeight: '500' as const,
    color: AppColors.textLight,
    marginBottom: 10,
  },
  budgetCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  budgetCategoryButtonActive: {
    backgroundColor: AppColors.blue[50],
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
    color: AppColors.textPrimary,
  },
  impactCard: {
    backgroundColor: AppColors.surfaceLight,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
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
    color: AppColors.textPrimary,
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
    backgroundColor: AppColors.border,
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
    color: AppColors.textLight,
    marginBottom: 4,
  },
  impactDetailValue: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600' as const,
    color: AppColors.textPrimary,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: AppColors.dangerLight,
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  warningText: {
    fontFamily,
    fontSize: 13,
    color: AppColors.danger,
    flex: 1,
  },
  violationsSection: {
    marginTop: 24,
  },
  violationsTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600' as const,
    color: AppColors.danger,
  },
  violationCard: {
    backgroundColor: AppColors.warningLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  violationCardBlocking: {
    backgroundColor: AppColors.dangerLight,
    borderColor: 'rgba(239, 68, 68, 0.3)',
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
    color: AppColors.warning,
    flex: 1,
  },
  violationRuleNameBlocking: {
    color: AppColors.danger,
  },
  blockingBadge: {
    backgroundColor: AppColors.danger,
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
    color: AppColors.textSecondary,
  },
  confirmSection: {
    marginTop: 24,
  },
  confirmCard: {
    backgroundColor: AppColors.warningLight,
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
    color: AppColors.warning,
    marginTop: 12,
    marginBottom: 8,
  },
  confirmText: {
    fontFamily,
    fontSize: 14,
    color: AppColors.textSecondary,
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
    backgroundColor: AppColors.surfaceLight,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  confirmCancelText: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600' as const,
    color: AppColors.textPrimary,
  },
  confirmProceedButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: AppColors.warning,
    alignItems: 'center',
  },
  confirmProceedText: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
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
  submitButtonBlocked: {
    backgroundColor: AppColors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
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
    color: AppColors.textLight,
  },
});
