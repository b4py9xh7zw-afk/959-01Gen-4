import React from 'react';
import { Menu, Bell, User, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store/appStore.js';

export const Header: React.FC = () => {
  const { toggleSidebar, sidebarCollapsed } = useAppStore();

  return (
    <header className="h-16 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10 backdrop-blur-sm">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-800 transition-colors mr-4"
          style={{ marginLeft: sidebarCollapsed ? '0' : '256px' }}
        >
          <Menu className="w-5 h-5 text-slate-400" />
        </button>
        <h1 className="text-xl font-semibold text-white" style={{ marginLeft: sidebarCollapsed ? '16px' : '0' }}>
          工控网关证书下发管理平台
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <Bell className="w-5 h-5 text-slate-400 hover:text-white transition-colors cursor-pointer" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-xs flex items-center justify-center animate-pulse">
            3
          </span>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/50">
          <User className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-slate-300">管理员</span>
        </div>
      </div>
    </header>
  );
};
