import React from 'react';
import { cn } from '@/lib/utils.js';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  valid: { label: '有效', className: 'bg-green-900/50 text-green-400 border-green-500/30' },
  expired: { label: '已过期', className: 'bg-yellow-900/50 text-yellow-400 border-yellow-500/30' },
  revoked: { label: '已吊销', className: 'bg-red-900/50 text-red-400 border-red-500/30' },
  online: { label: '在线', className: 'bg-green-900/50 text-green-400 border-green-500/30' },
  offline: { label: '离线', className: 'bg-gray-800/50 text-gray-400 border-gray-500/30' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status] || { label: status, className: 'bg-gray-800 text-gray-400' };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border',
        config.className,
        className
      )}
    >
      {status === 'online' && (
        <span className="w-1.5 h-1.5 mr-1.5 bg-green-400 rounded-full animate-pulse" />
      )}
      {status === 'offline' && (
        <span className="w-1.5 h-1.5 mr-1.5 bg-gray-500 rounded-full" />
      )}
      {status === 'revoked' && (
        <span className="w-1.5 h-1.5 mr-1.5 bg-red-500 rounded-full" />
      )}
      {config.label}
    </span>
  );
};
