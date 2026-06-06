import { api } from './client.js';
import type {
  DashboardStats, ExpiringCertificate, RevokedDevice,
  Certificate, Gateway, Factory, ProductionLine,
  CollectedData, AuditLog, SystemSettings,
  PaginationResponse, CreateCertificateRequest,
  RevokeCertificateRequest, CreateGatewayRequest,
  CreateFactoryRequest, CreateProductionLineRequest,
} from '../../shared/types.js';

function buildQueryString(params: Record<string, any>): string {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
  );
  const query = new URLSearchParams(cleanParams).toString();
  return query ? `?${query}` : '';
}

export const dashboardApi = {
  getStats: () => api.get<DashboardStats>('/dashboard/stats'),
  getExpiring: () => api.get<ExpiringCertificate[]>('/dashboard/expiring'),
  getRevoked: () => api.get<RevokedDevice[]>('/dashboard/revoked'),
};

export const certificateApi = {
  list: (params: { page?: number; pageSize?: number; status?: string; factoryId?: string; productionLineId?: string } = {}) => {
    const query = buildQueryString(params);
    return api.get<PaginationResponse<Certificate>>(`/certificates${query}`);
  },
  get: (id: string) => api.get<Certificate>(`/certificates/${id}`),
  create: (data: CreateCertificateRequest) => api.post<Certificate>('/certificates', data),
  revoke: (id: string, data: RevokeCertificateRequest) => api.post<Certificate>(`/certificates/${id}/revoke`, data),
};

export const gatewayApi = {
  list: (params: { page?: number; pageSize?: number; factoryId?: string; status?: string } = {}) => {
    const query = buildQueryString(params);
    return api.get<PaginationResponse<Gateway>>(`/gateways${query}`);
  },
  listAll: () => api.get<Gateway[]>('/gateways/all'),
  listWithoutCertificate: () => api.get<Gateway[]>('/gateways/without-certificate'),
  get: (id: string) => api.get<Gateway>(`/gateways/${id}`),
  create: (data: CreateGatewayRequest) => api.post<Gateway>('/gateways', data),
  auth: (sn: string) => api.get(`/gateway/auth?sn=${sn}`),
};

export const factoryApi = {
  list: () => api.get<Factory[]>('/factories'),
  get: (id: string) => api.get<Factory>(`/factories/${id}`),
  create: (data: CreateFactoryRequest) => api.post<Factory>('/factories', data),
  getProductionLines: (factoryId: string) => api.get<ProductionLine[]>(`/factories/${factoryId}/production-lines`),
  createProductionLine: (factoryId: string, data: CreateProductionLineRequest) =>
    api.post<ProductionLine>(`/factories/${factoryId}/production-lines`, data),
};

export const traceApi = {
  listData: (params: { page?: number; pageSize?: number; gatewayId?: string; startTime?: string; endTime?: string } = {}) => {
    const query = buildQueryString(params);
    return api.get<PaginationResponse<CollectedData>>(`/trace/data${query}`);
  },
  listAuditLogs: (params: { page?: number; pageSize?: number; targetType?: string; action?: string } = {}) => {
    const query = buildQueryString(params);
    return api.get<PaginationResponse<AuditLog>>(`/trace/audit${query}`);
  },
};

export const settingsApi = {
  get: () => api.get<SystemSettings>('/settings'),
  update: (data: Partial<SystemSettings>) => api.put<SystemSettings>('/settings', data),
};
