import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { skillsAPI } from '../services/api';
import { SkillForm as SkillFormType } from '../types';

const SkillForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SkillFormType>({
    name: '',
    offered: true,
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
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
      await skillsAPI.createSkill(formData);
      navigate('/skills');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create skill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ maxWidth: '500px', margin: '50px auto' }}>
        <div className="card">
          <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Add New Skill</h2>
          
          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Skill Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Python Programming, Guitar Lessons, Spanish Language"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="offered"
                  checked={formData.offered}
                  onChange={handleChange}
                  style={{ marginRight: '8px' }}
                />
                I want to offer this skill (uncheck if you want to learn this skill)
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ flex: '1' }}
              >
                {loading ? 'Creating...' : 'Create Skill'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/skills')}
                className="btn btn-secondary"
                style={{ flex: '1' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SkillForm; 