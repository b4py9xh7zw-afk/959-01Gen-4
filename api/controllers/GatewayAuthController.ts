import { Request, Response } from 'express';
import authService from '../services/AuthService.js';

export const authenticateGateway = (req: Request, res: Response) => {
  try {
    const { sn } = req.query;

    if (!sn) {
      return res.status(400).json({ error: '网关序列号不能为空' });
    }

    const result = authService.authenticateGateway(sn as string);
    authService.recordConnectionAttempt(sn as string, result.allowed, result.reason);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: '网关认证失败' });
  }
};
