import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout.js';
import { Dashboard } from '@/pages/Dashboard.js';
import { CertificateList } from '@/pages/certificates/CertificateList.js';
import { CertificateApply } from '@/pages/certificates/CertificateApply.js';
import { CertificateDetail } from '@/pages/certificates/CertificateDetail.js';
import { GatewayList } from '@/pages/gateways/GatewayList.js';
import { FactoryList } from '@/pages/factories/FactoryList.js';
import { DataTrace } from '@/pages/trace/DataTrace.js';
import { AuditLogList } from '@/pages/trace/AuditLog.js';
import { SettingsPage } from '@/pages/settings/Settings.js';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/certificates" element={<CertificateList />} />
          <Route path="/certificates/apply" element={<CertificateApply />} />
          <Route path="/certificates/:id" element={<CertificateDetail />} />
          <Route path="/gateways" element={<GatewayList />} />
          <Route path="/factories" element={<FactoryList />} />
          <Route path="/trace" element={<Navigate to="/trace/data" replace />} />
          <Route path="/trace/data" element={<DataTrace />} />
          <Route path="/trace/audit" element={<AuditLogList />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
