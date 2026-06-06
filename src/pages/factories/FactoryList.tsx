import React, { useEffect, useState } from 'react';
import { Building2, Plus, ChevronRight, Layers, Server, MapPin, Code, X } from 'lucide-react';
import { factoryApi } from '@/api/index.js';
import type { Factory, ProductionLine } from '../../../shared/types.js';

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const FactoryList: React.FC = () => {
  const [factories, setFactories] = useState<Factory[]>([]);
  const [productionLines, setProductionLines] = useState<Record<string, ProductionLine[]>>({});
  const [loading, setLoading] = useState(false);
  const [expandedFactoryId, setExpandedFactoryId] = useState<string | null>(null);

  const [showCreateFactoryModal, setShowCreateFactoryModal] = useState(false);
  const [showCreateLineModal, setShowCreateLineModal] = useState(false);
  const [selectedFactoryId, setSelectedFactoryId] = useState<string | null>(null);

  const [newFactory, setNewFactory] = useState({
    name: '',
    code: '',
    address: '',
    description: '',
  });

  const [newProductionLine, setNewProductionLine] = useState({
    name: '',
    code: '',
    description: '',
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadFactories();
  }, []);

  const loadFactories = async () => {
    try {
      setLoading(true);
      const data = await factoryApi.list();
      setFactories(data);
      for (const factory of data) {
        const lines = await factoryApi.getProductionLines(factory.id);
        setProductionLines(prev => ({ ...prev, [factory.id]: lines }));
      }
    } catch (error) {
      console.error('加载厂区列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFactory = async () => {
    if (!newFactory.name || !newFactory.code) {
      alert('请填写厂区名称和编码');
      return;
    }
    try {
      setSubmitting(true);
      await factoryApi.create(newFactory);
      setShowCreateFactoryModal(false);
      setNewFactory({ name: '', code: '', address: '', description: '' });
      loadFactories();
    } catch (error: any) {
      alert(error.message || '创建厂区失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateProductionLine = async () => {
    if (!selectedFactoryId || !newProductionLine.name || !newProductionLine.code) {
      alert('请填写生产线名称和编码');
      return;
    }
    try {
      setSubmitting(true);
      await factoryApi.createProductionLine(selectedFactoryId, newProductionLine);
      setShowCreateLineModal(false);
      setNewProductionLine({ name: '', code: '', description: '' });
      loadFactories();
    } catch (error: any) {
      alert(error.message || '创建生产线失败');
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateLineModal = (factoryId: string) => {
    setSelectedFactoryId(factoryId);
    setShowCreateLineModal(true);
  };

  const toggleExpand = (factoryId: string) => {
    setExpandedFactoryId(expandedFactoryId === factoryId ? null : factoryId);
  };

  return (
    <div className="space-y-6" style={{ marginLeft: '64px' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Building2 className="w-6 h-6 mr-2 text-purple-400" />
            厂区管理
          </h2>
          <p className="text-slate-400 mt-1">管理厂区和生产线信息</p>
        </div>
        <button
          onClick={() => setShowCreateFactoryModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          新增厂区
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-4">
          {factories.length === 0 ? (
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-12 text-center">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <p className="text-slate-500">暂无厂区数据</p>
              <button
                onClick={() => setShowCreateFactoryModal(true)}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                添加第一个厂区
              </button>
            </div>
          ) : (
            factories.map((factory) => (
              <div
                key={factory.id}
                className="bg-slate-900/80 border border-slate-700/50 rounded-lg overflow-hidden"
              >
                <div
                  className="p-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
                  onClick={() => toggleExpand(factory.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-purple-900/50 rounded-lg">
                        <Building2 className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{factory.name}</h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-slate-400">
                          <span className="flex items-center">
                            <Code className="w-3.5 h-3.5 mr-1" />
                            {factory.code}
                          </span>
                          {factory.address && (
                            <span className="flex items-center">
                              <MapPin className="w-3.5 h-3.5 mr-1" />
                              {factory.address}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="flex items-center text-slate-400">
                          <Layers className="w-4 h-4 mr-1.5 text-cyan-400" />
                          <span>{productionLines[factory.id]?.length || 0} 条生产线</span>
                        </div>
                        <div className="flex items-center text-slate-400">
                          <Server className="w-4 h-4 mr-1.5 text-green-400" />
                          <span>-- 台设备</span>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 text-slate-400 transition-transform ${
                          expandedFactoryId === factory.id ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {expandedFactoryId === factory.id && (
                  <div className="border-t border-slate-700/50 p-4 bg-slate-800/30">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-slate-300 flex items-center">
                        <Layers className="w-4 h-4 mr-2 text-cyan-400" />
                        生产线列表
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openCreateLineModal(factory.id);
                        }}
                        className="flex items-center px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        添加生产线
                      </button>
                    </div>

                    {productionLines[factory.id]?.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <Layers className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                        <p className="text-sm">暂无生产线</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {productionLines[factory.id]?.map((line) => (
                          <div
                            key={line.id}
                            className="p-3 bg-slate-900/50 border border-slate-700/50 rounded-lg hover:border-cyan-500/30 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-white">{line.name}</p>
                                <p className="text-xs text-slate-400 font-mono mt-0.5">{line.code}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-slate-500">
                                  {formatDateTime(line.createdAt)}
                                </p>
                              </div>
                            </div>
                            {line.description && (
                              <p className="text-xs text-slate-500 mt-2">{line.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {factory.description && (
                      <div className="mt-4 pt-4 border-t border-slate-700/50">
                        <p className="text-xs text-slate-500">{factory.description}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {showCreateFactoryModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Plus className="w-5 h-5 mr-2 text-blue-400" />
                新增厂区
              </h3>
              <button
                onClick={() => setShowCreateFactoryModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">厂区名称 *</label>
                  <input
                    type="text"
                    value={newFactory.name}
                    onChange={(e) => setNewFactory({ ...newFactory, name: e.target.value })}
                    placeholder="如：一号厂区"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">厂区编码 *</label>
                  <input
                    type="text"
                    value={newFactory.code}
                    onChange={(e) => setNewFactory({ ...newFactory, code: e.target.value })}
                    placeholder="如：F001"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">地址</label>
                <input
                  type="text"
                  value={newFactory.address}
                  onChange={(e) => setNewFactory({ ...newFactory, address: e.target.value })}
                  placeholder="如：上海市浦东新区..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">描述</label>
                <textarea
                  value={newFactory.description}
                  onChange={(e) => setNewFactory({ ...newFactory, description: e.target.value })}
                  placeholder="厂区描述信息..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateFactoryModal(false);
                  setNewFactory({ name: '', code: '', address: '', description: '' });
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateFactory}
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? '创建中...' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateLineModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Plus className="w-5 h-5 mr-2 text-cyan-400" />
                新增生产线
              </h3>
              <button
                onClick={() => setShowCreateLineModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">生产线名称 *</label>
                  <input
                    type="text"
                    value={newProductionLine.name}
                    onChange={(e) => setNewProductionLine({ ...newProductionLine, name: e.target.value })}
                    placeholder="如：SMT产线1"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">生产线编码 *</label>
                  <input
                    type="text"
                    value={newProductionLine.code}
                    onChange={(e) => setNewProductionLine({ ...newProductionLine, code: e.target.value })}
                    placeholder="如：SMT-001"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">描述</label>
                <textarea
                  value={newProductionLine.description}
                  onChange={(e) => setNewProductionLine({ ...newProductionLine, description: e.target.value })}
                  placeholder="生产线描述信息..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateLineModal(false);
                  setNewProductionLine({ name: '', code: '', description: '' });
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateProductionLine}
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
