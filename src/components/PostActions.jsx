import React, { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export default function PostActions({ post, onUpdate, onHide }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem('mortals.auth.token');
  const currentUser = localStorage.getItem('mortals.auth.username');
  const isOwnPost = post.author_username === currentUser;

  const handleBookmark = async () => {
    if (!token) {
      alert('Please log in to bookmark posts');
      return;
    }

    try {
      const method = post.is_bookmarked ? 'DELETE' : 'POST';
      const response = await fetch(`${API_URL}/bookmarks/${post.id}`, {
        method,
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to update bookmark');
      
      onUpdate && onUpdate({ ...post, is_bookmarked: !post.is_bookmarked });
      setShowMenu(false);
    } catch (error) {
      console.error('Error bookmarking:', error);
      alert('Failed to bookmark post');
    }
  };

  const handleHide = async () => {
    if (!token) return;

    if (!window.confirm('Hide this post? You won\'t see it in your feed anymore.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/moderation/hide/${post.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to hide post');
      
      onHide && onHide(post.id);
      setShowMenu(false);
    } catch (error) {
      console.error('Error hiding post:', error);
      alert('Failed to hide post');
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    if (!token || !reportReason.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/moderation/report/post/${post.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: reportReason.trim() })
      });

      if (!response.ok) throw new Error('Failed to submit report');
      
      alert('Report submitted. Thank you for helping keep our community safe.');
      setShowReportModal(false);
      setShowMenu(false);
      setReportReason('');
    } catch (error) {
      console.error('Error reporting post:', error);
      alert('Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="text-amber-700 hover:text-amber-900 text-xl font-bold px-2"
          title="Post actions"
        >
          ⋮
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-8 z-50 bg-white border-2 border-amber-300 rounded-lg shadow-lg py-1 w-48">
              {token && (
                <>
                  <button
                    onClick={handleBookmark}
                    className="w-full px-4 py-2 text-left text-amber-900 hover:bg-amber-50 flex items-center gap-2"
                  >
                    <span>{post.is_bookmarked ? '🔖' : '📑'}</span>
                    {post.is_bookmarked ? 'Remove Bookmark' : 'Bookmark'}
                  </button>
                  
                  {!isOwnPost && (
                    <>
                      <button
                        onClick={handleHide}
                        className="w-full px-4 py-2 text-left text-amber-900 hover:bg-amber-50 flex items-center gap-2"
                      >
                        <span>🙈</span>
                        Hide Post
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowReportModal(true);
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-red-700 hover:bg-red-50 flex items-center gap-2"
                      >
                        <span>🚩</span>
                        Report
                      </button>
                    </>
                  )}
                </>
              )}

              {!token && (
                <div className="px-4 py-2 text-sm text-amber-700">
                  Login to interact
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-amber-900 mb-4">Report Post</h3>
            <form onSubmit={handleReport}>
              <p className="text-sm text-amber-700 mb-3">
                Please explain why you're reporting this post:
              </p>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="e.g., Spam, harassment, inappropriate content..."
                className="w-full p-3 border-2 border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 mb-4"
                rows={4}
                maxLength={500}
                required
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowReportModal(false);
                    setReportReason('');
                  }}
                  className="px-4 py-2 text-amber-700 hover:bg-amber-50 rounded"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!reportReason.trim() || submitting}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
