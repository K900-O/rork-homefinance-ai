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

interface BudgetModalProps {
  visible: boolean;
  onClose: () => void;
}

const BUDGET_CATEGORIES: { value: BudgetCategory; label: string; color: string }[] = [
  { value: 'household', label: 'Household', color: '#3B82F6' },
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
  };

  const handleAddBudget = () => {
    if (!budgetName.trim() || !budgetLimit) return;
    
    const categoryInfo = BUDGET_CATEGORIES.find(c => c.value === budgetCategory);
    
    addBudget({
      name: budgetName.trim(),
      limit: parseFloat(budgetLimit),
      category: budgetCategory,
      period: budgetPeriod,
      startDate: new Date().toISOString(),
      color: categoryInfo?.color || '#3B82F6',
      rules: [],
    });
    
    resetForm();
    onClose();
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
    
    resetForm();
    onClose();
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
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X color="#FFF" size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.tabs}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'budget' && styles.activeTab]}
              onPress={() => setActiveTab('budget')}
            >
              <Wallet size={18} color={activeTab === 'budget' ? '#10B981' : '#71717A'} />
              <Text style={[styles.tabText, activeTab === 'budget' && styles.activeTabText]}>
                Budget
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'rule' && styles.activeTab]}
              onPress={() => setActiveTab('rule')}
            >
              <Shield size={18} color={activeTab === 'rule' ? '#10B981' : '#71717A'} />
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
                    placeholderTextColor="#52525B"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Limit (USD)</Text>
                  <TextInput
                    style={styles.input}
                    value={budgetLimit}
                    onChangeText={setBudgetLimit}
                    placeholder="0.00"
                    placeholderTextColor="#52525B"
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
                    <ChevronDown size={20} color="#71717A" />
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
                  <Text style={styles.submitButtonText}>Create Budget</Text>
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
                    placeholderTextColor="#52525B"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Description</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={ruleDescription}
                    onChangeText={setRuleDescription}
                    placeholder="Describe this rule..."
                    placeholderTextColor="#52525B"
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
                    <ChevronDown size={20} color="#71717A" />
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
                      placeholderTextColor="#52525B"
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
                      placeholderTextColor="#52525B"
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
                  <Text style={styles.submitButtonText}>Create Rule</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#18181B',
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
    borderBottomColor: '#27272A',
  },
  title: {
    fontFamily,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#27272A',
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
    backgroundColor: '#27272A',
  },
  activeTab: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  tabText: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: '#71717A',
  },
  activeTabText: {
    color: '#10B981',
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
    fontWeight: '600',
    color: '#A1A1AA',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFF',
    fontFamily,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  picker: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  pickerText: {
    fontFamily,
    fontSize: 16,
    color: '#FFF',
    flex: 1,
  },
  pickerPlaceholder: {
    fontFamily,
    fontSize: 16,
    color: '#71717A',
    flex: 1,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  pickerDropdown: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#3F3F46',
    overflow: 'hidden',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#3F3F46',
  },
  selectedOption: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  pickerOptionText: {
    fontFamily,
    fontSize: 15,
    color: '#FFF',
  },
  periodToggle: {
    flexDirection: 'row',
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 4,
  },
  periodOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activePeriod: {
    backgroundColor: '#10B981',
  },
  periodText: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: '#71717A',
  },
  activePeriodText: {
    color: '#000',
  },
  row: {
    flexDirection: 'row',
  },
  strictnessOptions: {
    gap: 10,
  },
  strictnessOption: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  activeStrictness: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10B981',
  },
  strictnessLabel: {
    fontFamily,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  activeStrictnessLabel: {
    color: '#10B981',
  },
  strictnessDesc: {
    fontFamily,
    fontSize: 13,
    color: '#71717A',
  },
  submitButton: {
    backgroundColor: '#10B981',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#27272A',
    opacity: 0.6,
  },
  submitButtonText: {
    fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});
