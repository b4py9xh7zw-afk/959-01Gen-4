import db from '../db/database.js';
import type { CollectedData } from '../../shared/types.js';
import gatewayService from './GatewayService.js';

const DATA_TYPES = ['temperature', 'pressure', 'humidity', 'vibration', 'power', 'flow_rate'];

class TraceService {
  listCollectedData(params: {
    page: number;
    pageSize: number;
    gatewayId?: string;
    startTime?: string;
    endTime?: string;
    includeRevoked?: boolean;
  }): { items: CollectedData[]; total: number } {
    const { page, pageSize, gatewayId, startTime, endTime } = params;
    const offset = (page - 1) * pageSize;

    let whereClause = '';
    const queryParams: string[] = [];

    if (gatewayId) {
      whereClause += ' WHERE cd.gateway_id = ?';
      queryParams.push(gatewayId);
    }
    if (startTime) {
      whereClause += whereClause ? ' AND cd.timestamp >= ?' : ' WHERE cd.timestamp >= ?';
      queryParams.push(startTime);
    }
    if (endTime) {
      whereClause += ' AND cd.timestamp <= ?';
      queryParams.push(endTime);
    }

    const countStmt = db.prepare(`SELECT COUNT(*) as count FROM collected_data cd${whereClause}`);
    const totalResult = countStmt.get(...queryParams) as { count: number };

    const listStmt = db.prepare(`
      SELECT cd.*, f.name as factory_name, pl.name as production_line_name, g.name as gateway_name
      FROM collected_data cd
      LEFT JOIN factories f ON cd.factory_id = f.id
      LEFT JOIN production_lines pl ON cd.production_line_id = pl.id
      LEFT JOIN gateways g ON cd.gateway_id = g.id
      ${whereClause}
      ORDER BY cd.timestamp DESC
      LIMIT ? OFFSET ?
    `);
    const items = listStmt.all(...queryParams, pageSize, offset) as any[];

    return {
      items: items.map(item => this.mapToCollectedData(item)),
      total: totalResult.count,
    };
  }

  generateMockData(): void {
    const gateways = gatewayService.listAll();
    const now = new Date();

    gateways.forEach(gateway => {
      const existingCount = db.prepare('SELECT COUNT(*) as count FROM collected_data WHERE gateway_id = ?').get(gateway.id) as { count: number };
      if (existingCount.count > 0) return;

      const insertStmt = db.prepare(`
        INSERT INTO collected_data (
          id, gateway_id, gateway_sn, factory_id, production_line_id,
          data_type, value, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (let day = 30; day >= 0; day--) {
        const dataTime = new Date(now.getTime() - day * 24 * 60 * 60 * 1000);
        DATA_TYPES.forEach(dataType => {
          for (let i = 0; i < 3; i++) {
            const id = crypto.randomUUID();
            const recordTime = new Date(dataTime.getTime() + i * 8 * 60 * 60 * 1000);
            const value = this.generateValue(dataType);
            insertStmt.run(
              id,
              gateway.id,
              gateway.sn,
              gateway.factoryId,
              gateway.productionLineId,
              dataType,
              value,
              recordTime.toISOString()
            );
          }
        });
      }
    });
  }

  private generateValue(dataType: string): number {
    switch (dataType) {
      case 'temperature':
        return Math.round((20 + Math.random() * 30) * 100) / 100;
      case 'pressure':
        return Math.round((1 + Math.random() * 2) * 100) / 100;
      case 'humidity':
        return Math.round((40 + Math.random() * 40) * 10) / 10;
      case 'vibration':
        return Math.round((0.1 + Math.random() * 2) * 100) / 100;
      case 'power':
        return Math.round((100 + Math.random() * 400) * 10) / 10;
      case 'flow_rate':
        return Math.round((50 + Math.random() * 150) * 10) / 10;
      default:
        return Math.random() * 100;
    }
  }

  private mapToCollectedData(row: any): CollectedData {
    return {
      id: row.id,
      gatewayId: row.gateway_id,
      gatewaySn: row.gateway_sn,
      factoryId: row.factory_id,
      productionLineId: row.production_line_id,
      dataType: row.data_type,
      value: row.value,
      timestamp: row.timestamp,
      factoryName: row.factory_name,
      productionLineName: row.production_line_name,
      gatewayName: row.gateway_name,
    };
  }
}

export default new TraceService();
