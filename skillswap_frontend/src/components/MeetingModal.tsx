import React, { useState } from 'react';
import { meetingsAPI } from '../services/api';
import { Meeting, MeetingForm } from '../types';

interface MeetingModalProps {
  chatId: number;
  participants: { id: number; username: string }[];
  onClose: () => void;
  onMeetingCreated?: (meeting: Meeting) => void;
  onStartVideoCall?: (meeting: Meeting) => void;
}

const MeetingModal: React.FC<MeetingModalProps> = ({ 
  chatId, 
  participants, 
  onClose, 
  onMeetingCreated,
  onStartVideoCall
}) => {
  const [meetingType, setMeetingType] = useState<'INSTANT' | 'SCHEDULED'>('INSTANT');
  const [formData, setFormData] = useState<Partial<MeetingForm>>({
    chat: chatId,
    meeting_type: 'INSTANT',
    title: '',
    description: '',
    duration_minutes: 30,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const meetingData: MeetingForm = {
        chat: chatId,
        meeting_type: meetingType,
        title: formData.title || '',
        description: formData.description || '',
        duration_minutes: formData.duration_minutes || 30,
        ...(meetingType === 'SCHEDULED' && formData.scheduled_at && {
          scheduled_at: formData.scheduled_at,
        }),
      };

      const meeting = await meetingsAPI.createMeeting(meetingData);
      
      if (onMeetingCreated) {
        onMeetingCreated(meeting);
      }

      if (onStartVideoCall && meetingType === 'INSTANT') {
        onStartVideoCall(meeting);
      }
      
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toISOString().slice(0, 16);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="card" style={{
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Create Video Meeting</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <p><strong>Participants:</strong> {participants.map(p => p.username).join(', ')}</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Meeting Type</label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="meetingType"
                  value="INSTANT"
                  checked={meetingType === 'INSTANT'}
                  onChange={() => setMeetingType('INSTANT')}
                  style={{ marginRight: '5px' }}
                />
                🚀 Instant Meeting
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="meetingType"
                  value="SCHEDULED"
                  checked={meetingType === 'SCHEDULED'}
                  onChange={() => setMeetingType('SCHEDULED')}
                  style={{ marginRight: '5px' }}
                />
                📅 Scheduled Meeting
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="title">Meeting Title</label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-control"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Python Tutorial Session, Guitar Lesson"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              name="description"
              className="form-control"
              value={formData.description}
              onChange={handleChange}
              placeholder="What will you discuss in this meeting?"
              rows={3}
            />
          </div>

          {meetingType === 'SCHEDULED' && (
            <div className="form-group">
              <label htmlFor="scheduled_at">Scheduled Date & Time</label>
              <input
                type="datetime-local"
                id="scheduled_at"
                name="scheduled_at"
                className="form-control"
                value={formData.scheduled_at || ''}
                onChange={handleChange}
                min={formatDateTime(new Date().toISOString())}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="duration_minutes">Duration (minutes)</label>
            <select
              id="duration_minutes"
              name="duration_minutes"
              className="form-control"
              value={formData.duration_minutes}
              onChange={handleChange}
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ flex: '1' }}
            >
              {loading ? 'Creating...' : meetingType === 'INSTANT' ? '🚀 Start Instant Meeting' : '📅 Schedule Meeting'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ flex: '1' }}
            >
              Cancel
            </button>
          </div>
        </form>

        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>💡 Meeting Features:</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
            <li><strong>Instant Meeting:</strong> Start immediately with video call</li>
            <li><strong>Scheduled Meeting:</strong> Set a future time for the meeting</li>
            <li><strong>Screen Sharing:</strong> Share your screen for tutorials</li>
            <li><strong>Recording:</strong> Record sessions for later review</li>
            <li><strong>Chat:</strong> Text chat during video calls</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MeetingModal; 