import React from 'react';
import { MapPin, Star, ArrowLeftRight } from 'lucide-react';

function UserCard({ user, onRequestSwap }) {
  return (
    <div className="card hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{user.name}</h3>
          {user.location && (
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin size={14} className="mr-1" />
              {user.location}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
          <Star size={14} className="text-yellow-500" fill="currentColor" />
          <span className="text-sm font-medium text-yellow-700">{user.rating}</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Skills Offered */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Can teach:</h4>
          <div className="flex flex-wrap gap-1">
            {user.skillsOffered.slice(0, 3).map((skill, index) => (
              <span key={index} className="badge badge-primary text-xs">
                {skill}
              </span>
            ))}
            {user.skillsOffered.length > 3 && (
              <span className="badge badge-primary text-xs">
                +{user.skillsOffered.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Skills Wanted */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Wants to learn:</h4>
          <div className="flex flex-wrap gap-1">
            {user.skillsWanted.slice(0, 3).map((skill, index) => (
              <span key={index} className="badge badge-warning text-xs">
                {skill}
              </span>
            ))}
            {user.skillsWanted.length > 3 && (
              <span className="badge badge-warning text-xs">
                +{user.skillsWanted.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t border-gray-100">
          <span>{user.completedSwaps} swaps completed</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            Available
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onRequestSwap(user)}
          className="btn btn-primary w-full mt-4"
        >
          <ArrowLeftRight size={16} />
          Request Swap
        </button>
      </div>
    </div>
  );
}

export default UserCard;