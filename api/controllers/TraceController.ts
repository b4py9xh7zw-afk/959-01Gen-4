import { Request, Response } from 'express';
import traceService from '../services/TraceService.js';
import auditLogService from '../services/AuditLogService.js';
import { cleanQueryParam } from '../utils/queryHelper.js';

export const listCollectedData = (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const gatewayId = cleanQueryParam(req.query.gatewayId);
    const startTime = cleanQueryParam(req.query.startTime);
    const endTime = cleanQueryParam(req.query.endTime);

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
    const targetType = cleanQueryParam(req.query.targetType);
    const action = cleanQueryParam(req.query.action);

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
