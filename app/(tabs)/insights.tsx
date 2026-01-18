import React, { useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  PieChart, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Wallet,
  BarChart3,
  CircleDollarSign,
  Lightbulb,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFinance } from '@/contexts/FinanceContext';
import { AppColors } from '@/constants/colors';
import { sfProDisplayBold, sfProDisplayMedium, sfProDisplayRegular } from '@/constants/Typography';

const { width } = Dimensions.get('window');

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const { financialSummary, categorySpending, transactions, goals } = useFinance();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const insights = useMemo(() => {
    const topCategory = categorySpending[0];
    const totalTransactions = transactions.length;
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    
    const avgExpense = expenseTransactions.length > 0 
      ? expenseTransactions.reduce((sum, t) => sum + t.amount, 0) / expenseTransactions.length 
      : 0;
    
    const avgIncome = incomeTransactions.length > 0
      ? incomeTransactions.reduce((sum, t) => sum + t.amount, 0) / incomeTransactions.length
      : 0;

    const weeklyComparison = calculateWeeklyComparison(transactions);
    const monthlyComparison = calculateMonthlyComparison(transactions);

    const goalsProgress = goals.length > 0
      ? (goals.reduce((sum, g) => sum + (g.currentAmount / g.targetAmount), 0) / goals.length) * 100
      : 0;

    return {
      topCategory,
      totalTransactions,
      expenseCount: expenseTransactions.length,
      incomeCount: incomeTransactions.length,
      avgExpense,
      avgIncome,
      weeklyComparison,
      monthlyComparison,
      goalsProgress,
      categoriesCount: categorySpending.length,
    };
  }, [categorySpending, transactions, goals]);

  const getInsightMessage = () => {
    const savingsRate = financialSummary.savingsRate;
    if (savingsRate >= 30) {
      return `Outstanding! You're saving ${savingsRate.toFixed(0)}% of your income this month.`;
    } else if (savingsRate >= 20) {
      return `Great work! Your savings rate of ${savingsRate.toFixed(0)}% is above average.`;
    } else if (savingsRate >= 10) {
      return `You're saving ${savingsRate.toFixed(0)}% this month. Aim for 20%+ for better security.`;
    } else if (savingsRate > 0) {
      return `Your savings rate is ${savingsRate.toFixed(0)}%. Small changes can boost this significantly.`;
    }
    return `Focus on reducing expenses to start building your savings this month.`;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.contentContainer, { paddingTop: insets.top }]}>
        <Animated.View 
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View>
            <Text style={styles.headerSubtitle}>Data Based on Your Activity</Text>
            <Text style={styles.headerTitle}>Overview Panel</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.headerIconButton}>
              <Calendar size={20} color="#1A1A1A" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconButton}>
              <Activity size={20} color="#1A1A1A" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View 
            style={[
              styles.insightHeroCard,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <LinearGradient
              colors={['rgba(37, 99, 235, 0.15)', 'rgba(37, 99, 235, 0.05)', 'rgba(255, 255, 255, 0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            />
            <View style={styles.heroContent}>
              <View style={styles.heroLabelRow}>
                <Zap size={16} color={AppColors.primary} />
                <Text style={styles.heroLabel}>Account Insights</Text>
                <ArrowUpRight size={16} color={AppColors.primary} />
              </View>
              <Text style={styles.heroText}>{getInsightMessage()}</Text>
              <View style={styles.heroIndicator}>
                <View style={[styles.heroIndicatorDot, styles.heroIndicatorDotActive]} />
                <View style={styles.heroIndicatorDot} />
                <View style={styles.heroIndicatorDot} />
              </View>
            </View>
          </Animated.View>

          <View style={styles.mainStatsRow}>
            <View style={styles.mainStatCard}>
              <View style={styles.mainStatHeader}>
                <View style={styles.mainStatIconContainer}>
                  <TrendingUp size={16} color={AppColors.primary} />
                </View>
                <Text style={styles.mainStatLabel}>Income</Text>
              </View>
              <Text style={styles.mainStatValue}>
                {formatLargeNumber(financialSummary.totalIncome)}
                <Text style={styles.mainStatSuperscript}>JD</Text>
              </Text>
              <View style={styles.mainStatSubRow}>
                <View style={styles.mainStatSubItem}>
                  <Text style={styles.mainStatSubValue}>{insights.incomeCount}</Text>
                  <Text style={styles.mainStatSubLabel}>Entries</Text>
                </View>
                <View style={styles.mainStatSubItem}>
                  <Text style={styles.mainStatSubValue}>{formatShortNumber(insights.avgIncome)}</Text>
                  <Text style={styles.mainStatSubLabel}>Avg</Text>
                </View>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarFill, { width: '100%', backgroundColor: AppColors.primary }]} />
              </View>
            </View>

            <View style={styles.mainStatCard}>
              <View style={styles.mainStatHeader}>
                <View style={[styles.mainStatIconContainer, { backgroundColor: '#FEE2E2' }]}>
                  <TrendingDown size={16} color={AppColors.danger} />
                </View>
                <Text style={styles.mainStatLabel}>Expenses</Text>
              </View>
              <Text style={[styles.mainStatValue, { color: AppColors.danger }]}>
                {formatLargeNumber(financialSummary.totalExpenses)}
                <Text style={[styles.mainStatSuperscript, { color: AppColors.danger }]}>JD</Text>
              </Text>
              <View style={styles.mainStatSubRow}>
                <View style={styles.mainStatSubItem}>
                  <Text style={styles.mainStatSubValue}>{insights.expenseCount}</Text>
                  <Text style={styles.mainStatSubLabel}>Entries</Text>
                </View>
                <View style={styles.mainStatSubItem}>
                  <Text style={styles.mainStatSubValue}>{formatShortNumber(insights.avgExpense)}</Text>
                  <Text style={styles.mainStatSubLabel}>Avg</Text>
                </View>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[
                  styles.progressBarFill, 
                  { 
                    width: `${Math.min(100, (financialSummary.totalExpenses / Math.max(1, financialSummary.totalIncome)) * 100)}%`,
                    backgroundColor: AppColors.danger 
                  }
                ]} />
              </View>
            </View>
          </View>

          <View style={styles.metricsSection}>
            <View style={styles.sectionHeader}>
              <BarChart3 size={18} color="#1A1A1A" />
              <Text style={styles.sectionTitle}>Key Metrics</Text>
            </View>
            
            <View style={styles.metricsGrid}>
              <MetricCard
                icon={<Wallet size={20} color={AppColors.primary} />}
                label="Net Balance"
                value={`JD ${financialSummary.balance.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
                trend={financialSummary.balance >= 0 ? 'up' : 'down'}
                trendValue={`${financialSummary.savingsRate.toFixed(0)}% saved`}
              />
              <MetricCard
                icon={<Activity size={20} color="#8B5CF6" />}
                label="Health Score"
                value={`${financialSummary.healthScore.toFixed(0)}`}
                suffix="/100"
                trend={financialSummary.healthScore >= 60 ? 'up' : 'down'}
                trendValue={financialSummary.healthScore >= 70 ? 'Excellent' : financialSummary.healthScore >= 50 ? 'Good' : 'Needs work'}
              />
              <MetricCard
                icon={<Target size={20} color="#F59E0B" />}
                label="Goals Progress"
                value={`${insights.goalsProgress.toFixed(0)}%`}
                trend={insights.goalsProgress >= 50 ? 'up' : 'neutral'}
                trendValue={`${goals.length} active`}
              />
              <MetricCard
                icon={<PieChart size={20} color="#EC4899" />}
                label="Categories"
                value={insights.categoriesCount.toString()}
                trend="neutral"
                trendValue="tracked"
              />
            </View>
          </View>

          <View style={styles.spendingSection}>
            <View style={styles.sectionHeader}>
              <CircleDollarSign size={18} color="#1A1A1A" />
              <Text style={styles.sectionTitle}>Spending Breakdown</Text>
            </View>
            
            <View style={styles.spendingCard}>
              {categorySpending.slice(0, 5).map((item, index) => (
                <SpendingRow key={item.category} item={item} index={index} />
              ))}
              {categorySpending.length === 0 && (
                <Text style={styles.emptyText}>No spending data yet</Text>
              )}
            </View>
          </View>

          {(insights.weeklyComparison.change !== 0 || insights.monthlyComparison.change !== 0) && (
            <View style={styles.trendsSection}>
              <View style={styles.sectionHeader}>
                <TrendingUp size={18} color="#1A1A1A" />
                <Text style={styles.sectionTitle}>Trends</Text>
              </View>
              
              <View style={styles.trendsRow}>
                {insights.weeklyComparison.change !== 0 && (
                  <TrendCard
                    label="Weekly"
                    change={insights.weeklyComparison.change}
                    thisValue={insights.weeklyComparison.thisWeek}
                    lastValue={insights.weeklyComparison.lastWeek}
                  />
                )}
                {insights.monthlyComparison.change !== 0 && (
                  <TrendCard
                    label="Monthly"
                    change={insights.monthlyComparison.change}
                    thisValue={insights.monthlyComparison.thisMonth}
                    lastValue={insights.monthlyComparison.lastMonth}
                  />
                )}
              </View>
            </View>
          )}

          <View style={styles.tipsSection}>
            <View style={styles.sectionHeader}>
              <Lightbulb size={18} color="#1A1A1A" />
              <Text style={styles.sectionTitle}>Smart Tips</Text>
            </View>
            
            <View style={styles.tipsCard}>
              {insights.topCategory && (
                <TipItem
                  icon={<PieChart size={18} color={AppColors.primary} />}
                  text={`Your top spending category is ${insights.topCategory.category}. Consider setting a budget for it.`}
                />
              )}
              {financialSummary.savingsRate < 20 && (
                <TipItem
                  icon={<Target size={18} color="#F59E0B" />}
                  text="Aim to save at least 20% of your income for long-term financial security."
                />
              )}
              {financialSummary.healthScore >= 70 && (
                <TipItem
                  icon={<TrendingUp size={18} color="#10B981" />}
                  text="Great financial health! Consider investing your surplus for growth."
                />
              )}
            </View>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </View>
    </View>
  );
}

function MetricCard({ 
  icon, 
  label, 
  value, 
  suffix,
  trend, 
  trendValue 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string;
  suffix?: string;
  trend: 'up' | 'down' | 'neutral'; 
  trendValue: string;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricIconContainer}>{icon}</View>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricValueRow}>
        <Text style={styles.metricValue}>{value}</Text>
        {suffix && <Text style={styles.metricSuffix}>{suffix}</Text>}
      </View>
      <View style={styles.metricTrendRow}>
        {trend === 'up' && <ArrowUpRight size={12} color="#10B981" />}
        {trend === 'down' && <ArrowDownRight size={12} color={AppColors.danger} />}
        <Text style={[
          styles.metricTrendText,
          trend === 'up' && { color: '#10B981' },
          trend === 'down' && { color: AppColors.danger },
        ]}>{trendValue}</Text>
      </View>
    </View>
  );
}

function SpendingRow({ item, index }: { item: { category: string; amount: number; percentage: number }; index: number }) {
  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      food: '#F59E0B',
      transport: '#3B82F6',
      entertainment: '#EC4899',
      shopping: '#8B5CF6',
      bills: '#EF4444',
      healthcare: '#14B8A6',
      education: '#6366F1',
      other: '#71717A',
    };
    return colors[cat] || AppColors.primary;
  };

  const color = getCategoryColor(item.category);

  return (
    <View style={styles.spendingRow}>
      <View style={styles.spendingRowLeft}>
        <View style={[styles.spendingDot, { backgroundColor: color }]} />
        <Text style={styles.spendingCategory}>
          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
        </Text>
      </View>
      <View style={styles.spendingRowRight}>
        <Text style={styles.spendingAmount}>JD {item.amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}</Text>
        <Text style={styles.spendingPercent}>{item.percentage.toFixed(0)}%</Text>
      </View>
      <View style={styles.spendingBarContainer}>
        <View style={[styles.spendingBarFill, { width: `${item.percentage}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function TrendCard({ 
  label, 
  change, 
  thisValue, 
  lastValue 
}: { 
  label: string; 
  change: number; 
  thisValue: number; 
  lastValue: number;
}) {
  const isUp = change > 0;
  
  return (
    <View style={styles.trendCard}>
      <Text style={styles.trendLabel}>{label}</Text>
      <View style={styles.trendChangeRow}>
        {isUp ? (
          <ArrowUpRight size={20} color={AppColors.danger} />
        ) : (
          <ArrowDownRight size={20} color="#10B981" />
        )}
        <Text style={[styles.trendChange, { color: isUp ? AppColors.danger : '#10B981' }]}>
          {Math.abs(change).toFixed(1)}%
        </Text>
      </View>
      <Text style={styles.trendDescription}>
        {isUp ? 'Spending increased' : 'Spending decreased'}
      </Text>
      <View style={styles.trendCompareRow}>
        <View style={styles.trendCompareItem}>
          <Text style={styles.trendCompareValue}>{formatShortNumber(thisValue)}</Text>
          <Text style={styles.trendCompareLabel}>Current</Text>
        </View>
        <View style={styles.trendCompareDivider} />
        <View style={styles.trendCompareItem}>
          <Text style={styles.trendCompareValue}>{formatShortNumber(lastValue)}</Text>
          <Text style={styles.trendCompareLabel}>Previous</Text>
        </View>
      </View>
    </View>
  );
}

function TipItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View style={styles.tipItem}>
      <View style={styles.tipIconContainer}>{icon}</View>
      <Text style={styles.tipText}>{text}</Text>
    </View>
  );
}

function formatLargeNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2);
  } else if (num >= 1000) {
    return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }
  return num.toFixed(0);
}

function formatShortNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toFixed(0);
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

function calculateMonthlyComparison(transactions: any[]) {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const thisMonth = transactions
    .filter(t => t.type === 'expense' && new Date(t.date) >= thisMonthStart)
    .reduce((sum, t) => sum + t.amount, 0);

  const lastMonth = transactions
    .filter(t => t.type === 'expense' && new Date(t.date) >= lastMonthStart && new Date(t.date) <= lastMonthEnd)
    .reduce((sum, t) => sum + t.amount, 0);

  const change = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

  return { thisMonth, lastMonth, change };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  headerSubtitle: {
    fontFamily: sfProDisplayRegular,
    fontSize: 13,
    color: '#71717A',
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: sfProDisplayBold,
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  insightHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginTop: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroContent: {
    padding: 20,
  },
  heroLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  heroLabel: {
    fontFamily: sfProDisplayMedium,
    fontSize: 13,
    fontWeight: '600' as const,
    color: AppColors.primary,
    flex: 1,
  },
  heroText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 20,
    fontWeight: '500' as const,
    color: '#1A1A1A',
    lineHeight: 28,
    marginBottom: 16,
  },
  heroIndicator: {
    flexDirection: 'row',
    gap: 6,
  },
  heroIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E5E5',
  },
  heroIndicatorDotActive: {
    backgroundColor: AppColors.primary,
    width: 24,
  },
  mainStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  mainStatCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  mainStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  mainStatIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: AppColors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainStatLabel: {
    fontFamily: sfProDisplayMedium,
    fontSize: 13,
    fontWeight: '500' as const,
    color: '#71717A',
  },
  mainStatValue: {
    fontFamily: sfProDisplayBold,
    fontSize: 28,
    fontWeight: '700' as const,
    color: AppColors.primary,
    marginBottom: 8,
  },
  mainStatSuperscript: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: AppColors.primary,
  },
  mainStatSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  mainStatSubItem: {
    alignItems: 'flex-start',
  },
  mainStatSubValue: {
    fontFamily: sfProDisplayBold,
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#1A1A1A',
  },
  mainStatSubLabel: {
    fontFamily: sfProDisplayRegular,
    fontSize: 11,
    color: '#A1A1AA',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#F5F5F5',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  metricsSection: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: sfProDisplayBold,
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1A1A1A',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  metricIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    fontFamily: sfProDisplayRegular,
    fontSize: 12,
    color: '#71717A',
    marginBottom: 4,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricValue: {
    fontFamily: sfProDisplayBold,
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#1A1A1A',
  },
  metricSuffix: {
    fontFamily: sfProDisplayMedium,
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#A1A1AA',
    marginLeft: 2,
  },
  metricTrendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  metricTrendText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 11,
    fontWeight: '500' as const,
    color: '#71717A',
  },
  spendingSection: {
    marginTop: 24,
  },
  spendingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  spendingRow: {
    marginBottom: 16,
  },
  spendingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  spendingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  spendingCategory: {
    fontFamily: sfProDisplayMedium,
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#1A1A1A',
  },
  spendingRowRight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingLeft: 18,
  },
  spendingAmount: {
    fontFamily: sfProDisplayBold,
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#1A1A1A',
  },
  spendingPercent: {
    fontFamily: sfProDisplayMedium,
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#71717A',
  },
  spendingBarContainer: {
    height: 4,
    backgroundColor: '#F5F5F5',
    borderRadius: 2,
    marginLeft: 18,
  },
  spendingBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  emptyText: {
    fontFamily: sfProDisplayRegular,
    fontSize: 14,
    color: '#A1A1AA',
    textAlign: 'center',
    paddingVertical: 20,
  },
  trendsSection: {
    marginTop: 24,
  },
  trendsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  trendCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  trendLabel: {
    fontFamily: sfProDisplayMedium,
    fontSize: 13,
    fontWeight: '500' as const,
    color: '#71717A',
    marginBottom: 8,
  },
  trendChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  trendChange: {
    fontFamily: sfProDisplayBold,
    fontSize: 24,
    fontWeight: '700' as const,
  },
  trendDescription: {
    fontFamily: sfProDisplayRegular,
    fontSize: 12,
    color: '#71717A',
    marginBottom: 12,
  },
  trendCompareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  trendCompareItem: {
    flex: 1,
    alignItems: 'center',
  },
  trendCompareDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E5E5',
  },
  trendCompareValue: {
    fontFamily: sfProDisplayBold,
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#1A1A1A',
  },
  trendCompareLabel: {
    fontFamily: sfProDisplayRegular,
    fontSize: 10,
    color: '#A1A1AA',
    marginTop: 2,
  },
  tipsSection: {
    marginTop: 24,
  },
  tipsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  tipIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    flex: 1,
    fontFamily: sfProDisplayRegular,
    fontSize: 14,
    color: '#52525B',
    lineHeight: 20,
  },
});
