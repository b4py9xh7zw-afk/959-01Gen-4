import { Router } from 'express';
import { listFactories, getFactory, createFactory, getProductionLines, createProductionLine } from '../controllers/FactoryController.js';

const router = Router();

router.get('/', listFactories);
router.get('/:id', getFactory);
router.post('/', createFactory);
router.get('/:id/production-lines', getProductionLines);
router.post('/:id/production-lines', createProductionLine);

export default router;
