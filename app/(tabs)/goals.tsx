import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Target, Calendar, ArrowUpRight } from 'lucide-react-native';
import { useFinance } from '@/contexts/FinanceContext';
import { AppColors } from '@/constants/colors';
import type { SavingsGoal } from '@/constants/types';
import AddGoalModal from '@/components/AddGoalModal';
import AddContributionModal from '@/components/AddContributionModal';
import { LinearGradient } from 'expo-linear-gradient';
import { fontFamily } from '@/constants/Typography';

export default function GoalsScreen() {
  const insets = useSafeAreaInsets();
  const { goals } = useFinance();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  const totalTargetAmount = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalCurrentAmount = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Savings Goals</Text>
          <Text style={styles.headerSubtitle}>{goals.length} active goals</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)} activeOpacity={0.8}>
          <Plus color="#000" size={24} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
            <LinearGradient
                colors={['#18181B', '#09090B']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
          <View style={styles.summaryHeader}>
            <View style={styles.summaryIconContainer}>
              <Target color="#FFFFFF" size={24} />
            </View>
            <View style={styles.summaryTextContainer}>
              <Text style={styles.summaryLabel}>Overall Progress</Text>
              <Text style={styles.summaryValue}>{overallProgress.toFixed(1)}%</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressBarFill, { width: `${Math.min(100, overallProgress)}%` }]} />
          </View>
          <View style={styles.summaryFooter}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>Saved</Text>
              <Text style={styles.summaryItemValue}>
                JD {totalCurrentAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>Target</Text>
              <Text style={styles.summaryItemValue}>
                JD {totalTargetAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>Remaining</Text>
              <Text style={styles.summaryItemValue}>
                JD {(totalTargetAmount - totalCurrentAmount).toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </Text>
            </View>
          </View>
        </View>

        {goals.length === 0 ? (
          <View style={styles.emptyState}>
            <Target color="#333" size={64} />
            <Text style={styles.emptyStateTitle}>No goals yet</Text>
            <Text style={styles.emptyStateText}>
              Set your first savings goal to start tracking your financial milestones
            </Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={() => setShowAddModal(true)} activeOpacity={0.8}>
              <Text style={styles.emptyStateButtonText}>Create Goal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.goalsSection}>
            <Text style={styles.sectionTitle}>Your Goals</Text>
            <View style={styles.goalsList}>
              {goals.map(goal => (
                <GoalCard key={goal.id} goal={goal} onContribute={() => setSelectedGoal(goal)} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <AddGoalModal visible={showAddModal} onClose={() => setShowAddModal(false)} />
      {selectedGoal && (
        <AddContributionModal
          visible={selectedGoal !== null}
          onClose={() => setSelectedGoal(null)}
          goal={selectedGoal}
        />
      )}
    </View>
  );
}

function GoalCard({ goal, onContribute }: { goal: SavingsGoal; onContribute: () => void }) {
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const remaining = goal.targetAmount - goal.currentAmount;
  
  const daysRemaining = goal.deadline
    ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <TouchableOpacity style={styles.goalCard} activeOpacity={0.7}>
      <View style={styles.goalHeader}>
        <View style={[styles.goalIconContainer, { backgroundColor: '#18181B' }]}>
          <Target color="#FFFFFF" size={24} />
        </View>
        <View style={styles.goalInfo}>
          <Text style={styles.goalTitle}>{goal.title}</Text>
          <Text style={styles.goalCategory}>{goal.category}</Text>
        </View>
        {daysRemaining !== null && (
          <View style={[styles.deadlineBadge, daysRemaining < 30 && styles.deadlineBadgeUrgent]}>
            <Calendar size={14} color={daysRemaining < 30 ? AppColors.danger : '#A1A1AA'} />
            <Text style={[styles.deadlineText, daysRemaining < 30 && styles.deadlineTextUrgent]}>
              {daysRemaining}d
            </Text>
          </View>
        )}
      </View>

      <View style={styles.goalProgress}>
        <View style={styles.goalProgressBar}>
          <View style={[styles.goalProgressBarFill, { width: `${Math.min(100, progress)}%`, backgroundColor: '#FFFFFF' }]} />
        </View>
        <Text style={styles.goalProgressText}>{progress.toFixed(0)}%</Text>
      </View>

      <View style={styles.goalFooter}>
        <View style={styles.goalAmount}>
          <Text style={styles.goalAmountLabel}>Current</Text>
          <Text style={styles.goalAmountValue}>
            JD {goal.currentAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </Text>
        </View>
        <View style={styles.goalAmount}>
          <Text style={styles.goalAmountLabel}>Target</Text>
          <Text style={styles.goalAmountValue}>
            JD {goal.targetAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </Text>
        </View>
        <View style={styles.goalAmount}>
          <Text style={styles.goalAmountLabel}>Remaining</Text>
          <Text style={[styles.goalAmountValue, { color: '#A1A1AA' }]}>
            JD {remaining.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.contributeButton]} onPress={onContribute} activeOpacity={0.7}>
        <Text style={[styles.contributeButtonText]}>Add Contribution</Text>
        <ArrowUpRight color="#000" size={16} />
      </TouchableOpacity>
    </TouchableOpacity>
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
    paddingVertical: 16,
  },
  headerTitle: {
    fontFamily,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily,
    fontSize: 14,
    color: '#A1A1AA',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  summaryCard: {
    margin: 20,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryLabel: {
    fontFamily,
    fontSize: 14,
    color: '#A1A1AA',
    marginBottom: 4,
  },
  summaryValue: {
    fontFamily,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  summaryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryItemLabel: {
    fontFamily,
    fontSize: 12,
    color: '#A1A1AA',
    marginBottom: 4,
  },
  summaryItemValue: {
    fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#333',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontFamily,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateText: {
    fontFamily,
    fontSize: 14,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  goalsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontFamily,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  goalsList: {
    gap: 16,
  },
  goalCard: {
    backgroundColor: '#09090B',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  goalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  goalCategory: {
    fontFamily,
    fontSize: 13,
    color: '#A1A1AA',
    textTransform: 'capitalize',
  },
  deadlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  deadlineBadgeUrgent: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  deadlineText: {
    fontFamily,
    fontSize: 12,
    fontWeight: '600',
    color: '#A1A1AA',
  },
  deadlineTextUrgent: {
    color: AppColors.danger,
  },
  goalProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  goalProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
  },
  goalProgressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalProgressText: {
    fontFamily,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    minWidth: 42,
    textAlign: 'right',
  },
  goalFooter: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  goalAmount: {
    flex: 1,
  },
  goalAmountLabel: {
    fontFamily,
    fontSize: 12,
    color: '#A1A1AA',
    marginBottom: 4,
  },
  goalAmountValue: {
    fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  contributeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  contributeButtonText: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
});
