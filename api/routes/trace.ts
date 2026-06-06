import { Router } from 'express';
import { listCollectedData, listAuditLogs } from '../controllers/TraceController.js';

const router = Router();

router.get('/data', listCollectedData);
router.get('/audit', listAuditLogs);

export default router;
