import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Users, 
  ArrowLeftRight, 
  Star, 
  TrendingUp, 
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pendingRequests: 3,
    activeSwaps: 2,
    completedSwaps: user?.completedSwaps || 0,
    rating: user?.rating || 0
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'request_received',
      message: 'Sarah Johnson wants to swap Python for JavaScript',
      time: '2 hours ago',
      status: 'pending'
    },
    {
      id: 2,
      type: 'swap_completed',
      message: 'Completed swap with Mike Chen',
      time: '1 day ago',
      status: 'completed'
    },
    {
      id: 3,
      type: 'request_sent',
      message: 'Requested Machine Learning from Emma Davis',
      time: '2 days ago',
      status: 'pending'
    }
  ]);

  const getActivityIcon = (type, status) => {
    if (type === 'request_received') return <ArrowLeftRight className="text-blue-500" size={20} />;
    if (type === 'swap_completed') return <CheckCircle className="text-green-500" size={20} />;
    if (type === 'request_sent') return <Clock className="text-yellow-500" size={20} />;
    return <AlertCircle className="text-gray-500" size={20} />;
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your skill swaps
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-blue-600">{stats.pendingRequests}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Clock className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Swaps</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeSwaps}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <ArrowLeftRight className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Swaps</p>
              <p className="text-2xl font-bold text-purple-600">{stats.completedSwaps}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <CheckCircle className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Your Rating</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.rating.toFixed(1)}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Star className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent Activity</h2>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type, activity.status)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                  <span className={`badge ${
                    activity.status === 'completed' ? 'badge-success' :
                    activity.status === 'pending' ? 'badge-warning' : 'badge-primary'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Link to="/swaps" className="btn btn-outline w-full">
                View All Swap Requests
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Quick Actions</h2>
            </div>
            <div className="space-y-3">
              <Link to="/browse" className="btn btn-primary w-full">
                <Users size={20} />
                Browse Users
              </Link>
              <Link to="/profile" className="btn btn-secondary w-full">
                <Star size={20} />
                Update Profile
              </Link>
              <Link to="/swaps" className="btn btn-outline w-full">
                <ArrowLeftRight size={20} />
                Manage Swaps
              </Link>
            </div>
          </div>

          {/* Skills Summary */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Your Skills</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Skills Offered</h4>
                <div className="flex flex-wrap gap-2">
                  {user?.skillsOffered?.slice(0, 3).map((skill, index) => (
                    <span key={index} className="badge badge-primary">
                      {skill}
                    </span>
                  ))}
                  {user?.skillsOffered?.length > 3 && (
                    <span className="badge badge-primary">
                      +{user.skillsOffered.length - 3} more
                    </span>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Skills Wanted</h4>
                <div className="flex flex-wrap gap-2">
                  {user?.skillsWanted?.slice(0, 3).map((skill, index) => (
                    <span key={index} className="badge badge-warning">
                      {skill}
                    </span>
                  ))}
                  {user?.skillsWanted?.length > 3 && (
                    <span className="badge badge-warning">
                      +{user.skillsWanted.length - 3} more
                    </span>
                  )}
                </div>
              </div>
              <Link to="/profile" className="text-sm text-blue-600 hover:text-blue-700">
                Update skills →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;