export type TransactionType = 'income' | 'expense';

export type TransactionCategory = 
  | 'food'
  | 'transport'
  | 'entertainment'
  | 'shopping'
  | 'bills'
  | 'healthcare'
  | 'education'
  | 'investment'
  | 'savings'
  | 'income'
  | 'other';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  date: string;
  notes?: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  category: string;
  color: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number;
  healthScore: number;
}

export interface CategorySpending {
  category: TransactionCategory;
  amount: number;
  percentage: number;
  transactions: number;
}

export type RiskTolerance = 'conservative' | 'moderate' | 'aggressive';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  monthlyIncome: number;
  householdSize: number;
  primaryGoals: string[];
  riskTolerance: RiskTolerance;
  currency: string;
  hasCompletedOnboarding: boolean;
  createdAt: string;
}

export interface OnboardingData {
  name: string;
  email: string;
  monthlyIncome: number;
  householdSize: number;
  primaryGoals: string[];
  riskTolerance: RiskTolerance;
}

export type OptimizationType = 'expense_reduction' | 'income_increase' | 'savings_boost' | 'investment_opportunity';

export type OptimizationPriority = 'high' | 'medium' | 'low';

export interface OptimizationSuggestion {
  id: string;
  type: OptimizationType;
  priority: OptimizationPriority;
  title: string;
  description: string;
  potentialSavings?: number;
  potentialIncome?: number;
  actionItems: string[];
  category?: TransactionCategory;
  implementationDifficulty: 'easy' | 'moderate' | 'hard';
  timeframe: string;
  implemented?: boolean;
}

export interface OptimizationReport {
  totalPotentialSavings: number;
  totalPotentialIncome: number;
  suggestions: OptimizationSuggestion[];
  generatedAt: string;
}

export type BudgetCategory = 'household' | 'groceries' | 'utilities' | 'entertainment' | 'dining' | 'transport' | 'personal' | 'other';

export type BudgetPeriod = 'weekly' | 'monthly';

export type RuleStrictness = 'flexible' | 'moderate' | 'strict';

export interface BudgetRule {
  id: string;
  name: string;
  description: string;
  category?: BudgetCategory;
  maxPercentage?: number;
  maxAmount?: number;
  strictness: RuleStrictness;
  isActive: boolean;
  createdAt: string;
}

export interface Budget {
  id: string;
  category: BudgetCategory;
  name: string;
  budgetLimit: number;
  spent: number;
  period: BudgetPeriod;
  startDate: string;
  color: string;
  rules: string[];
}

export type RewardTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface BudgetReward {
  id: string;
  budgetId: string;
  budgetName: string;
  tier: RewardTier;
  points: number;
  earnedAt: string;
  period: string;
  savingsAmount: number;
  message: string;
}

export interface BudgetStatus {
  budget: Budget;
  percentageUsed: number;
  remaining: number;
  status: 'safe' | 'warning' | 'danger' | 'exceeded';
  daysRemaining: number;
  projectedEnd: number;
}

export interface RuleViolation {
  rule: BudgetRule;
  type: 'max_amount' | 'max_percentage';
  message: string;
  isBlocking: boolean;
}

export type RecurrenceType = 'once' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';

export interface PlannedTransaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  scheduledDate: string;
  recurrence: RecurrenceType;
  notes?: string;
  isActive: boolean;
  lastProcessedDate?: string;
  createdAt: string;
}

export interface BudgetImpact {
  budget: Budget;
  currentSpent: number;
  newSpent: number;
  currentPercentage: number;
  newPercentage: number;
  remaining: number;
  status: 'safe' | 'warning' | 'danger' | 'exceeded';
  willExceed: boolean;
  ruleViolations: RuleViolation[];
}
