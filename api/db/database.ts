import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', '..', 'data', 'gateway_certs.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function runMigrations() {
  const migrationPath = path.join(__dirname, '..', '..', 'migrations', '001_initial_schema.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
  db.exec(migrationSQL);
}

function seedInitialData() {
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM system_settings').get() as { count: number };
  if (settingsCount.count === 0) {
    const insertSettings = db.prepare(`
      INSERT INTO system_settings (key, value) VALUES 
      ('expireWarningDays', '30'),
      ('defaultCertValidDays', '365')
    `);
    insertSettings.run();
  }

  const factoryCount = db.prepare('SELECT COUNT(*) as count FROM factories').get() as { count: number };
  if (factoryCount.count === 0) {
    const insertFactories = db.prepare(`
      INSERT INTO factories (id, name, code, address, description) VALUES 
      ('f1', '华东一号厂区', 'F001', '上海市浦东新区工业路1号', '主要生产电子产品'),
      ('f2', '华南二号厂区', 'F002', '深圳市南山区科技园路2号', '主要生产机械设备')
    `);
    insertFactories.run();

    const insertProductionLines = db.prepare(`
      INSERT INTO production_lines (id, factory_id, name, code, description) VALUES 
      ('pl1', 'f1', 'SMT贴片线A', 'PL001', '表面贴装生产线'),
      ('pl2', 'f1', '组装测试线B', 'PL002', '产品组装与测试'),
      ('pl3', 'f2', '机械加工线C', 'PL003', '精密零件加工'),
      ('pl4', 'f2', '焊接生产线D', 'PL004', '自动化焊接')
    `);
    insertProductionLines.run();

    const insertGateways = db.prepare(`
      INSERT INTO gateways (id, name, sn, factory_id, production_line_id, ip_address, status) VALUES 
      ('g1', 'SMT线网关01', 'GW20240001', 'f1', 'pl1', '192.168.1.10', 'online'),
      ('g2', 'SMT线网关02', 'GW20240002', 'f1', 'pl1', '192.168.1.11', 'online'),
      ('g3', '组装线网关01', 'GW20240003', 'f1', 'pl2', '192.168.1.20', 'offline'),
      ('g4', '加工线网关01', 'GW20240004', 'f2', 'pl3', '192.168.2.10', 'online'),
      ('g5', '焊接线网关01', 'GW20240005', 'f2', 'pl4', '192.168.2.20', 'online')
    `);
    insertGateways.run();
  }
}

runMigrations();
seedInitialData();

export default db;
