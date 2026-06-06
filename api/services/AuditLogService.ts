import db from '../db/database.js';
import type { AuditLog } from '../../shared/types.js';

const ACTION_NAMES: Record<string, string> = {
  create: '创建',
  revoke: '吊销',
  update: '更新',
  delete: '删除',
};

const TARGET_TYPE_NAMES: Record<string, string> = {
  certificate: '证书',
  gateway: '网关设备',
  factory: '厂区',
  settings: '系统设置',
};

class AuditLogService {
  log(operator: string, action: AuditLog['action'], targetType: AuditLog['targetType'], targetId: string, detail: string) {
    const stmt = db.prepare(`
      INSERT INTO audit_logs (id, operator, action, target_type, target_id, detail)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const id = crypto.randomUUID();
    stmt.run(id, operator, action, targetType, targetId, detail);
    return id;
  }

  list(params: { page: number; pageSize: number; targetType?: string; action?: string }): { items: AuditLog[]; total: number } {
    const { page, pageSize, targetType, action } = params;
    const offset = (page - 1) * pageSize;

    let whereClause = '';
    const queryParams: string[] = [];

    if (targetType) {
      whereClause += ' WHERE target_type = ?';
      queryParams.push(targetType);
    }
    if (action) {
      whereClause += whereClause ? ' AND action = ?' : ' WHERE action = ?';
      queryParams.push(action);
    }

    const countStmt = db.prepare(`SELECT COUNT(*) as count FROM audit_logs${whereClause}`);
    const totalResult = countStmt.get(...queryParams) as { count: number };

    const listStmt = db.prepare(`
      SELECT * FROM audit_logs${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);
    const items = listStmt.all(...queryParams, pageSize, offset) as any[];

    return {
      items: items.map(item => this.mapToAuditLog(item)),
      total: totalResult.count,
    };
  }

  private mapToAuditLog(row: any): AuditLog {
    return {
      id: row.id,
      operator: row.operator,
      action: row.action,
      targetType: row.target_type,
      targetId: row.target_id,
      detail: row.detail,
      createdAt: row.created_at,
      actionName: ACTION_NAMES[row.action] || row.action,
      targetTypeName: TARGET_TYPE_NAMES[row.target_type] || row.target_type,
    };
  }
}

export default new AuditLogService();
