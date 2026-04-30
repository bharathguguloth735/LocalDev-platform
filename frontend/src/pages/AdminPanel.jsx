import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import AdminOverview from '../components/dashboard/AdminOverview';
import AdminUsers from '../components/dashboard/AdminUsers';
import AdminProjects from '../components/dashboard/AdminProjects';
import AdminCertificates from '../components/dashboard/AdminCertificates';
import AdminSettings from '../components/dashboard/AdminSettings';

const AdminPanel = () => {
  return (
    <div className="flex min-h-screen bg-slate-50 w-full overflow-x-hidden">
      <Sidebar role="admin" />
      <main className="flex-1 md:ml-[280px] pt-16 md:pt-24 overflow-y-auto w-full transition-all duration-500">
        <Routes>
          <Route path="/" element={<AdminOverview />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/projects" element={<AdminProjects />} />
          <Route path="/certificates" element={<AdminCertificates />} />
          <Route path="/settings" element={<AdminSettings />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminPanel;
