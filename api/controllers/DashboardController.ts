import { Request, Response } from 'express';
import certificateService from '../services/CertificateService.js';

export const getStats = (req: Request, res: Response) => {
  try {
    const stats = certificateService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: '获取统计数据失败' });
  }
};

export const getExpiringCertificates = (req: Request, res: Response) => {
  try {
    const certificates = certificateService.getExpiringCertificates();
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ error: '获取即将过期证书失败' });
  }
};

export const getRevokedDevices = (req: Request, res: Response) => {
  try {
    const devices = certificateService.getRevokedDevices();
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: '获取已吊销设备失败' });
  }
};
