import React, { useEffect, useState } from 'react';
import { ArrowLeft, FileKey, Calendar, User, Clock, Ban, Download, Copy, CheckCircle } from 'lucide-react';
import { certificateApi } from '@/api/index.js';
import type { Certificate } from '../../../shared/types.js';
import { useParams, useNavigate } from 'react-router-dom';
import { StatusBadge } from '@/components/ui/StatusBadge.js';

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
    second: '2-digit',
  });
};

export const CertificateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');

  useEffect(() => {
    if (id) {
      loadCertificate();
    }
  }, [id]);

  const loadCertificate = async () => {
    try {
      setLoading(true);
      const data = await certificateApi.get(id!);
      setCert(data);
    } catch (error) {
      console.error('加载证书详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (cert) {
      await navigator.clipboard.writeText(cert.pemContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (cert) {
      const blob = new Blob([cert.pemContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cert.gatewaySn}-certificate.pem`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleRevoke = async () => {
    if (!id || !revokeReason.trim()) return;
    try {
      await certificateApi.revoke(id, { reason: revokeReason });
      setShowRevokeModal(false);
      setRevokeReason('');
      loadCertificate();
    } catch (error: any) {
      alert(error.message || '吊销失败');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ marginLeft: '64px' }}>
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="text-center py-12 text-slate-500" style={{ marginLeft: '64px' }}>
        证书不存在
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ marginLeft: '64px' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/certificates')}
            className="flex items-center text-slate-400 hover:text-white transition-colors mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <FileKey className="w-6 h-6 mr-2 text-blue-400" />
              证书详情
            </h2>
            <p className="text-slate-400 mt-1">证书编号: <span className="font-mono text-blue-400">{cert.serialNumber}</span></p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleCopy}
            className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            {copied ? <CheckCircle className="w-4 h-4 mr-2 text-green-400" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? '已复制' : '复制'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            下载
          </button>
          {cert.status === 'valid' && (
            <button
              onClick={() => setShowRevokeModal(true)}
              className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <Ban className="w-4 h-4 mr-2" />
              吊销证书
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FileKey className="w-5 h-5 mr-2 text-blue-400" />
              基本信息
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-slate-500">状态</span>
                <div className="mt-1">
                  <StatusBadge status={cert.status} />
                </div>
              </div>
              <div>
                <span className="text-sm text-slate-500">剩余天数</span>
                <p className={`text-lg font-mono font-bold mt-1 ${
                  cert.daysRemaining && cert.daysRemaining <= 7 ? 'text-red-400' :
                  cert.daysRemaining && cert.daysRemaining <= 30 ? 'text-orange-400' : 'text-green-400'
                }`}>
                  {cert.status === 'revoked' ? '-' : `${cert.daysRemaining} 天`}
                </p>
              </div>
              <div>
                <span className="text-sm text-slate-500">颁发日期</span>
                <p className="text-white mt-1 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                  {formatDate(cert.validFrom)}
                </p>
              </div>
              <div>
                <span className="text-sm text-slate-500">到期日期</span>
                <p className="text-white mt-1 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                  {formatDate(cert.validTo)}
                </p>
              </div>
              <div className="col-span-2">
                <span className="text-sm text-slate-500">主题 (Subject)</span>
                <p className="text-white mt-1 font-mono text-sm bg-slate-800 p-2 rounded">{cert.subject}</p>
              </div>
              <div className="col-span-2">
                <span className="text-sm text-slate-500">颁发者 (Issuer)</span>
                <p className="text-white mt-1 font-mono text-sm bg-slate-800 p-2 rounded">{cert.issuer}</p>
              </div>
            </div>
          </div>

          {cert.status === 'revoked' && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center">
                <Ban className="w-5 h-5 mr-2" />
                吊销信息
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-slate-400">吊销时间</span>
                  <p className="text-white mt-1">{cert.revokedAt ? formatDateTime(cert.revokedAt) : '-'}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-400">吊销原因</span>
                  <p className="text-white mt-1">{cert.revokeReason || '-'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FileKey className="w-5 h-5 mr-2 text-blue-400" />
              证书内容 (PEM)
            </h3>
            <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm font-mono text-slate-300 overflow-auto max-h-80">
              {cert.pemContent}
            </pre>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-cyan-400" />
              网关信息
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">设备名称</span>
                <span className="text-white">{cert.gatewayName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">序列号</span>
                <span className="text-white font-mono">{cert.gatewaySn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">所属厂区</span>
                <span className="text-white">{cert.factoryName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">生产线</span>
                <span className="text-white">{cert.productionLineName}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-purple-400" />
              时间信息
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">创建时间</span>
                <span className="text-white">{formatDateTime(cert.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showRevokeModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Ban className="w-5 h-5 mr-2 text-red-400" />
              吊销证书确认
            </h3>
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-300 mb-2">
                即将吊销网关 <span className="font-mono font-bold">{cert.gatewaySn}</span> 的证书
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
