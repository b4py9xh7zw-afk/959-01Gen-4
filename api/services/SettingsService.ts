import db from '../db/database.js';
import type { SystemSettings } from '../../shared/types.js';
import auditLogService from './AuditLogService.js';

class SettingsService {
  get(): SystemSettings {
    const stmt = db.prepare('SELECT key, value FROM system_settings');
    const rows = stmt.all() as { key: string; value: string }[];
    const settings: Record<string, string> = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });
    return {
      expireWarningDays: parseInt(settings.expireWarningDays || '30', 10),
      defaultCertValidDays: parseInt(settings.defaultCertValidDays || '365', 10),
    };
  }

  update(settings: Partial<SystemSettings>, operator: string): SystemSettings {
    const updateStmt = db.prepare(`
      UPDATE system_settings 
      SET value = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE key = ?
    `);

    const currentSettings = this.get();
    const changes: string[] = [];

    if (settings.expireWarningDays !== undefined) {
      updateStmt.run(settings.expireWarningDays.toString(), 'expireWarningDays');
      changes.push(`过期提醒天数: ${currentSettings.expireWarningDays} → ${settings.expireWarningDays}`);
    }
    if (settings.defaultCertValidDays !== undefined) {
      updateStmt.run(settings.defaultCertValidDays.toString(), 'defaultCertValidDays');
      changes.push(`默认证书有效期: ${currentSettings.defaultCertValidDays} → ${settings.defaultCertValidDays}`);
    }

    if (changes.length > 0) {
      auditLogService.log(operator, 'update', 'settings', 'system', changes.join('; '));
    }

    return this.get();
  }
}

export default new SettingsService();
