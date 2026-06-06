import db from '../db/database.js';
import type { Factory, ProductionLine } from '../../shared/types.js';
import auditLogService from './AuditLogService.js';

class FactoryService {
  list(): Factory[] {
    const stmt = db.prepare('SELECT * FROM factories ORDER BY created_at DESC');
    const rows = stmt.all() as any[];
    return rows.map(row => this.mapToFactory(row));
  }

  getById(id: string): Factory | null {
    const stmt = db.prepare('SELECT * FROM factories WHERE id = ?');
    const row = stmt.get(id) as any;
    return row ? this.mapToFactory(row) : null;
  }

  create(data: { name: string; code: string; address: string; description: string }, operator: string): Factory {
    const existing = db.prepare('SELECT id FROM factories WHERE code = ?').get(data.code);
    if (existing) {
      throw new Error('厂区编码已存在');
    }

    const id = crypto.randomUUID();
    const stmt = db.prepare(`
      INSERT INTO factories (id, name, code, address, description)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, data.name, data.code, data.address, data.description);

    auditLogService.log(operator, 'create', 'factory', id, `创建厂区: ${data.name} (${data.code})`);

    return this.getById(id)!;
  }

  getProductionLines(factoryId: string): ProductionLine[] {
    const stmt = db.prepare('SELECT * FROM production_lines WHERE factory_id = ? ORDER BY created_at DESC');
    const rows = stmt.all(factoryId) as any[];
    return rows.map(row => this.mapToProductionLine(row));
  }

  createProductionLine(factoryId: string, data: { name: string; code: string; description: string }, operator: string): ProductionLine {
    const factory = this.getById(factoryId);
    if (!factory) {
      throw new Error('厂区不存在');
    }

    const id = crypto.randomUUID();
    const stmt = db.prepare(`
      INSERT INTO production_lines (id, factory_id, name, code, description)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, factoryId, data.name, data.code, data.description);

    auditLogService.log(operator, 'create', 'factory', id, `创建生产线: ${data.name} (${data.code})，所属厂区: ${factory.name}`);

    return this.getProductionLineById(id)!;
  }

  getProductionLineById(id: string): ProductionLine | null {
    const stmt = db.prepare('SELECT * FROM production_lines WHERE id = ?');
    const row = stmt.get(id) as any;
    return row ? this.mapToProductionLine(row) : null;
  }

  private mapToFactory(row: any): Factory {
    return {
      id: row.id,
      name: row.name,
      code: row.code,
      address: row.address,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapToProductionLine(row: any): ProductionLine {
    return {
      id: row.id,
      factoryId: row.factory_id,
      name: row.name,
      code: row.code,
      description: row.description,
      createdAt: row.created_at,
    };
  }
}

export default new FactoryService();
