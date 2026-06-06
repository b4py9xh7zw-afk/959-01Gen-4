import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileKey,
  Server,
  Building2,
  History,
  Settings,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils.js';
import { useAppStore } from '@/store/appStore.js';

const menuItems = [
  { path: '/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { path: '/certificates', label: '证书管理', icon: FileKey },
  { path: '/gateways', label: '网关设备', icon: Server },
  { path: '/factories', label: '厂区管理', icon: Building2 },
  {
    path: '/trace',
    label: '数据追溯',
    icon: History,
    subItems: [
      { path: '/trace/data', label: '历史数据' },
      { path: '/trace/audit', label: '审计日志' },
    ],
  },
  { path: '/settings', label: '系统设置', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed } = useAppStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-slate-900/95 border-r border-slate-800 transition-all duration-300 z-20',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex items-center h-16 px-4 border-b border-slate-800">
        <Shield className="w-8 h-8 text-blue-500 flex-shrink-0" />
        {!sidebarCollapsed && (
          <span className="ml-3 font-bold text-lg bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            工控网关证书台
          </span>
        )}
      </div>

      <nav className="p-3 space-y-1">
        {menuItems.map((item) => (
          <div key={item.path}>
            <NavLink
              to={item.path}
              end={!item.subItems}
              className={({ isActive }) => cn(
                'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                'hover:bg-slate-800 hover:text-white',
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400',
                sidebarCollapsed && 'justify-center'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="ml-3">{item.label}</span>}
            </NavLink>
            {item.subItems && !sidebarCollapsed && (
              <div className="ml-8 mt-1 space-y-1">
                {item.subItems.map((subItem) => (
                  <NavLink
                    key={subItem.path}
                    to={subItem.path}
                    className={({ isActive }) => cn(
                      'block px-3 py-2 text-sm rounded transition-colors',
                      isActive
                        ? 'text-blue-400 bg-slate-800/50'
                        : 'text-slate-500 hover:text-slate-300'
                    )}
                  >
                    {subItem.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};
