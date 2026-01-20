import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Transaction, SavingsGoal, FinancialSummary, CategorySpending, TransactionCategory, UserProfile, OnboardingData, OptimizationSuggestion, OptimizationReport, Budget, BudgetRule, BudgetReward, BudgetStatus, BudgetCategory, BudgetImpact, RuleViolation, PlannedTransaction, RecurrenceType } from '@/constants/types';
import { generateObject } from '@rork-ai/toolkit-sdk';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';



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

export const [FinanceProvider, useFinance] = createContextHook(() => {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [optimizations, setOptimizations] = useState<OptimizationSuggestion[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetRules, setBudgetRules] = useState<BudgetRule[]>([]);
  const [budgetRewards, setBudgetRewards] = useState<BudgetReward[]>([]);
  const [plannedTransactions, setPlannedTransactions] = useState<PlannedTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    if (!authLoading && authUser) {
      loadData();
    } else if (!authLoading && !authUser) {
      setIsLoading(false);
    }
  }, [authUser, authLoading]);

  const loadData = async () => {
    if (!authUser) return;
    
    try {
      console.log('Loading financial data for user:', authUser.id);

      const [profileRes, transactionsRes, goalsRes, budgetsRes, rulesRes, plannedRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', authUser.id).single(),
        supabase.from('transactions').select('*').eq('user_id', authUser.id).order('date', { ascending: false }),
        supabase.from('goals').select('*').eq('user_id', authUser.id),
        supabase.from('budgets').select('*').eq('user_id', authUser.id),
        supabase.from('budget_rules').select('*').eq('user_id', authUser.id),
        supabase.from('planned_transactions').select('*').eq('user_id', authUser.id),
      ]);

      if (profileRes.data) {
        const profile: UserProfile = {
          id: profileRes.data.id,
          email: profileRes.data.email,
          name: profileRes.data.name,
          monthlyIncome: Number(profileRes.data.monthly_income),
          householdSize: profileRes.data.household_size,
          primaryGoals: profileRes.data.primary_goals,
          riskTolerance: profileRes.data.risk_tolerance as 'conservative' | 'moderate' | 'aggressive',
          currency: profileRes.data.currency,
          hasCompletedOnboarding: profileRes.data.has_completed_onboarding,
          createdAt: profileRes.data.created_at,
        };
        setUserProfile(profile);
      }

      if (transactionsRes.data) {
        const trans: Transaction[] = transactionsRes.data.map(t => ({
          id: t.id,
          type: t.type as 'income' | 'expense',
          category: t.category as TransactionCategory,
          amount: Number(t.amount),
          description: t.description,
          date: t.date,
          notes: t.notes || undefined,
        }));
        setTransactions(trans);
      }

      if (goalsRes.data) {
        const goalsData: SavingsGoal[] = goalsRes.data.map(g => ({
          id: g.id,
          title: g.title,
          targetAmount: Number(g.target_amount),
          currentAmount: Number(g.current_amount),
          deadline: g.deadline || undefined,
          category: g.category,
          color: g.color,
        }));
        setGoals(goalsData);
      }

      if (budgetsRes.data) {
        const budgetsData: Budget[] = budgetsRes.data.map(b => ({
          id: b.id,
          category: b.category as BudgetCategory,
          name: b.name,
          limit: Number(b.limit),
          spent: Number(b.spent),
          period: b.period as 'weekly' | 'monthly',
          startDate: b.start_date,
          color: b.color,
          rules: b.rules,
        }));
        setBudgets(budgetsData);
      }

      if (rulesRes.data) {
        const rulesData: BudgetRule[] = rulesRes.data.map(r => ({
          id: r.id,
          name: r.name,
          description: r.description,
          category: r.category as BudgetCategory | undefined,
          maxPercentage: r.max_percentage ? Number(r.max_percentage) : undefined,
          maxAmount: r.max_amount ? Number(r.max_amount) : undefined,
          strictness: r.strictness as 'flexible' | 'moderate' | 'strict',
          isActive: r.is_active,
          createdAt: r.created_at,
        }));
        setBudgetRules(rulesData);
      }

      if (plannedRes.data) {
        const plannedData: PlannedTransaction[] = plannedRes.data.map(p => ({
          id: p.id,
          type: p.type as 'income' | 'expense',
          category: p.category as TransactionCategory,
          amount: Number(p.amount),
          description: p.description,
          scheduledDate: p.scheduled_date,
          recurrence: p.recurrence as RecurrenceType,
          notes: p.notes || undefined,
          isActive: p.is_active,
          lastProcessedDate: p.last_processed_date || undefined,
          createdAt: p.created_at,
        }));
        setPlannedTransactions(plannedData);
      }

      console.log('Financial data loaded successfully');
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setIsLoading(false);
    }
  };









  const createProfile = useCallback(async (data: OnboardingData): Promise<boolean> => {
    if (!authUser) return false;
    
    try {
      const { error } = await supabase.from('profiles').insert({
        user_id: authUser.id,
        email: data.email,
        name: data.name,
        monthly_income: data.monthlyIncome,
        household_size: data.householdSize,
        primary_goals: data.primaryGoals,
        risk_tolerance: data.riskTolerance,
        currency: 'JD',
        has_completed_onboarding: true,
      });

      if (error) {
        console.error('Error creating profile:', error);
        return false;
      }

      await loadData();
      return true;
    } catch (error) {
      console.error('Error creating profile:', error);
      return false;
    }
  }, [authUser]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!authUser || !userProfile) return false;
    
    try {
      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.monthlyIncome) updateData.monthly_income = updates.monthlyIncome;
      if (updates.householdSize) updateData.household_size = updates.householdSize;
      if (updates.primaryGoals) updateData.primary_goals = updates.primaryGoals;
      if (updates.riskTolerance) updateData.risk_tolerance = updates.riskTolerance;
      if (updates.hasCompletedOnboarding !== undefined) updateData.has_completed_onboarding = updates.hasCompletedOnboarding;

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', authUser.id);

      if (error) {
        console.error('Error updating profile:', error);
        return false;
      }

      setUserProfile({ ...userProfile, ...updates });
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  }, [authUser, userProfile]);



  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>) => {
    if (!authUser) return;
    
    try {
      const { data, error } = await supabase.from('transactions').insert({
        user_id: authUser.id,
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date,
        notes: transaction.notes || null,
      }).select().single();

      if (error) {
        console.error('Error adding transaction:', error);
        return;
      }

      if (data) {
        const newTransaction: Transaction = {
          id: data.id,
          type: data.type as 'income' | 'expense',
          category: data.category as TransactionCategory,
          amount: Number(data.amount),
          description: data.description,
          date: data.date,
          notes: data.notes || undefined,
        };
        setTransactions(prev => [newTransaction, ...prev]);
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  }, [authUser]);

  const deleteTransaction = useCallback(async (id: string) => {
    if (!authUser) return;
    
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);

      if (error) {
        console.error('Error deleting transaction:', error);
        return;
      }

      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  }, [authUser]);

  const addGoal = useCallback(async (goal: Omit<SavingsGoal, 'id'>) => {
    if (!authUser) return;
    
    try {
      const { data, error } = await supabase.from('goals').insert({
        user_id: authUser.id,
        title: goal.title,
        target_amount: goal.targetAmount,
        current_amount: goal.currentAmount,
        deadline: goal.deadline || null,
        category: goal.category,
        color: goal.color,
      }).select().single();

      if (error) {
        console.error('Error adding goal:', error);
        return;
      }

      if (data) {
        const newGoal: SavingsGoal = {
          id: data.id,
          title: data.title,
          targetAmount: Number(data.target_amount),
          currentAmount: Number(data.current_amount),
          deadline: data.deadline || undefined,
          category: data.category,
          color: data.color,
        };
        setGoals(prev => [...prev, newGoal]);
      }
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  }, [authUser]);

  const updateGoal = useCallback(async (id: string, updates: Partial<SavingsGoal>) => {
    if (!authUser) return;
    
    try {
      const updateData: any = {};
      if (updates.title) updateData.title = updates.title;
      if (updates.targetAmount) updateData.target_amount = updates.targetAmount;
      if (updates.currentAmount !== undefined) updateData.current_amount = updates.currentAmount;
      if (updates.deadline) updateData.deadline = updates.deadline;
      if (updates.category) updateData.category = updates.category;
      if (updates.color) updateData.color = updates.color;

      const { error } = await supabase.from('goals').update(updateData).eq('id', id);

      if (error) {
        console.error('Error updating goal:', error);
        return;
      }

      setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  }, [authUser]);

  const deleteGoal = useCallback(async (id: string) => {
    if (!authUser) return;
    
    try {
      const { error } = await supabase.from('goals').delete().eq('id', id);

      if (error) {
        console.error('Error deleting goal:', error);
        return;
      }

      setGoals(prev => prev.filter(g => g.id !== id));
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  }, [authUser]);

  const financialSummary = useMemo<FinancialSummary>(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;
    
    let healthScore = 0;
    if (savingsRate > 20) healthScore += 40;
    else if (savingsRate > 10) healthScore += 25;
    else if (savingsRate > 0) healthScore += 15;
    
    if (balance > 1000) healthScore += 30;
    else if (balance > 500) healthScore += 20;
    else if (balance > 0) healthScore += 10;
    
    const avgTransactionsPerDay = transactions.length / 30;
    if (avgTransactionsPerDay < 5) healthScore += 20;
    else if (avgTransactionsPerDay < 10) healthScore += 15;
    else healthScore += 10;
    
    const goalsProgress = goals.length > 0
      ? goals.reduce((sum, g) => sum + (g.currentAmount / g.targetAmount), 0) / goals.length
      : 0;
    healthScore += goalsProgress * 10;
    
    return {
      totalIncome,
      totalExpenses,
      balance,
      savingsRate: Math.max(0, Math.min(100, savingsRate)),
      healthScore: Math.max(0, Math.min(100, healthScore)),
    };
  }, [transactions, goals]);

  const categorySpending = useMemo<CategorySpending[]>(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const total = expenses.reduce((sum, t) => sum + t.amount, 0);
    
    const categoryMap = new Map<TransactionCategory, { amount: number; count: number }>();
    
    expenses.forEach(t => {
      const current = categoryMap.get(t.category) || { amount: 0, count: 0 };
      categoryMap.set(t.category, {
        amount: current.amount + t.amount,
        count: current.count + 1,
      });
    });
    
    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        percentage: total > 0 ? (data.amount / total) * 100 : 0,
        transactions: data.count,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const generateOptimizations = useCallback(async (): Promise<OptimizationReport> => {
    console.log('Starting AI optimization analysis...');
    setIsOptimizing(true);
    
    try {
      const expenses = transactions.filter(t => t.type === 'expense');
      const income = transactions.filter(t => t.type === 'income');
      const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
      const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);

      const categoryMap = new Map<TransactionCategory, { amount: number; transactions: Transaction[] }>();
      expenses.forEach(t => {
        const current = categoryMap.get(t.category) || { amount: 0, transactions: [] };
        categoryMap.set(t.category, {
          amount: current.amount + t.amount,
          transactions: [...current.transactions, t],
        });
      });

      const spendingByCategory = Array.from(categoryMap.entries()).map(([category, data]) => ({
        category,
        amount: data.amount,
        percentage: (data.amount / totalExpenses) * 100,
        count: data.transactions.length,
        avgTransaction: data.amount / data.transactions.length,
        transactions: data.transactions.slice(0, 5).map(t => ({
          description: t.description,
          amount: t.amount,
          date: t.date,
        })),
      }));

      const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

      const contextData = {
        user: {
          name: userProfile?.name,
          monthlyIncome: userProfile?.monthlyIncome,
          householdSize: userProfile?.householdSize,
          primaryGoals: userProfile?.primaryGoals,
          riskTolerance: userProfile?.riskTolerance,
        },
        financial: {
          totalIncome,
          totalExpenses,
          balance: financialSummary.balance,
          savingsRate,
          healthScore: financialSummary.healthScore,
        },
        spending: spendingByCategory,
        goals: goals.map(g => ({
          title: g.title,
          target: g.targetAmount,
          current: g.currentAmount,
          progress: (g.currentAmount / g.targetAmount) * 100,
        })),
        transactionCount: {
          total: transactions.length,
          lastMonth: transactions.filter(t => {
            const date = new Date(t.date);
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return date >= monthAgo;
          }).length,
        },
      };

      console.log('Calling AI with context:', JSON.stringify(contextData, null, 2));

      const OptimizationSchema = z.object({
        suggestions: z.array(z.object({
          type: z.enum(['expense_reduction', 'income_increase', 'savings_boost', 'investment_opportunity']),
          priority: z.enum(['high', 'medium', 'low']),
          title: z.string().describe('Clear, actionable title'),
          description: z.string().describe('Detailed explanation with specific amounts'),
          potentialSavings: z.number().optional().describe('Monthly savings in JD'),
          potentialIncome: z.number().optional().describe('Monthly income increase in JD'),
          category: z.enum(['food', 'transport', 'entertainment', 'shopping', 'bills', 'healthcare', 'education', 'investment', 'savings', 'income', 'other']).optional(),
          implementationDifficulty: z.enum(['easy', 'moderate', 'hard']),
          timeframe: z.string().describe('How long to implement'),
          actionItems: z.array(z.string()).describe('3-5 specific action steps'),
        })),
      });

      const aiResult = await generateObject({
        messages: [
          {
            role: 'user',
            content: `You are DomusIQ, an AI financial optimization expert. Analyze this user's financial data and generate 5-8 personalized optimization suggestions.

User Context:
${JSON.stringify(contextData, null, 2)}

Your task:
1. Analyze spending patterns and identify waste or inefficiencies
2. Suggest specific expense reduction strategies with realistic savings amounts
3. Identify income opportunities based on their profile
4. Recommend savings and investment strategies aligned with their risk tolerance and goals
5. Prioritize suggestions by potential impact and ease of implementation

Guidelines:
- Be specific with amounts (in JD)
- Focus on actionable, realistic advice
- Consider their household size and income level
- Align with their primary goals: ${userProfile?.primaryGoals?.join(', ') || 'general financial health'}
- Provide 3-5 concrete action items per suggestion
- Estimate realistic savings/income potential (don't overestimate)

Generate suggestions that will genuinely improve their financial state.`,
          },
        ],
        schema: OptimizationSchema,
      });

      console.log('AI returned suggestions:', aiResult);

      const suggestions: OptimizationSuggestion[] = aiResult.suggestions.map(s => ({
        ...s,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        implemented: false,
      }));

      const totalPotentialSavings = suggestions.reduce((sum, s) => sum + (s.potentialSavings || 0), 0);
      const totalPotentialIncome = suggestions.reduce((sum, s) => sum + (s.potentialIncome || 0), 0);

      const report: OptimizationReport = {
        totalPotentialSavings,
        totalPotentialIncome,
        suggestions,
        generatedAt: new Date().toISOString(),
      };

      setOptimizations(suggestions);
      
      console.log('AI optimization complete:', report);
      return report;
    } catch (error) {
      console.error('Error generating optimizations:', error);
      throw error;
    } finally {
      setIsOptimizing(false);
    }
  }, [transactions, userProfile, financialSummary, goals]);

  const markOptimizationImplemented = useCallback(async (id: string) => {
    const updated = optimizations.map(opt => 
      opt.id === id ? { ...opt, implemented: true } : opt
    );
    setOptimizations(updated);
  }, [optimizations]);

  const clearOptimizations = useCallback(() => {
    setOptimizations([]);
  }, []);

  const addBudget = useCallback(async (budget: Omit<Budget, 'id' | 'spent'>) => {
    if (!authUser) return;
    
    try {
      const { data, error } = await supabase.from('budgets').insert({
        user_id: authUser.id,
        category: budget.category,
        name: budget.name,
        limit: budget.limit,
        spent: 0,
        period: budget.period,
        start_date: budget.startDate,
        color: budget.color,
        rules: budget.rules,
      }).select().single();

      if (error) {
        console.error('Error adding budget:', error);
        return;
      }

      if (data) {
        const newBudget: Budget = {
          id: data.id,
          category: data.category as BudgetCategory,
          name: data.name,
          limit: Number(data.limit),
          spent: Number(data.spent),
          period: data.period as 'weekly' | 'monthly',
          startDate: data.start_date,
          color: data.color,
          rules: data.rules,
        };
        setBudgets(prev => [...prev, newBudget]);
      }
    } catch (error) {
      console.error('Error adding budget:', error);
    }
  }, [authUser]);

  const updateBudget = useCallback(async (id: string, updates: Partial<Budget>) => {
    if (!authUser) return;
    
    try {
      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.limit) updateData.limit = updates.limit;
      if (updates.spent !== undefined) updateData.spent = updates.spent;
      if (updates.category) updateData.category = updates.category;
      if (updates.period) updateData.period = updates.period;
      if (updates.color) updateData.color = updates.color;
      if (updates.rules) updateData.rules = updates.rules;

      const { error } = await supabase.from('budgets').update(updateData).eq('id', id);

      if (error) {
        console.error('Error updating budget:', error);
        return;
      }

      setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    } catch (error) {
      console.error('Error updating budget:', error);
    }
  }, [authUser]);

  const deleteBudget = useCallback(async (id: string) => {
    if (!authUser) return;
    
    try {
      const { error } = await supabase.from('budgets').delete().eq('id', id);

      if (error) {
        console.error('Error deleting budget:', error);
        return;
      }

      setBudgets(prev => prev.filter(b => b.id !== id));
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  }, [authUser]);

  const addBudgetRule = useCallback(async (rule: Omit<BudgetRule, 'id' | 'createdAt'>) => {
    if (!authUser) return;
    
    try {
      const { data, error } = await supabase.from('budget_rules').insert({
        user_id: authUser.id,
        name: rule.name,
        description: rule.description,
        category: rule.category || null,
        max_percentage: rule.maxPercentage || null,
        max_amount: rule.maxAmount || null,
        strictness: rule.strictness,
        is_active: rule.isActive,
      }).select().single();

      if (error) {
        console.error('Error adding budget rule:', error);
        return;
      }

      if (data) {
        const newRule: BudgetRule = {
          id: data.id,
          name: data.name,
          description: data.description,
          category: data.category as BudgetCategory | undefined,
          maxPercentage: data.max_percentage ? Number(data.max_percentage) : undefined,
          maxAmount: data.max_amount ? Number(data.max_amount) : undefined,
          strictness: data.strictness as 'flexible' | 'moderate' | 'strict',
          isActive: data.is_active,
          createdAt: data.created_at,
        };
        setBudgetRules(prev => [...prev, newRule]);
      }
    } catch (error) {
      console.error('Error adding budget rule:', error);
    }
  }, [authUser]);

  const updateBudgetRule = useCallback(async (id: string, updates: Partial<BudgetRule>) => {
    if (!authUser) return;
    
    try {
      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.description) updateData.description = updates.description;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.maxPercentage !== undefined) updateData.max_percentage = updates.maxPercentage;
      if (updates.maxAmount !== undefined) updateData.max_amount = updates.maxAmount;
      if (updates.strictness) updateData.strictness = updates.strictness;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

      const { error } = await supabase.from('budget_rules').update(updateData).eq('id', id);

      if (error) {
        console.error('Error updating budget rule:', error);
        return;
      }

      setBudgetRules(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    } catch (error) {
      console.error('Error updating budget rule:', error);
    }
  }, [authUser]);

  const deleteBudgetRule = useCallback(async (id: string) => {
    if (!authUser) return;
    
    try {
      const { error } = await supabase.from('budget_rules').delete().eq('id', id);

      if (error) {
        console.error('Error deleting budget rule:', error);
        return;
      }

      setBudgetRules(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting budget rule:', error);
    }
  }, [authUser]);

  const checkAndAwardRewards = useCallback(() => {
    console.log('Budget rewards system needs implementation');
  }, []);

  const budgetStatuses = useMemo<BudgetStatus[]>(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysInMonth = endOfMonth.getDate();
    const daysPassed = now.getDate();
    const daysRemaining = daysInMonth - daysPassed;
    
    return budgets.map(budget => {
      const relevantTransactions = transactions.filter(t => {
        if (t.type !== 'expense') return false;
        const budgetCategory = CATEGORY_TO_BUDGET[t.category];
        if (budgetCategory !== budget.category) return false;
        
        const transDate = new Date(t.date);
        if (budget.period === 'monthly') {
          return transDate >= startOfMonth && transDate <= now;
        } else {
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return transDate >= weekAgo && transDate <= now;
        }
      });
      
      const spent = relevantTransactions.reduce((sum, t) => sum + t.amount, 0);
      const percentageUsed = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
      const remaining = Math.max(0, budget.limit - spent);
      
      const dailyRate = spent / Math.max(1, daysPassed);
      const projectedEnd = dailyRate * daysInMonth;
      
      let status: 'safe' | 'warning' | 'danger' | 'exceeded';
      if (spent > budget.limit) {
        status = 'exceeded';
      } else if (percentageUsed >= 90) {
        status = 'danger';
      } else if (percentageUsed >= 70) {
        status = 'warning';
      } else {
        status = 'safe';
      }
      
      return {
        budget: { ...budget, spent },
        percentageUsed,
        remaining,
        status,
        daysRemaining,
        projectedEnd,
      };
    });
  }, [budgets, transactions]);

  const totalRewardPoints = useMemo(() => {
    return budgetRewards.reduce((sum, r) => sum + r.points, 0);
  }, [budgetRewards]);

  const checkRuleViolation = useCallback((transaction: Omit<Transaction, 'id'>): RuleViolation[] => {
    const violations: RuleViolation[] = [];
    
    if (transaction.type !== 'expense') return violations;
    
    const budgetCategory = CATEGORY_TO_BUDGET[transaction.category];
    if (!budgetCategory) return violations;
    
    for (const rule of budgetRules) {
      if (!rule.isActive) continue;
      
      if (rule.category && rule.category !== budgetCategory) continue;
      
      if (rule.maxAmount && transaction.amount > rule.maxAmount) {
        violations.push({
          rule,
          type: 'max_amount',
          message: `Exceeds rule "${rule.name}" (max: ${rule.maxAmount} USD)`,
          isBlocking: rule.strictness === 'strict',
        });
      }
      
      if (rule.maxPercentage) {
        const budget = budgets.find(b => b.category === budgetCategory);
        if (budget) {
          const currentSpent = budgetStatuses.find(s => s.budget.id === budget.id)?.budget.spent || 0;
          const wouldBeSpent = currentSpent + transaction.amount;
          const wouldBePercentage = (wouldBeSpent / budget.limit) * 100;
          
          if (wouldBePercentage > rule.maxPercentage) {
            violations.push({
              rule,
              type: 'max_percentage',
              message: `Would exceed ${rule.maxPercentage}% of ${budget.name} budget`,
              isBlocking: rule.strictness === 'strict',
            });
          }
        }
      }
    }
    
    return violations;
  }, [budgetRules, budgets, budgetStatuses]);

  const addPlannedTransaction = useCallback(async (planned: Omit<PlannedTransaction, 'id' | 'createdAt' | 'isActive'>) => {
    if (!authUser) return;
    
    try {
      const { data, error } = await supabase.from('planned_transactions').insert({
        user_id: authUser.id,
        type: planned.type,
        category: planned.category,
        amount: planned.amount,
        description: planned.description,
        scheduled_date: planned.scheduledDate,
        recurrence: planned.recurrence,
        notes: planned.notes || null,
        is_active: true,
      }).select().single();

      if (error) {
        console.error('Error adding planned transaction:', error);
        return;
      }

      if (data) {
        const newPlanned: PlannedTransaction = {
          id: data.id,
          type: data.type as 'income' | 'expense',
          category: data.category as TransactionCategory,
          amount: Number(data.amount),
          description: data.description,
          scheduledDate: data.scheduled_date,
          recurrence: data.recurrence as RecurrenceType,
          notes: data.notes || undefined,
          isActive: data.is_active,
          lastProcessedDate: data.last_processed_date || undefined,
          createdAt: data.created_at,
        };
        setPlannedTransactions(prev => [...prev, newPlanned]);
      }
    } catch (error) {
      console.error('Error adding planned transaction:', error);
    }
  }, [authUser]);

  const updatePlannedTransaction = useCallback(async (id: string, updates: Partial<PlannedTransaction>) => {
    if (!authUser) return;
    
    try {
      const updateData: any = {};
      if (updates.type) updateData.type = updates.type;
      if (updates.category) updateData.category = updates.category;
      if (updates.amount) updateData.amount = updates.amount;
      if (updates.description) updateData.description = updates.description;
      if (updates.scheduledDate) updateData.scheduled_date = updates.scheduledDate;
      if (updates.recurrence) updateData.recurrence = updates.recurrence;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
      if (updates.lastProcessedDate !== undefined) updateData.last_processed_date = updates.lastProcessedDate;

      const { error } = await supabase.from('planned_transactions').update(updateData).eq('id', id);

      if (error) {
        console.error('Error updating planned transaction:', error);
        return;
      }

      setPlannedTransactions(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    } catch (error) {
      console.error('Error updating planned transaction:', error);
    }
  }, [authUser]);

  const deletePlannedTransaction = useCallback(async (id: string) => {
    if (!authUser) return;
    
    try {
      const { error } = await supabase.from('planned_transactions').delete().eq('id', id);

      if (error) {
        console.error('Error deleting planned transaction:', error);
        return;
      }

      setPlannedTransactions(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting planned transaction:', error);
    }
  }, [authUser]);

  const getNextOccurrence = (date: string, recurrence: RecurrenceType): string => {
    const d = new Date(date);
    switch (recurrence) {
      case 'daily':
        d.setDate(d.getDate() + 1);
        break;
      case 'weekly':
        d.setDate(d.getDate() + 7);
        break;
      case 'biweekly':
        d.setDate(d.getDate() + 14);
        break;
      case 'monthly':
        d.setMonth(d.getMonth() + 1);
        break;
      case 'yearly':
        d.setFullYear(d.getFullYear() + 1);
        break;
      default:
        return date;
    }
    return d.toISOString();
  };

  const processPlannedTransaction = useCallback((planned: PlannedTransaction) => {
    addTransaction({
      type: planned.type,
      category: planned.category,
      amount: planned.amount,
      description: planned.description,
      date: new Date().toISOString(),
      notes: planned.notes ? `[Planned] ${planned.notes}` : '[Planned Transaction]',
    });

    if (planned.recurrence === 'once') {
      updatePlannedTransaction(planned.id, { isActive: false, lastProcessedDate: new Date().toISOString() });
    } else {
      const nextDate = getNextOccurrence(planned.scheduledDate, planned.recurrence);
      updatePlannedTransaction(planned.id, {
        scheduledDate: nextDate,
        lastProcessedDate: new Date().toISOString(),
      });
    }
    console.log('Processed planned transaction:', planned.description);
  }, [addTransaction, updatePlannedTransaction]);

  const upcomingPlannedTransactions = useMemo(() => {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return plannedTransactions
      .filter(p => p.isActive)
      .filter(p => {
        const scheduledDate = new Date(p.scheduledDate);
        return scheduledDate >= now && scheduledDate <= thirtyDaysFromNow;
      })
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  }, [plannedTransactions]);

  const projectedBalance = useMemo(() => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    let projectedIncome = 0;
    let projectedExpenses = 0;

    upcomingPlannedTransactions.forEach(p => {
      if (p.type === 'income') {
        projectedIncome += p.amount;
      } else {
        projectedExpenses += p.amount;
      }
    });

    return {
      currentBalance: financialSummary.balance,
      projectedIncome,
      projectedExpenses,
      projectedBalance: financialSummary.balance + projectedIncome - projectedExpenses,
    };
  }, [financialSummary.balance, upcomingPlannedTransactions]);

  const checkBudgetImpact = useCallback((transaction: Omit<Transaction, 'id'>): BudgetImpact | null => {
    if (transaction.type !== 'expense') return null;
    
    const budgetCategory = CATEGORY_TO_BUDGET[transaction.category];
    if (!budgetCategory) return null;
    
    const budgetStatus = budgetStatuses.find(s => s.budget.category === budgetCategory);
    if (!budgetStatus) return null;
    
    const currentSpent = budgetStatus.budget.spent;
    const newSpent = currentSpent + transaction.amount;
    const newPercentage = (newSpent / budgetStatus.budget.limit) * 100;
    const newRemaining = Math.max(0, budgetStatus.budget.limit - newSpent);
    
    let newStatus: 'safe' | 'warning' | 'danger' | 'exceeded';
    if (newSpent > budgetStatus.budget.limit) {
      newStatus = 'exceeded';
    } else if (newPercentage >= 90) {
      newStatus = 'danger';
    } else if (newPercentage >= 70) {
      newStatus = 'warning';
    } else {
      newStatus = 'safe';
    }
    
    const ruleViolations = checkRuleViolation(transaction);
    
    return {
      budget: budgetStatus.budget,
      currentSpent,
      newSpent,
      currentPercentage: budgetStatus.percentageUsed,
      newPercentage,
      remaining: newRemaining,
      status: newStatus,
      willExceed: newSpent > budgetStatus.budget.limit,
      ruleViolations,
    };
  }, [budgetStatuses, checkRuleViolation]);

  const isAuthenticated = authUser !== null;
  const hasCompletedOnboarding = userProfile?.hasCompletedOnboarding ?? false;

  return useMemo(() => ({
    transactions,
    goals,
    userProfile,
    isLoading,
    isAuthenticated,
    hasCompletedOnboarding,
    financialSummary,
    categorySpending,
    optimizations,
    isOptimizing,
    budgets,
    budgetRules,
    budgetRewards,
    budgetStatuses,
    totalRewardPoints,
    plannedTransactions,
    upcomingPlannedTransactions,
    projectedBalance,
    addTransaction,
    deleteTransaction,
    checkBudgetImpact,
    checkRuleViolation,
    addGoal,
    updateGoal,
    deleteGoal,
    addBudget,
    updateBudget,
    deleteBudget,
    addBudgetRule,
    updateBudgetRule,
    deleteBudgetRule,
    addPlannedTransaction,
    updatePlannedTransaction,
    deletePlannedTransaction,
    processPlannedTransaction,
    checkAndAwardRewards,
    createProfile,
    updateProfile,
    generateOptimizations,
    markOptimizationImplemented,
    clearOptimizations,
  }), [
    transactions,
    goals,
    userProfile,
    isLoading,
    isAuthenticated,
    hasCompletedOnboarding,
    financialSummary,
    categorySpending,
    optimizations,
    isOptimizing,
    budgets,
    budgetRules,
    budgetRewards,
    budgetStatuses,
    totalRewardPoints,
    plannedTransactions,
    upcomingPlannedTransactions,
    projectedBalance,
    addTransaction,
    deleteTransaction,
    checkBudgetImpact,
    checkRuleViolation,
    addGoal,
    updateGoal,
    deleteGoal,
    addBudget,
    updateBudget,
    deleteBudget,
    addBudgetRule,
    updateBudgetRule,
    deleteBudgetRule,
    addPlannedTransaction,
    updatePlannedTransaction,
    deletePlannedTransaction,
    processPlannedTransaction,
    checkAndAwardRewards,
    createProfile,
    updateProfile,
    generateOptimizations,
    markOptimizationImplemented,
    clearOptimizations,
  ]);
});
