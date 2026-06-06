import React, { useEffect, useState } from 'react';
import { Server, Plus, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge.js';
import { gatewayApi, factoryApi } from '@/api/index.js';
import type { Gateway, ProductionLine } from '../../../shared/types.js';
import { useAppStore } from '@/store/appStore.js';

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const GatewayList: React.FC = () => {
  const { factories } = useAppStore();

  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [factoryFilter, setFactoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [productionLines, setProductionLines] = useState<ProductionLine[]>([]);
  const [productionLineFilter, setProductionLineFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGateway, setNewGateway] = useState({
    name: '',
    sn: '',
    factoryId: '',
    productionLineId: '',
    ipAddress: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadGateways();
  }, [page, pageSize, factoryFilter, statusFilter, productionLineFilter]);

  useEffect(() => {
    if (factoryFilter) {
      factoryApi.getProductionLines(factoryFilter).then(setProductionLines);
    } else {
      setProductionLines([]);
    }
  }, [factoryFilter]);

  const loadGateways = async () => {
    try {
      setLoading(true);
      const result = await gatewayApi.list({
        page,
        pageSize,
        factoryId: factoryFilter || undefined,
        status: statusFilter || undefined,
      });
      setGateways(result.items);
      setTotal(result.total);
    } catch (error) {
      console.error('加载网关列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newGateway.name || !newGateway.sn || !newGateway.factoryId || !newGateway.productionLineId) {
      alert('请填写所有必填项');
      return;
    }
    try {
      setSubmitting(true);
      await gatewayApi.create(newGateway);
      setShowCreateModal(false);
      setNewGateway({ name: '', sn: '', factoryId: '', productionLineId: '', ipAddress: '' });
      loadGateways();
    } catch (error: any) {
      alert(error.message || '创建失败');
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6" style={{ marginLeft: '64px' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Server className="w-6 h-6 mr-2 text-cyan-400" />
            网关设备
          </h2>
          <p className="text-slate-400 mt-1">管理所有边缘网关设备</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          注册新网关
        </button>
      </div>

      <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-slate-400 mb-1">搜索</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="搜索网关名称、SN、IP..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="min-w-[150px]">
            <label className="block text-sm text-slate-400 mb-1">状态</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">全部状态</option>
              <option value="online">在线</option>
              <option value="offline">离线</option>
              <option value="revoked">已吊销</option>
            </select>
          </div>
          <div className="min-w-[150px]">
            <label className="block text-sm text-slate-400 mb-1">厂区</label>
            <select
              value={factoryFilter}
              onChange={(e) => {
                setFactoryFilter(e.target.value);
                setProductionLineFilter('');
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">全部厂区</option>
              {factories.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          {productionLines.length > 0 && (
            <div className="min-w-[150px]">
              <label className="block text-sm text-slate-400 mb-1">生产线</label>
              <select
                value={productionLineFilter}
                onChange={(e) => { setProductionLineFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">全部生产线</option>
                {productionLines.map((pl) => (
                  <option key={pl.id} value={pl.id}>{pl.name}</option>
                ))}
              </select>
            </div>
          )}
          <button
            onClick={loadGateways}
            className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            查询
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">设备信息</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">序列号</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">厂区/生产线</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">IP地址</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">最后心跳</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">证书状态</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {gateways.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                        暂无网关数据
                      </td>
                    </tr>
                  ) : (
                    gateways.map((gateway) => (
                      <tr key={gateway.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <Server className={`w-5 h-5 mr-3 ${
                              gateway.status === 'online' ? 'text-green-400' : 'text-slate-500'
                            }`} />
                            <span className="text-white font-medium">{gateway.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-mono text-slate-300">{gateway.sn}</span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-white">{gateway.factoryName}</p>
                          <p className="text-xs text-slate-500">{gateway.productionLineName}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-mono text-slate-300">{gateway.ipAddress}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-slate-400">{formatDateTime(gateway.lastHeartbeat || '')}</span>
                        </td>
                        <td className="px-4 py-4">
                          {gateway.certificateId ? (
                            <span className="text-xs text-green-400">已绑定</span>
                          ) : (
                            <span className="text-xs text-yellow-400">未绑定</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={gateway.status} />
                        </td>
                      </tr>
                    ))
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

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Plus className="w-5 h-5 mr-2 text-blue-400" />
              注册新网关
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">设备名称 *</label>
                  <input
                    type="text"
                    value={newGateway.name}
                    onChange={(e) => setNewGateway({ ...newGateway, name: e.target.value })}
                    placeholder="如：SMT线网关01"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">序列号 (SN) *</label>
                  <input
                    type="text"
                    value={newGateway.sn}
                    onChange={(e) => setNewGateway({ ...newGateway, sn: e.target.value })}
                    placeholder="如：GW20240001"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">IP地址</label>
                <input
                  type="text"
                  value={newGateway.ipAddress}
                  onChange={(e) => setNewGateway({ ...newGateway, ipAddress: e.target.value })}
                  placeholder="如：192.168.1.10"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">厂区 *</label>
                  <select
                    value={newGateway.factoryId}
                    onChange={(e) => {
                      setNewGateway({ ...newGateway, factoryId: e.target.value, productionLineId: '' });
                    }}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">请选择厂区</option>
                    {factories.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">生产线 *</label>
                  <select
                    value={newGateway.productionLineId}
                    onChange={(e) => setNewGateway({ ...newGateway, productionLineId: e.target.value })}
                    disabled={!newGateway.factoryId}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  >
                    <option value="">请选择生产线</option>
                    {productionLines.map((pl) => (
                      <option key={pl.id} value={pl.id}>{pl.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewGateway({ name: '', sn: '', factoryId: '', productionLineId: '', ipAddress: '' });
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreate}
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? '创建中...' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
