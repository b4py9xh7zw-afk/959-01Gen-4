import { Router } from 'express';
import { authenticateGateway } from '../controllers/GatewayAuthController.js';

const router = Router();

router.get('/auth', authenticateGateway);

export default router;
