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
import { X, Wallet, Shield, ChevronDown } from 'lucide-react-native';
import { useFinance } from '@/contexts/FinanceContext';
import type { BudgetCategory, BudgetPeriod, RuleStrictness } from '@/constants/types';
import { fontFamily } from '@/constants/Typography';
import { AppColors } from '@/constants/colors';
import SuccessAnimation from './SuccessAnimation';

interface BudgetModalProps {
  visible: boolean;
  onClose: () => void;
}

const BUDGET_CATEGORIES: { value: BudgetCategory; label: string; color: string }[] = [
  { value: 'household', label: 'Household', color: AppColors.primary },
  { value: 'groceries', label: 'Groceries', color: '#10B981' },
  { value: 'utilities', label: 'Utilities', color: '#F59E0B' },
  { value: 'entertainment', label: 'Entertainment', color: '#8B5CF6' },
  { value: 'dining', label: 'Dining Out', color: '#EF4444' },
  { value: 'transport', label: 'Transport', color: '#06B6D4' },
  { value: 'personal', label: 'Personal', color: '#EC4899' },
  { value: 'other', label: 'Other', color: '#6B7280' },
];

const STRICTNESS_OPTIONS: { value: RuleStrictness; label: string; description: string }[] = [
  { value: 'flexible', label: 'Flexible', description: 'Soft warnings only' },
  { value: 'moderate', label: 'Moderate', description: 'Warnings + notifications' },
  { value: 'strict', label: 'Strict', description: 'Block over-budget spending' },
];

type TabType = 'budget' | 'rule';

export default function BudgetModal({ visible, onClose }: BudgetModalProps) {
  const { addBudget, addBudgetRule } = useFinance();
  const [activeTab, setActiveTab] = useState<TabType>('budget');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successType, setSuccessType] = useState<'budget' | 'general'>('budget');
  
  const [budgetName, setBudgetName] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [budgetCategory, setBudgetCategory] = useState<BudgetCategory>('household');
  const [budgetPeriod, setBudgetPeriod] = useState<BudgetPeriod>('monthly');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  
  const [ruleName, setRuleName] = useState('');
  const [ruleDescription, setRuleDescription] = useState('');
  const [ruleCategory, setRuleCategory] = useState<BudgetCategory | undefined>(undefined);
  const [ruleMaxAmount, setRuleMaxAmount] = useState('');
  const [ruleMaxPercentage, setRuleMaxPercentage] = useState('');
  const [ruleStrictness, setRuleStrictness] = useState<RuleStrictness>('moderate');
  const [showRuleCategoryPicker, setShowRuleCategoryPicker] = useState(false);

  const resetForm = () => {
    setBudgetName('');
    setBudgetLimit('');
    setBudgetCategory('household');
    setBudgetPeriod('monthly');
    setRuleName('');
    setRuleDescription('');
    setRuleCategory(undefined);
    setRuleMaxAmount('');
    setRuleMaxPercentage('');
    setRuleStrictness('moderate');
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

  const handleAddBudget = async () => {
    if (!budgetName.trim() || !budgetLimit) return;
    
    const limitAmount = parseFloat(budgetLimit);
    if (isNaN(limitAmount)) {
      alert("Please enter a valid amount");
      return;
    }

    const categoryInfo = BUDGET_CATEGORIES.find(c => c.value === budgetCategory);
    
    const success = await addBudget({
      name: budgetName.trim(),
      budgetLimit: limitAmount,
      category: budgetCategory,
      period: budgetPeriod,
      startDate: new Date().toISOString(),
      color: categoryInfo?.color || AppColors.primary,
      rules: [],
    });
    
    if (success) {
      setSuccessType('budget');
      setShowSuccess(true);
    }
  };

  const handleAddRule = () => {
    if (!ruleName.trim()) return;
    
    addBudgetRule({
      name: ruleName.trim(),
      description: ruleDescription.trim(),
      category: ruleCategory,
      maxAmount: ruleMaxAmount ? parseFloat(ruleMaxAmount) : undefined,
      maxPercentage: ruleMaxPercentage ? parseFloat(ruleMaxPercentage) : undefined,
      strictness: ruleStrictness,
      isActive: true,
    });
    
    setSuccessType('general');
    setShowSuccess(true);
  };

  const selectedCategory = BUDGET_CATEGORIES.find(c => c.value === budgetCategory);
  const selectedRuleCategory = ruleCategory ? BUDGET_CATEGORIES.find(c => c.value === ruleCategory) : null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {activeTab === 'budget' ? 'New Budget' : 'New Rule'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X color={AppColors.textSecondary} size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.tabs}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'budget' && styles.activeTab]}
              onPress={() => setActiveTab('budget')}
            >
              <Wallet size={18} color={activeTab === 'budget' ? AppColors.primary : AppColors.textLight} />
              <Text style={[styles.tabText, activeTab === 'budget' && styles.activeTabText]}>
                Budget
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'rule' && styles.activeTab]}
              onPress={() => setActiveTab('rule')}
            >
              <Shield size={18} color={activeTab === 'rule' ? AppColors.primary : AppColors.textLight} />
              <Text style={[styles.tabText, activeTab === 'rule' && styles.activeTabText]}>
                Rule
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {activeTab === 'budget' ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Budget Name</Text>
                  <TextInput
                    style={styles.input}
                    value={budgetName}
                    onChangeText={setBudgetName}
                    placeholder="e.g., Monthly Groceries"
                    placeholderTextColor={AppColors.textLight}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Limit (USD)</Text>
                  <TextInput
                    style={styles.input}
                    value={budgetLimit}
                    onChangeText={setBudgetLimit}
                    placeholder="0.00"
                    placeholderTextColor={AppColors.textLight}
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Category</Text>
                  <TouchableOpacity 
                    style={styles.picker}
                    onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                  >
                    <View style={[styles.categoryDot, { backgroundColor: selectedCategory?.color }]} />
                    <Text style={styles.pickerText}>{selectedCategory?.label}</Text>
                    <ChevronDown size={20} color={AppColors.textLight} />
                  </TouchableOpacity>
                  
                  {showCategoryPicker && (
                    <View style={styles.pickerDropdown}>
                      {BUDGET_CATEGORIES.map(cat => (
                        <TouchableOpacity
                          key={cat.value}
                          style={[
                            styles.pickerOption,
                            budgetCategory === cat.value && styles.selectedOption
                          ]}
                          onPress={() => {
                            setBudgetCategory(cat.value);
                            setShowCategoryPicker(false);
                          }}
                        >
                          <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                          <Text style={styles.pickerOptionText}>{cat.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Period</Text>
                  <View style={styles.periodToggle}>
                    <TouchableOpacity 
                      style={[styles.periodOption, budgetPeriod === 'weekly' && styles.activePeriod]}
                      onPress={() => setBudgetPeriod('weekly')}
                    >
                      <Text style={[styles.periodText, budgetPeriod === 'weekly' && styles.activePeriodText]}>
                        Weekly
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.periodOption, budgetPeriod === 'monthly' && styles.activePeriod]}
                      onPress={() => setBudgetPeriod('monthly')}
                    >
                      <Text style={[styles.periodText, budgetPeriod === 'monthly' && styles.activePeriodText]}>
                        Monthly
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.submitButton, (!budgetName.trim() || !budgetLimit) && styles.disabledButton]}
                  onPress={handleAddBudget}
                  disabled={!budgetName.trim() || !budgetLimit}
                >
                  <Text style={[styles.submitButtonText, (!budgetName.trim() || !budgetLimit) && styles.disabledButtonText]}>
                    Create Budget
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Rule Name</Text>
                  <TextInput
                    style={styles.input}
                    value={ruleName}
                    onChangeText={setRuleName}
                    placeholder="e.g., No impulse purchases"
                    placeholderTextColor={AppColors.textLight}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Description</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={ruleDescription}
                    onChangeText={setRuleDescription}
                    placeholder="Describe this rule..."
                    placeholderTextColor={AppColors.textLight}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Apply to Category (Optional)</Text>
                  <TouchableOpacity 
                    style={styles.picker}
                    onPress={() => setShowRuleCategoryPicker(!showRuleCategoryPicker)}
                  >
                    {selectedRuleCategory ? (
                      <>
                        <View style={[styles.categoryDot, { backgroundColor: selectedRuleCategory.color }]} />
                        <Text style={styles.pickerText}>{selectedRuleCategory.label}</Text>
                      </>
                    ) : (
                      <Text style={styles.pickerPlaceholder}>All Categories</Text>
                    )}
                    <ChevronDown size={20} color={AppColors.textLight} />
                  </TouchableOpacity>
                  
                  {showRuleCategoryPicker && (
                    <View style={styles.pickerDropdown}>
                      <TouchableOpacity
                        style={[styles.pickerOption, !ruleCategory && styles.selectedOption]}
                        onPress={() => {
                          setRuleCategory(undefined);
                          setShowRuleCategoryPicker(false);
                        }}
                      >
                        <Text style={styles.pickerOptionText}>All Categories</Text>
                      </TouchableOpacity>
                      {BUDGET_CATEGORIES.map(cat => (
                        <TouchableOpacity
                          key={cat.value}
                          style={[
                            styles.pickerOption,
                            ruleCategory === cat.value && styles.selectedOption
                          ]}
                          onPress={() => {
                            setRuleCategory(cat.value);
                            setShowRuleCategoryPicker(false);
                          }}
                        >
                          <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                          <Text style={styles.pickerOptionText}>{cat.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>Max Amount (USD)</Text>
                    <TextInput
                      style={styles.input}
                      value={ruleMaxAmount}
                      onChangeText={setRuleMaxAmount}
                      placeholder="0.00"
                      placeholderTextColor={AppColors.textLight}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.label}>Max % of Budget</Text>
                    <TextInput
                      style={styles.input}
                      value={ruleMaxPercentage}
                      onChangeText={setRuleMaxPercentage}
                      placeholder="0"
                      placeholderTextColor={AppColors.textLight}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Strictness</Text>
                  <View style={styles.strictnessOptions}>
                    {STRICTNESS_OPTIONS.map(option => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.strictnessOption,
                          ruleStrictness === option.value && styles.activeStrictness
                        ]}
                        onPress={() => setRuleStrictness(option.value)}
                      >
                        <Text style={[
                          styles.strictnessLabel,
                          ruleStrictness === option.value && styles.activeStrictnessLabel
                        ]}>
                          {option.label}
                        </Text>
                        <Text style={styles.strictnessDesc}>{option.description}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.submitButton, !ruleName.trim() && styles.disabledButton]}
                  onPress={handleAddRule}
                  disabled={!ruleName.trim()}
                >
                  <Text style={[styles.submitButtonText, !ruleName.trim() && styles.disabledButtonText]}>
                    Create Rule
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>

          <SuccessAnimation
            visible={showSuccess}
            type={successType}
            title={successType === 'budget' ? 'Budget Created!' : 'Rule Created!'}
            subtitle={successType === 'budget' ? 'Start tracking your spending' : 'Your rule is now active'}
            onComplete={handleSuccessComplete}
            autoHide={true}
            autoHideDelay={2000}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: AppColors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  title: {
    fontFamily,
    fontSize: 20,
    fontWeight: '700' as const,
    color: AppColors.textPrimary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppColors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: AppColors.surfaceLight,
    borderWidth: 1.5,
    borderColor: AppColors.border,
  },
  activeTab: {
    backgroundColor: AppColors.blue[50],
    borderColor: AppColors.primary,
  },
  tabText: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600' as const,
    color: AppColors.textLight,
  },
  activeTabText: {
    color: AppColors.primary,
  },
  content: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600' as const,
    color: AppColors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: AppColors.surfaceLight,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: AppColors.textPrimary,
    fontFamily,
    borderWidth: 1.5,
    borderColor: AppColors.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  picker: {
    backgroundColor: AppColors.surfaceLight,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: AppColors.border,
  },
  pickerText: {
    fontFamily,
    fontSize: 16,
    color: AppColors.textPrimary,
    flex: 1,
  },
  pickerPlaceholder: {
    fontFamily,
    fontSize: 16,
    color: AppColors.textLight,
    flex: 1,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  pickerDropdown: {
    backgroundColor: AppColors.surfaceLight,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    overflow: 'hidden',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  selectedOption: {
    backgroundColor: AppColors.blue[50],
  },
  pickerOptionText: {
    fontFamily,
    fontSize: 15,
    color: AppColors.textPrimary,
  },
  periodToggle: {
    flexDirection: 'row',
    backgroundColor: AppColors.surfaceLight,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1.5,
    borderColor: AppColors.border,
  },
  periodOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activePeriod: {
    backgroundColor: AppColors.primary,
  },
  periodText: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600' as const,
    color: AppColors.textLight,
  },
  activePeriodText: {
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
  },
  strictnessOptions: {
    gap: 10,
  },
  strictnessOption: {
    backgroundColor: AppColors.surfaceLight,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: AppColors.border,
  },
  activeStrictness: {
    backgroundColor: AppColors.blue[50],
    borderColor: AppColors.primary,
  },
  strictnessLabel: {
    fontFamily,
    fontSize: 15,
    fontWeight: '600' as const,
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  activeStrictnessLabel: {
    color: AppColors.primary,
  },
  strictnessDesc: {
    fontFamily,
    fontSize: 13,
    color: AppColors.textLight,
  },
  submitButton: {
    backgroundColor: AppColors.primary,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: AppColors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontFamily,
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  disabledButtonText: {
    color: AppColors.textLight,
  },
});
