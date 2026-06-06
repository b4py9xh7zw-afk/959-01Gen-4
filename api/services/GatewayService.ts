import db from '../db/database.js';
import type { Gateway } from '../../shared/types.js';
import auditLogService from './AuditLogService.js';
import factoryService from './FactoryService.js';

class GatewayService {
  list(params: { page: number; pageSize: number; factoryId?: string; status?: string }): { items: Gateway[]; total: number } {
    const { page, pageSize, factoryId, status } = params;
    const offset = (page - 1) * pageSize;

    let whereClause = '';
    const queryParams: string[] = [];

    if (factoryId) {
      whereClause += ' WHERE g.factory_id = ?';
      queryParams.push(factoryId);
    }
    if (status) {
      whereClause += whereClause ? ' AND g.status = ?' : ' WHERE g.status = ?';
      queryParams.push(status);
    }

    const countStmt = db.prepare(`SELECT COUNT(*) as count FROM gateways g${whereClause}`);
    const totalResult = countStmt.get(...queryParams) as { count: number };

    const listStmt = db.prepare(`
      SELECT g.*, f.name as factory_name, pl.name as production_line_name
      FROM gateways g
      LEFT JOIN factories f ON g.factory_id = f.id
      LEFT JOIN production_lines pl ON g.production_line_id = pl.id
      ${whereClause}
      ORDER BY g.created_at DESC
      LIMIT ? OFFSET ?
    `);
    const items = listStmt.all(...queryParams, pageSize, offset) as any[];

    return {
      items: items.map(item => this.mapToGateway(item)),
      total: totalResult.count,
    };
  }

  getById(id: string): Gateway | null {
    const stmt = db.prepare(`
      SELECT g.*, f.name as factory_name, pl.name as production_line_name
      FROM gateways g
      LEFT JOIN factories f ON g.factory_id = f.id
      LEFT JOIN production_lines pl ON g.production_line_id = pl.id
      WHERE g.id = ?
    `);
    const row = stmt.get(id) as any;
    return row ? this.mapToGateway(row) : null;
  }

  getBySn(sn: string): Gateway | null {
    const stmt = db.prepare(`
      SELECT g.*, f.name as factory_name, pl.name as production_line_name
      FROM gateways g
      LEFT JOIN factories f ON g.factory_id = f.id
      LEFT JOIN production_lines pl ON g.production_line_id = pl.id
      WHERE g.sn = ?
    `);
    const row = stmt.get(sn) as any;
    return row ? this.mapToGateway(row) : null;
  }

  create(data: { name: string; sn: string; factoryId: string; productionLineId: string; ipAddress: string }, operator: string): Gateway {
    const existing = db.prepare('SELECT id FROM gateways WHERE sn = ?').get(data.sn);
    if (existing) {
      throw new Error('网关序列号已存在');
    }

    const factory = factoryService.getById(data.factoryId);
    if (!factory) {
      throw new Error('厂区不存在');
    }

    const productionLine = factoryService.getProductionLineById(data.productionLineId);
    if (!productionLine || productionLine.factoryId !== data.factoryId) {
      throw new Error('生产线不存在或不属于该厂区');
    }

    const id = crypto.randomUUID();
    const stmt = db.prepare(`
      INSERT INTO gateways (id, name, sn, factory_id, production_line_id, ip_address)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, data.name, data.sn, data.factoryId, data.productionLineId, data.ipAddress);

    auditLogService.log(operator, 'create', 'gateway', id, `创建网关: ${data.name} (SN: ${data.sn})，所属厂区: ${factory.name}`);

    return this.getById(id)!;
  }

  updateStatus(id: string, status: Gateway['status'], heartbeat?: Date) {
    const stmt = db.prepare(`
      UPDATE gateways 
      SET status = ?, last_heartbeat = COALESCE(?, last_heartbeat)
      WHERE id = ?
    `);
    stmt.run(status, heartbeat ? heartbeat.toISOString() : null, id);
  }

  updateCertificateId(gatewayId: string, certificateId: string | null) {
    const stmt = db.prepare('UPDATE gateways SET certificate_id = ? WHERE id = ?');
    stmt.run(certificateId, gatewayId);
  }

  listAll(): Gateway[] {
    const stmt = db.prepare(`
      SELECT g.*, f.name as factory_name, pl.name as production_line_name
      FROM gateways g
      LEFT JOIN factories f ON g.factory_id = f.id
      LEFT JOIN production_lines pl ON g.production_line_id = pl.id
      ORDER BY g.created_at DESC
    `);
    const rows = stmt.all() as any[];
    return rows.map(row => this.mapToGateway(row));
  }

  listWithoutCertificate(): Gateway[] {
    const stmt = db.prepare(`
      SELECT g.*, f.name as factory_name, pl.name as production_line_name
      FROM gateways g
      LEFT JOIN factories f ON g.factory_id = f.id
      LEFT JOIN production_lines pl ON g.production_line_id = pl.id
      WHERE g.certificate_id IS NULL OR g.status = 'revoked'
      ORDER BY g.created_at DESC
    `);
    const rows = stmt.all() as any[];
    return rows.map(row => this.mapToGateway(row));
  }

  private mapToGateway(row: any): Gateway {
    return {
      id: row.id,
      name: row.name,
      sn: row.sn,
      factoryId: row.factory_id,
      productionLineId: row.production_line_id,
      ipAddress: row.ip_address,
      status: row.status,
      lastHeartbeat: row.last_heartbeat,
      certificateId: row.certificate_id,
      createdAt: row.created_at,
      factoryName: row.factory_name,
      productionLineName: row.production_line_name,
    };
  }
}

export default new GatewayService();
