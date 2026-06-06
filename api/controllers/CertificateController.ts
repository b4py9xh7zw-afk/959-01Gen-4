import { Request, Response } from 'express';
import certificateService from '../services/CertificateService.js';
import type { CreateCertificateRequest, RevokeCertificateRequest } from '../../shared/types.js';
import { cleanQueryParam } from '../utils/queryHelper.js';

export const listCertificates = (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const status = cleanQueryParam(req.query.status);
    const factoryId = cleanQueryParam(req.query.factoryId);
    const productionLineId = cleanQueryParam(req.query.productionLineId);

    const result = certificateService.list({
      page,
      pageSize,
      status,
      factoryId,
      productionLineId,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: '获取证书列表失败' });
  }
};

export const getCertificate = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cert = certificateService.getById(id);

    if (!cert) {
      return res.status(404).json({ error: '证书不存在' });
    }

    res.json(cert);
  } catch (error) {
    res.status(500).json({ error: '获取证书详情失败' });
  }
};

export const createCertificate = (req: Request, res: Response) => {
  try {
    const { gatewayId, validDays } = req.body as CreateCertificateRequest;
    const operator = req.headers['x-operator'] as string || 'admin';

    if (!gatewayId) {
      return res.status(400).json({ error: '网关ID不能为空' });
    }

    const cert = certificateService.create(gatewayId, operator, validDays);
    res.status(201).json(cert);
  } catch (error: any) {
    res.status(400).json({ error: error.message || '创建证书失败' });
  }
};

export const revokeCertificate = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body as RevokeCertificateRequest;
    const operator = req.headers['x-operator'] as string || 'admin';

    if (!reason) {
      return res.status(400).json({ error: '吊销原因不能为空' });
    }

    const cert = certificateService.revoke(id, reason, operator);
    res.json(cert);
  } catch (error: any) {
    res.status(400).json({ error: error.message || '吊销证书失败' });
  }
};
