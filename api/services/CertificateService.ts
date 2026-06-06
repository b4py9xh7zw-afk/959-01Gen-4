import db from '../db/database.js';
import type { Certificate, DashboardStats, ExpiringCertificate, RevokedDevice } from '../../shared/types.js';
import { generateCertificate, calculateDaysRemaining } from '../utils/certGenerator.js';
import auditLogService from './AuditLogService.js';
import gatewayService from './GatewayService.js';
import factoryService from './FactoryService.js';
import settingsService from './SettingsService.js';

class CertificateService {
  list(params: {
    page: number;
    pageSize: number;
    status?: string;
    factoryId?: string;
    productionLineId?: string;
  }): { items: Certificate[]; total: number } {
    const { page, pageSize, status, factoryId, productionLineId } = params;
    const offset = (page - 1) * pageSize;

    let whereClause = '';
    const queryParams: string[] = [];

    if (status) {
      whereClause += ' WHERE c.status = ?';
      queryParams.push(status);
    }
    if (factoryId) {
      whereClause += whereClause ? ' AND c.factory_id = ?' : ' WHERE c.factory_id = ?';
      queryParams.push(factoryId);
    }
    if (productionLineId) {
      whereClause += ' AND c.production_line_id = ?';
      queryParams.push(productionLineId);
    }

    const countStmt = db.prepare(`SELECT COUNT(*) as count FROM certificates c${whereClause}`);
    const totalResult = countStmt.get(...queryParams) as { count: number };

    const listStmt = db.prepare(`
      SELECT c.*, f.name as factory_name, pl.name as production_line_name, g.name as gateway_name
      FROM certificates c
      LEFT JOIN factories f ON c.factory_id = f.id
      LEFT JOIN production_lines pl ON c.production_line_id = pl.id
      LEFT JOIN gateways g ON c.gateway_id = g.id
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `);
    const items = listStmt.all(...queryParams, pageSize, offset) as any[];

    return {
      items: items.map(item => this.mapToCertificate(item)),
      total: totalResult.count,
    };
  }

  getById(id: string): Certificate | null {
    const stmt = db.prepare(`
      SELECT c.*, f.name as factory_name, pl.name as production_line_name, g.name as gateway_name
      FROM certificates c
      LEFT JOIN factories f ON c.factory_id = f.id
      LEFT JOIN production_lines pl ON c.production_line_id = pl.id
      LEFT JOIN gateways g ON c.gateway_id = g.id
      WHERE c.id = ?
    `);
    const row = stmt.get(id) as any;
    return row ? this.mapToCertificate(row) : null;
  }

  getByGatewayId(gatewayId: string): Certificate | null {
    const stmt = db.prepare(`
      SELECT c.*, f.name as factory_name, pl.name as production_line_name, g.name as gateway_name
      FROM certificates c
      LEFT JOIN factories f ON c.factory_id = f.id
      LEFT JOIN production_lines pl ON c.production_line_id = pl.id
      LEFT JOIN gateways g ON c.gateway_id = g.id
      WHERE c.gateway_id = ? AND c.status != 'revoked'
      ORDER BY c.created_at DESC
      LIMIT 1
    `);
    const row = stmt.get(gatewayId) as any;
    return row ? this.mapToCertificate(row) : null;
  }

  create(gatewayId: string, operator: string, validDays?: number): Certificate {
    const gateway = gatewayService.getById(gatewayId);
    if (!gateway) {
      throw new Error('网关不存在');
    }

    const factory = factoryService.getById(gateway.factoryId);
    if (!factory) {
      throw new Error('厂区不存在');
    }

    const productionLine = factoryService.getProductionLineById(gateway.productionLineId);
    if (!productionLine) {
      throw new Error('生产线不存在');
    }

    const existingCert = this.getByGatewayId(gatewayId);
    if (existingCert && existingCert.status === 'valid') {
      throw new Error('该网关已有有效证书');
    }

    const settings = settingsService.get();
    const days = validDays || settings.defaultCertValidDays;
    const cert = generateCertificate(gateway.sn, days);

    const id = crypto.randomUUID();
    const stmt = db.prepare(`
      INSERT INTO certificates (
      id, gateway_id, gateway_sn, factory_id, production_line_id,
      serial_number, subject, issuer, valid_from, valid_to, pem_content
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      gatewayId,
      gateway.sn,
      gateway.factoryId,
      gateway.productionLineId,
      cert.serialNumber,
      cert.subject,
      cert.issuer,
      cert.validFrom.toISOString(),
      cert.validTo.toISOString(),
      cert.pemContent
    );

    gatewayService.updateCertificateId(gatewayId, id);
    gatewayService.updateStatus(gatewayId, 'online');

    auditLogService.log(
      operator,
      'create',
      'certificate',
      id,
      `为网关 ${gateway.name} (SN: ${gateway.sn}) 颁发证书，有效期 ${days} 天`
    );

    return this.getById(id)!;
  }

  revoke(id: string, reason: string, operator: string): Certificate {
    const cert = this.getById(id);
    if (!cert) {
      throw new Error('证书不存在');
    }
    if (cert.status === 'revoked') {
      throw new Error('证书已被吊销');
    }

    const revokeStmt = db.prepare(`
      UPDATE certificates 
      SET status = 'revoked', revoked_at = CURRENT_TIMESTAMP, revoke_reason = ?
      WHERE id = ?
    `);
    revokeStmt.run(reason, id);

    gatewayService.updateStatus(cert.gatewayId, 'revoked');

    auditLogService.log(
      operator,
      'revoke',
      'certificate',
      id,
      `吊销证书，原因: ${reason}，网关: ${cert.gatewaySn}`
    );

    return this.getById(id)!;
  }

  getDashboardStats(): DashboardStats {
    const certCounts = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'valid' THEN 1 ELSE 0 END) as valid,
        SUM(CASE WHEN status = 'revoked' THEN 1 ELSE 0 END) as revoked
      FROM certificates
    `).get() as any;

    const settings = settingsService.get();
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + settings.expireWarningDays);

    const expiringCount = db.prepare(`
      SELECT COUNT(*) as count FROM certificates 
      WHERE status = 'valid' AND valid_to <= ?
    `).get(warningDate.toISOString()) as { count: number };

    const gatewayCounts = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'online' THEN 1 ELSE 0 END) as online
      FROM gateways
    `).get() as any;

    const factoryCount = db.prepare('SELECT COUNT(*) as count FROM factories').get() as { count: number };
    const productionLineCount = db.prepare('SELECT COUNT(*) as count FROM production_lines').get() as { count: number };

    return {
      totalCertificates: certCounts.total || 0,
      validCertificates: certCounts.valid || 0,
      expiringCertificates: expiringCount.count,
      revokedCertificates: certCounts.revoked || 0,
      totalGateways: gatewayCounts.total || 0,
      onlineGateways: gatewayCounts.online || 0,
      totalFactories: factoryCount.count,
      totalProductionLines: productionLineCount.count,
    };
  }

  getExpiringCertificates(): ExpiringCertificate[] {
    const settings = settingsService.get();
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + settings.expireWarningDays);

    const stmt = db.prepare(`
      SELECT c.id, c.serial_number, c.gateway_sn, c.valid_to,
             g.name as gateway_name, f.name as factory_name, pl.name as production_line_name
      FROM certificates c
      LEFT JOIN gateways g ON c.gateway_id = g.id
      LEFT JOIN factories f ON c.factory_id = f.id
      LEFT JOIN production_lines pl ON c.production_line_id = pl.id
      WHERE c.status = 'valid' AND c.valid_to <= ?
      ORDER BY c.valid_to ASC
    `);
    const rows = stmt.all(warningDate.toISOString()) as any[];

    return rows.map(row => ({
      id: row.id,
      serialNumber: row.serial_number,
      gatewaySn: row.gateway_sn,
      gatewayName: row.gateway_name,
      factoryName: row.factory_name,
      productionLineName: row.production_line_name,
      validTo: row.valid_to,
      daysRemaining: calculateDaysRemaining(row.valid_to),
    }));
  }

  getRevokedDevices(): RevokedDevice[] {
    const stmt = db.prepare(`
      SELECT c.id, c.gateway_sn, c.revoked_at, c.revoke_reason,
             g.name as gateway_name, f.name as factory_name, pl.name as production_line_name
      FROM certificates c
      LEFT JOIN gateways g ON c.gateway_id = g.id
      LEFT JOIN factories f ON c.factory_id = f.id
      LEFT JOIN production_lines pl ON c.production_line_id = pl.id
      WHERE c.status = 'revoked'
      ORDER BY c.revoked_at DESC
    `);
    const rows = stmt.all() as any[];

    return rows.map(row => ({
      id: row.id,
      gatewaySn: row.gateway_sn,
      gatewayName: row.gateway_name,
      factoryName: row.factory_name,
      productionLineName: row.production_line_name,
      revokedAt: row.revoked_at,
      revokeReason: row.revoke_reason,
    }));
  }

  checkAndUpdateExpired(): void {
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE certificates 
      SET status = 'expired'
      WHERE status = 'valid' AND valid_to < ?
    `).run(now);
  }

  private mapToCertificate(row: any): Certificate {
    const cert: Certificate = {
      id: row.id,
      gatewayId: row.gateway_id,
      gatewaySn: row.gateway_sn,
      factoryId: row.factory_id,
      productionLineId: row.production_line_id,
      serialNumber: row.serial_number,
      subject: row.subject,
      issuer: row.issuer,
      validFrom: row.valid_from,
      validTo: row.valid_to,
      status: row.status,
      revokedAt: row.revoked_at,
      revokeReason: row.revoke_reason,
      pemContent: row.pem_content,
      createdAt: row.created_at,
      factoryName: row.factory_name,
      productionLineName: row.production_line_name,
      gatewayName: row.gateway_name,
    };
    cert.daysRemaining = calculateDaysRemaining(cert.validTo);
    return cert;
  }
}

export default new CertificateService();
