import React, { useEffect, useState } from 'react';
import {
  FileKey,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Ban,
  Calendar,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge.js';
import { certificateApi, factoryApi } from '@/api/index.js';
import type { Certificate, Factory, ProductionLine } from '../../../shared/types.js';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/store/appStore.js';

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const CertificateList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { factories } = useAppStore();

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || '');
  const [factoryFilter, setFactoryFilter] = useState('');
  const [productionLineFilter, setProductionLineFilter] = useState('');
  const [productionLines, setProductionLines] = useState<ProductionLine[]>([]);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revokeCert, setRevokeCert] = useState<Certificate | null>(null);
  const [revokeReason, setRevokeReason] = useState('');

  useEffect(() => {
    loadCertificates();
  }, [page, pageSize, statusFilter, factoryFilter, productionLineFilter]);

  useEffect(() => {
    if (factoryFilter) {
      factoryApi.getProductionLines(factoryFilter).then(setProductionLines);
    } else {
      setProductionLines([]);
    }
  }, [factoryFilter]);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const result = await certificateApi.list({
        page,
        pageSize,
        status: statusFilter || undefined,
        factoryId: factoryFilter || undefined,
        productionLineId: productionLineFilter || undefined,
      });
      setCertificates(result.items);
      setTotal(result.total);
    } catch (error) {
      console.error('加载证书列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokeCert || !revokeReason.trim()) return;
    try {
      await certificateApi.revoke(revokeCert.id, { reason: revokeReason });
      setShowRevokeModal(false);
      setRevokeCert(null);
      setRevokeReason('');
      loadCertificates();
    } catch (error: any) {
      alert(error.message || '吊销失败');
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6" style={{ marginLeft: '64px' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FileKey className="w-6 h-6 mr-2 text-blue-400" />
            证书管理
          </h2>
          <p className="text-slate-400 mt-1">管理所有网关设备的通信证书</p>
        </div>
        <button
          onClick={() => navigate('/certificates/apply')}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          申请新证书
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
                placeholder="搜索证书编号、网关SN..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="min-w-[150px]">
            <label className="block text-sm text-slate-400 mb-1">状态</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
                if (e.target.value) {
                  searchParams.set('status', e.target.value);
                } else {
                  searchParams.delete('status');
                }
                setSearchParams(searchParams);
              }}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">全部状态</option>
              <option value="valid">有效</option>
              <option value="expired">已过期</option>
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
                onChange={(e) => {
                  setProductionLineFilter(e.target.value);
                  setPage(1);
                }}
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
            onClick={loadCertificates}
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">证书编号</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">网关信息</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">厂区/生产线</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">有效期</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">剩余天数</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">状态</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {certificates.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                        暂无证书数据
                      </td>
                    </tr>
                  ) : (
                    certificates.map((cert) => (
                      <tr
                        key={cert.id}
                        className="hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <span className="text-sm font-mono text-blue-400">{cert.serialNumber.slice(0, 16)}...</span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-white">{cert.gatewayName}</p>
                          <p className="text-xs text-slate-500 font-mono">{cert.gatewaySn}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-white">{cert.factoryName}</p>
                          <p className="text-xs text-slate-500">{cert.productionLineName}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-slate-300 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(cert.validFrom)}
                          </p>
                          <p className="text-xs text-slate-500">至 {formatDate(cert.validTo)}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-sm font-mono font-bold ${
                            cert.daysRemaining && cert.daysRemaining <= 7 ? 'text-red-400' :
                            cert.daysRemaining && cert.daysRemaining <= 30 ? 'text-orange-400' : 'text-green-400'
                          }`}>
                            {cert.status === 'revoked' ? '-' : `${cert.daysRemaining} 天`}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={cert.status} />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => navigate(`/certificates/${cert.id}`)}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                              title="查看详情"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {cert.status === 'valid' && (
                              <button
                                onClick={() => {
                                  setRevokeCert(cert);
                                  setShowRevokeModal(true);
                                }}
                                className="p-1.5 text-red-400 hover:text-white hover:bg-red-900/50 rounded transition-colors"
                                title="吊销证书"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )}
                          </div>
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

      {showRevokeModal && revokeCert && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Ban className="w-5 h-5 mr-2 text-red-400" />
              吊销证书确认
            </h3>
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-300 mb-2">
                即将吊销网关 <span className="font-mono font-bold">{revokeCert.gatewaySn}</span> 的证书
              </p>
              <p className="text-xs text-red-400">
                吊销后该设备将无法继续连接平台，但历史采集数据仍可追溯。
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">吊销原因 *</label>
              <textarea
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="请输入吊销原因..."
                rows={3}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500 resize-none"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRevokeModal(false);
                  setRevokeCert(null);
                  setRevokeReason('');
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleRevoke}
                disabled={!revokeReason.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认吊销
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
