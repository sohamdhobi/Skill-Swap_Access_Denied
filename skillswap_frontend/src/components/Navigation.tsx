import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/login';
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav style={{
      backgroundColor: '#343a40',
      padding: '1rem 0',
      marginBottom: '2rem'
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem'
          }}>
            <Link to="/profile" style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}>
              Skill-Swap
            </Link>
            
            <div style={{
              display: 'flex',
              gap: '1rem'
            }}>
              <Link 
                to="/profile" 
                style={{
                  color: isActive('/profile') ? '#007bff' : 'white',
                  textDecoration: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  backgroundColor: isActive('/profile') ? 'rgba(255,255,255,0.1)' : 'transparent'
                }}
              >
                Profile
              </Link>
              <Link 
                to="/skills" 
                style={{
                  color: isActive('/skills') ? '#007bff' : 'white',
                  textDecoration: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  backgroundColor: isActive('/skills') ? 'rgba(255,255,255,0.1)' : 'transparent'
                }}
              >
                Skills
              </Link>
              <Link 
                to="/swaps" 
                style={{
                  color: isActive('/swaps') ? '#007bff' : 'white',
                  textDecoration: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  backgroundColor: isActive('/swaps') ? 'rgba(255,255,255,0.1)' : 'transparent'
                }}
              >
                Swap Requests
              </Link>
              <Link 
                to="/chats" 
                style={{
                  color: isActive('/chats') ? '#007bff' : 'white',
                  textDecoration: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  backgroundColor: isActive('/chats') ? 'rgba(255,255,255,0.1)' : 'transparent'
                }}
              >
                💬 Chats
              </Link>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <span style={{ color: 'white' }}>
              Welcome, {username}!
            </span>
            <button 
              onClick={handleLogout}
              className="btn btn-outline-light"
              style={{ fontSize: '0.9rem' }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 