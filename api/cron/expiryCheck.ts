import cron, { type ScheduledTask } from 'node-cron';
import certificateService from '../services/CertificateService.js';
import settingsService from '../services/SettingsService.js';
import { calculateDaysRemaining } from '../utils/certGenerator.js';

class ExpiryCheckScheduler {
  private task: ScheduledTask | null = null;

  start() {
    console.log('启动证书过期检查定时任务，每日00:00执行');

    this.task = cron.schedule('0 0 0 * * *', () => {
      this.runCheck();
    }, {
      timezone: 'Asia/Shanghai',
    });

    this.runCheck();
  }

  stop() {
    if (this.task) {
      this.task.stop();
      console.log('证书过期检查定时任务已停止');
    }
  }

  private async runCheck() {
    console.log('[定时任务] 开始检查证书过期状态...');

    try {
      certificateService.checkAndUpdateExpired();

      const expiring = certificateService.getExpiringCertificates();
      const settings = settingsService.get();

      if (expiring.length > 0) {
        console.log(`[定时任务] 发现 ${expiring.length} 个即将过期的证书（${settings.expireWarningDays}天内）:`);
        expiring.forEach(cert => {
          console.log(`  - ${cert.gatewaySn} (${cert.gatewayName}): 剩余 ${cert.daysRemaining} 天`);
        });
      } else {
        console.log('[定时任务] 没有即将过期的证书');
      }

      const now = new Date();
      const countStmt = (await import('../db/database.js')).default.prepare(
        'UPDATE certificates SET status = ? WHERE status = ? AND valid_to < ?'
      );
      const result = countStmt.run('expired', 'valid', now.toISOString());
      if (result.changes > 0) {
        console.log(`[定时任务] 自动标记 ${result.changes} 个已过期证书`);
      }

      console.log('[定时任务] 证书过期检查完成');
    } catch (error) {
      console.error('[定时任务] 证书过期检查失败:', error);
    }
  }
}

export default new ExpiryCheckScheduler();
