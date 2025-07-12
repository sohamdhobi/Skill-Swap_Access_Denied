import React, { useState, useEffect, useRef } from 'react';
import { messagesAPI, meetingsAPI } from '../services/api';
import { Message, MessageForm, Meeting } from '../types';
import MeetingModal from './MeetingModal';
import VideoCall from './VideoCall';
import MeetingNotification from './MeetingNotification';
import NotificationPanel from './NotificationPanel';

// Test if VideoCall component is imported
console.log('VideoCall component imported:', VideoCall);

interface ChatProps {
  chatId: number;
  participants: { id: number; username: string }[];
}

const Chat: React.FC<ChatProps> = ({ chatId, participants }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showMeetingModal, setShowMeetingModal] = useState<boolean>(false);
  const [showMeetings, setShowMeetings] = useState<boolean>(false);
  const [activeVideoCall, setActiveVideoCall] = useState<Meeting | null>(null);
  const [meetingNotification, setMeetingNotification] = useState<Meeting | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotificationPanel, setShowNotificationPanel] = useState<boolean>(false);
  
  // Debug logging
  console.log('Chat component rendered, activeVideoCall:', activeVideoCall);
  
  // Add a visible indicator if activeVideoCall exists
  if (activeVideoCall) {
    console.log('ACTIVE VIDEO CALL EXISTS!', activeVideoCall);
  }
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUsername = localStorage.getItem('username');

  useEffect(() => {
    fetchMessages();
    fetchMeetings();
    // Poll for new messages every 3 seconds
    const interval = setInterval(() => {
      fetchMessages();
      checkForMeetingNotifications();
    }, 3000);
    return () => clearInterval(interval);
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clean up old notifications and ended meetings
  useEffect(() => {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    // Remove notifications older than 5 minutes
    setNotifications(prev => prev.filter(notification => 
      notification.timestamp > fiveMinutesAgo
    ));
    
    // Clear meeting notification if the meeting has ended
    if (meetingNotification) {
      const meeting = meetings.find(m => m.id === meetingNotification.id);
      if (meeting && meeting.status !== 'ONGOING') {
        setMeetingNotification(null);
      }
    }
  }, [meetings, meetingNotification]);

  const fetchMessages = async () => {
    try {
      const data = await messagesAPI.getMessages(chatId);
      setMessages(data);
    } catch (err: any) {
      setError('Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMeetings = async () => {
    try {
      const data = await meetingsAPI.getMeetings();
      // Filter meetings for this chat
      const chatMeetings = data.filter(meeting => meeting.chat === chatId);
      setMeetings(chatMeetings);
    } catch (err: any) {
      console.error('Failed to load meetings:', err);
    }
  };

  const checkForMeetingNotifications = async () => {
    try {
      const data = await meetingsAPI.getMeetings();
      const chatMeetings = data.filter(meeting => meeting.chat === chatId);
      
      // Check for newly started meetings (status = 'ONGOING')
      const ongoingMeetings = chatMeetings.filter(meeting => 
        meeting.status === 'ONGOING' && 
        meeting.organizer_name !== currentUsername
      );
      
      console.log('Checking notifications:', {
        ongoingMeetings: ongoingMeetings.length,
        currentNotifications: notifications.length,
        currentMeetingNotification: meetingNotification?.id
      });
      
      // Add new notifications to the list - only for meetings we haven't seen before
      ongoingMeetings.forEach(meeting => {
        const existingNotification = notifications.find(n => n.meeting.id === meeting.id);
        const existingMeetingNotification = meetingNotification?.id === meeting.id;
        
        if (!existingNotification && !existingMeetingNotification) {
          console.log('Creating new notification for meeting:', meeting.id);
          const newNotification = {
            id: `meeting_${meeting.id}`,
            meeting: meeting,
            timestamp: new Date(),
            type: 'meeting_started' as const,
            read: false
          };
          setNotifications(prev => [...prev, newNotification]);
        }
      });
      
      // Only set meeting notification if we don't have one and there's an ongoing meeting
      if (ongoingMeetings.length > 0 && !meetingNotification) {
        const latestMeeting = ongoingMeetings[0];
        console.log('Setting meeting notification for:', latestMeeting.id);
        setMeetingNotification(latestMeeting);
      }
      
      // Clear meeting notification if no ongoing meetings
      if (ongoingMeetings.length === 0 && meetingNotification) {
        console.log('Clearing meeting notification');
        setMeetingNotification(null);
      }
    } catch (err: any) {
      console.error('Failed to check for meeting notifications:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    setError('');

    try {
      const messageData: MessageForm = {
        chat: chatId,
        content: newMessage.trim(),
      };

      const sentMessage = await messagesAPI.createMessage(messageData);
      setMessages([...messages, sentMessage]);
      setNewMessage('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleMeetingCreated = (meeting: Meeting) => {
    setMeetings([...meetings, meeting]);
    checkForMeetingNotifications(); // Check for notifications after a meeting is created
  };

  const handleMeetingNotificationJoin = (meeting: Meeting) => {
    setActiveVideoCall(meeting);
    setMeetingNotification(null);
  };

  const handleMeetingNotificationDismiss = () => {
    setMeetingNotification(null);
  };

  const handleJoinMeetingFromNotification = (meeting: Meeting) => {
    setActiveVideoCall(meeting);
    // Remove notification for this meeting
    setNotifications(prev => prev.filter(n => n.meeting.id !== meeting.id));
  };

  const handleDismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleMarkNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    setMeetingNotification(null);
    console.log('All notifications cleared');
  };

  // Clear all notifications immediately
  useEffect(() => {
    handleClearAllNotifications();
  }, []);

  const handleJoinMeeting = async (meeting: Meeting) => {
    try {
      await meetingsAPI.joinMeeting(meeting.id);
      setActiveVideoCall(meeting);
      checkForMeetingNotifications(); // Check for notifications after joining a meeting
    } catch (err: any) {
      setError('Failed to join meeting. Please try again.');
    }
  };

  const handleStartMeeting = async (meeting: Meeting) => {
    console.log('Starting meeting:', meeting);
    try {
      await meetingsAPI.startMeeting(meeting.id);
      console.log('Meeting started successfully, setting active video call');
      setActiveVideoCall(meeting);
      fetchMeetings(); // Refresh meetings list
      checkForMeetingNotifications(); // Check for notifications after starting a meeting
    } catch (err: any) {
      console.error('Failed to start meeting:', err);
      setError('Failed to start meeting. Please try again.');
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getMeetingStatusColor = (status: string) => {
    switch (status) {
      case 'ONGOING':
        return '#28a745';
      case 'COMPLETED':
        return '#6c757d';
      case 'CANCELLED':
        return '#dc3545';
      default:
        return '#007bff';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <p>Loading chat...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '500px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Debug indicator */}
      {activeVideoCall && (
        <div style={{
          position: 'absolute',
          top: '0px',
          left: '0px',
          right: '0px',
          backgroundColor: 'red',
          color: 'white',
          padding: '5px',
          textAlign: 'center',
          zIndex: 1000,
          fontSize: '12px'
        }}>
          🚨 VIDEO CALL ACTIVE - Meeting ID: {activeVideoCall.id}
        </div>
      )}
      {/* Chat Header */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ margin: 0 }}>Chat</h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
            {participants.map(p => p.username).join(' & ')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => setShowNotificationPanel(!showNotificationPanel)}
            className="btn btn-outline-info"
            style={{ 
              fontSize: '12px', 
              padding: '5px 10px',
              position: 'relative'
            }}
          >
            🔔 Notifications
            {notifications.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                backgroundColor: '#dc3545',
                color: 'white',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {notifications.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowMeetings(!showMeetings)}
            className="btn btn-outline-primary"
            style={{ fontSize: '12px', padding: '5px 10px' }}
          >
            📅 Meetings ({meetings.length})
          </button>
          <button
            onClick={() => setShowMeetingModal(true)}
            className="btn btn-success"
            style={{ fontSize: '12px', padding: '5px 10px' }}
          >
            🚀 Start Meeting
          </button>
          <button
            onClick={() => {
              alert('Test button clicked!');
              console.log('Test video call button clicked');
              setActiveVideoCall({
                id: 999,
                chat: chatId,
                organizer: 1,
                organizer_name: 'Test User',
                meeting_type: 'INSTANT',
                title: 'Test Meeting',
                description: 'Test meeting for debugging',
                scheduled_at: null,
                duration_minutes: 30,
                meeting_url: null,
                meeting_id: null,
                status: 'ONGOING',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                participants: participants
              });
            }}
            className="btn btn-warning"
            style={{ 
              fontSize: '12px', 
              padding: '5px 10px',
              backgroundColor: 'orange',
              color: 'white',
              border: '2px solid red'
            }}
          >
            🧪 Test Video Call
          </button>
          <button
            onClick={() => {
              alert('Simple test button clicked!');
              document.body.innerHTML += '<div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:red;color:white;padding:20px;z-index:9999;">SIMPLE TEST - BUTTONS WORK!</div>';
            }}
            className="btn btn-danger"
            style={{ 
              fontSize: '12px', 
              padding: '5px 10px',
              backgroundColor: 'red',
              color: 'white',
              border: '2px solid black'
            }}
          >
            🔥 Simple Test
          </button>
        </div>
      </div>

      {/* Meetings Panel */}
      {showMeetings && (
        <div style={{
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #ddd',
          padding: '15px',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>📅 Meetings</h4>
          {meetings.length === 0 ? (
            <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
              No meetings scheduled. Start a meeting to begin video calls!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {meetings.map((meeting) => (
                <div key={meeting.id} style={{
                  backgroundColor: 'white',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ddd'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h5 style={{ margin: '0 0 5px 0', fontSize: '13px' }}>{meeting.title}</h5>
                      <p style={{ margin: 0, fontSize: '11px', color: '#666' }}>
                        {meeting.meeting_type === 'INSTANT' ? '🚀 Instant' : '📅 Scheduled'}
                        {meeting.scheduled_at && ` - ${formatDateTime(meeting.scheduled_at)}`}
                      </p>
                      <p style={{ margin: '5px 0 0 0', fontSize: '11px' }}>
                        <span style={{ 
                          color: getMeetingStatusColor(meeting.status),
                          fontWeight: 'bold'
                        }}>
                          {meeting.status}
                        </span>
                        {meeting.duration_minutes && ` • ${meeting.duration_minutes} min`}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {meeting.status === 'SCHEDULED' && meeting.organizer_name === currentUsername && (
                        <button
                          onClick={() => handleStartMeeting(meeting)}
                          className="btn btn-success"
                          style={{ fontSize: '10px', padding: '3px 8px' }}
                        >
                          Start
                        </button>
                      )}
                      {meeting.status === 'ONGOING' && (
                        <button
                          onClick={() => handleJoinMeeting(meeting)}
                          className="btn btn-primary"
                          style={{ fontSize: '10px', padding: '3px 8px' }}
                        >
                          Join
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '15px',
        backgroundColor: '#f9f9f9'
      }}>
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '15px' }}>
            {error}
          </div>
        )}

        {messages.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#666', 
            marginTop: '50px' 
          }}>
            <p>No messages yet. Start the conversation!</p>
            <p style={{ fontSize: '14px' }}>
              💡 Share tips, ask questions, or discuss your skills
            </p>
            <p style={{ fontSize: '14px' }}>
              🚀 Click "Start Meeting" to begin video calls
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((message) => {
              const isOwnMessage = message.sender_name === currentUsername;
              return (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                    marginBottom: '10px'
                  }}
                >
                  <div style={{
                    maxWidth: '70%',
                    padding: '10px 15px',
                    borderRadius: '15px',
                    backgroundColor: isOwnMessage ? '#007bff' : 'white',
                    color: isOwnMessage ? 'white' : '#333',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    wordWrap: 'break-word'
                  }}>
                    <div style={{ 
                      fontSize: '12px', 
                      marginBottom: '5px',
                      opacity: 0.8
                    }}>
                      {message.sender_name}
                    </div>
                    <div style={{ marginBottom: '5px' }}>
                      {message.content}
                    </div>
                    <div style={{ 
                      fontSize: '10px', 
                      opacity: 0.7,
                      textAlign: 'right'
                    }}>
                      {formatTime(message.created_at)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} style={{
        padding: '15px',
        borderTop: '1px solid #ddd',
        backgroundColor: 'white'
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '14px'
            }}
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="btn btn-primary"
            style={{ padding: '10px 20px' }}
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>

      {/* Meeting Modal */}
      {showMeetingModal && (
        <MeetingModal
          chatId={chatId}
          participants={participants}
          onClose={() => setShowMeetingModal(false)}
          onMeetingCreated={handleMeetingCreated}
          onStartVideoCall={setActiveVideoCall}
        />
      )}

      {/* Video Call */}
      {activeVideoCall && (
        <div>
          <div style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            backgroundColor: 'red',
            color: 'white',
            padding: '10px',
            zIndex: 3000,
            borderRadius: '5px'
          }}>
            DEBUG: Video Call Active - Meeting ID: {activeVideoCall.id}
          </div>
          
          <VideoCall
            meetingId={activeVideoCall.id}
            participants={participants}
            onClose={() => setActiveVideoCall(null)}
          />
        </div>
      )}

      {/* Meeting Notification */}
      {meetingNotification && (
        <MeetingNotification
          meeting={meetingNotification}
          onJoin={handleMeetingNotificationJoin}
          onDismiss={handleMeetingNotificationDismiss}
        />
      )}

      {/* Notification Panel */}
      {showNotificationPanel && (
        <NotificationPanel
          notifications={notifications}
          onJoinMeeting={handleJoinMeetingFromNotification}
          onDismissNotification={handleDismissNotification}
          onMarkAsRead={handleMarkNotificationAsRead}
          onClearAll={handleClearAllNotifications}
          onClose={() => setShowNotificationPanel(false)}
        />
      )}
    </div>
  );
};

export default Chat; 