import React, { useEffect, useState } from 'react';
import { History, Search, Filter, ChevronLeft, ChevronRight, Server, Thermometer, Gauge, Activity } from 'lucide-react';
import { traceApi, gatewayApi } from '@/api/index.js';
import type { CollectedData, Gateway } from '../../../shared/types.js';
import { useAppStore } from '@/store/appStore.js';

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

const dataTypeConfig: Record<string, { label: string; icon: React.ReactNode; color: string; unit: string }> = {
  temperature: { label: '温度', icon: <Thermometer className="w-4 h-4" />, color: 'text-orange-400', unit: '°C' },
  humidity: { label: '湿度', icon: <Gauge className="w-4 h-4" />, color: 'text-blue-400', unit: '%' },
  vibration: { label: '振动', icon: <Activity className="w-4 h-4" />, color: 'text-purple-400', unit: 'mm/s' },
  pressure: { label: '压力', icon: <Gauge className="w-4 h-4" />, color: 'text-green-400', unit: 'kPa' },
};

export const DataTrace: React.FC = () => {
  const { factories } = useAppStore();

  const [data, setData] = useState<CollectedData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [gatewayFilter, setGatewayFilter] = useState('');
  const [dataTypeFilter, setDataTypeFilter] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    loadGateways();
  }, []);

  useEffect(() => {
    loadData();
  }, [page, pageSize, gatewayFilter, dataTypeFilter, startTime, endTime]);

  const loadGateways = async () => {
    try {
      const data = await gatewayApi.listAll();
      setGateways(data);
    } catch (error) {
      console.error('加载网关列表失败:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await traceApi.listData({
        page,
        pageSize,
        gatewayId: gatewayFilter || undefined,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
      });
      setData(result.items);
      setTotal(result.total);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const stats = data.reduce((acc, item) => {
    if (!acc[item.dataType]) {
      acc[item.dataType] = { count: 0, values: [] as number[] };
    }
    acc[item.dataType].count++;
    acc[item.dataType].values.push(item.value);
    return acc;
  }, {} as Record<string, { count: number; values: number[] }>);

  return (
    <div className="space-y-6" style={{ marginLeft: '64px' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <History className="w-6 h-6 mr-2 text-cyan-400" />
            历史数据追溯
          </h2>
          <p className="text-slate-400 mt-1">查询和追溯网关设备采集的历史数据</p>
        </div>
      </div>

      {Object.keys(stats).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats).map(([type, stat]) => {
            const config = dataTypeConfig[type] || { label: type, icon: <Activity className="w-4 h-4" />, color: 'text-slate-400', unit: '' };
            const avg = stat.values.length > 0 ? (stat.values.reduce((a, b) => a + b, 0) / stat.values.length).toFixed(2) : '0';
            return (
              <div key={type} className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`flex items-center text-sm ${config.color}`}>
                    {config.icon}
                    <span className="ml-1.5">{config.label}</span>
                  </span>
                  <span className="text-xs text-slate-500">{stat.count} 条</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {avg}
                  <span className="text-sm font-normal text-slate-500 ml-1">{config.unit}</span>
                </p>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="min-w-[180px]">
            <label className="block text-sm text-slate-400 mb-1">网关设备</label>
            <select
              value={gatewayFilter}
              onChange={(e) => { setGatewayFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">全部网关</option>
              {gateways.map((g) => (
                <option key={g.id} value={g.id}>{g.name} ({g.sn})</option>
              ))}
            </select>
          </div>
          <div className="min-w-[150px]">
            <label className="block text-sm text-slate-400 mb-1">数据类型</label>
            <select
              value={dataTypeFilter}
              onChange={(e) => { setDataTypeFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">全部类型</option>
              <option value="temperature">温度</option>
              <option value="humidity">湿度</option>
              <option value="vibration">振动</option>
              <option value="pressure">压力</option>
            </select>
          </div>
          <div className="min-w-[160px]">
            <label className="block text-sm text-slate-400 mb-1">开始时间</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => { setStartTime(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="min-w-[160px]">
            <label className="block text-sm text-slate-400 mb-1">结束时间</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => { setEndTime(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={loadData}
            className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            查询
          </button>
          <button
            onClick={() => {
              setGatewayFilter('');
              setDataTypeFilter('');
              setStartTime('');
              setEndTime('');
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">采集时间</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">网关设备</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">厂区/生产线</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">数据类型</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">数值</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                        <History className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                        <p>暂无采集数据</p>
                      </td>
                    </tr>
                  ) : (
                    data.map((item) => {
                      const config = dataTypeConfig[item.dataType];
                      return (
                        <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3">
                            <span className="text-sm text-slate-300">{formatDateTime(item.timestamp)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <Server className="w-4 h-4 mr-2 text-slate-500" />
                              <div>
                                <p className="text-sm text-white">{item.gatewayName}</p>
                                <p className="text-xs text-slate-500 font-mono">{item.gatewaySn}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-slate-300">{item.factoryName}</p>
                            <p className="text-xs text-slate-500">{item.productionLineName}</p>
                          </td>
                          <td className="px-4 py-3">
                            {config ? (
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 ${config.color}`}>
                                {config.icon}
                                <span className="ml-1.5">{config.label}</span>
                              </span>
                            ) : (
                              <span className="text-sm text-slate-300">{item.dataType}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-lg font-mono font-bold ${config?.color || 'text-white'}`}>
                              {item.value.toFixed(2)}
                              <span className="text-sm font-normal text-slate-500 ml-1">{config?.unit || ''}</span>
                            </span>
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
