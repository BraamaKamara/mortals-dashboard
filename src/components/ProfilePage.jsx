import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export default function ProfilePage({ username, onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: '',
    dob: '',
    avatar_emoji: '',
    avatar_image: ''
  });
  const [saving, setSaving] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [messageUserId, setMessageUserId] = useState(null);

  const token = localStorage.getItem('mortals.auth.token');
  const currentUser = localStorage.getItem('mortals.auth.username');
  const isOwnProfile = username === currentUser;

  // Debug logging
  console.log('ProfilePage Debug:', {
    viewingUsername: username,
    currentUser: currentUser,
    isOwnProfile: isOwnProfile,
    hasToken: !!token
  });

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/profile/${username}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (!response.ok) {
        throw new Error(response.status === 404 ? 'User not found' : 'Failed to load profile');
      }

      const data = await response.json();
      setProfile(data.profile);
      setFollowing(data.profile.isFollowing || false);
      setBlocked(data.profile.isBlocked || false);
      setEditForm({
        bio: data.profile.bio || '',
        dob: data.profile.dob || '',
        avatar_emoji: data.profile.avatar_emoji || '',
        avatar_image: data.profile.avatar_image || ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!token || isOwnProfile) return;
    
    try {
      setFollowLoading(true);
      const method = following ? 'DELETE' : 'POST';
      const response = await fetch(`${API_URL}/profile/${username}/follow`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to update follow status');
      }

      setFollowing(!following);
      // Update follower count
      setProfile(prev => ({
        ...prev,
        followerCount: following ? prev.followerCount - 1 : prev.followerCount + 1
      }));
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleBlock = async () => {
    if (!token || isOwnProfile) return;
    
    const action = blocked ? 'unblock' : 'block';
    if (!blocked && !window.confirm(`Block ${username}? You won't see their posts and they can't message you.`)) {
      return;
    }
    
    try {
      setBlockLoading(true);
      const method = blocked ? 'DELETE' : 'POST';
      const response = await fetch(`${API_URL}/moderation/block/${username}`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} user`);
      }

      setBlocked(!blocked);
      if (!blocked) {
        // If blocking, also unfollow
        setFollowing(false);
        setProfile(prev => ({
          ...prev,
          followerCount: Math.max(0, (prev.followerCount || 0) - 1)
        }));
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setBlockLoading(false);
    }
  };

  const handleMessage = async (userId) => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/messages/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ otherUserId: userId })
      });

      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }

      const data = await response.json();
      // Signal to parent to open messages panel
      if (window.openMessagesPanel) {
        window.openMessagesPanel(data.conversationId);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    try {
      setSaving(true);
      const response = await fetch(`${API_URL}/profile/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updated = await response.json();
      setProfile(prev => ({ ...prev, ...updated }));
      setIsEditing(false);
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-8 max-w-2xl w-full mx-4 border border-amber-900/30">
          <div className="text-amber-400 text-center">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-8 max-w-2xl w-full mx-4 border border-amber-900/30">
          <div className="text-red-400 text-center mb-4">{error}</div>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-gray-900 rounded-lg p-6 max-w-3xl w-full mx-4 my-8 border border-amber-900/30">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="text-5xl">
              {profile.avatar_emoji || profile.avatar_image || '👤'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-amber-400">{profile.username}</h2>
              {isOwnProfile && profile.email && (
                <p className="text-sm text-gray-400">{profile.email}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Action Buttons (if not own profile) */}
        {!isOwnProfile && token && (
          <div className="mb-6 space-y-2">
            <div className="flex gap-2">
              <button
                onClick={handleFollow}
                disabled={followLoading || blocked}
                className={`flex-1 px-4 py-2 rounded font-medium transition ${
                  following 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                } ${(followLoading || blocked) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {followLoading ? 'Loading...' : following ? 'Following' : 'Follow'}
              </button>
              <button
                onClick={() => handleMessage(profile.id)}
                disabled={blocked}
                className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition ${blocked ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Message
              </button>
            </div>
            <button
              onClick={handleBlock}
              disabled={blockLoading}
              className={`w-full px-4 py-2 rounded font-medium transition ${
                blocked 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              } ${blockLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {blockLoading ? 'Loading...' : blocked ? 'Unblock User' : 'Block User'}
            </button>
          </div>
        )}

        {/* Profile Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-black/30 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">{profile.postCount}</div>
            <div className="text-sm text-gray-400">Posts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">{profile.followerCount || 0}</div>
            <div className="text-sm text-gray-400">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">{profile.followingCount || 0}</div>
            <div className="text-sm text-gray-400">Following</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">
              {profile.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : '—'}
            </div>
            <div className="text-sm text-gray-400">Age</div>
          </div>
        </div>

        {/* Bio Section */}
        {!isEditing ? (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-amber-400">Bio</h3>
              {isOwnProfile && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded transition"
                >
                  Edit Profile
                </button>
              )}
            </div>
            <p className="text-gray-300 whitespace-pre-wrap">
              {profile.bio || 'No bio yet.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleEditSubmit} className="mb-6 space-y-4">
            <h3 className="text-lg font-semibold text-amber-400">Edit Profile</h3>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Bio</label>
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                className="w-full px-3 py-2 bg-black/30 border border-amber-900/30 rounded text-white resize-none"
                rows={4}
                maxLength={500}
              />
              <div className="text-xs text-gray-500 text-right">{editForm.bio.length}/500</div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Date of Birth</label>
              <input
                type="date"
                value={editForm.dob}
                onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                className="w-full px-3 py-2 bg-black/30 border border-amber-900/30 rounded text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Avatar Emoji</label>
              <input
                type="text"
                value={editForm.avatar_emoji}
                onChange={(e) => setEditForm({ ...editForm, avatar_emoji: e.target.value })}
                className="w-full px-3 py-2 bg-black/30 border border-amber-900/30 rounded text-white"
                placeholder="e.g., 🧙‍♂️"
                maxLength={10}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Avatar Image URL</label>
              <input
                type="url"
                value={editForm.avatar_image}
                onChange={(e) => setEditForm({ ...editForm, avatar_image: e.target.value })}
                className="w-full px-3 py-2 bg-black/30 border border-amber-900/30 rounded text-white"
                placeholder="https://..."
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Recent Posts */}
        <div>
          <h3 className="text-lg font-semibold text-amber-400 mb-3">Recent Posts</h3>
          {profile.posts && profile.posts.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {profile.posts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 bg-black/30 rounded-lg border border-amber-900/20 hover:border-amber-900/40 transition"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs text-gray-400">
                      {new Date(post.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                    {post.philosopher && (
                      <span className="text-xs px-2 py-1 bg-amber-900/20 text-amber-400 rounded">
                        {post.philosopher}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm line-clamp-3">{post.content}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>💬 {post.comment_count || 0}</span>
                    <span>👍 {post.likes_count || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No posts yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
