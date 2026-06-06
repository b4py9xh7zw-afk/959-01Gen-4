import { Request, Response } from 'express';
import settingsService from '../services/SettingsService.js';
import type { SystemSettings } from '../../shared/types.js';

export const getSettings = (req: Request, res: Response) => {
  try {
    const settings = settingsService.get();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: '获取系统设置失败' });
  }
};

export const updateSettings = (req: Request, res: Response) => {
  try {
    const settings = req.body as Partial<SystemSettings>;
    const operator = req.headers['x-operator'] as string || 'admin';

    const updated = settingsService.update(settings, operator);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message || '更新系统设置失败' });
  }
};
