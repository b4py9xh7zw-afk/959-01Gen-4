import { Request, Response } from 'express';
import gatewayService from '../services/GatewayService.js';
import type { CreateGatewayRequest } from '../../shared/types.js';
import { cleanQueryParam } from '../utils/queryHelper.js';

export const listGateways = (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const factoryId = cleanQueryParam(req.query.factoryId);
    const status = cleanQueryParam(req.query.status);

    const result = gatewayService.list({
      page,
      pageSize,
      factoryId,
      status,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: '获取网关列表失败' });
  }
};

export const listAllGateways = (req: Request, res: Response) => {
  try {
    const gateways = gatewayService.listAll();
    res.json(gateways);
  } catch (error) {
    res.status(500).json({ error: '获取网关列表失败' });
  }
};

export const listGatewaysWithoutCertificate = (req: Request, res: Response) => {
  try {
    const gateways = gatewayService.listWithoutCertificate();
    res.json(gateways);
  } catch (error) {
    res.status(500).json({ error: '获取网关列表失败' });
  }
};

export const getGateway = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const gateway = gatewayService.getById(id);

    if (!gateway) {
      return res.status(404).json({ error: '网关不存在' });
    }

    res.json(gateway);
  } catch (error) {
    res.status(500).json({ error: '获取网关详情失败' });
  }
};

export const createGateway = (req: Request, res: Response) => {
  try {
    const data = req.body as CreateGatewayRequest;
    const operator = req.headers['x-operator'] as string || 'admin';

    if (!data.name || !data.sn || !data.factoryId || !data.productionLineId) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    const gateway = gatewayService.create(data, operator);
    res.status(201).json(gateway);
  } catch (error: any) {
    res.status(400).json({ error: error.message || '创建网关失败' });
  }
};
