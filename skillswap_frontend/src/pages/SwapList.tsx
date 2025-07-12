import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { swapsAPI, chatsAPI } from '../services/api';
import { SwapRequest, Chat } from '../types';
import ChatComponent from '../components/Chat';

const SwapList: React.FC = () => {
  const [swaps, setSwaps] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showChatModal, setShowChatModal] = useState<boolean>(false);

  useEffect(() => {
    fetchSwaps();
  }, []);

  const fetchSwaps = async () => {
    try {
      setLoading(true);
      const data = await swapsAPI.getSwaps();
      setSwaps(data);
    } catch (err: any) {
      setError('Failed to load swap requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, action: 'accept' | 'reject' | 'cancel') => {
    try {
      if (action === 'accept') {
        await swapsAPI.acceptSwap(id);
      } else if (action === 'reject') {
        await swapsAPI.rejectSwap(id);
      } else if (action === 'cancel') {
        await swapsAPI.cancelSwap(id);
      }
      
      // Refresh the list
      fetchSwaps();
    } catch (err: any) {
      setError(`Failed to ${action} swap request. Please try again.`);
    }
  };

  const handleSwapClick = async (swap: SwapRequest) => {
    if (swap.status === 'ACCEPTED') {
      try {
        // Get the chat for this accepted swap
        const chats = await chatsAPI.getChats();
        const chat = chats.find(c => c.swap_request === swap.id);
        
        if (chat) {
          setSelectedChat(chat);
          setShowChatModal(true);
        } else {
          setError('Chat not found for this swap. Please try again.');
        }
      } catch (err: any) {
        setError('Failed to load chat. Please try again.');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return '#28a745';
      case 'REJECTED':
        return '#dc3545';
      case 'CANCELLED':
        return '#6c757d';
      default:
        return '#ffc107';
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <p>Loading swap requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Swap Requests</h1>
        <Link to="/swaps/new" className="btn btn-primary">
          New Swap Request
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Swap Requests List */}
      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))' }}>
        {swaps.map((swap) => (
          <div 
            key={swap.id} 
            className="card" 
            style={{ 
              cursor: swap.status === 'ACCEPTED' ? 'pointer' : 'default',
              transition: swap.status === 'ACCEPTED' ? 'transform 0.2s, box-shadow 0.2s' : 'none',
              border: swap.status === 'ACCEPTED' ? '2px solid transparent' : '1px solid rgba(0,0,0,0.125)'
            }}
            onMouseEnter={(e) => {
              if (swap.status === 'ACCEPTED') {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                e.currentTarget.style.borderColor = '#28a745';
              }
            }}
            onMouseLeave={(e) => {
              if (swap.status === 'ACCEPTED') {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = 'transparent';
              }
            }}
            onClick={() => handleSwapClick(swap)}
          >
            <div style={{ marginBottom: '15px' }}>
              <h3>
                {swap.from_user_name} → {swap.to_user_name}
              </h3>
              <p>
                <strong>Offering:</strong> {swap.offered_skill_name}
              </p>
              <p>
                <strong>Requesting:</strong> {swap.requested_skill_name}
              </p>
              <p>
                <strong>Status:</strong>{' '}
                <span style={{ 
                  color: getStatusColor(swap.status),
                  fontWeight: 'bold'
                }}>
                  {swap.status}
                </span>
              </p>
              <p>
                <strong>Created:</strong> {new Date(swap.created_at).toLocaleDateString()}
              </p>
              {swap.status === 'ACCEPTED' && (
                <p style={{ color: '#28a745', fontSize: '14px', marginTop: '10px' }}>
                  💬 Click to open chat and share tips!
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {swap.status === 'PENDING' && (
                <>
                  {swap.to_user_name === localStorage.getItem('username') && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(swap.id, 'accept');
                        }}
                        className="btn btn-success"
                        style={{ flex: '1', minWidth: '80px' }}
                      >
                        Accept
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(swap.id, 'reject');
                        }}
                        className="btn btn-danger"
                        style={{ flex: '1', minWidth: '80px' }}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {swap.from_user_name === localStorage.getItem('username') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(swap.id, 'cancel');
                      }}
                      className="btn btn-secondary"
                      style={{ flex: '1', minWidth: '80px' }}
                    >
                      Cancel
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {swaps.length === 0 && !loading && (
        <div className="card" style={{ textAlign: 'center' }}>
          <p>No swap requests found. Create a new swap request to get started!</p>
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && selectedChat && (
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
          <div style={{
            maxWidth: '800px',
            width: '90%',
            height: '80vh',
            backgroundColor: 'white',
            borderRadius: '8px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              padding: '15px',
              borderBottom: '1px solid #ddd',
              backgroundColor: '#f8f9fa',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0 }}>Chat for Swap</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                  {selectedChat.participants.map(p => p.username).join(' & ')}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowChatModal(false);
                  setSelectedChat(null);
                }}
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
            
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <ChatComponent 
                chatId={selectedChat.id} 
                participants={selectedChat.participants}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwapList; 