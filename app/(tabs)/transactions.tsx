import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Plus, Filter, Wallet, AlertTriangle, CalendarClock, TrendingUp, TrendingDown, RefreshCw, Play, Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';
import { useFinance } from '@/contexts/FinanceContext';
import { AppColors } from '@/constants/colors';
import type { Transaction, TransactionType, TransactionCategory, BudgetCategory, PlannedTransaction, RecurrenceType } from '@/constants/types';
import AddTransactionModal from '@/components/AddTransactionModal';
import AddPlannedTransactionModal from '@/components/AddPlannedTransactionModal';
import { fontFamily } from '@/constants/Typography';
import { BlueGlow } from '@/components/BlueGlow';
import { LinearGradient } from 'expo-linear-gradient';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

type FilterType = 'all' | TransactionType;

const CATEGORY_TO_BUDGET: Record<TransactionCategory, BudgetCategory | null> = {
  food: 'groceries',
  transport: 'transport',
  entertainment: 'entertainment',
  shopping: 'personal',
  bills: 'utilities',
  healthcare: 'personal',
  education: 'personal',
  investment: null,
  savings: null,
  income: null,
  other: 'other',
};

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const { transactions, budgetStatuses, plannedTransactions, processPlannedTransaction, deletePlannedTransaction } = useFinance();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPlannedModal, setShowPlannedModal] = useState(false);
  const [showPlannedSection, setShowPlannedSection] = useState(true);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [transactions, filterType, searchQuery]);

  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {};

    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let groupKey: string;
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Yesterday';
      } else {
        groupKey = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(transaction);
    });

    return Object.entries(groups).sort((a, b) => {
      const dateA = a[1][0].date;
      const dateB = b[1][0].date;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  }, [filteredTransactions]);

  const getBudgetStatusForTransaction = (transaction: Transaction) => {
    if (transaction.type !== 'expense') return null;
    const budgetCategory = CATEGORY_TO_BUDGET[transaction.category];
    if (!budgetCategory) return null;
    return budgetStatuses.find(s => s.budget.category === budgetCategory) || null;
  };

  const togglePlannedSection = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowPlannedSection(!showPlannedSection);
  };

  return (
    <View style={styles.container}>
      <BlueGlow />
      <View style={[styles.contentContainer, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Transactions</Text>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => setShowAddModal(true)} 
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              style={styles.addButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Plus color="#FFF" size={24} strokeWidth={2.5} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {budgetStatuses.length > 0 && (
          <View style={styles.budgetSummary}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.budgetSummaryContent}>
              {budgetStatuses.map(status => (
                <View 
                  key={status.budget.id} 
                  style={[
                    styles.budgetChip,
                    status.status === 'exceeded' && styles.budgetChipExceeded,
                    status.status === 'danger' && styles.budgetChipDanger,
                    status.status === 'warning' && styles.budgetChipWarning,
                  ]}
                >
                  <View style={[styles.budgetChipDot, { backgroundColor: status.budget.color }]} />
                  <Text style={styles.budgetChipName}>{status.budget.name}</Text>
                  <Text style={[
                    styles.budgetChipPercent,
                    status.status === 'exceeded' && styles.budgetChipPercentExceeded,
                    status.status === 'danger' && styles.budgetChipPercentDanger,
                    status.status === 'warning' && styles.budgetChipPercentWarning,
                  ]}>
                    {status.percentageUsed.toFixed(0)}%
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Search color="#71717A" size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor="#71717A"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterIconButton}>
             <Filter color="#FFF" size={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
              <FilterButton
              label="All"
              isActive={filterType === 'all'}
              onPress={() => setFilterType('all')}
              />
              <FilterButton
              label="Income"
              isActive={filterType === 'income'}
              onPress={() => setFilterType('income')}
              />
              <FilterButton
              label="Expense"
              isActive={filterType === 'expense'}
              onPress={() => setFilterType('expense')}
              />
          </ScrollView>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Planned Transactions Section */}
          {plannedTransactions.filter(p => p.isActive).length > 0 && (
            <View style={styles.plannedSection}>
              <TouchableOpacity 
                style={styles.plannedHeader} 
                onPress={togglePlannedSection}
                activeOpacity={0.7}
              >
                <View style={styles.plannedHeaderLeft}>
                  <View style={styles.plannedIconBg}>
                    <CalendarClock size={16} color="#3B82F6" />
                  </View>
                  <Text style={styles.plannedTitle}>Planned</Text>
                  <View style={styles.plannedBadge}>
                    <Text style={styles.plannedBadgeText}>
                      {plannedTransactions.filter(p => p.isActive).length}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.addPlannedBtn}
                  onPress={() => setShowPlannedModal(true)}
                >
                  <Plus size={16} color="#3B82F6" />
                </TouchableOpacity>
              </TouchableOpacity>
              
              {showPlannedSection && (
                <View style={styles.plannedList}>
                  {plannedTransactions.filter(p => p.isActive).slice(0, 5).map((planned) => (
                    <PlannedItem 
                      key={planned.id} 
                      planned={planned}
                      onProcess={() => processPlannedTransaction(planned)}
                      onDelete={() => deletePlannedTransaction(planned.id)}
                    />
                  ))}
                </View>
              )}
            </View>
          )}

          {groupedTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Wallet color="#333" size={48} />
              </View>
              <Text style={styles.emptyStateTitle}>No transactions found</Text>
              <Text style={styles.emptyStateText}>
                {searchQuery ? 'Try a different search query' : 'Start tracking your expenses'}
              </Text>
            </View>
          ) : (
            groupedTransactions.map(([date, items]) => (
              <View key={date} style={styles.transactionGroup}>
                <View style={styles.dateHeader}>
                  <Text style={styles.dateText}>{date}</Text>
                  <Text style={styles.dateAmount}>
                    {items.reduce((sum, t) => t.type === 'income' ? sum + t.amount : sum - t.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                  </Text>
                </View>
                <View style={styles.transactionsList}>
                  {items.map(transaction => (
                    <TransactionItem 
                      key={transaction.id} 
                      transaction={transaction} 
                      budgetStatus={getBudgetStatusForTransaction(transaction)}
                    />
                  ))}
                </View>
              </View>
            ))
          )}
          <View style={{ height: 100 }} />
        </ScrollView>

        <AddTransactionModal visible={showAddModal} onClose={() => setShowAddModal(false)} />
        <AddPlannedTransactionModal visible={showPlannedModal} onClose={() => setShowPlannedModal(false)} />
      </View>
    </View>
  );
}

function FilterButton({ label, isActive, onPress }: { label: string; isActive: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.filterButton, isActive && styles.filterButtonActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

interface TransactionItemProps {
  transaction: Transaction;
  budgetStatus: {
    budget: { name: string; color: string; limit: number; spent: number };
    percentageUsed: number;
    status: 'safe' | 'warning' | 'danger' | 'exceeded';
  } | null;
}

interface PlannedItemProps {
  planned: PlannedTransaction;
  onProcess: () => void;
  onDelete: () => void;
}

function PlannedItem({ planned, onProcess, onDelete }: PlannedItemProps) {
  const isIncome = planned.type === 'income';
  const scheduledDate = new Date(planned.scheduledDate);
  const today = new Date();
  const daysUntil = Math.ceil((scheduledDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isToday = daysUntil <= 0;

  const getRecurrenceLabel = (recurrence: RecurrenceType) => {
    switch (recurrence) {
      case 'once': return 'One-time';
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'biweekly': return 'Bi-weekly';
      case 'monthly': return 'Monthly';
      case 'yearly': return 'Yearly';
      default: return recurrence;
    }
  };

  return (
    <View style={styles.plannedItem}>
      <View style={styles.plannedItemLeft}>
        <View style={[
          styles.plannedIcon,
          isIncome ? styles.plannedIconIncome : styles.plannedIconExpense
        ]}>
          {isIncome ? (
            <TrendingUp size={16} color="#10B981" />
          ) : (
            <TrendingDown size={16} color="#EF4444" />
          )}
        </View>
        <View style={styles.plannedInfo}>
          <Text style={styles.plannedName}>{planned.description}</Text>
          <View style={styles.plannedMeta}>
            <RefreshCw size={10} color="#71717A" />
            <Text style={styles.plannedRecurrence}>{getRecurrenceLabel(planned.recurrence)}</Text>
            <Text style={styles.plannedMetaDot}>•</Text>
            <Text style={[
              styles.plannedDate,
              isToday && styles.plannedDateToday
            ]}>
              {isToday ? 'Today' : `${daysUntil}d`}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.plannedItemRight}>
        <Text style={[
          styles.plannedAmount,
          isIncome ? styles.plannedAmountIncome : styles.plannedAmountExpense
        ]}>
          {isIncome ? '+' : '-'}{planned.amount.toFixed(0)}
        </Text>
        <View style={styles.plannedActions}>
          {isToday && (
            <TouchableOpacity style={styles.processBtn} onPress={onProcess}>
              <Play size={12} color="#10B981" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
            <Trash2 size={12} color="#71717A" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function TransactionItem({ transaction, budgetStatus }: TransactionItemProps) {
  const isIncome = transaction.type === 'income';

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
    <TouchableOpacity style={styles.transactionItem} activeOpacity={0.7}>
      <View style={[styles.transactionIcon]}>
        {isIncome ? (
          <ArrowDownLeft color="#10B981" size={20} />
        ) : (
          <ArrowUpRight color="#FFFFFF" size={20} />
        )}
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionDescription}>{transaction.description}</Text>
        <View style={styles.transactionMeta}>
          <Text style={styles.transactionCategory}>
            {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
          </Text>
          {budgetStatus && (
            <>
              <Text style={styles.dotSeparator}>•</Text>
              <View style={styles.budgetIndicator}>
                <Wallet size={10} color={getStatusColor(budgetStatus.status)} />
                <Text style={[styles.budgetIndicatorText, { color: getStatusColor(budgetStatus.status) }]}>
                  {budgetStatus.budget.name}
                </Text>
                {(budgetStatus.status === 'danger' || budgetStatus.status === 'exceeded') && (
                  <AlertTriangle size={10} color={getStatusColor(budgetStatus.status)} />
                )}
              </View>
            </>
          )}
        </View>
      </View>
      <View style={styles.transactionAmountContainer}>
        <Text style={[styles.transactionAmount, isIncome && styles.incomeText]}>
          {isIncome ? '+' : '-'}{transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
        </Text>
        <Text style={styles.transactionTime}>
          {new Date(transaction.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontFamily: fontFamily,
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addButton: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetSummary: {
    marginBottom: 16,
  },
  budgetSummaryContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  budgetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  budgetChipExceeded: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  budgetChipDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  budgetChipWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  budgetChipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  budgetChipName: {
    fontFamily: fontFamily,
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  budgetChipPercent: {
    fontFamily: fontFamily,
    fontSize: 12,
    color: '#71717A',
    fontWeight: '600',
  },
  budgetChipPercentExceeded: { color: '#DC2626' },
  budgetChipPercentDanger: { color: '#EF4444' },
  budgetChipPercentWarning: { color: '#F59E0B' },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(24, 24, 27, 0.6)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchInput: {
    fontFamily: fontFamily,
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  filterIconButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(24, 24, 27, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  filterContainer: {
    marginBottom: 24,
  },
  filterContent: {
      paddingHorizontal: 20,
      gap: 8,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(24, 24, 27, 0.6)',
    borderWidth: 1,
    borderColor: '#333',
  },
  filterButtonActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  filterButtonText: {
    fontFamily: fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: '#A1A1AA',
  },
  filterButtonTextActive: {
    color: '#000000',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#18181B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  emptyStateTitle: {
    fontFamily: fontFamily,
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyStateText: {
    fontFamily: fontFamily,
    fontSize: 14,
    color: '#A1A1AA',
    textAlign: 'center',
  },
  transactionGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  dateText: {
    fontFamily: fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: '#A1A1AA',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateAmount: {
    fontFamily: fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: '#A1A1AA',
  },
  transactionsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    backgroundColor: '#27272A',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontFamily: fontFamily,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  transactionCategory: {
    fontFamily: fontFamily,
    fontSize: 13,
    color: '#A1A1AA',
  },
  dotSeparator: {
      fontFamily: fontFamily,
      fontSize: 13,
      color: '#333',
      marginHorizontal: 6,
  },
  budgetIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  budgetIndicatorText: {
    fontFamily: fontFamily,
    fontSize: 11,
    fontWeight: '500',
  },
  transactionTime: {
    fontFamily: fontFamily,
    fontSize: 12,
    color: '#52525B',
    marginTop: 2,
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontFamily: fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  incomeText: {
    color: AppColors.success,
  },
  plannedSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: 'rgba(24, 24, 27, 0.6)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  plannedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  plannedHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  plannedIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plannedTitle: {
    fontFamily: fontFamily,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  plannedBadge: {
    backgroundColor: '#27272A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  plannedBadgeText: {
    fontFamily: fontFamily,
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  addPlannedBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plannedList: {
    gap: 10,
    marginTop: 4,
  },
  plannedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#27272A',
    borderRadius: 16,
    padding: 12,
  },
  plannedItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  plannedIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  plannedIconIncome: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  plannedIconExpense: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  plannedInfo: {
    flex: 1,
  },
  plannedName: {
    fontFamily: fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  plannedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  plannedRecurrence: {
    fontFamily: fontFamily,
    fontSize: 11,
    color: '#A1A1AA',
  },
  plannedMetaDot: {
    fontFamily: fontFamily,
    fontSize: 11,
    color: '#52525B',
  },
  plannedDate: {
    fontFamily: fontFamily,
    fontSize: 11,
    color: '#A1A1AA',
  },
  plannedDateToday: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  plannedItemRight: {
    alignItems: 'flex-end',
  },
  plannedAmount: {
    fontFamily: fontFamily,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  plannedAmountIncome: {
    color: '#10B981',
  },
  plannedAmountExpense: {
    color: '#EF4444',
  },
  plannedActions: {
    flexDirection: 'row',
    gap: 8,
  },
  processBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
