import React, { useState, useEffect } from 'react';
import { meetingsAPI } from '../services/api';
import { Meeting } from '../types';

interface MeetingNotificationProps {
  meeting: Meeting;
  onJoin: (meeting: Meeting) => void;
  onDismiss: () => void;
}

const MeetingNotification: React.FC<MeetingNotificationProps> = ({ 
  meeting, 
  onJoin, 
  onDismiss 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds to respond

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsVisible(false);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onDismiss]);

  const handleJoin = () => {
    onJoin(meeting);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: '#007bff',
      color: 'white',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      zIndex: 9999,
      maxWidth: '350px',
      transform: 'translateX(0)',
      transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
      opacity: 1
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '15px'
      }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
          🚀 Meeting Started!
        </div>
        <button
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0',
            marginLeft: '10px'
          }}
        >
          ×
        </button>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
          {meeting.title}
        </div>
        <div style={{ fontSize: '14px', opacity: 0.9 }}>
          {meeting.description || 'No description provided'}
        </div>
        <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '5px' }}>
          Duration: {meeting.duration_minutes} minutes
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '10px'
      }}>
        <button
          onClick={handleJoin}
          style={{
            flex: 1,
            padding: '10px 15px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          🎥 Join Meeting
        </button>
        <button
          onClick={handleDismiss}
          style={{
            padding: '10px 15px',
            backgroundColor: 'transparent',
            color: 'white',
            border: '1px solid white',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Dismiss
        </button>
      </div>

      <div style={{
        fontSize: '12px',
        opacity: 0.8,
        textAlign: 'center'
      }}>
        Auto-dismiss in {timeLeft} seconds
      </div>


    </div>
  );
};

export default MeetingNotification; 