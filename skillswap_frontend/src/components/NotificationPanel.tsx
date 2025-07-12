import React, { useState, useEffect } from 'react';
import { Meeting } from '../types';

interface Notification {
  id: string;
  meeting: Meeting;
  timestamp: Date;
  type: 'meeting_started' | 'meeting_reminder' | 'meeting_ended';
  read: boolean;
}

interface NotificationPanelProps {
  notifications: Notification[];
  onJoinMeeting: (meeting: Meeting) => void;
  onDismissNotification: (notificationId: string) => void;
  onMarkAsRead: (notificationId: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onJoinMeeting,
  onDismissNotification,
  onMarkAsRead,
  onClearAll,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show panel when there are notifications
    if (notifications.length > 0) {
      setIsVisible(true);
    }
  }, [notifications]);

  const handleJoin = (meeting: Meeting) => {
    onJoinMeeting(meeting);
    // Mark all notifications for this meeting as read
    notifications
      .filter(n => n.meeting.id === meeting.id)
      .forEach(n => onMarkAsRead(n.id));
  };

  const handleDismiss = (notificationId: string) => {
    onDismissNotification(notificationId);
  };

  const handleMarkAsRead = (notificationId: string) => {
    onMarkAsRead(notificationId);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'meeting_started':
        return '🚀';
      case 'meeting_reminder':
        return '⏰';
      case 'meeting_ended':
        return '✅';
      default:
        return '📢';
    }
  };

  const getNotificationTitle = (type: string, meeting: Meeting) => {
    switch (type) {
      case 'meeting_started':
        return `Meeting Started: ${meeting.title}`;
      case 'meeting_reminder':
        return `Meeting Reminder: ${meeting.title}`;
      case 'meeting_ended':
        return `Meeting Ended: ${meeting.title}`;
      default:
        return `Notification: ${meeting.title}`;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (!isVisible || notifications.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '400px',
      maxHeight: '600px',
      backgroundColor: 'white',
      borderRadius: '10px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      zIndex: 10000,
      overflow: 'hidden',
      border: '1px solid #ddd'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#007bff',
        color: 'white',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopLeftRadius: '10px',
        borderTopRightRadius: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>🔔</span>
          <span style={{ fontWeight: 'bold' }}>Notifications</span>
          <span style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            padding: '2px 8px',
            fontSize: '12px',
            minWidth: '20px',
            textAlign: 'center'
          }}>
            {notifications.length}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClearAll}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              fontSize: '12px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '4px'
            }}
            title="Clear all notifications"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '0'
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div style={{
        maxHeight: '500px',
        overflowY: 'auto',
        padding: '10px 0'
      }}>
        {notifications.length === 0 ? (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            color: '#666',
            fontSize: '14px'
          }}>
            No notifications
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              style={{
                padding: '15px 20px',
                borderBottom: '1px solid #eee',
                backgroundColor: notification.read ? 'white' : '#f8f9fa',
                position: 'relative'
              }}
            >
              {/* Unread indicator */}
              {!notification.read && (
                <div style={{
                  position: 'absolute',
                  top: '15px',
                  left: '8px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#007bff',
                  borderRadius: '50%'
                }} />
              )}

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ fontSize: '20px', marginTop: '2px' }}>
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: 'bold',
                    fontSize: '14px',
                    marginBottom: '5px',
                    color: notification.read ? '#666' : '#333'
                  }}>
                    {getNotificationTitle(notification.type, notification.meeting)}
                  </div>
                  
                  <div style={{
                    fontSize: '13px',
                    color: '#666',
                    marginBottom: '8px'
                  }}>
                    {notification.meeting.description || 'No description provided'}
                  </div>
                  
                  <div style={{
                    fontSize: '12px',
                    color: '#999',
                    marginBottom: '10px'
                  }}>
                    {formatTimeAgo(notification.timestamp)}
                  </div>

                  {/* Meeting details */}
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '8px 12px',
                    borderRadius: '5px',
                    fontSize: '12px',
                    marginBottom: '10px'
                  }}>
                    <div><strong>Duration:</strong> {notification.meeting.duration_minutes} minutes</div>
                    <div><strong>Type:</strong> {notification.meeting.meeting_type}</div>
                    <div><strong>Status:</strong> {notification.meeting.status}</div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {notification.meeting.status === 'ONGOING' && (
                      <button
                        onClick={() => handleJoin(notification.meeting)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        🎥 Join Meeting
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      {notification.read ? '✓ Read' : 'Mark Read'}
                    </button>
                    
                    <button
                      onClick={() => handleDismiss(notification.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '10px 20px',
        borderTop: '1px solid #eee',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        color: '#666'
      }}>
        <span>
          {notifications.filter(n => !n.read).length} unread
        </span>
        <button
          onClick={() => notifications.forEach(n => onMarkAsRead(n.id))}
          style={{
            background: 'none',
            border: 'none',
            color: '#007bff',
            cursor: 'pointer',
            fontSize: '12px',
            textDecoration: 'underline'
          }}
        >
          Mark all as read
        </button>
      </div>
    </div>
  );
};

export default NotificationPanel; 