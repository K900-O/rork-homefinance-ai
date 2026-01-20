import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, ArrowDownLeft, AlertTriangle, CheckCircle, RefreshCw, Play, Trash2 } from 'lucide-react-native';
import { 
  GlassBellIcon, 
  GlassWalletIcon, 
  GlassClockIcon, 
  GlassProfileIcon, 
  GlassTransactionsIcon, 
  GlassTrendUpIcon,
  GlassCoachIcon,
  GlassDocumentIcon
} from '@/components/GlassmorphicIcons';
import { useFinance } from '@/contexts/FinanceContext';
import { useAppMode } from '@/contexts/AppModeContext';
import { AppColors } from '@/constants/colors';
import type { Transaction, BudgetStatus, PlannedTransaction } from '@/constants/types';
import AddTransactionModal from '@/components/AddTransactionModal';
import BudgetModal from '@/components/BudgetModal';
import AddPlannedTransactionModal from '@/components/AddPlannedTransactionModal';
import { fontFamily, sfProDisplayBold, sfProDisplayMedium, sfProDisplayRegular } from '@/constants/Typography';
import { BlueGlow } from '@/components/BlueGlow';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}


export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { userProfile, financialSummary, transactions, budgetStatuses, budgetRules, totalRewardPoints, budgetRewards, upcomingPlannedTransactions, projectedBalance, processPlannedTransaction, deletePlannedTransaction } = useFinance();
  const { toggleMode } = useAppMode();
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showPlannedModal, setShowPlannedModal] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
  }, [transactions, budgetStatuses, upcomingPlannedTransactions, projectedBalance]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View style={styles.container}>
      <BlueGlow />
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image 
                source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/ptej5vs470eje74ucn753' }} 
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.modeButton} onPress={toggleMode}>
                <GlassProfileIcon size={24} focused={true} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <GlassBellIcon size={24} focused={true} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.cardsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Card</Text>
            </View>

            <LinearGradient
              colors={['#2563EB', '#1D4ED8']}
              style={styles.card}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
               <LinearGradient
                  colors={['rgba(255, 255, 255, 0.2)', 'transparent', 'rgba(255, 255, 255, 0.05)']}
                  style={styles.cardOverlay}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
               />
               
              <View style={styles.cardHeader}>
                <View style={styles.cardTypeBadge}>
                  <Text style={styles.cardTypeText}>Physical</Text>
                </View>
                <View style={styles.cardDots}>
                   <View style={[styles.dot, styles.activeDot]} />
                   <View style={styles.dot} />
                   <View style={styles.dot} />
                </View>
              </View>

              <View style={styles.cardBody}>
                 <View style={styles.holographicElement}>
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.3)', 'transparent']}
                      style={{ flex: 1, borderRadius: 20 }}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                 </View>

                 <View style={styles.cardChip}>
                   <GlassTransactionsIcon size={32} focused={true} />
                 </View>

                 <View style={styles.cardDetails}>
                    <Text style={styles.cardBalance}>
                      {financialSummary.balance.toLocaleString('en-US')} USD
                    </Text>
                    <Text style={styles.cardNumber}>.. 4568</Text>
                 </View>
              </View>
            </LinearGradient>
            
          </View>

          <View style={styles.plannedSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming</Text>
              <TouchableOpacity style={styles.addPlannedButton} onPress={() => setShowPlannedModal(true)}>
                <GlassClockIcon size={20} focused={true} />
                <Text style={styles.addPlannedText}>Plan</Text>
              </TouchableOpacity>
            </View>

            {(upcomingPlannedTransactions.length > 0 || projectedBalance.projectedIncome > 0 || projectedBalance.projectedExpenses > 0) && (
              <View style={styles.projectedCard}>
                <View style={styles.projectedHeader}>
                  <Text style={styles.projectedTitle}>30-Day Forecast</Text>
                </View>
                <View style={styles.projectedGrid}>
                  <View style={styles.projectedItem}>
                    <Text style={styles.projectedLabel}>Current</Text>
                    <Text style={styles.projectedValue}>{projectedBalance.currentBalance.toFixed(0)} USD</Text>
                  </View>
                  <View style={styles.projectedItem}>
                    <GlassTrendUpIcon size={18} focused={true} />
                    <Text style={styles.projectedIncomeValue}>+{projectedBalance.projectedIncome.toFixed(0)}</Text>
                  </View>
                  <View style={styles.projectedItem}>
                    <View style={{ transform: [{ scaleY: -1 }] }}>
                      <GlassTrendUpIcon size={18} focused={true} />
                    </View>
                    <Text style={styles.projectedExpenseValue}>-{projectedBalance.projectedExpenses.toFixed(0)}</Text>
                  </View>
                </View>
                <View style={styles.projectedResult}>
                  <Text style={styles.projectedResultLabel}>Projected Balance</Text>
                  <Text style={[
                    styles.projectedResultValue,
                    projectedBalance.projectedBalance >= 0 ? styles.positiveBalance : styles.negativeBalance
                  ]}>
                    {projectedBalance.projectedBalance.toFixed(0)} USD
                  </Text>
                </View>
              </View>
            )}

            {upcomingPlannedTransactions.length > 0 ? (
              <View style={styles.plannedList}>
                {upcomingPlannedTransactions.slice(0, 4).map((planned) => (
                  <PlannedTransactionItem 
                    key={planned.id} 
                    planned={planned} 
                    onProcess={() => processPlannedTransaction(planned)}
                    onDelete={() => deletePlannedTransaction(planned.id)}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyPlanned}>
                <GlassClockIcon size={48} focused={false} />
                <Text style={styles.emptyPlannedText}>No upcoming transactions</Text>
                <Text style={styles.emptyPlannedSubtext}>Plan your income and expenses for better stability</Text>
              </View>
            )}
          </View>

          <View style={styles.budgetSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Budgets</Text>
              <TouchableOpacity style={styles.addBudgetButton} onPress={() => setShowBudgetModal(true)}>
                <Plus size={16} color="#2563EB" />
                <Text style={styles.addBudgetText}>Add</Text>
              </TouchableOpacity>
            </View>

            {totalRewardPoints > 0 && (
              <View style={styles.rewardsBar}>
                <GlassCoachIcon size={24} focused={true} />
                <Text style={styles.rewardsText}>{totalRewardPoints} Points Earned</Text>
                <View style={styles.rewardsBadge}>
                  <Text style={styles.rewardsBadgeText}>
                    {budgetRewards.length} {budgetRewards.length === 1 ? 'Reward' : 'Rewards'}
                  </Text>
                </View>
              </View>
            )}

            {budgetStatuses.length > 0 ? (
              <View style={styles.budgetList}>
                {budgetStatuses.map((status, index) => (
                  <BudgetItem key={status.budget.id} status={status} index={index} />
                ))}
              </View>
            ) : (
              <View style={styles.emptyBudget}>
                <GlassWalletIcon size={48} focused={false} />
                <Text style={styles.emptyBudgetText}>No budgets set</Text>
                <Text style={styles.emptyBudgetSubtext}>Create a budget to track household spending</Text>
              </View>
            )}

            {budgetRules.length > 0 && (
              <View style={styles.rulesPreview}>
                <View style={styles.rulesHeader}>
                  <GlassDocumentIcon size={20} focused={true} />
                  <Text style={styles.rulesTitle}>{budgetRules.length} Active Rules</Text>
                </View>
                <View style={styles.rulesList}>
                  {budgetRules.slice(0, 2).map(rule => (
                    <View key={rule.id} style={styles.ruleItem}>
                      <View style={[
                        styles.strictnessDot,
                        rule.strictness === 'strict' && styles.strictDot,
                        rule.strictness === 'moderate' && styles.moderateDot,
                        rule.strictness === 'flexible' && styles.flexibleDot,
                      ]} />
                      <Text style={styles.ruleName} numberOfLines={1}>{rule.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          <View style={styles.transactionsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>History</Text>
              <TouchableOpacity style={styles.filterButton}>
                 <Text style={styles.filterText}>last week</Text>
                 <ArrowDownLeft size={12} color="#71717A" style={{ transform: [{ rotate: '-45deg' }] }} />
              </TouchableOpacity>
            </View>

            <View style={styles.transactionsList}>
              {transactions.length > 0 ? (
                transactions.slice(0, 5).map((t, index) => (
                  <TransactionItem key={t.id} transaction={t} index={index} />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No transactions yet</Text>
                  <Text style={styles.emptyStateSubtext}>Tap + to add your first transaction</Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.8}
      >
        <Plus color="#FFF" size={32} />
      </TouchableOpacity>

      <AddTransactionModal visible={showAddModal} onClose={() => setShowAddModal(false)} />
      <BudgetModal visible={showBudgetModal} onClose={() => setShowBudgetModal(false)} />
      <AddPlannedTransactionModal visible={showPlannedModal} onClose={() => setShowPlannedModal(false)} />
    </View>
  );
}

function BudgetItem({ status, index }: { status: BudgetStatus; index: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;
  const scaleAnim = useRef(new Animated.Value(0.97)).current;

  useEffect(() => {
    const delay = index * 80;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 45,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 45,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim, index]);
  const getStatusColor = () => {
    switch (status.status) {
      case 'safe': return '#2563EB';
      case 'warning': return '#F59E0B';
      case 'danger': return '#EF4444';
      case 'exceeded': return '#DC2626';
      default: return '#71717A';
    }
  };

  const getStatusIcon = () => {
    switch (status.status) {
      case 'safe': return <CheckCircle size={16} color="#2563EB" />;
      case 'warning': return <AlertTriangle size={16} color="#F59E0B" />;
      case 'danger':
      case 'exceeded': return <AlertTriangle size={16} color="#EF4444" />;
      default: return null;
    }
  };

  const progressWidth = Math.min(status.percentageUsed, 100);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressWidth,
      duration: 800,
      delay: index * 80 + 200,
      useNativeDriver: false,
    }).start();
  }, [progressAnim, progressWidth, index]);

  return (
    <Animated.View style={[styles.budgetItem, {
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
    }]}>
      <View style={styles.budgetHeader}>
        <View style={styles.budgetInfo}>
          <View style={[styles.budgetDot, { backgroundColor: status.budget.color }]} />
          <Text style={styles.budgetName}>{status.budget.name}</Text>
        </View>
        {getStatusIcon()}
      </View>
      
      <View style={styles.budgetProgress}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${progressWidth}%`, backgroundColor: getStatusColor() }
            ]} 
          />
        </View>
        <View style={styles.budgetAmounts}>
          <Text style={styles.spentAmount}>
            {status.budget.spent.toFixed(0)} USD
          </Text>
          <Text style={styles.limitAmount}>
            / {status.budget.budgetLimit.toFixed(0)} USD
          </Text>
        </View>
      </View>

      <View style={styles.budgetFooter}>
        <Text style={[styles.remainingText, { color: getStatusColor() }]}>
          {status.status === 'exceeded' 
            ? `Over by ${(status.budget.spent - status.budget.budgetLimit).toFixed(0)} USD`
            : `${status.remaining.toFixed(0)} USD remaining`
          }
        </Text>
        <Text style={styles.daysText}>
          {status.daysRemaining} days left
        </Text>
      </View>
    </Animated.View>
  );
}

function TransactionItem({ transaction, index }: { transaction: Transaction; index: number }) {
  const isIncome = transaction.type === 'income';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    const delay = index * 60;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 50,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 50,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim, index]);

  return (
    <Animated.View style={{
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
    }}>
    <TouchableOpacity style={styles.transactionItem}>
      <View style={[styles.transactionIcon, { backgroundColor: '#F5F5F5' }]}>
         <Text style={{ color: '#1A1A1A', fontWeight: 'bold' as const }}>
            {transaction.category.charAt(0).toUpperCase()}
         </Text>
      </View>
      <View style={styles.transactionInfo}>
          <Text style={styles.transactionName}>{transaction.description}</Text>
          <Text style={styles.transactionType}>{transaction.category}</Text>
      </View>
      <View style={styles.transactionValue}>
          <Text style={[styles.amountText, isIncome && { color: AppColors.success }]}>
            {isIncome ? '+' : '-'}{transaction.amount.toFixed(2)} USD
          </Text>
          <Text style={styles.dateText}>{new Date(transaction.date).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
    </Animated.View>
  );
}

interface PlannedTransactionItemProps {
  planned: PlannedTransaction;
  onProcess: () => void;
  onDelete: () => void;
}

function PlannedTransactionItem({ planned, onProcess, onDelete }: PlannedTransactionItemProps) {
  const isIncome = planned.type === 'income';
  const scheduledDate = new Date(planned.scheduledDate);
  const today = new Date();
  const daysUntil = Math.ceil((scheduledDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isToday = daysUntil <= 0;

  const getRecurrenceLabel = (recurrence: string) => {
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
            <GlassTrendUpIcon size={24} focused={true} />
          ) : (
            <View style={{ transform: [{ scaleY: -1 }] }}>
              <GlassTrendUpIcon size={24} focused={true} />
            </View>
          )}
        </View>
        <View style={styles.plannedInfo}>
          <Text style={styles.plannedName}>{planned.description}</Text>
          <View style={styles.plannedMeta}>
            <RefreshCw size={12} color="#71717A" />
            <Text style={styles.plannedRecurrence}>{getRecurrenceLabel(planned.recurrence)}</Text>
            <Text style={styles.plannedDot}>•</Text>
            <Text style={[
              styles.plannedDate,
              isToday && styles.plannedDateToday
            ]}>
              {isToday ? 'Today' : `${daysUntil} days`}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.plannedItemRight}>
        <Text style={[
          styles.plannedAmount,
          isIncome ? styles.incomeAmount : styles.expenseAmount
        ]}>
          {isIncome ? '+' : '-'}{planned.amount.toFixed(0)} USD
        </Text>
        <View style={styles.plannedActions}>
          {isToday && (
            <TouchableOpacity style={styles.processButton} onPress={onProcess}>
              <Play size={14} color="#2563EB" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
            <Trash2 size={14} color="#71717A" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    alignSelf: 'flex-start',
  },
  logo: {
    width: 360,
    height: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  content: {
    flex: 1,
  },
  cardsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: sfProDisplayBold,
    fontSize: 24,
    color: '#1A1A1A',
    letterSpacing: 0.2,
  },

  card: {
    height: 220,
    borderRadius: 24,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  cardTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
  },
  cardTypeText: {
    fontFamily: sfProDisplayMedium,
    color: '#FFF',
    fontSize: 12,
  },
  cardDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  activeDot: {
    backgroundColor: '#FFF',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  cardBody: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  holographicElement: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 150,
    height: 150,
    transform: [{ rotate: '45deg' }],
    opacity: 0.3,
  },
  cardChip: {
    marginBottom: 20,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardBalance: {
    fontFamily: sfProDisplayBold,
    fontSize: 28,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  cardNumber: {
    fontFamily: sfProDisplayMedium,
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 6,
  },

  transactionsSection: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterText: {
    fontFamily,
    color: '#71717A',
    fontSize: 14,
  },
  transactionsList: {
    gap: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  transactionType: {
    fontFamily,
    fontSize: 12,
    color: '#71717A',
  },
  transactionValue: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  dateText: {
    fontFamily,
    fontSize: 12,
    color: '#71717A',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600',
    color: '#71717A',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontFamily,
    fontSize: 14,
    color: '#A1A1AA',
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  budgetSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  addBudgetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addBudgetText: {
    fontFamily,
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#2563EB',
  },
  rewardsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  rewardsText: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#92400E',
    flex: 1,
  },
  rewardsBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rewardsBadgeText: {
    fontFamily,
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#92400E',
  },
  budgetList: {
    gap: 12,
  },
  budgetItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  budgetDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  budgetName: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1A1A1A',
  },
  budgetProgress: {
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  budgetAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  spentAmount: {
    fontFamily,
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1A1A1A',
  },
  limitAmount: {
    fontFamily,
    fontSize: 14,
    color: '#71717A',
    marginLeft: 4,
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  remainingText: {
    fontFamily,
    fontSize: 13,
    fontWeight: '500' as const,
  },
  daysText: {
    fontFamily,
    fontSize: 12,
    color: '#71717A',
  },
  emptyBudget: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
  },
  emptyBudgetText: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#71717A',
    marginTop: 12,
  },
  emptyBudgetSubtext: {
    fontFamily,
    fontSize: 13,
    color: '#A1A1AA',
    marginTop: 4,
  },
  rulesPreview: {
    marginTop: 16,
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    padding: 14,
  },
  rulesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  rulesTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#2563EB',
  },
  rulesList: {
    gap: 8,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  strictnessDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  strictDot: {
    backgroundColor: '#EF4444',
  },
  moderateDot: {
    backgroundColor: '#F59E0B',
  },
  flexibleDot: {
    backgroundColor: '#2563EB',
  },
  ruleName: {
    fontFamily,
    fontSize: 13,
    color: '#1D4ED8',
    flex: 1,
  },
  plannedSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  addPlannedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addPlannedText: {
    fontFamily,
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#2563EB',
  },
  projectedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  projectedHeader: {
    marginBottom: 12,
  },
  projectedTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#52525B',
  },
  projectedGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  projectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  projectedLabel: {
    fontFamily,
    fontSize: 12,
    color: '#71717A',
  },
  projectedValue: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1A1A1A',
  },
  projectedIncomeValue: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#2563EB',
  },
  projectedExpenseValue: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#EF4444',
  },
  projectedResult: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  projectedResultLabel: {
    fontFamily,
    fontSize: 14,
    color: '#52525B',
  },
  projectedResultValue: {
    fontFamily,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  positiveBalance: {
    color: '#2563EB',
  },
  negativeBalance: {
    color: '#EF4444',
  },
  plannedList: {
    gap: 10,
  },
  plannedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  plannedItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  plannedIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  plannedIconIncome: {
    backgroundColor: '#DBEAFE',
  },
  plannedIconExpense: {
    backgroundColor: '#FEE2E2',
  },
  plannedInfo: {
    flex: 1,
  },
  plannedName: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  plannedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  plannedRecurrence: {
    fontFamily,
    fontSize: 12,
    color: '#71717A',
  },
  plannedDot: {
    fontFamily,
    fontSize: 12,
    color: '#A1A1AA',
  },
  plannedDate: {
    fontFamily,
    fontSize: 12,
    color: '#71717A',
  },
  plannedDateToday: {
    color: '#F59E0B',
    fontWeight: '600' as const,
  },
  plannedItemRight: {
    alignItems: 'flex-end',
  },
  plannedAmount: {
    fontFamily,
    fontSize: 14,
    fontWeight: '700' as const,
    marginBottom: 6,
  },
  incomeAmount: {
    color: '#2563EB',
  },
  expenseAmount: {
    color: '#EF4444',
  },
  plannedActions: {
    flexDirection: 'row',
    gap: 8,
  },
  processButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPlanned: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
  },
  emptyPlannedText: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#71717A',
    marginTop: 12,
  },
  emptyPlannedSubtext: {
    fontFamily,
    fontSize: 13,
    color: '#A1A1AA',
    marginTop: 4,
  },
});
