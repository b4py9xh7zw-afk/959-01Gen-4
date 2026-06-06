import { Request, Response } from 'express';
import factoryService from '../services/FactoryService.js';
import type { CreateFactoryRequest, CreateProductionLineRequest } from '../../shared/types.js';

export const listFactories = (req: Request, res: Response) => {
  try {
    const factories = factoryService.list();
    res.json(factories);
  } catch (error) {
    res.status(500).json({ error: '获取厂区列表失败' });
  }
};

export const getFactory = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const factory = factoryService.getById(id);

    if (!factory) {
      return res.status(404).json({ error: '厂区不存在' });
    }

    res.json(factory);
  } catch (error) {
    res.status(500).json({ error: '获取厂区详情失败' });
  }
};

export const createFactory = (req: Request, res: Response) => {
  try {
    const data = req.body as CreateFactoryRequest;
    const operator = req.headers['x-operator'] as string || 'admin';

    if (!data.name || !data.code) {
      return res.status(400).json({ error: '厂区名称和编码不能为空' });
    }

    const factory = factoryService.create(data, operator);
    res.status(201).json(factory);
  } catch (error: any) {
    res.status(400).json({ error: error.message || '创建厂区失败' });
  }
};

export const getProductionLines = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productionLines = factoryService.getProductionLines(id);
    res.json(productionLines);
  } catch (error) {
    res.status(500).json({ error: '获取生产线列表失败' });
  }
};

export const createProductionLine = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body as CreateProductionLineRequest;
    const operator = req.headers['x-operator'] as string || 'admin';

    if (!data.name || !data.code) {
      return res.status(400).json({ error: '生产线名称和编码不能为空' });
    }

    const productionLine = factoryService.createProductionLine(id, data, operator);
    res.status(201).json(productionLine);
  } catch (error: any) {
    res.status(400).json({ error: error.message || '创建生产线失败' });
  }
};
