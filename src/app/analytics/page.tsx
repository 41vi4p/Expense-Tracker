'use client';

// Force dynamic rendering to avoid Firebase initialization during build
export const dynamic = 'force-dynamic';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, PieChart, TrendingUp, Calendar } from 'lucide-react';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types';
import { getUserTransactions, getUserStats } from '@/lib/firestore';
import toast from 'react-hot-toast';
import Header from '@/components/Header';

interface CategoryStats {
  name: string;
  amount: number;
  color: string;
  icon: string;
  percentage: number;
}

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({ totalIncome: 0, totalExpenses: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [expensesByCategory, setExpensesByCategory] = useState<CategoryStats[]>([]);
  const [incomeByCategory, setIncomeByCategory] = useState<CategoryStats[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [userTransactions, userStats] = await Promise.all([
        getUserTransactions(user.uid),
        getUserStats(user.uid)
      ]);
      
      setTransactions(userTransactions);
      setStats(userStats);
      calculateCategoryStats(userTransactions);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const calculateCategoryStats = useCallback((transactions: Transaction[]) => {
    const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
    
    // Calculate expenses by category
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const expenseMap = new Map<string, number>();
    
    expenseTransactions.forEach(transaction => {
      const current = expenseMap.get(transaction.category) || 0;
      expenseMap.set(transaction.category, current + transaction.amount);
    });

    const expenseStats: CategoryStats[] = [];
    expenseMap.forEach((amount, categoryId) => {
      const category = allCategories.find(c => c.id === categoryId);
      if (category) {
        expenseStats.push({
          name: category.name,
          amount,
          color: category.color,
          icon: category.icon,
          percentage: (amount / stats.totalExpenses) * 100 || 0
        });
      }
    });

    // Calculate income by category
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const incomeMap = new Map<string, number>();
    
    incomeTransactions.forEach(transaction => {
      const current = incomeMap.get(transaction.category) || 0;
      incomeMap.set(transaction.category, current + transaction.amount);
    });

    const incomeStats: CategoryStats[] = [];
    incomeMap.forEach((amount, categoryId) => {
      const category = allCategories.find(c => c.id === categoryId);
      if (category) {
        incomeStats.push({
          name: category.name,
          amount,
          color: category.color,
          icon: category.icon,
          percentage: (amount / stats.totalIncome) * 100 || 0
        });
      }
    });

    setExpensesByCategory(expenseStats.sort((a, b) => b.amount - a.amount));
    setIncomeByCategory(incomeStats.sort((a, b) => b.amount - a.amount));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface-dark to-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-display font-bold text-gradient mb-2">
            Financial Analytics
          </h1>
          <p className="text-foreground/70 font-body">
            Insights into your spending and earning patterns
          </p>
        </motion.div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="backdrop-blur-glass border border-success/30 rounded-2xl p-6 bg-gradient-to-br from-success/10 to-success/5"
          >
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-success" />
              <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full font-body">
                INCOME
              </span>
            </div>
            <h3 className="text-2xl font-display font-bold text-success mb-1">
              {formatAmount(stats.totalIncome)}
            </h3>
            <p className="text-sm text-foreground/70 font-body">Total earned</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="backdrop-blur-glass border border-secondary/30 rounded-2xl p-6 bg-gradient-to-br from-secondary/10 to-secondary/5"
          >
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-secondary" />
              <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full font-body">
                EXPENSES
              </span>
            </div>
            <h3 className="text-2xl font-display font-bold text-secondary mb-1">
              {formatAmount(stats.totalExpenses)}
            </h3>
            <p className="text-sm text-foreground/70 font-body">Total spent</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`backdrop-blur-glass border rounded-2xl p-6 ${
              stats.balance >= 0 
                ? 'border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5'
                : 'border-error/30 bg-gradient-to-br from-error/10 to-error/5'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <PieChart className={`w-8 h-8 ${stats.balance >= 0 ? 'text-primary' : 'text-error'}`} />
              <span className={`text-xs px-2 py-1 rounded-full font-body ${
                stats.balance >= 0 
                  ? 'bg-primary/20 text-primary'
                  : 'bg-error/20 text-error'
              }`}>
                BALANCE
              </span>
            </div>
            <h3 className={`text-2xl font-display font-bold mb-1 ${
              stats.balance >= 0 ? 'text-primary' : 'text-error'
            }`}>
              {formatAmount(stats.balance)}
            </h3>
            <p className="text-sm text-foreground/70 font-body">Current balance</p>
          </motion.div>
        </div>

        {/* Category Breakdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Expense Categories */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="backdrop-blur-glass border border-border/50 rounded-2xl p-6"
          >
            <h2 className="text-xl font-display font-semibold mb-6 flex items-center">
              <BarChart3 className="w-6 h-6 text-secondary mr-3" />
              Expense Categories
            </h2>
            
            {expensesByCategory.length > 0 ? (
              <div className="space-y-4">
                {expensesByCategory.map((category, index) => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-surface/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        {category.icon}
                      </div>
                      <div>
                        <h4 className="font-body font-medium">{category.name}</h4>
                        <p className="text-sm text-foreground/60">{category.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-semibold text-secondary">
                        {formatAmount(category.amount)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-foreground/60 font-body">No expense data available</p>
              </div>
            )}
          </motion.div>

          {/* Income Categories */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="backdrop-blur-glass border border-border/50 rounded-2xl p-6"
          >
            <h2 className="text-xl font-display font-semibold mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 text-success mr-3" />
              Income Categories
            </h2>
            
            {incomeByCategory.length > 0 ? (
              <div className="space-y-4">
                {incomeByCategory.map((category, index) => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-surface/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        {category.icon}
                      </div>
                      <div>
                        <h4 className="font-body font-medium">{category.name}</h4>
                        <p className="text-sm text-foreground/60">{category.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-semibold text-success">
                        {formatAmount(category.amount)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-foreground/60 font-body">No income data available</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Recent Activity Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 backdrop-blur-glass border border-border/50 rounded-2xl p-6"
        >
          <h2 className="text-xl font-display font-semibold mb-6 flex items-center">
            <Calendar className="w-6 h-6 text-primary mr-3" />
            Quick Stats
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-primary">
                {transactions.length}
              </p>
              <p className="text-sm text-foreground/70 font-body">Total Transactions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-success">
                {transactions.filter(t => t.type === 'income').length}
              </p>
              <p className="text-sm text-foreground/70 font-body">Income Entries</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-secondary">
                {transactions.filter(t => t.type === 'expense').length}
              </p>
              <p className="text-sm text-foreground/70 font-body">Expense Entries</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-accent">
                {transactions.length > 0 ? formatAmount(
                  transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length
                ) : '₹0'}
              </p>
              <p className="text-sm text-foreground/70 font-body">Avg. Transaction</p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 text-center">
        <p className="text-sm text-foreground/50 font-body">
          Made by David Porathur
        </p>
      </footer>
    </div>
  );
}