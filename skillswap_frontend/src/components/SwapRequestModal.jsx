import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X, ArrowLeftRight } from 'lucide-react';

function SwapRequestModal({ targetUser, onSend, onClose }) {
  const { user } = useAuth();
  const [selectedOfferedSkill, setSelectedOfferedSkill] = useState('');
  const [selectedWantedSkill, setSelectedWantedSkill] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Filter skills that match between users
  const matchingOfferedSkills = user?.skillsOffered?.filter(skill =>
    targetUser.skillsWanted.includes(skill)
  ) || [];

  const matchingWantedSkills = targetUser.skillsOffered.filter(skill =>
    user?.skillsWanted?.includes(skill)
  ) || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOfferedSkill || !selectedWantedSkill) {
      return;
    }

    setLoading(true);
    
    const requestData = {
      targetUserId: targetUser.id,
      offeredSkill: selectedOfferedSkill,
      wantedSkill: selectedWantedSkill,
      message: message,
      timestamp: new Date().toISOString()
    };

    await onSend(requestData);
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Request Skill Swap with {targetUser.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Skill Selection */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <ArrowLeftRight className="text-blue-600" size={20} />
              <h3 className="font-medium text-blue-900">Skill Exchange</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="form-label">I can teach them:</label>
                <select
                  className="form-input"
                  value={selectedOfferedSkill}
                  onChange={(e) => setSelectedOfferedSkill(e.target.value)}
                  required
                >
                  <option value="">Select a skill you can offer</option>
                  {matchingOfferedSkills.map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
                {matchingOfferedSkills.length === 0 && (
                  <p className="text-sm text-yellow-600 mt-1">
                    No matching skills found. You may not have skills they want to learn.
                  </p>
                )}
              </div>

              <div>
                <label className="form-label">I want to learn from them:</label>
                <select
                  className="form-input"
                  value={selectedWantedSkill}
                  onChange={(e) => setSelectedWantedSkill(e.target.value)}
                  required
                >
                  <option value="">Select a skill you want to learn</option>
                  {matchingWantedSkills.map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
                {matchingWantedSkills.length === 0 && (
                  <p className="text-sm text-yellow-600 mt-1">
                    No matching skills found. They may not offer skills you want to learn.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="form-label">Message (Optional)</label>
            <textarea
              className="form-textarea"
              placeholder="Add a personal message to introduce yourself and explain why you'd like to swap skills..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>

          {/* Preview */}
          {selectedOfferedSkill && selectedWantedSkill && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Request Preview:</h4>
              <p className="text-sm text-gray-700">
                You're offering to teach <span className="font-medium text-blue-600">{selectedOfferedSkill}</span> in exchange for learning <span className="font-medium text-green-600">{selectedWantedSkill}</span> from {targetUser.name}.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={loading || !selectedOfferedSkill || !selectedWantedSkill}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                'Send Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SwapRequestModal;