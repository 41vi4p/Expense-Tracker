'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types';
import { motion } from 'framer-motion';

interface ExpenseChartProps {
  transactions: Transaction[];
  type?: 'pie' | 'bar';
}

export default function ExpenseChart({ transactions, type = 'pie' }: ExpenseChartProps) {
  const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
  
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  
  // Calculate data for charts
  const categoryData = new Map<string, { amount: number; color: string; name: string; icon: string }>();
  
  expenseTransactions.forEach(transaction => {
    const category = allCategories.find(c => c.id === transaction.category);
    if (category) {
      const existing = categoryData.get(category.id) || { amount: 0, color: category.color, name: category.name, icon: category.icon };
      existing.amount += transaction.amount;
      categoryData.set(category.id, existing);
    }
  });

  const chartData = Array.from(categoryData.values())
    .sort((a, b) => b.amount - a.amount)
    .map(item => ({
      ...item,
      value: item.amount,
      formattedValue: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(item.amount)
    }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="backdrop-blur-glass border border-border/50 rounded-xl p-3 shadow-xl">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{data.icon}</span>
            <p className="font-body font-semibold">{data.name}</p>
          </div>
          <p className="text-secondary font-display font-bold">{data.formattedValue}</p>
          <p className="text-xs text-foreground/70">
            {((data.value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {payload.map((entry: any, index: number) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-2 backdrop-blur-glass border border-border/30 rounded-lg px-3 py-1"
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs font-body">{entry.value}</span>
          </motion.div>
        ))}
      </div>
    );
  };

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-foreground/60">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-surface to-surface-dark rounded-2xl flex items-center justify-center">
            <PieChart className="w-8 h-8" />
          </div>
          <p className="font-body">No expense data available</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="h-80"
    >
      {type === 'pie' ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={40}
              paddingAngle={2}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth={1}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData.slice(0, 8)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="name" 
              stroke="var(--foreground)"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              stroke="var(--foreground)"
              fontSize={12}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              radius={[4, 4, 0, 0]}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}