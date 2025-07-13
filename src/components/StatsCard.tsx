'use client';

import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: 'primary' | 'success' | 'secondary' | 'warning';
  trend?: 'up' | 'down';
  action?: React.ReactNode;
  collapsed?: boolean;
}

const colorClasses = {
  primary: 'bg-gradient-to-br from-primary/20 to-accent/20 border-primary/30',
  success: 'bg-gradient-to-br from-success/20 to-success/10 border-success/30',
  secondary: 'bg-gradient-to-br from-secondary/20 to-error/20 border-secondary/30',
  warning: 'bg-gradient-to-br from-warning/20 to-warning/10 border-warning/30',
};

const iconClasses = {
  primary: 'text-primary',
  success: 'text-success',
  secondary: 'text-secondary',
  warning: 'text-warning',
};

export default function StatsCard({ title, value, icon: Icon, color, trend, action, collapsed = false }: StatsCardProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Collapsed view - show as a thin bar
  if (collapsed) {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        className={`backdrop-blur-glass border rounded-xl p-3 ${colorClasses[color]} hover:glow transition-all duration-300 cursor-pointer`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br from-surface to-surface-dark border border-border/50 ${iconClasses[color]}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-foreground/70 font-body text-xs">{title}</p>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-1 bg-gradient-to-r from-primary/30 to-accent/30 rounded-full">
                  <div className="w-full h-full bg-gradient-to-r from-primary to-accent rounded-full animate-pulse"></div>
                </div>
                <span className="text-xs text-foreground/50 font-body">Hidden</span>
              </div>
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      </motion.div>
    );
  }

  // Expanded view - show full card
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className={`backdrop-blur-glass border rounded-2xl p-4 sm:p-6 ${colorClasses[color]} hover:glow transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br from-surface to-surface-dark border border-border/50 ${iconClasses[color]}`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        {action && <div>{action}</div>}
      </div>
      
      <div className="space-y-2">
        <p className="text-foreground/70 font-body text-sm">{title}</p>
        <div className="flex items-end justify-between">
          <p className="text-xl sm:text-2xl font-display font-bold">
            {formatValue(value)}
          </p>
          {trend && (
            <div className={`flex items-center space-x-1 ${
              trend === 'up' 
                ? 'text-success' 
                : 'text-secondary'
            }`}>
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl bg-gradient-to-br from-transparent via-primary/5 to-accent/5"></div>
    </motion.div>
  );
}