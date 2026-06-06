import React from 'react';
import { cn } from '@/lib/utils.js';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, className, onClick }) => {
  return (
    <div
      className={cn(
        'bg-slate-900/80 border border-slate-700/50 rounded-lg p-6 transition-all duration-300',
        'hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2 font-mono">{value}</p>
          {trend && (
            <p className={cn(
              'text-xs mt-2 flex items-center',
              trend.isPositive ? 'text-green-400' : 'text-red-400'
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className="p-3 bg-slate-800 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );
};
