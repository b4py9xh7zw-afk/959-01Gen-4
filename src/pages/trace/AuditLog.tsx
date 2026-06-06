import React, { useEffect, useState } from 'react';
import { FileText, Filter, ChevronLeft, ChevronRight, User, FileKey, Server, Building2, Settings, Plus, Ban, Edit, Trash2 } from 'lucide-react';
import { traceApi } from '@/api/index.js';
import type { AuditLog } from '../../../shared/types.js';

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const targetTypeConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  certificate: { label: '证书', icon: <FileKey className="w-4 h-4" />, color: 'text-blue-400' },
  gateway: { label: '网关', icon: <Server className="w-4 h-4" />, color: 'text-cyan-400' },
  factory: { label: '厂区', icon: <Building2 className="w-4 h-4" />, color: 'text-purple-400' },
  settings: { label: '设置', icon: <Settings className="w-4 h-4" />, color: 'text-orange-400' },
};

const actionConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  create: { label: '创建', icon: <Plus className="w-3.5 h-3.5" />, color: 'bg-green-900/50 text-green-400 border-green-500/30' },
  revoke: { label: '吊销', icon: <Ban className="w-3.5 h-3.5" />, color: 'bg-red-900/50 text-red-400 border-red-500/30' },
  update: { label: '更新', icon: <Edit className="w-3.5 h-3.5" />, color: 'bg-blue-900/50 text-blue-400 border-blue-500/30' },
  delete: { label: '删除', icon: <Trash2 className="w-3.5 h-3.5" />, color: 'bg-orange-900/50 text-orange-400 border-orange-500/30' },
};

export const AuditLogList: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [targetTypeFilter, setTargetTypeFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    loadLogs();
  }, [page, pageSize, targetTypeFilter, actionFilter]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const result = await traceApi.listAuditLogs({
        page,
        pageSize,
        targetType: targetTypeFilter || undefined,
        action: actionFilter || undefined,
      });
      setLogs(result.items);
      setTotal(result.total);
    } catch (error) {
      console.error('加载审计日志失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6" style={{ marginLeft: '64px' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FileText className="w-6 h-6 mr-2 text-orange-400" />
            审计日志
          </h2>
          <p className="text-slate-400 mt-1">查看所有操作的审计记录</p>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="min-w-[150px]">
            <label className="block text-sm text-slate-400 mb-1">操作类型</label>
            <select
              value={targetTypeFilter}
              onChange={(e) => { setTargetTypeFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">全部类型</option>
              <option value="certificate">证书</option>
              <option value="gateway">网关</option>
              <option value="factory">厂区</option>
              <option value="settings">设置</option>
            </select>
          </div>
          <div className="min-w-[150px]">
            <label className="block text-sm text-slate-400 mb-1">操作动作</label>
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">全部动作</option>
              <option value="create">创建</option>
              <option value="revoke">吊销</option>
              <option value="update">更新</option>
              <option value="delete">删除</option>
            </select>
          </div>
          <button
            onClick={loadLogs}
            className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            查询
          </button>
          <button
            onClick={() => {
              setTargetTypeFilter('');
              setActionFilter('');
              setPage(1);
            }}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            重置
          </button>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">时间</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">操作人</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">操作类型</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">操作动作</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">操作详情</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                        <FileText className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                        <p>暂无审计日志</p>
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => {
                      const targetType = targetTypeConfig[log.targetType];
                      const action = actionConfig[log.action];
                      return (
                        <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3">
                            <span className="text-sm text-slate-300">{formatDateTime(log.createdAt)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center mr-2">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                              </div>
                              <span className="text-sm text-white">{log.operator}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {targetType ? (
                              <span className={`inline-flex items-center ${targetType.color}`}>
                                {targetType.icon}
                                <span className="ml-1.5 text-sm">{targetType.label}</span>
                              </span>
                            ) : (
                              <span className="text-sm text-slate-300">{log.targetType}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {action ? (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${action.color}`}>
                                {action.icon}
                                <span className="ml-1">{action.label}</span>
                              </span>
                            ) : (
                              <span className="text-sm text-slate-300">{log.action}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-slate-300">{log.detail}</p>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 bg-slate-800/30 border-t border-slate-700/50">
                <div className="text-sm text-slate-400">
                  共 {total} 条记录，第 {page} / {totalPages} 页
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
