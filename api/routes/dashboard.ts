import { Router } from 'express';
import { getStats, getExpiringCertificates, getRevokedDevices } from '../controllers/DashboardController.js';

const router = Router();

router.get('/stats', getStats);
router.get('/expiring', getExpiringCertificates);
router.get('/revoked', getRevokedDevices);

export default router;
