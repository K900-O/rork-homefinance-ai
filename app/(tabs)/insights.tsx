import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TrendingUp, TrendingDown, AlertCircle, Lightbulb } from 'lucide-react-native';
import { useFinance } from '@/contexts/FinanceContext';
import { AppColors } from '@/constants/colors';
import { sfProDisplayBold, sfProDisplayMedium, sfProDisplayRegular } from '@/constants/Typography';
import { BlueGlow } from '@/components/BlueGlow';

const { width } = Dimensions.get('window');

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const { financialSummary, categorySpending, transactions } = useFinance();

  const insights = useMemo(() => {
    const topCategory = categorySpending[0];
    const monthlyExpenseAverage = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0) / Math.max(1, transactions.length / 30);

    const weeklyComparison = calculateWeeklyComparison(transactions);

    return {
      topCategory,
      monthlyExpenseAverage,
      weeklyComparison,
    };
  }, [categorySpending, transactions]);

  return (
    <View style={styles.container}>
      <BlueGlow />
      <View style={[styles.contentContainer, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Insights</Text>
            <Text style={styles.headerSubtitle}>AI-powered financial analysis</Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>This Month</Text>
            <View style={styles.statsGrid}>
              <StatCard
                label="Total Income"
                value={`JD ${financialSummary.totalIncome.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
                icon={<TrendingUp color="#2563EB" size={24} />}
                color="#2563EB"
              />
              <StatCard
                label="Total Expenses"
                value={`JD ${financialSummary.totalExpenses.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
                icon={<TrendingDown color={AppColors.danger} size={24} />}
                color={AppColors.danger}
              />
              <StatCard
                label="Net Savings"
                value={`JD ${financialSummary.balance.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
                icon={<TrendingUp color="#2563EB" size={24} />}
                color="#2563EB"
              />
              <StatCard
                label="Savings Rate"
                value={`${financialSummary.savingsRate.toFixed(1)}%`}
                icon={<TrendingUp color="#71717A" size={24} />}
                color="#71717A"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Spending Breakdown</Text>
            {categorySpending.slice(0, 5).map((item, index) => (
              <CategoryBar key={item.category} item={item} index={index} />
            ))}
          </View>

          {insights.weeklyComparison.change !== 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Weekly Trend</Text>
              <View style={[
                styles.trendCard,
                { borderLeftColor: insights.weeklyComparison.change > 0 ? AppColors.danger : '#2563EB' }
              ]}>
                <View style={styles.trendHeader}>
                  {insights.weeklyComparison.change > 0 ? (
                    <TrendingUp color={AppColors.danger} size={24} />
                  ) : (
                    <TrendingDown color="#2563EB" size={24} />
                  )}
                  <Text style={[
                    styles.trendValue,
                    { color: insights.weeklyComparison.change > 0 ? AppColors.danger : '#2563EB' }
                  ]}>
                    {Math.abs(insights.weeklyComparison.change).toFixed(1)}%
                  </Text>
                </View>
                <Text style={styles.trendDescription}>
                  Your spending is {insights.weeklyComparison.change > 0 ? 'up' : 'down'} compared to last week.
                  {insights.weeklyComparison.change > 0 
                    ? ' Consider reviewing your recent expenses.' 
                    : ' Great job keeping your spending under control!'}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Recommendations</Text>
            <RecommendationCard
              icon={<Lightbulb color={AppColors.warning} size={24} />}
              title="Optimize Spending"
              description={`Your top spending category is ${insights.topCategory?.category || 'unknown'}. Consider setting a monthly budget for this category.`}
              type="tip"
            />
            {financialSummary.savingsRate < 20 && (
              <RecommendationCard
                icon={<AlertCircle color={AppColors.danger} size={24} />}
                title="Increase Savings"
                description="Your savings rate is below 20%. Try to increase it by reducing non-essential expenses."
                type="alert"
              />
            )}
            {financialSummary.healthScore >= 70 && (
              <RecommendationCard
                icon={<TrendingUp color="#2563EB" size={24} />}
                title="Great Financial Health!"
                description="Your financial health score is excellent. Consider investing your extra savings for long-term growth."
                type="success"
              />
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Stats</Text>
            <View style={styles.quickStatsCard}>
              <QuickStat label="Avg Daily Expense" value={`JD ${insights.monthlyExpenseAverage.toFixed(2)}`} />
              <View style={styles.statDivider} />
              <QuickStat label="Transactions" value={transactions.length.toString()} />
              <View style={styles.statDivider} />
              <QuickStat label="Categories" value={categorySpending.length.toString()} />
            </View>
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </View>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon]}>
        {icon}
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

function CategoryBar({ item, index }: { item: { category: string; amount: number; percentage: number }; index: number }) {
  const categoryColor = '#2563EB';
  
  return (
    <View style={styles.categoryBar}>
      <View style={styles.categoryBarHeader}>
        <View style={styles.categoryBarInfo}>
          <View style={[styles.categoryBarDot, { backgroundColor: categoryColor }]} />
          <Text style={styles.categoryBarName}>
            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
          </Text>
        </View>
        <View style={styles.categoryBarValues}>
          <Text style={styles.categoryBarAmount}>
            JD {item.amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </Text>
          <Text style={styles.categoryBarPercentage}>{item.percentage.toFixed(1)}%</Text>
        </View>
      </View>
      <View style={styles.categoryBarProgress}>
        <View style={[styles.categoryBarProgressFill, { width: `${item.percentage}%`, backgroundColor: categoryColor }]} />
      </View>
    </View>
  );
}

function RecommendationCard({ icon, title, description, type }: { icon: React.ReactNode; title: string; description: string; type: 'tip' | 'alert' | 'success' }) {
  const borderColor = type === 'alert' ? AppColors.danger : type === 'success' ? '#2563EB' : AppColors.warning;
  
  return (
    <View style={[styles.recommendationCard, { borderLeftColor: borderColor }]}>
      <View style={styles.recommendationIcon}>{icon}</View>
      <View style={styles.recommendationContent}>
        <Text style={styles.recommendationTitle}>{title}</Text>
        <Text style={styles.recommendationDescription}>{description}</Text>
      </View>
    </View>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.quickStat}>
      <Text style={styles.quickStatValue}>{value}</Text>
      <Text style={styles.quickStatLabel}>{label}</Text>
    </View>
  );
}

function calculateWeeklyComparison(transactions: any[]) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const thisWeek = transactions
    .filter(t => t.type === 'expense' && new Date(t.date) >= weekAgo)
    .reduce((sum, t) => sum + t.amount, 0);

  const lastWeek = transactions
    .filter(t => t.type === 'expense' && new Date(t.date) >= twoWeeksAgo && new Date(t.date) < weekAgo)
    .reduce((sum, t) => sum + t.amount, 0);

  const change = lastWeek > 0 ? ((thisWeek - lastWeek) / lastWeek) * 100 : 0;

  return { thisWeek, lastWeek, change };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    fontFamily: sfProDisplayBold,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: sfProDisplayRegular,
    fontSize: 14,
    color: '#71717A',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontFamily: sfProDisplayBold,
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2,
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
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    backgroundColor: '#DBEAFE',
  },
  statLabel: {
    fontFamily: sfProDisplayRegular,
    fontSize: 12,
    color: '#71717A',
    marginBottom: 4,
  },
  statValue: {
    fontFamily: sfProDisplayBold,
    fontSize: 20,
    fontWeight: '700',
  },
  categoryBar: {
    marginBottom: 16,
  },
  categoryBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBarInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBarDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryBarName: {
    fontFamily: sfProDisplayMedium,
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  categoryBarValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryBarAmount: {
    fontFamily: sfProDisplayBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  categoryBarPercentage: {
    fontFamily: sfProDisplayMedium,
    fontSize: 12,
    fontWeight: '600',
    color: '#71717A',
  },
  categoryBarProgress: {
    height: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  categoryBarProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  trendCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  trendValue: {
    fontFamily: sfProDisplayBold,
    fontSize: 24,
    fontWeight: '700',
  },
  trendDescription: {
    fontFamily: sfProDisplayRegular,
    fontSize: 14,
    color: '#71717A',
    lineHeight: 20,
  },
  recommendationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  recommendationIcon: {
    marginRight: 12,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontFamily: sfProDisplayBold,
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  recommendationDescription: {
    fontFamily: sfProDisplayRegular,
    fontSize: 13,
    color: '#71717A',
    lineHeight: 18,
  },
  quickStatsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatValue: {
    fontFamily: sfProDisplayBold,
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  quickStatLabel: {
    fontFamily: sfProDisplayRegular,
    fontSize: 12,
    color: '#71717A',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#E5E5E5',
  },
});
