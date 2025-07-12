import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, MapPin, Clock, Eye, EyeOff, Plus, X } from 'lucide-react';

function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    location: user?.location || '',
    isPublic: user?.isPublic || true
  });
  const [skillsOffered, setSkillsOffered] = useState(user?.skillsOffered || []);
  const [skillsWanted, setSkillsWanted] = useState(user?.skillsWanted || []);
  const [availability, setAvailability] = useState(user?.availability || []);
  const [newSkill, setNewSkill] = useState('');
  const [newWantedSkill, setNewWantedSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const availabilityOptions = [
    'weekday_mornings',
    'weekday_afternoons', 
    'weekday_evenings',
    'weekend_mornings',
    'weekend_afternoons',
    'weekend_evenings'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addSkill = (type) => {
    const skill = type === 'offered' ? newSkill : newWantedSkill;
    if (!skill.trim()) return;

    if (type === 'offered') {
      setSkillsOffered(prev => [...prev, skill.trim()]);
      setNewSkill('');
    } else {
      setSkillsWanted(prev => [...prev, skill.trim()]);
      setNewWantedSkill('');
    }
  };

  const removeSkill = (type, index) => {
    if (type === 'offered') {
      setSkillsOffered(prev => prev.filter((_, i) => i !== index));
    } else {
      setSkillsWanted(prev => prev.filter((_, i) => i !== index));
    }
  };

  const toggleAvailability = (timeSlot) => {
    setAvailability(prev => 
      prev.includes(timeSlot) 
        ? prev.filter(slot => slot !== timeSlot)
        : [...prev, timeSlot]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await updateProfile({
        ...formData,
        skillsOffered,
        skillsWanted,
        availability
      });
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatAvailabilityLabel = (slot) => {
    return slot.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">Manage your account and skill information</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('successfully') 
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <div className="card">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('basic')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'basic'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Basic Info
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'skills'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Skills & Availability
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'privacy'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Privacy Settings
            </button>
          </nav>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="form-group">
                <label className="form-label">
                  <User size={16} className="inline mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Mail size={16} className="inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <MapPin size={16} className="inline mr-2" />
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  className="form-input"
                  placeholder="City, Country"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}

          {/* Skills & Availability Tab */}
          {activeTab === 'skills' && (
            <div className="space-y-8">
              {/* Skills Offered */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Skills I Can Offer</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {skillsOffered.map((skill, index) => (
                    <div key={index} className="skill-tag skill-tag-removable">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill('offered', index)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="form-input flex-1"
                    placeholder="Add a skill you can teach"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('offered'))}
                  />
                  <button
                    type="button"
                    onClick={() => addSkill('offered')}
                    className="btn btn-primary"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Skills Wanted */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Skills I Want to Learn</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {skillsWanted.map((skill, index) => (
                    <div key={index} className="skill-tag" style={{backgroundColor: '#fef3c7', color: '#92400e'}}>
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill('wanted', index)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="form-input flex-1"
                    placeholder="Add a skill you want to learn"
                    value={newWantedSkill}
                    onChange={(e) => setNewWantedSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('wanted'))}
                  />
                  <button
                    type="button"
                    onClick={() => addSkill('wanted')}
                    className="btn btn-primary"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Availability */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  <Clock size={16} className="inline mr-2" />
                  Availability
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availabilityOptions.map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={availability.includes(option)}
                        onChange={() => toggleAvailability(option)}
                        className="rounded border-gray-300 text-blue-600 mr-2"
                      />
                      <span className="text-sm text-gray-700">
                        {formatAvailabilityLabel(option)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Privacy Settings Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Profile Visibility</h3>
                  <p className="text-sm text-gray-600">
                    Control whether other users can find and view your profile
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    {formData.isPublic ? <Eye size={16} /> : <EyeOff size={16} />}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                  <span className="text-sm font-medium text-gray-700">
                    {formData.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Privacy Information</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Public profiles are visible to all users and can be found through search</li>
                  <li>• Private profiles are only visible to users you've interacted with</li>
                  <li>• You can still send and receive swap requests with a private profile</li>
                  <li>• Your basic contact information is never shared publicly</li>
                </ul>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;