import type { GatewayAuthResponse } from '../../shared/types.js';
import certificateService from './CertificateService.js';
import gatewayService from './GatewayService.js';
import db from '../db/database.js';

class AuthService {
  authenticateGateway(gatewaySn: string): GatewayAuthResponse {
    const gateway = gatewayService.getBySn(gatewaySn);
    if (!gateway) {
      return {
        allowed: false,
        reason: '网关设备未注册',
      };
    }

    const cert = certificateService.getByGatewayId(gateway.id);
    if (!cert) {
      gatewayService.updateStatus(gateway.id, 'offline');
      return {
        allowed: false,
        reason: '网关无有效证书',
        certificateStatus: 'none',
      };
    }

    if (cert.status === 'revoked') {
      gatewayService.updateStatus(gateway.id, 'revoked');
      return {
        allowed: false,
        reason: '证书已被吊销，设备禁止接入',
        certificateStatus: 'revoked',
      };
    }

    if (cert.status === 'expired') {
      gatewayService.updateStatus(gateway.id, 'offline');
      return {
        allowed: false,
        reason: '证书已过期',
        certificateStatus: 'expired',
      };
    }

    gatewayService.updateStatus(gateway.id, 'online', new Date());

    return {
      allowed: true,
      certificateStatus: 'valid',
    };
  }

  recordConnectionAttempt(gatewaySn: string, allowed: boolean, reason?: string) {
    const stmt = db.prepare(`
      INSERT INTO audit_logs (id, operator, action, target_type, target_id, detail)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const id = crypto.randomUUID();
    stmt.run(
      id,
      'system',
      allowed ? 'update' : 'update',
      'gateway',
      gatewaySn,
      `网关连接尝试: ${allowed ? '允许' : '拒绝'}，原因: ${reason || '正常连接'}`
    );
  }
}

export default new AuthService();
