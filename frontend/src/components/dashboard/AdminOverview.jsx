import { useState, useEffect } from 'react';
import { Users, Briefcase, DollarSign, Activity, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../../api';

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.getPlatformStats();
        setStats(response.data);
      } catch (err) {
        console.error('Failed to fetch platform stats:', err);
        setError('Failed to load real-time analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const statCards = [
    { 
      label: 'Total Users', 
      value: stats?.totalUsers?.toLocaleString() || '0', 
      icon: <Users />, 
      color: 'bg-indigo-100 text-indigo-600' 
    },
    { 
      label: 'Active Projects', 
      value: stats?.activeProjects?.toLocaleString() || '0', 
      icon: <Briefcase />, 
      color: 'bg-blue-100 text-blue-600' 
    },
    { 
      label: 'Clients', 
      value: stats?.clients?.toLocaleString() || '0', 
      icon: <DollarSign />, 
      color: 'bg-green-100 text-green-600' 
    },
    { 
      label: 'Platform Health', 
      value: '99.9%', 
      icon: <Activity />, 
      color: 'bg-purple-100 text-purple-600' 
    }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="mb-10">
        <h1 className="text-2xl font-bold font-heading text-slate-900">Platform Analytics</h1>
        <p className="text-slate-500 mt-1">Overview of LocalDev Connect performance.</p>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500">{stat.label}</div>
              <div className="text-2xl font-bold font-heading text-slate-900">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 font-heading mb-6">Recent Platform Activity</h2>
          
          <div className="space-y-6">
            {[
              { text: 'New student registered: Sarah Chen', time: '5 mins ago', type: 'user' },
              { text: 'Project "E-commerce Redesign" payment processed', time: '1 hour ago', type: 'payment' },
              { text: 'Client Jane posted a new requirement', time: '2 hours ago', type: 'project' },
              { text: 'Automated Certificate dispatched to Alex Johnson', time: '5 hours ago', type: 'system' }
            ].map((activity, i) => (
              <div key={i} className="flex gap-4">
                <div className="mt-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/10"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{activity.text}</p>
                  <p className="text-xs text-slate-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900 font-heading">System Alerts</h2>
            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-md">1 Warning</span>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-amber-800 text-sm">High Load on Matching Engine</h4>
              <p className="text-amber-700 text-xs mt-1">The AI developer recommendation queue is experiencing delays. Consider scaling the FastAPI workers.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
