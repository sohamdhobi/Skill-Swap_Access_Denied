import React, { useState, useEffect } from 'react';
import { chatsAPI } from '../services/api';
import { Chat } from '../types';
import ChatComponent from '../components/Chat';

const ChatList: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const data = await chatsAPI.getChats();
      setChats(data);
    } catch (err: any) {
      setError('Failed to load chats. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <p>Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Chats</h1>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {chats.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <h3>No Active Chats</h3>
          <p>You don't have any active chats yet.</p>
          <p style={{ color: '#666', fontSize: '14px' }}>
            💡 Chats are automatically created when you accept a swap request.
          </p>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Accept some swap requests to start chatting and sharing tips!
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px', height: '600px' }}>
          {/* Chat List Sidebar */}
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: 'white'
          }}>
            <div style={{
              padding: '15px',
              borderBottom: '1px solid #ddd',
              backgroundColor: '#f8f9fa'
            }}>
              <h3 style={{ margin: 0 }}>Your Chats</h3>
            </div>
            <div style={{ overflowY: 'auto', maxHeight: '500px' }}>
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  style={{
                    padding: '15px',
                    borderBottom: '1px solid #eee',
                    cursor: 'pointer',
                    backgroundColor: selectedChat?.id === chat.id ? '#e3f2fd' : 'white',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedChat?.id !== chat.id) {
                      e.currentTarget.style.backgroundColor = '#f5f5f5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedChat?.id !== chat.id) {
                      e.currentTarget.style.backgroundColor = 'white';
                    }
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                    {chat.participants.map(p => p.username).join(' & ')}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {chat.messages.length > 0 
                      ? `Last message: ${chat.messages[chat.messages.length - 1].content.substring(0, 30)}...`
                      : 'No messages yet'
                    }
                  </div>
                  <div style={{ fontSize: '10px', color: '#999', marginTop: '5px' }}>
                    {chat.messages.length} message{chat.messages.length !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
            {selectedChat ? (
              <ChatComponent 
                chatId={selectedChat.id} 
                participants={selectedChat.participants}
              />
            ) : (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                backgroundColor: '#f9f9f9'
              }}>
                <div style={{ textAlign: 'center', color: '#666' }}>
                  <h3>Select a Chat</h3>
                  <p>Choose a chat from the sidebar to start messaging</p>
                  <p style={{ fontSize: '14px' }}>
                    💬 Share tips, ask questions, and discuss your skills
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList; 