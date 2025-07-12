import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowLeftRight, 
  Star,
  Trash2,
  MessageSquare,
  User
} from 'lucide-react';

function SwapRequests() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('received');
  const [requests, setRequests] = useState({
    received: [],
    sent: [],
    active: [],
    completed: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    // Mock data for swap requests
    const mockRequests = {
      received: [
        {
          id: 1,
          fromUser: { id: 2, name: 'Sarah Johnson', rating: 4.9 },
          offeredSkill: 'Python',
          wantedSkill: 'JavaScript',
          message: 'Hi! I\'d love to swap Python knowledge for JavaScript. I have 5 years of experience in data science.',
          status: 'pending',
          createdAt: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          fromUser: { id: 3, name: 'Mike Chen', rating: 4.7 },
          offeredSkill: 'React',
          wantedSkill: 'Node.js',
          message: 'Hello! I\'m experienced in React and would like to learn Node.js. Let\'s swap skills!',
          status: 'pending',
          createdAt: '2024-01-14T15:20:00Z'
        }
      ],
      sent: [
        {
          id: 3,
          toUser: { id: 4, name: 'Emma Davis', rating: 4.8 },
          offeredSkill: 'JavaScript',
          wantedSkill: 'UX Design',
          message: 'Hi Emma! I\'d love to learn UX Design from you. I can teach JavaScript in return.',
          status: 'pending',
          createdAt: '2024-01-13T09:15:00Z'
        }
      ],
      active: [
        {
          id: 4,
          otherUser: { id: 5, name: 'Alex Rodriguez', rating: 4.6 },
          offeredSkill: 'JavaScript',
          wantedSkill: 'DevOps',
          status: 'active',
          startedAt: '2024-01-10T14:00:00Z'
        }
      ],
      completed: [
        {
          id: 5,
          otherUser: { id: 6, name: 'Lisa Wang', rating: 4.9 },
          offeredSkill: 'React',
          wantedSkill: 'Digital Marketing',
          status: 'completed',
          completedAt: '2024-01-05T16:30:00Z',
          feedback: null
        }
      ]
    };

    setTimeout(() => {
      setRequests(mockRequests);
      setLoading(false);
    }, 500);
  }, []);

  const handleAcceptRequest = (requestId) => {
    setRequests(prev => ({
      ...prev,
      received: prev.received.filter(req => req.id !== requestId),
      active: [...prev.active, {
        ...prev.received.find(req => req.id === requestId),
        status: 'active',
        startedAt: new Date().toISOString()
      }]
    }));
  };

  const handleRejectRequest = (requestId) => {
    setRequests(prev => ({
      ...prev,
      received: prev.received.filter(req => req.id !== requestId)
    }));
  };

  const handleDeleteRequest = (requestId) => {
    setRequests(prev => ({
      ...prev,
      sent: prev.sent.filter(req => req.id !== requestId)
    }));
  };

  const handleCompleteSwap = (requestId) => {
    const activeRequest = requests.active.find(req => req.id === requestId);
    setRequests(prev => ({
      ...prev,
      active: prev.active.filter(req => req.id !== requestId),
      completed: [...prev.completed, {
        ...activeRequest,
        status: 'completed',
        completedAt: new Date().toISOString()
      }]
    }));
  };

  const handleLeaveFeedback = (request) => {
    setSelectedRequest(request);
    setShowFeedbackModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTabCount = (tab) => {
    return requests[tab]?.length || 0;
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Swap Requests</h1>
        <p className="text-gray-600">Manage your skill swap requests and track active swaps</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {[
            { key: 'received', label: 'Received' },
            { key: 'sent', label: 'Sent' },
            { key: 'active', label: 'Active' },
            { key: 'completed', label: 'Completed' }
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
              {tab.label}
              {getTabCount(tab.key) > 0 && (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  activeTab === tab.key 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {getTabCount(tab.key)}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Received Requests */}
      {activeTab === 'received' && (
        <div className="space-y-6">
          {requests.received.length > 0 ? (
            requests.received.map(request => (
              <div key={request.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{request.fromUser.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Star size={14} className="text-yellow-500" fill="currentColor" />
                        {request.fromUser.rating}
                        <span>•</span>
                        <span>{formatDate(request.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-warning">
                    <Clock size={14} />
                    Pending
                  </span>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <span className="badge badge-primary">{request.offeredSkill}</span>
                    <ArrowLeftRight className="text-blue-600" size={20} />
                    <span className="badge badge-success">{request.wantedSkill}</span>
                  </div>
                  <p className="text-sm text-blue-800 text-center">
                    They want to teach you <strong>{request.offeredSkill}</strong> in exchange for learning <strong>{request.wantedSkill}</strong>
                  </p>
                </div>

                {request.message && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare size={16} className="text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Message:</span>
                    </div>
                    <p className="text-sm text-gray-700">{request.message}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => handleAcceptRequest(request.id)}
                    className="btn btn-success flex-1"
                  >
                    <CheckCircle size={16} />
                    Accept
                  </button>
                  <button
                    onClick={() => handleRejectRequest(request.id)}
                    className="btn btn-danger flex-1"
                  >
                    <XCircle size={16} />
                    Decline
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
              <p className="text-gray-600">You don't have any pending swap requests.</p>
            </div>
          )}
        </div>
      )}

      {/* Sent Requests */}
      {activeTab === 'sent' && (
        <div className="space-y-6">
          {requests.sent.length > 0 ? (
            requests.sent.map(request => (
              <div key={request.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="text-green-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">To: {request.toUser.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Star size={14} className="text-yellow-500" fill="currentColor" />
                        {request.toUser.rating}
                        <span>•</span>
                        <span>{formatDate(request.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge badge-warning">
                      <Clock size={14} />
                      Pending
                    </span>
                    <button
                      onClick={() => handleDeleteRequest(request.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Cancel request"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <span className="badge badge-primary">{request.offeredSkill}</span>
                    <ArrowLeftRight className="text-green-600" size={20} />
                    <span className="badge badge-success">{request.wantedSkill}</span>
                  </div>
                  <p className="text-sm text-green-800 text-center">
                    You offered to teach <strong>{request.offeredSkill}</strong> in exchange for learning <strong>{request.wantedSkill}</strong>
                  </p>
                </div>

                {request.message && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare size={16} className="text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Your message:</span>
                    </div>
                    <p className="text-sm text-gray-700">{request.message}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <ArrowLeftRight className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sent requests</h3>
              <p className="text-gray-600">You haven't sent any swap requests yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Active Swaps */}
      {activeTab === 'active' && (
        <div className="space-y-6">
          {requests.active.length > 0 ? (
            requests.active.map(request => (
              <div key={request.id} className="card border-green-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="text-green-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{request.otherUser.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Star size={14} className="text-yellow-500" fill="currentColor" />
                        {request.otherUser.rating}
                        <span>•</span>
                        <span>Started {formatDate(request.startedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-success">
                    <CheckCircle size={14} />
                    Active
                  </span>
                </div>

                <div className="bg-green-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <span className="badge badge-primary">{request.offeredSkill}</span>
                    <ArrowLeftRight className="text-green-600" size={20} />
                    <span className="badge badge-success">{request.wantedSkill}</span>
                  </div>
                  <p className="text-sm text-green-800 text-center">
                    Teaching <strong>{request.offeredSkill}</strong> • Learning <strong>{request.wantedSkill}</strong>
                  </p>
                </div>

                <button
                  onClick={() => handleCompleteSwap(request.id)}
                  className="btn btn-success w-full"
                >
                  <CheckCircle size={16} />
                  Mark as Completed
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active swaps</h3>
              <p className="text-gray-600">You don't have any active skill swaps.</p>
            </div>
          )}
        </div>
      )}

      {/* Completed Swaps */}
      {activeTab === 'completed' && (
        <div className="space-y-6">
          {requests.completed.length > 0 ? (
            requests.completed.map(request => (
              <div key={request.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="text-purple-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{request.otherUser.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Star size={14} className="text-yellow-500" fill="currentColor" />
                        {request.otherUser.rating}
                        <span>•</span>
                        <span>Completed {formatDate(request.completedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-success">
                    <CheckCircle size={14} />
                    Completed
                  </span>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <span className="badge badge-primary">{request.offeredSkill}</span>
                    <ArrowLeftRight className="text-purple-600" size={20} />
                    <span className="badge badge-success">{request.wantedSkill}</span>
                  </div>
                  <p className="text-sm text-purple-800 text-center">
                    Successfully swapped skills with {request.otherUser.name}
                  </p>
                </div>

                {!request.feedback && (
                  <button
                    onClick={() => handleLeaveFeedback(request)}
                    className="btn btn-outline w-full"
                  >
                    <Star size={16} />
                    Leave Feedback
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No completed swaps</h3>
              <p className="text-gray-600">You haven't completed any skill swaps yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SwapRequests;