import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Users, Filter, ChevronDown } from 'lucide-react';
import UserCard from '../components/UserCard';
import SwapRequestModal from '../components/SwapRequestModal';

function BrowseUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock users data
  useEffect(() => {
    const mockUsers = [
      {
        id: 2,
        name: 'Sarah Johnson',
        location: 'San Francisco, CA',
        skillsOffered: ['Python', 'Data Science', 'Machine Learning'],
        skillsWanted: ['React', 'UX Design'],
        rating: 4.9,
        completedSwaps: 15,
        availability: ['weekends', 'evenings'],
        isPublic: true
      },
      {
        id: 3,
        name: 'Mike Chen',
        location: 'New York, NY',
        skillsOffered: ['React', 'Node.js', 'MongoDB'],
        skillsWanted: ['Python', 'DevOps'],
        rating: 4.7,
        completedSwaps: 8,
        availability: ['weekdays', 'evenings'],
        isPublic: true
      },
      {
        id: 4,
        name: 'Emma Davis',
        location: 'London, UK',
        skillsOffered: ['UX Design', 'Figma', 'Adobe Creative Suite'],
        skillsWanted: ['Frontend Development', 'Vue.js'],
        rating: 4.8,
        completedSwaps: 12,
        availability: ['weekends'],
        isPublic: true
      },
      {
        id: 5,
        name: 'Alex Rodriguez',
        location: 'Berlin, Germany',
        skillsOffered: ['DevOps', 'AWS', 'Docker'],
        skillsWanted: ['Mobile Development', 'Flutter'],
        rating: 4.6,
        completedSwaps: 6,
        availability: ['weekday_evenings', 'weekends'],
        isPublic: true
      },
      {
        id: 6,
        name: 'Lisa Wang',
        location: 'Toronto, Canada',
        skillsOffered: ['Digital Marketing', 'SEO', 'Content Strategy'],
        skillsWanted: ['Data Analytics', 'Python'],
        rating: 4.9,
        completedSwaps: 20,
        availability: ['weekdays', 'weekends'],
        isPublic: true
      },
      {
        id: 7,
        name: 'James Wilson',
        location: 'Sydney, Australia',
        skillsOffered: ['Mobile Development', 'React Native', 'Flutter'],
        skillsWanted: ['Backend Development', 'Go'],
        rating: 4.5,
        completedSwaps: 9,
        availability: ['weekends'],
        isPublic: true
      }
    ];
    
    setTimeout(() => {
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
      setLoading(false);
    }, 500);
  }, []);

  // Get unique skills and locations for filters
  const allSkills = [...new Set(users.flatMap(user => [...user.skillsOffered, ...user.skillsWanted]))];
  const allLocations = [...new Set(users.map(user => user.location).filter(Boolean))];

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.skillsOffered.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
        user.skillsWanted.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedSkill) {
      filtered = filtered.filter(user =>
        user.skillsOffered.includes(selectedSkill) || user.skillsWanted.includes(selectedSkill)
      );
    }

    if (selectedLocation) {
      filtered = filtered.filter(user => user.location === selectedLocation);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, selectedSkill, selectedLocation, users]);

  const handleRequestSwap = (user) => {
    setSelectedUser(user);
    setShowRequestModal(true);
  };

  const handleSendRequest = (requestData) => {
    console.log('Sending swap request:', requestData);
    // Here you would typically send the request to your backend
    setShowRequestModal(false);
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Users</h1>
        <p className="text-gray-600">Find users to swap skills with</p>
      </div>

      {/* Search and Filters */}
      <div className="card mb-8">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or skills..."
              className="form-input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline flex items-center gap-2"
          >
            <Filter size={16} />
            Filters
            <ChevronDown 
              size={16} 
              className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} 
            />
          </button>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="form-label">Filter by Skill</label>
                <select
                  className="form-input"
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                >
                  <option value="">All Skills</option>
                  {allSkills.map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Filter by Location</label>
                <select
                  className="form-input"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <option value="">All Locations</option>
                  {allLocations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
          </p>
          {(searchTerm || selectedSkill || selectedLocation) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSkill('');
                setSelectedLocation('');
              }}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* User Grid */}
      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map(user => (
            <UserCard
              key={user.id}
              user={user}
              onRequestSwap={() => handleRequestSwap(user)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">
            Try adjusting your search terms or filters to find more users.
          </p>
        </div>
      )}

      {/* Swap Request Modal */}
      {showRequestModal && selectedUser && (
        <SwapRequestModal
          targetUser={selectedUser}
          onSend={handleSendRequest}
          onClose={() => {
            setShowRequestModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}

export default BrowseUsers;