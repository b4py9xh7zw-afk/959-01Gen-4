export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Factory {
  id: string;
  name: string;
  code: string;
  address: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionLine {
  id: string;
  factoryId: string;
  name: string;
  code: string;
  description: string;
  createdAt: string;
}

export interface Gateway {
  id: string;
  name: string;
  sn: string;
  factoryId: string;
  productionLineId: string;
  ipAddress: string;
  status: 'online' | 'offline' | 'revoked';
  lastHeartbeat: string | null;
  certificateId: string | null;
  createdAt: string;
  factoryName?: string;
  productionLineName?: string;
}

export interface Certificate {
  id: string;
  gatewayId: string;
  gatewaySn: string;
  factoryId: string;
  productionLineId: string;
  serialNumber: string;
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  status: 'valid' | 'expired' | 'revoked';
  revokedAt: string | null;
  revokeReason: string | null;
  pemContent: string;
  createdAt: string;
  factoryName?: string;
  productionLineName?: string;
  gatewayName?: string;
  daysRemaining?: number;
}

export interface CollectedData {
  id: string;
  gatewayId: string;
  gatewaySn: string;
  factoryId: string;
  productionLineId: string;
  dataType: string;
  value: number;
  timestamp: string;
  factoryName?: string;
  productionLineName?: string;
  gatewayName?: string;
}

export interface AuditLog {
  id: string;
  operator: string;
  action: 'create' | 'revoke' | 'update' | 'delete';
  targetType: 'certificate' | 'gateway' | 'factory' | 'settings';
  targetId: string;
  detail: string;
  createdAt: string;
  targetTypeName?: string;
  actionName?: string;
}

export interface SystemSettings {
  expireWarningDays: number;
  defaultCertValidDays: number;
}

export interface GatewayAuthResponse {
  allowed: boolean;
  reason?: string;
  certificateStatus?: string;
}

export interface DashboardStats {
  totalCertificates: number;
  validCertificates: number;
  expiringCertificates: number;
  revokedCertificates: number;
  totalGateways: number;
  onlineGateways: number;
  totalFactories: number;
  totalProductionLines: number;
}

export interface ExpiringCertificate {
  id: string;
  serialNumber: string;
  gatewaySn: string;
  gatewayName: string;
  factoryName: string;
  productionLineName: string;
  validTo: string;
  daysRemaining: number;
}

export interface RevokedDevice {
  id: string;
  gatewaySn: string;
  gatewayName: string;
  factoryName: string;
  productionLineName: string;
  revokedAt: string;
  revokeReason: string;
}

export interface CreateCertificateRequest {
  gatewayId: string;
  validDays?: number;
}

export interface RevokeCertificateRequest {
  reason: string;
}

export interface CreateGatewayRequest {
  name: string;
  sn: string;
  factoryId: string;
  productionLineId: string;
  ipAddress: string;
}

export interface CreateFactoryRequest {
  name: string;
  code: string;
  address: string;
  description: string;
}

export interface CreateProductionLineRequest {
  name: string;
  code: string;
  description: string;
}
