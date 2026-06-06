import { Router } from 'express';
import { listCertificates, getCertificate, createCertificate, revokeCertificate } from '../controllers/CertificateController.js';

const router = Router();

router.get('/', listCertificates);
router.get('/:id', getCertificate);
router.post('/', createCertificate);
router.post('/:id/revoke', revokeCertificate);

export default router;
