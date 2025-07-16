'use client';

// Force dynamic rendering to avoid Firebase initialization during build
export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, TrendingDown, Wallet, Eye, EyeOff, PieChart, BarChart3 } from 'lucide-react';
import { Transaction } from '@/types';
import { getUserTransactions, getUserStats } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { logUserAction, LOG_ACTIONS } from '@/lib/logging';
import toast from 'react-hot-toast';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import StatsCard from '@/components/StatsCard';
import TransactionList from '@/components/TransactionList';
import AddTransactionModal from '@/components/AddTransactionModal';
import ExpenseChart from '@/components/charts/ExpenseChart';
import IncomeChart from '@/components/charts/IncomeChart';
import TrendChart from '@/components/charts/TrendChart';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({ totalIncome: 0, totalExpenses: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const [trendPeriod, setTrendPeriod] = useState<6 | 12 | 36 | 60>(6);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadData();
      // Log page view
      logUserAction(user.uid, 'navigation', LOG_ACTIONS.NAVIGATION.PAGE_VIEW, {
        page: 'dashboard',
        timestamp: new Date().toISOString()
      });
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
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleTransactionAdded = () => {
    setShowAddModal(false);
    loadData();
    toast.success('Transaction added successfully!');
  };

  const handleModalOpen = () => {
    setShowAddModal(true);
    if (user) {
      logUserAction(user.uid, 'navigation', LOG_ACTIONS.NAVIGATION.MODAL_OPEN, {
        modal: 'add_transaction',
        timestamp: new Date().toISOString()
      });
    }
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
      
      <main className="container mx-auto px-4 py-6 pb-32 lg:pb-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-display font-bold text-gradient mb-2">
            Welcome back, {user.displayName?.split(' ')[0]}!
          </h1>
          <p className="text-foreground/70 font-body">
            Here&apos;s your financial overview
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          {/* Total Balance Card - Full Width on Mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <StatsCard
              title="Total Balance"
              value={balanceVisible ? stats.balance : '****'}
              icon={Wallet}
              color="primary"
              trend={stats.balance >= 0 ? 'up' : 'down'}
              collapsed={!balanceVisible}
              action={
                <button
                  onClick={() => setBalanceVisible(!balanceVisible)}
                  className="text-foreground/60 hover:text-foreground transition-colors"
                >
                  {balanceVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
          </motion.div>

          {/* Income and Expenses Cards - Side by Side on Mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4"
          >
            <StatsCard
              title="Total Income"
              value={stats.totalIncome}
              icon={TrendingUp}
              color="success"
              trend="up"
            />
            <StatsCard
              title="Total Expenses"
              value={stats.totalExpenses}
              icon={TrendingDown}
              color="secondary"
              trend="down"
            />
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-display font-semibold">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleModalOpen}
              className="bg-gradient-primary hover:bg-gradient-to-r hover:from-primary hover:to-accent text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 glow hover:glow-accent transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span className="font-body">Add Transaction</span>
            </button>
            <button
              onClick={() => router.push('/analytics')}
              className="backdrop-blur-glass border border-border/50 hover:border-primary/50 text-foreground font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 hover:glow transform hover:scale-105"
            >
              <TrendingUp className="w-5 h-5" />
              <span className="font-body">View Analytics</span>
            </button>
          </div>
        </motion.div>

        {/* Financial Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-display font-semibold">Financial Trends</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setTrendPeriod(6)}
                className={`px-3 py-1 rounded-lg text-sm font-body transition-all ${
                  trendPeriod === 6
                    ? 'bg-primary text-white glow'
                    : 'backdrop-blur-glass border border-border/50 hover:border-primary/50'
                }`}
              >
                6M
              </button>
              <button
                onClick={() => setTrendPeriod(12)}
                className={`px-3 py-1 rounded-lg text-sm font-body transition-all ${
                  trendPeriod === 12
                    ? 'bg-primary text-white glow'
                    : 'backdrop-blur-glass border border-border/50 hover:border-primary/50'
                }`}
              >
                1Y
              </button>
              <button
                onClick={() => setTrendPeriod(36)}
                className={`px-3 py-1 rounded-lg text-sm font-body transition-all ${
                  trendPeriod === 36
                    ? 'bg-primary text-white glow'
                    : 'backdrop-blur-glass border border-border/50 hover:border-primary/50'
                }`}
              >
                3Y
              </button>
              <button
                onClick={() => setTrendPeriod(60)}
                className={`px-3 py-1 rounded-lg text-sm font-body transition-all ${
                  trendPeriod === 60
                    ? 'bg-primary text-white glow'
                    : 'backdrop-blur-glass border border-border/50 hover:border-primary/50'
                }`}
              >
                5Y
              </button>
            </div>
          </div>
          <div className="backdrop-blur-glass border border-border/50 rounded-2xl p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-display font-semibold mb-4 flex items-center">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary" />
              {trendPeriod === 6 ? '6-Month' : trendPeriod === 12 ? '1-Year' : trendPeriod === 36 ? '3-Year' : '5-Year'} Trend
            </h3>
            <TrendChart transactions={transactions} months={trendPeriod} />
          </div>
        </motion.div>

        {/* Expense & Income Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-display font-semibold">Spending Analysis</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setChartType('pie')}
                title="Show Pie Chart"
                className={`p-2 rounded-lg transition-all ${
                  chartType === 'pie'
                    ? 'bg-primary text-white glow'
                    : 'backdrop-blur-glass border border-border/50 hover:border-primary/50'
                }`}
              >
                <PieChart className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartType('bar')}
                title="Show Bar Chart"
                className={`p-2 rounded-lg transition-all ${
                  chartType === 'bar'
                    ? 'bg-primary text-white glow'
                    : 'backdrop-blur-glass border border-border/50 hover:border-primary/50'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="backdrop-blur-glass border border-border/50 rounded-2xl p-6">
              <h3 className="text-lg font-display font-semibold mb-4 flex items-center">
                <TrendingDown className="w-5 h-5 mr-2 text-secondary" />
                Expenses by Category
              </h3>
              <ExpenseChart transactions={transactions} type={chartType} />
            </div>
            
            <div className="backdrop-blur-glass border border-border/50 rounded-2xl p-6">
              <h3 className="text-lg font-display font-semibold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-success" />
                Income by Source
              </h3>
              <IncomeChart transactions={transactions} type={chartType} />
            </div>
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-display font-semibold">Recent Transactions</h2>
            <button
              onClick={() => router.push('/transactions')}
              className="text-primary hover:text-accent font-body text-sm transition-colors"
            >
              View All
            </button>
          </div>
          <TransactionList 
            transactions={transactions.slice(0, 5)} 
            onTransactionUpdate={loadData}
            userId={user.uid}
          />
        </motion.div>
      </main>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <AddTransactionModal
          onClose={() => setShowAddModal(false)}
          onTransactionAdded={handleTransactionAdded}
          userId={user.uid}
        />
      )}

      {/* Bottom Navigation for Mobile */}
      <BottomNavigation />
    </div>
  );
}