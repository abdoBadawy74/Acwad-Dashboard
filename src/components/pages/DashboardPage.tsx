import React, { useState, useEffect } from 'react';
import { Users, Star, Briefcase, Settings, Activity, TrendingUp } from 'lucide-react';
import { apiService } from '../../services/api';

interface DashboardStats {
  subscribers: number;
  reviews: number;
  services: number;
  projects: number;
}

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    subscribers: 0,
    reviews: 0,
    services: 0,
    projects: 0
  });
  const [loading, setLoading] = useState(true);
  const [healthStatus, setHealthStatus] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch health status
      const health = await apiService.healthCheck();
      setHealthStatus(health.data);

      // Fetch basic counts (you might want to create dedicated endpoints for this)
      const [subscribersRes, reviewsRes, servicesRes, projectsRes] = await Promise.all([
        apiService.getAll('/api/subscribers', { limit: 1 }),
        apiService.getAll('/api/customer-reviews', { limit: 1 }),
        apiService.getAll('/api/services', { limit: 1 }),
        apiService.getAll('/api/projects', { limit: 1 })
      ]);

      setStats({
        subscribers: subscribersRes.pagination?.total || 0,
        reviews: reviewsRes.pagination?.total || 0,
        services: servicesRes.pagination?.total || 0,
        projects: projectsRes.pagination?.total || 0
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, change, color }: any) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{loading ? '...' : value}</p>
          {change && (
            <div className="flex items-center mt-2">
              <TrendingUp size={16} className="text-green-500 mr-1" />
              <span className="text-green-600 text-sm font-medium">{change}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-600">Welcome back! Here's what's happening with your company website.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total Subscribers"
          value={stats.subscribers}
          change="+12% from last month"
          color="bg-blue-500"
        />
        <StatCard
          icon={Star}
          title="Customer Reviews"
          value={stats.reviews}
          change="+8% from last month"
          color="bg-yellow-500"
        />
        <StatCard
          icon={Briefcase}
          title="Services"
          value={stats.services}
          color="bg-green-500"
        />
        <StatCard
          icon={Settings}
          title="Projects"
          value={stats.projects}
          change="+15% from last month"
          color="bg-purple-500"
        />
      </div>

      {/* Health Status */}
      {healthStatus && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="text-green-500" size={20} />
            <h2 className="text-lg font-semibold text-slate-900">System Health</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-green-800 font-semibold">Database</p>
              <p className="text-green-600 text-sm">{healthStatus.database}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-semibold">Uptime</p>
              <p className="text-blue-600 text-sm">{Math.floor(healthStatus.uptime / 3600)}h</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-purple-800 font-semibold">Environment</p>
              <p className="text-purple-600 text-sm capitalize">{healthStatus.environment}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 text-left border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Users className="text-blue-500 mb-2" size={20} />
            <p className="font-medium">Manage Subscribers</p>
            <p className="text-sm text-slate-600">Add or edit subscribers</p>
          </button>
          <button className="p-4 text-left border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Star className="text-yellow-500 mb-2" size={20} />
            <p className="font-medium">Review Management</p>
            <p className="text-sm text-slate-600">Moderate customer reviews</p>
          </button>
          <button className="p-4 text-left border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Briefcase className="text-green-500 mb-2" size={20} />
            <p className="font-medium">Add Service</p>
            <p className="text-sm text-slate-600">Create new service offerings</p>
          </button>
          <button className="p-4 text-left border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Settings className="text-slate-500 mb-2" size={20} />
            <p className="font-medium">Site Settings</p>
            <p className="text-sm text-slate-600">Configure website settings</p>
          </button>
        </div>
      </div>
    </div>
  );
};