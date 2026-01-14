import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Transaction, SavingsGoal, FinancialSummary, CategorySpending, TransactionCategory, UserProfile, OnboardingData, OptimizationSuggestion, OptimizationReport, Budget, BudgetRule, BudgetReward, BudgetStatus, BudgetCategory, BudgetImpact, RuleViolation, PlannedTransaction, RecurrenceType } from '@/constants/types';
import { generateObject } from '@rork-ai/toolkit-sdk';
import { z } from 'zod';

const STORAGE_KEYS = {
  TRANSACTIONS: '@domusiq_transactions',
  GOALS: '@domusiq_goals',
  USER: '@domusiq_user',
  OPTIMIZATIONS: '@domusiq_optimizations',
  BUDGETS: '@domusiq_budgets',
  BUDGET_RULES: '@domusiq_budget_rules',
  BUDGET_REWARDS: '@domusiq_budget_rewards',
  PLANNED_TRANSACTIONS: '@domusiq_planned_transactions',
};

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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [optimizations, setOptimizations] = useState<OptimizationSuggestion[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetRules, setBudgetRules] = useState<BudgetRule[]>([]);
  const [budgetRewards, setBudgetRewards] = useState<BudgetReward[]>([]);
  const [plannedTransactions, setPlannedTransactions] = useState<PlannedTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [transactionsData, goalsData, userData, optimizationsData, budgetsData, rulesData, rewardsData, plannedData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS),
        AsyncStorage.getItem(STORAGE_KEYS.GOALS),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.OPTIMIZATIONS),
        AsyncStorage.getItem(STORAGE_KEYS.BUDGETS),
        AsyncStorage.getItem(STORAGE_KEYS.BUDGET_RULES),
        AsyncStorage.getItem(STORAGE_KEYS.BUDGET_REWARDS),
        AsyncStorage.getItem(STORAGE_KEYS.PLANNED_TRANSACTIONS),
      ]);

      if (transactionsData) {
        setTransactions(JSON.parse(transactionsData));
      }

      if (goalsData) {
        setGoals(JSON.parse(goalsData));
      }

      if (userData) {
        setUser(JSON.parse(userData));
      }

      if (optimizationsData) {
        setOptimizations(JSON.parse(optimizationsData));
      }

      if (budgetsData) {
        setBudgets(JSON.parse(budgetsData));
      }

      if (rulesData) {
        setBudgetRules(JSON.parse(rulesData));
      }

      if (rewardsData) {
        setBudgetRewards(JSON.parse(rewardsData));
      }

      if (plannedData) {
        setPlannedTransactions(JSON.parse(plannedData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTransactions = async (newTransactions: Transaction[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(newTransactions));
      setTransactions(newTransactions);
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  };

  const saveGoals = async (newGoals: SavingsGoal[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(newGoals));
      setGoals(newGoals);
    } catch (error) {
      console.error('Error saving goals:', error);
    }
  };

  const saveUser = async (newUser: UserProfile) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      setUser(newUser);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      if (userData) {
        const user: UserProfile = JSON.parse(userData);
        if (user.email === email) {
          setUser(user);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error logging in:', error);
      return false;
    }
  }, []);

  const signup = useCallback(async (data: OnboardingData): Promise<boolean> => {
    try {
      const newUser: UserProfile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        email: data.email,
        name: data.name,
        monthlyIncome: data.monthlyIncome,
        householdSize: data.householdSize,
        primaryGoals: data.primaryGoals,
        riskTolerance: data.riskTolerance,
        currency: 'JD',
        hasCompletedOnboarding: true,
        createdAt: new Date().toISOString(),
      };
      
      await saveUser(newUser);
      return true;
    } catch (error) {
      console.error('Error signing up:', error);
      return false;
    }
  }, []);

  const updateUser = useCallback(async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!user) return false;
    try {
      const updatedUser = { ...user, ...updates };
      await saveUser(updatedUser);
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }, [user]);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER,
        STORAGE_KEYS.TRANSACTIONS,
        STORAGE_KEYS.GOALS,
        STORAGE_KEYS.OPTIMIZATIONS,
      ]);
      setUser(null);
      setTransactions([]);
      setGoals([]);
      setOptimizations([]);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }, []);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    const updated = [newTransaction, ...transactions];
    saveTransactions(updated);
  }, [transactions]);

  const deleteTransaction = useCallback((id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    saveTransactions(updated);
  }, [transactions]);

  const addGoal = useCallback((goal: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    const updated = [...goals, newGoal];
    saveGoals(updated);
  }, [goals]);

  const updateGoal = useCallback((id: string, updates: Partial<SavingsGoal>) => {
    const updated = goals.map(g => g.id === id ? { ...g, ...updates } : g);
    saveGoals(updated);
  }, [goals]);

  const deleteGoal = useCallback((id: string) => {
    const updated = goals.filter(g => g.id !== id);
    saveGoals(updated);
  }, [goals]);

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
          name: user?.name,
          monthlyIncome: user?.monthlyIncome,
          householdSize: user?.householdSize,
          primaryGoals: user?.primaryGoals,
          riskTolerance: user?.riskTolerance,
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
- Align with their primary goals: ${user?.primaryGoals?.join(', ') || 'general financial health'}
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

      await AsyncStorage.setItem(STORAGE_KEYS.OPTIMIZATIONS, JSON.stringify(suggestions));
      setOptimizations(suggestions);
      
      console.log('AI optimization complete:', report);
      return report;
    } catch (error) {
      console.error('Error generating optimizations:', error);
      throw error;
    } finally {
      setIsOptimizing(false);
    }
  }, [transactions, user, financialSummary, goals]);

  const markOptimizationImplemented = useCallback(async (id: string) => {
    try {
      const updated = optimizations.map(opt => 
        opt.id === id ? { ...opt, implemented: true } : opt
      );
      await AsyncStorage.setItem(STORAGE_KEYS.OPTIMIZATIONS, JSON.stringify(updated));
      setOptimizations(updated);
    } catch (error) {
      console.error('Error marking optimization as implemented:', error);
    }
  }, [optimizations]);

  const clearOptimizations = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.OPTIMIZATIONS);
      setOptimizations([]);
    } catch (error) {
      console.error('Error clearing optimizations:', error);
    }
  }, []);

  const saveBudgets = async (newBudgets: Budget[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(newBudgets));
      setBudgets(newBudgets);
    } catch (error) {
      console.error('Error saving budgets:', error);
    }
  };

  const saveBudgetRules = async (newRules: BudgetRule[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BUDGET_RULES, JSON.stringify(newRules));
      setBudgetRules(newRules);
    } catch (error) {
      console.error('Error saving budget rules:', error);
    }
  };

  const saveBudgetRewards = async (newRewards: BudgetReward[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BUDGET_REWARDS, JSON.stringify(newRewards));
      setBudgetRewards(newRewards);
    } catch (error) {
      console.error('Error saving budget rewards:', error);
    }
  };

  const addBudget = useCallback((budget: Omit<Budget, 'id' | 'spent'>) => {
    const newBudget: Budget = {
      ...budget,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      spent: 0,
    };
    const updated = [...budgets, newBudget];
    saveBudgets(updated);
    console.log('Budget added:', newBudget);
  }, [budgets]);

  const updateBudget = useCallback((id: string, updates: Partial<Budget>) => {
    const updated = budgets.map(b => b.id === id ? { ...b, ...updates } : b);
    saveBudgets(updated);
  }, [budgets]);

  const deleteBudget = useCallback((id: string) => {
    const updated = budgets.filter(b => b.id !== id);
    saveBudgets(updated);
  }, [budgets]);

  const addBudgetRule = useCallback((rule: Omit<BudgetRule, 'id' | 'createdAt'>) => {
    const newRule: BudgetRule = {
      ...rule,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    const updated = [...budgetRules, newRule];
    saveBudgetRules(updated);
    console.log('Budget rule added:', newRule);
  }, [budgetRules]);

  const updateBudgetRule = useCallback((id: string, updates: Partial<BudgetRule>) => {
    const updated = budgetRules.map(r => r.id === id ? { ...r, ...updates } : r);
    saveBudgetRules(updated);
  }, [budgetRules]);

  const deleteBudgetRule = useCallback((id: string) => {
    const updated = budgetRules.filter(r => r.id !== id);
    saveBudgetRules(updated);
  }, [budgetRules]);

  const checkAndAwardRewards = useCallback(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    budgets.forEach(budget => {
      const existingReward = budgetRewards.find(
        r => r.budgetId === budget.id && r.period === currentMonth
      );
      
      if (!existingReward && budget.spent <= budget.limit) {
        const percentUsed = (budget.spent / budget.limit) * 100;
        const savingsAmount = budget.limit - budget.spent;
        
        let tier: 'bronze' | 'silver' | 'gold' | 'platinum';
        let points: number;
        let message: string;
        
        if (percentUsed <= 50) {
          tier = 'platinum';
          points = 100;
          message = `Outstanding! You only used ${percentUsed.toFixed(0)}% of your ${budget.name} budget!`;
        } else if (percentUsed <= 75) {
          tier = 'gold';
          points = 75;
          message = `Excellent! You saved ${savingsAmount.toFixed(0)} on ${budget.name}!`;
        } else if (percentUsed <= 90) {
          tier = 'silver';
          points = 50;
          message = `Great job staying under your ${budget.name} budget!`;
        } else {
          tier = 'bronze';
          points = 25;
          message = `You stayed within your ${budget.name} budget!`;
        }
        
        const newReward: BudgetReward = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          budgetId: budget.id,
          budgetName: budget.name,
          tier,
          points,
          earnedAt: new Date().toISOString(),
          period: currentMonth,
          savingsAmount,
          message,
        };
        
        const updatedRewards = [...budgetRewards, newReward];
        saveBudgetRewards(updatedRewards);
        console.log('Reward earned:', newReward);
      }
    });
  }, [budgets, budgetRewards]);

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

  const savePlannedTransactions = async (newPlanned: PlannedTransaction[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PLANNED_TRANSACTIONS, JSON.stringify(newPlanned));
      setPlannedTransactions(newPlanned);
    } catch (error) {
      console.error('Error saving planned transactions:', error);
    }
  };

  const addPlannedTransaction = useCallback((planned: Omit<PlannedTransaction, 'id' | 'createdAt' | 'isActive'>) => {
    const newPlanned: PlannedTransaction = {
      ...planned,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    const updated = [...plannedTransactions, newPlanned];
    savePlannedTransactions(updated);
    console.log('Planned transaction added:', newPlanned);
  }, [plannedTransactions]);

  const updatePlannedTransaction = useCallback((id: string, updates: Partial<PlannedTransaction>) => {
    const updated = plannedTransactions.map(p => p.id === id ? { ...p, ...updates } : p);
    savePlannedTransactions(updated);
  }, [plannedTransactions]);

  const deletePlannedTransaction = useCallback((id: string) => {
    const updated = plannedTransactions.filter(p => p.id !== id);
    savePlannedTransactions(updated);
  }, [plannedTransactions]);

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

  const isAuthenticated = user !== null;
  const hasCompletedOnboarding = user?.hasCompletedOnboarding ?? false;

  return useMemo(() => ({
    transactions,
    goals,
    user,
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
    login,
    signup,
    logout,
    updateUser,
    generateOptimizations,
    markOptimizationImplemented,
    clearOptimizations,
  }), [
    transactions,
    goals,
    user,
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
    login,
    signup,
    logout,
    updateUser,
    generateOptimizations,
    markOptimizationImplemented,
    clearOptimizations,
  ]);
});
