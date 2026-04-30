import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import ClientOverview from '../components/dashboard/ClientOverview';
import MyProjects from './client/MyProjects';
import Developers from './client/Developers';
import Messages from './shared/Messages';
import Settings from './shared/Settings';
import Payments from './shared/Payments';
import Checkout from './client/Checkout';
import ProjectTracker from './client/ProjectTracker';
import ProjectReview from './client/ProjectReview';
import Submissions from './shared/Submissions';
import Profile from './client/Profile';
import Test from './client/Test';

const ClientDashboard = () => {
  return (
    <div className="flex min-h-screen bg-white w-full overflow-hidden">
      <Sidebar role="client" />
      
      <main className="flex-1 overflow-y-auto md:pl-[280px] w-full">
        <Routes>
          <Route path="/" element={<ClientOverview />} />
          <Route path="/projects" element={<MyProjects />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/developers" element={<Developers />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/checkout/:id" element={<Checkout />} />
          <Route path="/track/:projectId" element={<ProjectTracker />} />
          <Route path="/review/:projectId" element={<ProjectReview />} />
          <Route path="/test" element={<Test />} />
          <Route path="/submissions" element={<Submissions />} />
        </Routes>
      </main>
    </div>
  );
};

export default ClientDashboard;
