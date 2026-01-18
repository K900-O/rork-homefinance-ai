import React, { useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFinance } from '@/contexts/FinanceContext';
import { AppColors } from '@/constants/colors';
import { sfProDisplayBold, sfProDisplayMedium, sfProDisplayRegular } from '@/constants/Typography';
import { 
  AnimatedBarChart, 
  AnimatedLineChart, 
  AnimatedProgressRing,
} from '@/components/AnimatedCharts';
import {
  GlassFlameIcon,
  GlassTrendUpIcon,
  GlassWalletIcon,
  GlassGoalsIcon,
  GlassChartIcon,
  GlassInsightsIcon,
  GlassTransactionsIcon,
  GlassClockIcon,
} from '@/components/GlassmorphicIcons';



const CATEGORY_COLORS: Record<string, string> = {
  food: '#F59E0B',
  transport: '#3B82F6',
  entertainment: '#EC4899',
  shopping: '#8B5CF6',
  bills: '#EF4444',
  healthcare: '#14B8A6',
  education: '#6366F1',
  investment: '#10B981',
  savings: '#06B6D4',
  income: '#22C55E',
  other: '#71717A',
};

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const { 
    financialSummary, 
    categorySpending, 
    transactions, 
    goals,
    budgetStatuses,
    projectedBalance,
  } = useFinance();
  
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
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    
    const avgExpense = expenseTransactions.length > 0 
      ? expenseTransactions.reduce((sum, t) => sum + t.amount, 0) / expenseTransactions.length 
      : 0;
    
    const avgIncome = incomeTransactions.length > 0
      ? incomeTransactions.reduce((sum, t) => sum + t.amount, 0) / incomeTransactions.length
      : 0;

    const goalsProgress = goals.length > 0
      ? (goals.reduce((sum, g) => sum + (g.currentAmount / g.targetAmount), 0) / goals.length) * 100
      : 0;

    const last7Days = getLast7DaysSpending(transactions);
    const weeklyTrend = calculateTrend(last7Days);
    
    const monthlyData = getMonthlyData(transactions);
    
    return {
      expenseCount: expenseTransactions.length,
      incomeCount: incomeTransactions.length,
      avgExpense,
      avgIncome,
      goalsProgress,
      last7Days,
      weeklyTrend,
      monthlyData,
    };
  }, [transactions, goals]);

  const getInsightMessage = () => {
    const savingsRate = financialSummary.savingsRate;
    if (savingsRate >= 30) return "Outstanding financial discipline!";
    if (savingsRate >= 20) return "Great savings momentum!";
    if (savingsRate >= 10) return "Building healthy habits";
    if (savingsRate > 0) return "Room for improvement";
    return "Focus on reducing expenses";
  };

  const budgetHealthCount = useMemo(() => {
    const safe = budgetStatuses.filter(b => b.status === 'safe').length;
    const warning = budgetStatuses.filter(b => b.status === 'warning').length;
    const danger = budgetStatuses.filter(b => b.status === 'danger' || b.status === 'exceeded').length;
    return { safe, warning, danger, total: budgetStatuses.length };
  }, [budgetStatuses]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F8FAFC', '#EFF6FF', '#FFFFFF']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={[styles.contentContainer, { paddingTop: insets.top }]}>
        <Animated.View 
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View>
            <Text style={styles.headerSubtitle}>Financial Analytics</Text>
            <Text style={styles.headerTitle}>Insights</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live</Text>
            </View>
          </View>
        </Animated.View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View 
            style={[
              styles.heroCard,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <LinearGradient
              colors={['#1E40AF', '#3B82F6', '#60A5FA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.heroPattern}>
              {[...Array(6)].map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.heroPatternCircle, 
                    { 
                      top: (i % 3) * 60 - 30,
                      right: Math.floor(i / 3) * 80 - 40,
                      opacity: 0.1 - (i * 0.015),
                    }
                  ]} 
                />
              ))}
            </View>
            
            <View style={styles.heroContent}>
              <View style={styles.heroTop}>
                <View style={styles.heroLabelRow}>
                  <GlassFlameIcon size={24} focused={true} />
                  <Text style={styles.heroLabel}>Financial Health</Text>
                </View>
                <View style={styles.heroScoreContainer}>
                  <AnimatedProgressRing
                    progress={financialSummary.healthScore}
                    size={72}
                    strokeWidth={6}
                    color="#FFFFFF"
                    bgColor="rgba(255,255,255,0.2)"
                    value={`${financialSummary.healthScore.toFixed(0)}`}
                    delay={300}
                  />
                </View>
              </View>
              
              <Text style={styles.heroMessage}>{getInsightMessage()}</Text>
              
              <View style={styles.heroStats}>
                <View style={styles.heroStatItem}>
                  <Text style={styles.heroStatValue}>
                    {financialSummary.savingsRate.toFixed(0)}%
                  </Text>
                  <Text style={styles.heroStatLabel}>Savings Rate</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStatItem}>
                  <Text style={styles.heroStatValue}>
                    {transactions.length}
                  </Text>
                  <Text style={styles.heroStatLabel}>Transactions</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStatItem}>
                  <Text style={styles.heroStatValue}>
                    {goals.length}
                  </Text>
                  <Text style={styles.heroStatLabel}>Active Goals</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          <View style={styles.quickStatsRow}>
            <QuickStatCard
              icon={<GlassTrendUpIcon size={24} focused={true} />}
              label="Income"
              value={`${formatCurrency(financialSummary.totalIncome)}`}
              trend="up"
              trendValue={`${insights.incomeCount} entries`}
              color="#10B981"
              delay={100}
            />
            <QuickStatCard
              icon={<View style={{ transform: [{ scaleY: -1 }] }}><GlassTrendUpIcon size={24} focused={true} /></View>}
              label="Expenses"
              value={`${formatCurrency(financialSummary.totalExpenses)}`}
              trend="down"
              trendValue={`${insights.expenseCount} entries`}
              color="#EF4444"
              delay={200}
            />
          </View>

          <View style={styles.quickStatsRow}>
            <QuickStatCard
              icon={<GlassWalletIcon size={24} focused={true} />}
              label="Balance"
              value={`${formatCurrency(financialSummary.balance)}`}
              trend={financialSummary.balance >= 0 ? 'up' : 'down'}
              trendValue={financialSummary.balance >= 0 ? 'Positive' : 'Negative'}
              color={AppColors.primary}
              delay={300}
            />
            <QuickStatCard
              icon={<GlassGoalsIcon size={24} focused={true} />}
              label="Goals Progress"
              value={`${insights.goalsProgress.toFixed(0)}%`}
              trend={insights.goalsProgress >= 50 ? 'up' : 'neutral'}
              trendValue={`${goals.length} active`}
              color="#F59E0B"
              delay={400}
            />
          </View>

          <SectionHeader 
            icon={<GlassChartIcon size={24} focused={true} />}
            title="Income vs Expenses"
            delay={500}
          />
          
          <AnimatedChartCard delay={600}>
            <AnimatedBarChart
              data={[
                { label: 'Income', value: financialSummary.totalIncome, color: '#10B981' },
                { label: 'Expenses', value: financialSummary.totalExpenses, color: '#EF4444' },
                { label: 'Savings', value: Math.max(0, financialSummary.balance), color: AppColors.primary },
              ]}
              height={140}
              delay={700}
            />
            <View style={styles.chartLegend}>
              <LegendItem color="#10B981" label="Income" />
              <LegendItem color="#EF4444" label="Expenses" />
              <LegendItem color={AppColors.primary} label="Savings" />
            </View>
          </AnimatedChartCard>

          <SectionHeader 
            icon={<GlassInsightsIcon size={24} focused={true} />}
            title="7-Day Spending Trend"
            delay={800}
          />
          
          <AnimatedChartCard delay={900}>
            {insights.last7Days.length > 0 ? (
              <>
                <AnimatedLineChart
                  data={insights.last7Days}
                  height={120}
                  color={insights.weeklyTrend >= 0 ? '#EF4444' : '#10B981'}
                  delay={1000}
                />
                <View style={styles.trendIndicator}>
                  {insights.weeklyTrend >= 0 ? (
                    <ArrowUpRight size={16} color="#EF4444" />
                  ) : (
                    <ArrowDownRight size={16} color="#10B981" />
                  )}
                  <Text style={[
                    styles.trendText,
                    { color: insights.weeklyTrend >= 0 ? '#EF4444' : '#10B981' }
                  ]}>
                    {Math.abs(insights.weeklyTrend).toFixed(1)}% {insights.weeklyTrend >= 0 ? 'increase' : 'decrease'}
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.emptyChart}>
                <Text style={styles.emptyChartText}>Add transactions to see trends</Text>
              </View>
            )}
          </AnimatedChartCard>

          <SectionHeader 
            icon={<GlassTransactionsIcon size={24} focused={true} />}
            title="Spending by Category"
            delay={1100}
          />
          
          <AnimatedChartCard delay={1200}>
            {categorySpending.length > 0 ? (
              <View style={styles.categoryContainer}>
                <View style={styles.categoryBars}>
                  {categorySpending.slice(0, 5).map((cat, index) => (
                    <CategoryBar 
                      key={cat.category}
                      category={cat.category}
                      amount={cat.amount}
                      percentage={cat.percentage}
                      color={CATEGORY_COLORS[cat.category] || CATEGORY_COLORS.other}
                      delay={1300 + (index * 100)}
                    />
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.emptyChart}>
                <Text style={styles.emptyChartText}>No spending data yet</Text>
              </View>
            )}
          </AnimatedChartCard>

          {budgetStatuses.length > 0 && (
            <>
              <SectionHeader 
                icon={<GlassWalletIcon size={24} focused={true} />}
                title="Budget Health"
                delay={1600}
              />
              
              <AnimatedChartCard delay={1700}>
                <View style={styles.budgetHealthContainer}>
                  <View style={styles.budgetHealthRings}>
                    <AnimatedProgressRing
                      progress={(budgetHealthCount.safe / Math.max(1, budgetHealthCount.total)) * 100}
                      size={70}
                      strokeWidth={8}
                      color="#10B981"
                      value={`${budgetHealthCount.safe}`}
                      label="Safe"
                      delay={1800}
                    />
                    <AnimatedProgressRing
                      progress={(budgetHealthCount.warning / Math.max(1, budgetHealthCount.total)) * 100}
                      size={70}
                      strokeWidth={8}
                      color="#F59E0B"
                      value={`${budgetHealthCount.warning}`}
                      label="Warning"
                      delay={1900}
                    />
                    <AnimatedProgressRing
                      progress={(budgetHealthCount.danger / Math.max(1, budgetHealthCount.total)) * 100}
                      size={70}
                      strokeWidth={8}
                      color="#EF4444"
                      value={`${budgetHealthCount.danger}`}
                      label="At Risk"
                      delay={2000}
                    />
                  </View>
                  <View style={styles.budgetHealthSummary}>
                    <Text style={styles.budgetHealthTotal}>
                      {budgetHealthCount.total} Active Budgets
                    </Text>
                    <Text style={styles.budgetHealthDesc}>
                      {budgetHealthCount.safe === budgetHealthCount.total 
                        ? 'All budgets on track!' 
                        : budgetHealthCount.danger > 0 
                          ? `${budgetHealthCount.danger} budget${budgetHealthCount.danger > 1 ? 's' : ''} need attention`
                          : 'Most budgets healthy'}
                    </Text>
                  </View>
                </View>
              </AnimatedChartCard>
            </>
          )}

          {goals.length > 0 && (
            <>
              <SectionHeader 
                icon={<GlassGoalsIcon size={24} focused={true} />}
                title="Goals Overview"
                delay={2100}
              />
              
              <AnimatedChartCard delay={2200}>
                <View style={styles.goalsContainer}>
                  {goals.slice(0, 3).map((goal, index) => {
                    const progress = (goal.currentAmount / goal.targetAmount) * 100;
                    return (
                      <GoalProgressItem
                        key={goal.id}
                        title={goal.title}
                        current={goal.currentAmount}
                        target={goal.targetAmount}
                        progress={progress}
                        color={goal.color}
                        delay={2300 + (index * 100)}
                      />
                    );
                  })}
                </View>
              </AnimatedChartCard>
            </>
          )}

          <SectionHeader 
            icon={<GlassClockIcon size={24} focused={true} />}
            title="30-Day Projection"
            delay={2500}
          />
          
          <AnimatedChartCard delay={2600}>
            <View style={styles.projectionContainer}>
              <View style={styles.projectionItem}>
                <Text style={styles.projectionLabel}>Current Balance</Text>
                <Text style={styles.projectionValue}>
                  {formatCurrency(projectedBalance.currentBalance)}
                </Text>
              </View>
              <View style={styles.projectionArrow}>
                <ChevronRight size={20} color="#A1A1AA" />
              </View>
              <View style={styles.projectionItem}>
                <Text style={styles.projectionLabel}>Projected</Text>
                <Text style={[
                  styles.projectionValue,
                  { color: projectedBalance.projectedBalance >= 0 ? '#10B981' : '#EF4444' }
                ]}>
                  {formatCurrency(projectedBalance.projectedBalance)}
                </Text>
              </View>
            </View>
            <View style={styles.projectionDetails}>
              <View style={styles.projectionDetailItem}>
                <ArrowUpRight size={14} color="#10B981" />
                <Text style={styles.projectionDetailText}>
                  +{formatCurrency(projectedBalance.projectedIncome)} expected income
                </Text>
              </View>
              <View style={styles.projectionDetailItem}>
                <ArrowDownRight size={14} color="#EF4444" />
                <Text style={styles.projectionDetailText}>
                  -{formatCurrency(projectedBalance.projectedExpenses)} planned expenses
                </Text>
              </View>
            </View>
          </AnimatedChartCard>

          <View style={{ height: 120 }} />
        </ScrollView>
      </View>
    </View>
  );
}

function QuickStatCard({ 
  icon, 
  label, 
  value, 
  trend, 
  trendValue, 
  color,
  delay = 0,
}: { 
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  color: string;
  delay?: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [delay, fadeAnim, scaleAnim]);

  const trendColor = trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : '#71717A';

  return (
    <Animated.View 
      style={[
        styles.quickStatCard,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
      ]}
    >
      <View style={[styles.quickStatIcon, { backgroundColor: `${color}15` }]}>
        {icon}
      </View>
      <Text style={styles.quickStatLabel}>{label}</Text>
      <Text style={[styles.quickStatValue, { color }]}>{value}</Text>
      <Text style={[styles.quickStatTrend, { color: trendColor }]}>{trendValue}</Text>
    </Animated.View>
  );
}

function SectionHeader({ 
  icon, 
  title,
  delay = 0,
}: { 
  icon: React.ReactNode;
  title: string;
  delay?: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [delay, fadeAnim, slideAnim]);

  return (
    <Animated.View 
      style={[
        styles.sectionHeader,
        { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }
      ]}
    >
      {icon}
      <Text style={styles.sectionTitle}>{title}</Text>
    </Animated.View>
  );
}

function AnimatedChartCard({ 
  children, 
  delay = 0 
}: { 
  children: React.ReactNode;
  delay?: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [delay, fadeAnim, slideAnim]);

  return (
    <Animated.View 
      style={[
        styles.chartCard,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      {children}
    </Animated.View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function CategoryBar({ 
  category, 
  amount, 
  percentage, 
  color,
  delay = 0,
}: { 
  category: string;
  amount: number;
  percentage: number;
  color: string;
  delay?: number;
}) {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(widthAnim, {
          toValue: percentage,
          duration: 800,
          useNativeDriver: false,
        }),
      ]),
    ]).start();
  }, [delay, widthAnim, fadeAnim, percentage]);

  const barWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.categoryBarContainer, { opacity: fadeAnim }]}>
      <View style={styles.categoryBarHeader}>
        <View style={styles.categoryBarLeft}>
          <View style={[styles.categoryDot, { backgroundColor: color }]} />
          <Text style={styles.categoryName}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Text>
        </View>
        <View style={styles.categoryBarRight}>
          <Text style={styles.categoryAmount}>{formatCurrency(amount)}</Text>
          <Text style={styles.categoryPercent}>{percentage.toFixed(0)}%</Text>
        </View>
      </View>
      <View style={styles.categoryBarTrack}>
        <Animated.View 
          style={[
            styles.categoryBarFill,
            { width: barWidth, backgroundColor: color }
          ]} 
        />
      </View>
    </Animated.View>
  );
}

function GoalProgressItem({
  title,
  current,
  target,
  progress,
  color,
  delay = 0,
}: {
  title: string;
  current: number;
  target: number;
  progress: number;
  color: string;
  delay?: number;
}) {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(widthAnim, {
          toValue: Math.min(progress, 100),
          duration: 800,
          useNativeDriver: false,
        }),
      ]),
    ]).start();
  }, [delay, widthAnim, fadeAnim, progress]);

  const barWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.goalItem, { opacity: fadeAnim }]}>
      <View style={styles.goalHeader}>
        <Text style={styles.goalTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.goalProgress}>{progress.toFixed(0)}%</Text>
      </View>
      <View style={styles.goalBarTrack}>
        <Animated.View 
          style={[
            styles.goalBarFill,
            { width: barWidth, backgroundColor: color }
          ]} 
        />
      </View>
      <View style={styles.goalAmounts}>
        <Text style={styles.goalCurrent}>{formatCurrency(current)}</Text>
        <Text style={styles.goalTarget}>of {formatCurrency(target)}</Text>
      </View>
    </Animated.View>
  );
}

function formatCurrency(num: number): string {
  if (Math.abs(num) >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M JD`;
  } else if (Math.abs(num) >= 1000) {
    return `${(num / 1000).toFixed(1)}K JD`;
  }
  return `${num.toFixed(0)} JD`;
}

function getLast7DaysSpending(transactions: any[]): { value: number; label: string }[] {
  const days: { value: number; label: string }[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const daySpending = transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'expense' && tDate >= date && tDate < nextDate;
      })
      .reduce((sum, t) => sum + t.amount, 0);
    
    days.push({
      value: daySpending,
      label: dayNames[date.getDay()],
    });
  }
  
  return days;
}

function calculateTrend(data: { value: number }[]): number {
  if (data.length < 2) return 0;
  
  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, d) => sum + d.value, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, d) => sum + d.value, 0) / secondHalf.length;
  
  if (firstAvg === 0) return secondAvg > 0 ? 100 : 0;
  return ((secondAvg - firstAvg) / firstAvg) * 100;
}

function getMonthlyData(transactions: any[]): { income: number; expenses: number }[] {
  const months: { income: number; expenses: number }[] = [];
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const monthIncome = transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'income' && tDate >= monthStart && tDate <= monthEnd;
      })
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthExpenses = transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'expense' && tDate >= monthStart && tDate <= monthEnd;
      })
      .reduce((sum, t) => sum + t.amount, 0);
    
    months.push({ income: monthIncome, expenses: monthExpenses });
  }
  
  return months;
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
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerSubtitle: {
    fontFamily: sfProDisplayRegular,
    fontSize: 13,
    color: '#71717A',
    marginBottom: 2,
  },
  headerTitle: {
    fontFamily: sfProDisplayBold,
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  liveText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#10B981',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  heroCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
  },
  heroPattern: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '50%',
  },
  heroPatternCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
  },
  heroContent: {
    padding: 20,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  heroLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroLabel: {
    fontFamily: sfProDisplayMedium,
    fontSize: 13,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.9)',
  },
  heroScoreContainer: {
    alignItems: 'center',
  },
  heroMessage: {
    fontFamily: sfProDisplayBold,
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
  },
  heroStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatValue: {
    fontFamily: sfProDisplayBold,
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  heroStatLabel: {
    fontFamily: sfProDisplayRegular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  quickStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickStatLabel: {
    fontFamily: sfProDisplayRegular,
    fontSize: 12,
    color: '#71717A',
    marginBottom: 4,
  },
  quickStatValue: {
    fontFamily: sfProDisplayBold,
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  quickStatTrend: {
    fontFamily: sfProDisplayMedium,
    fontSize: 11,
    fontWeight: '500' as const,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: sfProDisplayBold,
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#1A1A1A',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 12,
    fontWeight: '500' as const,
    color: '#71717A',
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  trendText: {
    fontFamily: sfProDisplayMedium,
    fontSize: 13,
    fontWeight: '600' as const,
  },
  emptyChart: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyChartText: {
    fontFamily: sfProDisplayRegular,
    fontSize: 14,
    color: '#A1A1AA',
  },
  categoryContainer: {
    
  },
  categoryBars: {
    gap: 16,
  },
  categoryBarContainer: {
    
  },
  categoryBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryName: {
    fontFamily: sfProDisplayMedium,
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#1A1A1A',
  },
  categoryBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryAmount: {
    fontFamily: sfProDisplayBold,
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#1A1A1A',
  },
  categoryPercent: {
    fontFamily: sfProDisplayMedium,
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#71717A',
    width: 36,
    textAlign: 'right',
  },
  categoryBarTrack: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  budgetHealthContainer: {
    alignItems: 'center',
  },
  budgetHealthRings: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  budgetHealthSummary: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    width: '100%',
  },
  budgetHealthTotal: {
    fontFamily: sfProDisplayBold,
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  budgetHealthDesc: {
    fontFamily: sfProDisplayRegular,
    fontSize: 13,
    color: '#71717A',
  },
  goalsContainer: {
    gap: 20,
  },
  goalItem: {
    
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontFamily: sfProDisplayMedium,
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#1A1A1A',
    flex: 1,
    marginRight: 12,
  },
  goalProgress: {
    fontFamily: sfProDisplayBold,
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#1A1A1A',
  },
  goalBarTrack: {
    height: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  goalBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  goalAmounts: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  goalCurrent: {
    fontFamily: sfProDisplayMedium,
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#1A1A1A',
  },
  goalTarget: {
    fontFamily: sfProDisplayRegular,
    fontSize: 12,
    color: '#71717A',
  },
  projectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  projectionItem: {
    flex: 1,
    alignItems: 'center',
  },
  projectionLabel: {
    fontFamily: sfProDisplayRegular,
    fontSize: 12,
    color: '#71717A',
    marginBottom: 4,
  },
  projectionValue: {
    fontFamily: sfProDisplayBold,
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1A1A1A',
  },
  projectionArrow: {
    paddingHorizontal: 8,
  },
  projectionDetails: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 8,
  },
  projectionDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  projectionDetailText: {
    fontFamily: sfProDisplayRegular,
    fontSize: 13,
    color: '#71717A',
  },
});
