import React, { useEffect, useState } from 'react';
import { Settings, AlertCircle, Clock, Save, CheckCircle } from 'lucide-react';
import { settingsApi } from '@/api/index.js';
import type { SystemSettings } from '../../../shared/types.js';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [expireWarningDays, setExpireWarningDays] = useState(30);
  const [defaultCertValidDays, setDefaultCertValidDays] = useState(365);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsApi.get();
      setSettings(data);
      setExpireWarningDays(data.expireWarningDays);
      setDefaultCertValidDays(data.defaultCertValidDays);
    } catch (error) {
      console.error('加载设置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (expireWarningDays < 1 || expireWarningDays > 365) {
      alert('过期提醒天数应在 1-365 天之间');
      return;
    }
    if (defaultCertValidDays < 30 || defaultCertValidDays > 3650) {
      alert('证书有效期应在 30-3650 天之间');
      return;
    }

    try {
      setSaving(true);
      const data = await settingsApi.update({
        expireWarningDays,
        defaultCertValidDays,
      });
      setSettings(data);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      alert(error.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (settings) {
      setExpireWarningDays(settings.expireWarningDays);
      setDefaultCertValidDays(settings.defaultCertValidDays);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ marginLeft: '64px' }}>
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const hasChanges = settings && (
    expireWarningDays !== settings.expireWarningDays ||
    defaultCertValidDays !== settings.defaultCertValidDays
  );

  return (
    <div className="space-y-6" style={{ marginLeft: '64px' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Settings className="w-6 h-6 mr-2 text-orange-400" />
            系统设置
          </h2>
          <p className="text-slate-400 mt-1">配置证书管理系统参数</p>
        </div>
        {showSuccess && (
          <div className="flex items-center px-4 py-2 bg-green-900/50 border border-green-500/30 rounded-lg text-green-400">
            <CheckCircle className="w-4 h-4 mr-2" />
            保存成功
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-6">
          <div className="flex items-start space-x-4 mb-6">
            <div className="p-3 bg-orange-900/50 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">过期提醒设置</h3>
              <p className="text-sm text-slate-400 mt-1">配置证书过期前多少天开始提醒</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                过期提醒天数
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={expireWarningDays}
                  onChange={(e) => setExpireWarningDays(parseInt(e.target.value) || 1)}
                  className="w-32 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
                <span className="text-slate-400">天</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                证书到期前 {expireWarningDays} 天，系统将在仪表盘显示过期提醒
              </p>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <h4 className="text-sm font-medium text-slate-300 mb-2">快捷设置</h4>
              <div className="flex flex-wrap gap-2">
                {[7, 15, 30, 60, 90].map((days) => (
                  <button
                    key={days}
                    onClick={() => setExpireWarningDays(days)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      expireWarningDays === days
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {days} 天
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-6">
          <div className="flex items-start space-x-4 mb-6">
            <div className="p-3 bg-blue-900/50 rounded-lg">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">证书默认有效期</h3>
              <p className="text-sm text-slate-400 mt-1">配置新申请证书的默认有效天数</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                默认有效期
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min="30"
                  max="3650"
                  value={defaultCertValidDays}
                  onChange={(e) => setDefaultCertValidDays(parseInt(e.target.value) || 30)}
                  className="w-32 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
                <span className="text-slate-400">天</span>
                <span className="text-sm text-slate-500 ml-2">
                  （约 {(defaultCertValidDays / 365).toFixed(1)} 年）
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                新申请证书时，默认使用此有效期，可在申请时手动调整
              </p>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <h4 className="text-sm font-medium text-slate-300 mb-2">快捷设置</h4>
              <div className="flex flex-wrap gap-2">
                {[180, 365, 730, 1095, 1825].map((days) => (
                  <button
                    key={days}
                    onClick={() => setDefaultCertValidDays(days)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      defaultCertValidDays === days
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {days} 天 ({(days / 365).toFixed(1)}年)
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">设置说明</h3>
        <div className="space-y-3 text-sm text-slate-400">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
            <p>
              <strong className="text-slate-300">过期提醒：</strong>
              系统每日凌晨自动检查证书有效期，将过期提醒阈值内的证书显示在仪表盘的"即将过期"列表中。
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <Clock className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <p>
              <strong className="text-slate-300">证书有效期：</strong>
              新证书默认有效期建议设置为 1-3 年，过短会增加运维成本，过长存在安全风险。
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={handleReset}
          disabled={!hasChanges}
          className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          重置
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? '保存中...' : '保存设置'}
        </button>
      </div>
    </div>
  );
};
