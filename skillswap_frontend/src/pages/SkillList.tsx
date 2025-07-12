import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { skillsAPI, swapsAPI, profilesAPI } from '../services/api';
import { Skill, UserProfile } from '../types';

const SkillList: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [filters, setFilters] = useState({
    name: '',
    offered: '',
  });
  const [showSwapModal, setShowSwapModal] = useState<boolean>(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [mySkills, setMySkills] = useState<Skill[]>([]);
  const [swapLoading, setSwapLoading] = useState<boolean>(false);
  const [swapError, setSwapError] = useState<string>('');

  useEffect(() => {
    fetchSkills();
    fetchMySkills();
  }, [filters]);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.name) params.name = filters.name;
      if (filters.offered !== '') params.offered = filters.offered === 'true';
      
      const data = await skillsAPI.getSkills(params);
      setSkills(data);
    } catch (err: any) {
      setError('Failed to load skills. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const fetchMySkills = async () => {
    try {
      const username = localStorage.getItem('username');
      if (username) {
        const data = await skillsAPI.getSkills({ owner: username });
        setMySkills(data);
      }
    } catch (err: any) {
      console.error('Failed to load my skills:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this skill?')) {
      try {
        await skillsAPI.deleteSkill(id);
        setSkills(skills.filter(skill => skill.id !== id));
      } catch (err: any) {
        setError('Failed to delete skill. Please try again.');
      }
    }
  };

  const handleSkillClick = (skill: Skill) => {
    setSelectedSkill(skill);
    setShowSwapModal(true);
    setSwapError('');
  };

  const handleSwapRequest = async (offeredSkillId: number) => {
    if (!selectedSkill) return;
    
    setSwapLoading(true);
    setSwapError('');
    
    try {
      await swapsAPI.createSwap({
        to_user: selectedSkill.owner,
        offered_skill: offeredSkillId,
        requested_skill: selectedSkill.id,
      });
      
      setShowSwapModal(false);
      setSelectedSkill(null);
      alert('Swap request sent successfully!');
    } catch (err: any) {
      setSwapError(err.response?.data?.error || 'Failed to send swap request. Please try again.');
    } finally {
      setSwapLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <p>Loading skills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Skills</h1>
        <Link to="/skills/add" className="btn btn-primary">
          Add New Skill
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3>Filters</h3>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
            <label htmlFor="name">Skill Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-control"
              value={filters.name}
              onChange={handleFilterChange}
              placeholder="Search by skill name..."
            />
          </div>
          <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
            <label htmlFor="offered">Availability</label>
            <select
              id="offered"
              name="offered"
              className="form-control"
              value={filters.offered}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              <option value="true">Offered</option>
              <option value="false">Wanted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Skills List */}
      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {skills.map((skill) => (
          <div 
            key={skill.id} 
            className="card" 
            style={{ 
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              border: '2px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
              e.currentTarget.style.borderColor = '#007bff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              e.currentTarget.style.borderColor = 'transparent';
            }}
            onClick={() => handleSkillClick(skill)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3>{skill.name}</h3>
                <p><strong>Owner:</strong> {skill.owner_name}</p>
                <p>
                  <strong>Type:</strong>{' '}
                  <span style={{ 
                    color: skill.offered ? '#28a745' : '#007bff',
                    fontWeight: 'bold'
                  }}>
                    {skill.offered ? 'Offered' : 'Wanted'}
                  </span>
                </p>
                <p><strong>Added:</strong> {new Date(skill.created_at).toLocaleDateString()}</p>
                <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>
                  💡 Click to request a swap
                </p>
              </div>
              <div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(skill.id);
                  }}
                  className="btn btn-danger"
                  style={{ padding: '5px 10px', fontSize: '12px' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {skills.length === 0 && !loading && (
        <div className="card" style={{ textAlign: 'center' }}>
          <p>No skills found. Try adjusting your filters or add a new skill!</p>
        </div>
      )}

      {/* Swap Modal */}
      {showSwapModal && selectedSkill && (
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
              <h2>Request Skill Swap</h2>
              <button
                onClick={() => {
                  setShowSwapModal(false);
                  setSelectedSkill(null);
                  setSwapError('');
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

            <div style={{ marginBottom: '20px' }}>
              <h3>Requesting: {selectedSkill.name}</h3>
              <p><strong>Owner:</strong> {selectedSkill.owner_name}</p>
              <p><strong>Type:</strong> {selectedSkill.offered ? 'Offered' : 'Wanted'}</p>
            </div>

            {swapError && (
              <div className="alert alert-danger">
                {swapError}
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <h4>Select a skill to offer in exchange:</h4>
              {mySkills.filter(skill => skill.offered).length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic' }}>
                  You don't have any skills to offer. Add some skills first!
                </p>
              ) : (
                <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                  {mySkills.filter(skill => skill.offered).map((skill) => (
                    <div
                      key={skill.id}
                      className="card"
                      style={{
                        cursor: 'pointer',
                        border: '2px solid #ddd',
                        transition: 'border-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#007bff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#ddd';
                      }}
                      onClick={() => handleSwapRequest(skill.id)}
                    >
                      <h4>{skill.name}</h4>
                      <p style={{ color: '#28a745', fontWeight: 'bold' }}>Offered</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {swapLoading && (
              <div style={{ textAlign: 'center' }}>
                <p>Sending swap request...</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowSwapModal(false);
                  setSelectedSkill(null);
                  setSwapError('');
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillList; 