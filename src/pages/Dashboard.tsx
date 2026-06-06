import React, { useEffect, useState } from 'react';
import {
  FileKey,
  CheckCircle,
  AlertTriangle,
  Ban,
  Server,
  Building2,
  Layers,
  Clock,
  Calendar,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard.js';
import { StatusBadge } from '@/components/ui/StatusBadge.js';
import { dashboardApi } from '@/api/index.js';
import type { DashboardStats, ExpiringCertificate, RevokedDevice } from '../../shared/types.js';
import { useNavigate } from 'react-router-dom';

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [expiringCerts, setExpiringCerts] = useState<ExpiringCertificate[]>([]);
  const [revokedDevices, setRevokedDevices] = useState<RevokedDevice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, expiringData, revokedData] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getExpiring(),
        dashboardApi.getRevoked(),
      ]);
      setStats(statsData);
      setExpiringCerts(expiringData);
      setRevokedDevices(revokedData);
    } catch (error) {
      console.error('加载仪表盘数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ marginLeft: '64px' }}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">仪表盘</h2>
        <p className="text-slate-400 mt-1">证书和设备的整体状态概览</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="证书总数"
          value={stats?.totalCertificates || 0}
          icon={<FileKey className="w-6 h-6 text-blue-400" />}
          onClick={() => navigate('/certificates')}
        />
        <StatCard
          title="有效证书"
          value={stats?.validCertificates || 0}
          icon={<CheckCircle className="w-6 h-6 text-green-400" />}
          onClick={() => navigate('/certificates?status=valid')}
        />
        <StatCard
          title="即将过期"
          value={stats?.expiringCertificates || 0}
          icon={<AlertTriangle className="w-6 h-6 text-orange-400" />}
          className={stats && stats.expiringCertificates > 0 ? 'border-orange-500/50' : ''}
          onClick={() => navigate('/certificates')}
        />
        <StatCard
          title="已吊销"
          value={stats?.revokedCertificates || 0}
          icon={<Ban className="w-6 h-6 text-red-400" />}
          onClick={() => navigate('/certificates?status=revoked')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="网关总数"
          value={stats?.totalGateways || 0}
          icon={<Server className="w-6 h-6 text-cyan-400" />}
          onClick={() => navigate('/gateways')}
        />
        <StatCard
          title="在线网关"
          value={stats?.onlineGateways || 0}
          icon={<Server className="w-6 h-6 text-green-400" />}
          onClick={() => navigate('/gateways?status=online')}
        />
        <StatCard
          title="厂区数量"
          value={stats?.totalFactories || 0}
          icon={<Building2 className="w-6 h-6 text-purple-400" />}
          onClick={() => navigate('/factories')}
        />
        <StatCard
          title="生产线数量"
          value={stats?.totalProductionLines || 0}
          icon={<Layers className="w-6 h-6 text-pink-400" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Clock className="w-5 h-5 mr-2 text-orange-400" />
              即将过期证书
            </h3>
            <span className="text-sm text-slate-400">{expiringCerts.length} 个证书</span>
          </div>
          {expiringCerts.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500/50" />
              <p>暂无即将过期的证书</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-auto">
              {expiringCerts.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  onClick={() => navigate(`/certificates/${cert.id}`)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      cert.daysRemaining <= 7 ? 'bg-red-900/50' : 'bg-orange-900/50'
                    }`}>
                      <AlertTriangle className={`w-4 h-4 ${
                        cert.daysRemaining <= 7 ? 'text-red-400 animate-pulse' : 'text-orange-400'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{cert.gatewayName}</p>
                      <p className="text-xs text-slate-400">{cert.gatewaySn}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-mono font-bold ${
                      cert.daysRemaining <= 7 ? 'text-red-400' : 'text-orange-400'
                    }`}>
                      {cert.daysRemaining} 天
                    </p>
                    <p className="text-xs text-slate-500 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(cert.validTo)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Ban className="w-5 h-5 mr-2 text-red-400" />
              已吊销设备
            </h3>
            <span className="text-sm text-slate-400">{revokedDevices.length} 台设备</span>
          </div>
          {revokedDevices.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500/50" />
              <p>暂无已吊销的设备</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-auto">
              {revokedDevices.map((device) => (
                <div
                  key={device.id}
                  className="p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-white">{device.gatewayName}</span>
                      <StatusBadge status="revoked" />
                    </div>
                    <span className="text-xs text-slate-400">{device.gatewaySn}</span>
                  </div>
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>厂区: {device.factoryName} / {device.productionLineName}</p>
                    <p>吊销时间: {formatDate(device.revokedAt)}</p>
                    <p className="text-red-400">原因: {device.revokeReason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
