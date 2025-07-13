'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Transaction } from '@/types';
import { motion } from 'framer-motion';
import { format, startOfMonth, subMonths, isSameMonth } from 'date-fns';

interface TrendChartProps {
  transactions: Transaction[];
  months?: number;
}

export default function TrendChart({ transactions, months = 6 }: TrendChartProps) {
  // Generate last N months of data
  const generateMonthlyData = () => {
    const monthlyData = [];
    
    for (let i = months - 1; i >= 0; i--) {
      const month = subMonths(startOfMonth(new Date()), i);
      const monthTransactions = transactions.filter(t => 
        isSameMonth(t.date, month)
      );
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const balance = income - expenses;
      
      monthlyData.push({
        month: format(month, 'MMM yyyy'),
        shortMonth: format(month, 'MMM'),
        income,
        expenses,
        balance,
        formattedIncome: new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 0,
        }).format(income),
        formattedExpenses: new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 0,
        }).format(expenses),
        formattedBalance: new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 0,
        }).format(balance),
      });
    }
    
    return monthlyData;
  };

  const chartData = generateMonthlyData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="backdrop-blur-glass border border-border/50 rounded-xl p-4 shadow-xl">
          <p className="font-body font-semibold mb-3">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-body capitalize">{entry.dataKey}</span>
              </div>
              <span className="font-display font-semibold ml-4">
                {entry.payload[`formatted${entry.dataKey.charAt(0).toUpperCase() + entry.dataKey.slice(1)}`]}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0 || chartData.every(d => d.income === 0 && d.expenses === 0)) {
    return (
      <div className="h-64 flex items-center justify-center text-foreground/60">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-surface to-surface-dark rounded-2xl flex items-center justify-center">
            <LineChart className="w-8 h-8" />
          </div>
          <p className="font-body">No trend data available</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-80"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--success)" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="shortMonth" 
            stroke="var(--foreground)"
            fontSize={12}
          />
          <YAxis 
            stroke="var(--foreground)"
            fontSize={12}
            tickFormatter={(value) => `₹${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          
          <Area
            type="monotone"
            dataKey="income"
            stroke="var(--success)"
            strokeWidth={2}
            fill="url(#incomeGradient)"
            animationDuration={1000}
          />
          <Area
            type="monotone"
            dataKey="expenses"
            stroke="var(--secondary)"
            strokeWidth={2}
            fill="url(#expenseGradient)"
            animationDuration={1000}
          />
          <Line
            type="monotone"
            dataKey="balance"
            stroke="var(--primary)"
            strokeWidth={3}
            dot={{ fill: 'var(--primary)', strokeWidth: 2, r: 4 }}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}