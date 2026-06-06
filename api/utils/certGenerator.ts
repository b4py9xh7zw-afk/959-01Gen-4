import crypto from 'crypto';

export interface GeneratedCertificate {
  serialNumber: string;
  subject: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
  pemContent: string;
}

export function generateCertificate(gatewaySn: string, validDays: number): GeneratedCertificate {
  const serialNumber = crypto.randomBytes(16).toString('hex').toUpperCase();
  const now = new Date();
  const validFrom = new Date(now.getTime());
  const validTo = new Date(now.getTime() + validDays * 24 * 60 * 60 * 1000);

  const subject = `CN=${gatewaySn}, O=IndustrialGateway, OU=IoT, C=CN`;
  const issuer = `CN=IndustrialCA, O=IndustrialGateway, OU=CertificateAuthority, C=CN`;

  const keyPair = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  const certInfo = [
    '-----BEGIN CERTIFICATE-----',
    `Serial Number: ${serialNumber}`,
    `Subject: ${subject}`,
    `Issuer: ${issuer}`,
    `Valid From: ${validFrom.toISOString()}`,
    `Valid To: ${validTo.toISOString()}`,
    '',
    'Public Key:',
    keyPair.publicKey.replace(/\n$/, ''),
    '',
    'Signature: ' + crypto.sign('sha256', Buffer.from(subject + serialNumber), keyPair.privateKey).toString('base64'),
    '-----END CERTIFICATE-----',
    '',
    '-----BEGIN PRIVATE KEY-----',
    keyPair.privateKey.replace(/^-----BEGIN PRIVATE KEY-----\n?/, '').replace(/\n?-----END PRIVATE KEY-----\n?$/, ''),
    '-----END PRIVATE KEY-----',
  ].join('\n');

  return {
    serialNumber,
    subject,
    issuer,
    validFrom,
    validTo,
    pemContent: certInfo,
  };
}

export function calculateDaysRemaining(validTo: string | Date): number {
  const endDate = typeof validTo === 'string' ? new Date(validTo) : validTo;
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
