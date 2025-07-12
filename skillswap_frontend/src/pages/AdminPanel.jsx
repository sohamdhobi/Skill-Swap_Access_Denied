import React, { useState, useEffect } from 'react';
import { 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  BarChart3,
  Download,
  MessageSquare,
  Shield,
  Eye,
  Ban
} from 'lucide-react';

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 156,
    activeSwaps: 23,
    completedSwaps: 89,
    pendingReports: 3,
    bannedUsers: 2
  });
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock admin data
    const mockUsers = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        status: 'active',
        joinDate: '2024-01-10',
        swapsCompleted: 12,
        rating: 4.8,
        reports: 0
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        status: 'active',
        joinDate: '2024-01-08',
        swapsCompleted: 15,
        rating: 4.9,
        reports: 0
      },
      {
        id: 3,
        name: 'Suspicious User',
        email: 'suspicious@example.com',
        status: 'reported',
        joinDate: '2024-01-15',
        swapsCompleted: 1,
        rating: 2.1,
        reports: 3
      }
    ];

    const mockReports = [
      {
        id: 1,
        reportedUser: 'Suspicious User',
        reportedBy: 'Sarah Johnson',
        reason: 'Inappropriate behavior during skill session',
        status: 'pending',
        createdAt: '2024-01-16',
        description: 'User was unprofessional and didn\'t deliver promised teaching quality.'
      },
      {
        id: 2,
        reportedUser: 'Suspicious User',
        reportedBy: 'Mike Chen',
        reason: 'Spam/Fake profile',
        status: 'pending',
        createdAt: '2024-01-15',
        description: 'Profile seems fake with unrealistic skill claims.'
      }
    ];

    setTimeout(() => {
      setUsers(mockUsers);
      setReports(mockReports);
      setLoading(false);
    }, 500);
  }, []);

  const handleBanUser = (userId) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: 'banned' }
        : user
    ));
    setStats(prev => ({ ...prev, bannedUsers: prev.bannedUsers + 1 }));
  };

  const handleResolveReport = (reportId, action) => {
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, status: action }
        : report
    ));
    setStats(prev => ({ ...prev, pendingReports: prev.pendingReports - 1 }));
  };

  const handleDownloadReport = () => {
    // Mock download functionality
    const reportData = {
      totalUsers: stats.totalUsers,
      activeSwaps: stats.activeSwaps,
      completedSwaps: stats.completedSwaps,
      userGrowth: '15% this month',
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skillswap-report.json';
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          <Shield className="inline mr-3" size={32} />
          Admin Panel
        </h1>
        <p className="text-gray-600">Platform management and moderation tools</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', icon: BarChart3 },
            { key: 'users', label: 'Users', icon: Users },
            { key: 'reports', label: 'Reports', icon: AlertTriangle }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {tab.key === 'reports' && stats.pendingReports > 0 && (
                <span className="bg-red-100 text-red-600 px-2 py-1 text-xs rounded-full">
                  {stats.pendingReports}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
                </div>
                <Users className="text-blue-600" size={24} />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Swaps</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeSwaps}</p>
                </div>
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Swaps</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.completedSwaps}</p>
                </div>
                <BarChart3 className="text-purple-600" size={24} />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Reports</p>
                  <p className="text-2xl font-bold text-red-600">{stats.pendingReports}</p>
                </div>
                <AlertTriangle className="text-red-600" size={24} />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Banned Users</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.bannedUsers}</p>
                </div>
                <Ban className="text-gray-600" size={24} />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleDownloadReport}
                className="btn btn-primary"
              >
                <Download size={16} />
                Download Platform Report
              </button>
              <button className="btn btn-secondary">
                <MessageSquare size={16} />
                Send Platform Announcement
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent Activity</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="text-green-600" size={20} />
                <span className="text-sm">Sarah Johnson completed a swap with Mike Chen</span>
                <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Users className="text-blue-600" size={20} />
                <span className="text-sm">New user Emma Davis joined the platform</span>
                <span className="text-xs text-gray-500 ml-auto">4 hours ago</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="text-red-600" size={20} />
                <span className="text-sm">New report submitted against Suspicious User</span>
                <span className="text-xs text-gray-500 ml-auto">6 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">User Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Join Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Swaps</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Rating</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Reports</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`badge ${
                          user.status === 'active' ? 'badge-success' :
                          user.status === 'banned' ? 'badge-danger' : 'badge-warning'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{user.joinDate}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{user.swapsCompleted}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{user.rating}</td>
                      <td className="py-3 px-4">
                        {user.reports > 0 ? (
                          <span className="badge badge-danger">{user.reports}</span>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button className="text-blue-600 hover:text-blue-700 p-1" title="View Profile">
                            <Eye size={16} />
                          </button>
                          {user.status !== 'banned' && (
                            <button 
                              onClick={() => handleBanUser(user.id)}
                              className="text-red-600 hover:text-red-700 p-1" 
                              title="Ban User"
                            >
                              <Ban size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {reports.filter(report => report.status === 'pending').length > 0 ? (
            reports.filter(report => report.status === 'pending').map(report => (
              <div key={report.id} className="card border-red-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Report against {report.reportedUser}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Reported by {report.reportedBy} on {report.createdAt}
                    </p>
                  </div>
                  <span className="badge badge-danger">
                    <AlertTriangle size={14} />
                    {report.status}
                  </span>
                </div>

                <div className="bg-red-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-red-900 mb-2">Reason: {report.reason}</h4>
                  <p className="text-sm text-red-800">{report.description}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleResolveReport(report.id, 'resolved')}
                    className="btn btn-success flex-1"
                  >
                    <CheckCircle size={16} />
                    Resolve
                  </button>
                  <button
                    onClick={() => handleResolveReport(report.id, 'dismissed')}
                    className="btn btn-outline flex-1"
                  >
                    <XCircle size={16} />
                    Dismiss
                  </button>
                  <button
                    onClick={() => handleBanUser(3)} // Assuming reported user has ID 3
                    className="btn btn-danger flex-1"
                  >
                    <Ban size={16} />
                    Ban User
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending reports</h3>
              <p className="text-gray-600">All reports have been reviewed and resolved.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;