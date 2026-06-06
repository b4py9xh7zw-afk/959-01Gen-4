import { Router } from 'express';
import {
  listGateways, listAllGateways, listGatewaysWithoutCertificate, getGateway, createGateway } from '../controllers/GatewayController.js';

const router = Router();

router.get('/', listGateways);
router.get('/all', listAllGateways);
router.get('/without-certificate', listGatewaysWithoutCertificate);
router.get('/:id', getGateway);
router.post('/', createGateway);

export default router;
