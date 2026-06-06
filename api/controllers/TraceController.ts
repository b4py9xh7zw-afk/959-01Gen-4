import { Request, Response } from 'express';
import traceService from '../services/TraceService.js';
import auditLogService from '../services/AuditLogService.js';

export const listCollectedData = (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const gatewayId = req.query.gatewayId as string;
    const startTime = req.query.startTime as string;
    const endTime = req.query.endTime as string;

    const result = traceService.listCollectedData({
      page,
      pageSize,
      gatewayId,
      startTime,
      endTime,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: '获取采集数据失败' });
  }
};

export const listAuditLogs = (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const targetType = req.query.targetType as string;
    const action = req.query.action as string;

    const result = auditLogService.list({
      page,
      pageSize,
      targetType,
      action,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: '获取审计日志失败' });
  }
};
