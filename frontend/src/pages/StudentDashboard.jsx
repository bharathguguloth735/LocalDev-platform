import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import StudentOverview from '../components/dashboard/StudentOverview';
import JobRequests from './student/JobRequests';
import Portfolio from './student/Portfolio';
import Reviews from './student/Reviews';
import Earnings from './student/Earnings';
import Messages from './shared/Messages';
import Settings from './shared/Settings';
import WithdrawFunds from './student/WithdrawFunds';
import Profile from './student/Profile';
import Certificates from './student/Certificates';
import Submissions from './shared/Submissions';
import ProjectTracker from './client/ProjectTracker';
import MyProjects from './student/MyProjects';

const StudentDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-white w-full overflow-hidden">
      <Sidebar role="student" isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-[70] w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-2xl flex items-center justify-center active:scale-90 transition-all border-none"
      >
        <LayoutDashboard className="w-6 h-6" />
      </button>

      <main className="flex-1 overflow-y-auto w-full md:pl-[280px] transition-all duration-300">
        <div className="max-w-[1600px] mx-auto p-4 md:p-8">
        <Routes>
          <Route path="/" element={<StudentOverview />} />
          <Route path="/projects" element={<MyProjects />} />
          <Route path="/explore" element={<JobRequests />} />
          <Route path="/requests" element={<Navigate to="/student-dashboard/explore" replace />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/earnings" element={<Earnings />} />
          <Route path="/withdraw" element={<WithdrawFunds />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/submissions" element={<Submissions />} />
          <Route path="/track/:projectId" element={<ProjectTracker />} />
        </Routes>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
