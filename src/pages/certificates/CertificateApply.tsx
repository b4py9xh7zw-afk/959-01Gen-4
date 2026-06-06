import React, { useEffect, useState } from 'react';
import { FileKey, Plus, ArrowLeft, Check, Building2, Server, Calendar } from 'lucide-react';
import { certificateApi, gatewayApi, factoryApi } from '@/api/index.js';
import type { Gateway, Factory, ProductionLine, SystemSettings } from '../../../shared/types.js';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore.js';

export const CertificateApply: React.FC = () => {
  const navigate = useNavigate();
  const { settings, loadSettings } = useAppStore();

  const [step, setStep] = useState(1);
  const [selectedGateway, setSelectedGateway] = useState<string>('');
  const [validDays, setValidDays] = useState<number>(365);
  const [customValidDays, setCustomValidDays] = useState(false);
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [productionLines, setProductionLines] = useState<ProductionLine[]>([]);
  const [factoryFilter, setFactoryFilter] = useState('');
  const [productionLineFilter, setProductionLineFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdCert, setCreatedCert] = useState<any>(null);

  useEffect(() => {
    loadSettings();
    loadData();
  }, []);

  useEffect(() => {
    if (settings) {
      setValidDays(settings.defaultCertValidDays);
    }
  }, [settings]);

  useEffect(() => {
    if (factoryFilter) {
      factoryApi.getProductionLines(factoryFilter).then(setProductionLines);
    } else {
      setProductionLines([]);
    }
  }, [factoryFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [gatewaysData, factoriesData] = await Promise.all([
        gatewayApi.listWithoutCertificate(),
        factoryApi.list(),
      ]);
      setGateways(gatewaysData);
      setFactories(factoriesData);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGateways = gateways.filter(g => {
    if (factoryFilter && g.factoryId !== factoryFilter) return false;
    if (productionLineFilter && g.productionLineId !== productionLineFilter) return false;
    return true;
  });

  const selectedGatewayData = gateways.find(g => g.id === selectedGateway);

  const handleSubmit = async () => {
    if (!selectedGateway) return;
    try {
      setSubmitting(true);
      const cert = await certificateApi.create({
        gatewayId: selectedGateway,
        validDays: customValidDays ? validDays : undefined,
      });
      setCreatedCert(cert);
      setSuccess(true);
    } catch (error: any) {
      alert(error.message || '申请失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (success && createdCert) {
    return (
      <div className="space-y-6" style={{ marginLeft: '64px' }}>
        <button
          onClick={() => navigate('/certificates')}
          className="flex items-center text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回证书列表
        </button>

        <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-8 max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">证书申请成功</h2>
          <p className="text-slate-400 mb-6">通信证书已成功生成并下发到网关设备</p>

          <div className="bg-slate-800/50 rounded-lg p-4 text-left mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">证书编号:</span>
                <p className="text-white font-mono mt-1">{createdCert.serialNumber}</p>
              </div>
              <div>
                <span className="text-slate-500">网关设备:</span>
                <p className="text-white mt-1">{createdCert.gatewayName} ({createdCert.gatewaySn})</p>
              </div>
              <div>
                <span className="text-slate-500">有效期:</span>
                <p className="text-white mt-1">
                  {new Date(createdCert.validFrom).toLocaleDateString('zh-CN')} ~ {new Date(createdCert.validTo).toLocaleDateString('zh-CN')}
                </p>
              </div>
              <div>
                <span className="text-slate-500">剩余天数:</span>
                <p className="text-green-400 font-mono mt-1">{createdCert.daysRemaining} 天</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate(`/certificates/${createdCert.id}`)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              查看证书详情
            </button>
            <button
              onClick={() => navigate('/certificates')}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              返回列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ marginLeft: '64px' }}>
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
            申请新证书
          </h2>
          <p className="text-slate-400 mt-1">为边缘网关设备申请通信证书</p>
        </div>
      </div>

      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'
          }`}>
            1
          </div>
          <span className={`ml-2 ${step >= 1 ? 'text-white' : 'text-slate-400'}`}>选择网关</span>
          <div className={`w-16 h-0.5 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-700'}`} />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'
          }`}>
            2
          </div>
          <span className={`ml-2 ${step >= 2 ? 'text-white' : 'text-slate-400'}`}>确认信息</span>
        </div>
      </div>

      {step === 1 && (
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">筛选条件</h3>
            <div className="flex flex-wrap gap-4">
              <div className="min-w-[200px]">
                <label className="block text-sm text-slate-400 mb-2">厂区</label>
                <select
                  value={factoryFilter}
                  onChange={(e) => {
                    setFactoryFilter(e.target.value);
                    setProductionLineFilter('');
                  }}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">全部厂区</option>
                  {factories.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              {productionLines.length > 0 && (
                <div className="min-w-[200px]">
                  <label className="block text-sm text-slate-400 mb-2">生产线</label>
                  <select
                    value={productionLineFilter}
                    onChange={(e) => setProductionLineFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">全部生产线</option>
                    {productionLines.map(pl => (
                      <option key={pl.id} value={pl.id}>{pl.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <h3 className="text-lg font-semibold text-white mb-4">选择网关设备</h3>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : filteredGateways.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Server className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>暂无可用的网关设备</p>
              <p className="text-sm">所有网关均已绑定有效证书或已被吊销</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {filteredGateways.map(gateway => (
                <div
                  key={gateway.id}
                  onClick={() => setSelectedGateway(gateway.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedGateway === gateway.id
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <Server className={`w-5 h-5 mr-2 ${
                        gateway.status === 'online' ? 'text-green-400' : 'text-slate-500'
                      }`} />
                      <span className="text-white font-medium">{gateway.name}</span>
                    </div>
                    {selectedGateway === gateway.id && (
                      <Check className="w-5 h-5 text-blue-400" />
                    )}
                  </div>
                  <div className="text-sm text-slate-400 space-y-1">
                    <p className="font-mono">SN: {gateway.sn}</p>
                    <p className="flex items-center">
                      <Building2 className="w-3 h-3 mr-1" />
                      {gateway.factoryName} / {gateway.productionLineName}
                    </p>
                    <p>IP: {gateway.ipAddress}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!selectedGateway}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              下一步
              <Plus className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && selectedGatewayData && (
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-6">确认证书信息</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="text-sm text-slate-400 mb-3 flex items-center">
                <Server className="w-4 h-4 mr-2" />
                网关信息
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">设备名称:</span>
                  <span className="text-white">{selectedGatewayData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">序列号:</span>
                  <span className="text-white font-mono">{selectedGatewayData.sn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">厂区:</span>
                  <span className="text-white">{selectedGatewayData.factoryName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">生产线:</span>
                  <span className="text-white">{selectedGatewayData.productionLineName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">IP地址:</span>
                  <span className="text-white font-mono">{selectedGatewayData.ipAddress}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="text-sm text-slate-400 mb-3 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                证书配置
              </h4>
              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-slate-500 mb-2">有效期</label>
                  {!customValidDays ? (
                    <div className="flex items-center space-x-3">
                      <span className="text-white">默认 {settings?.defaultCertValidDays || 365} 天</span>
                      <button
                        onClick={() => setCustomValidDays(true)}
                        className="text-blue-400 hover:text-blue-300 text-xs"
                      >
                        自定义
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        value={validDays}
                        onChange={(e) => setValidDays(Math.max(1, parseInt(e.target.value) || 1))}
                        min="1"
                        className="w-24 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-slate-400">天</span>
                      <button
                        onClick={() => {
                          setCustomValidDays(false);
                          setValidDays(settings?.defaultCertValidDays || 365);
                        }}
                        className="text-slate-400 hover:text-white text-xs"
                      >
                        使用默认
                      </button>
                    </div>
                  )}
                </div>
                <div className="pt-2 border-t border-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">生效日期:</span>
                    <span className="text-white">{new Date().toLocaleDateString('zh-CN')}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-slate-500">到期日期:</span>
                    <span className="text-white">
                      {new Date(Date.now() + validDays * 24 * 60 * 60 * 1000).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              上一步
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {submitting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  申请中...
                </>
              ) : (
                <>
                  <FileKey className="w-4 h-4 mr-2" />
                  确认申请
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
