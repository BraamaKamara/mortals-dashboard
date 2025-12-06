import React, { useState, useEffect } from 'react';
import MarkdownContent from './MarkdownContent';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export default function BookmarksView({ onClose }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const token = localStorage.getItem('mortals.auth.token');

  useEffect(() => {
    fetchBookmarks();
  }, [page]);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/bookmarks?page=${page}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch bookmarks');
      
      const data = await response.json();
      setBookmarks(prev => page === 1 ? data.posts : [...prev, ...data.posts]);
      setHasMore(data.pagination.hasMore);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (postId) => {
    try {
      const response = await fetch(`${API_URL}/bookmarks/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to remove bookmark');
      
      setBookmarks(prev => prev.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
      alert('Failed to remove bookmark');
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-amber-50 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-amber-300">
          <h2 className="text-xl font-bold text-amber-900">📑 Bookmarks</h2>
          <button
            onClick={onClose}
            className="text-amber-700 hover:text-amber-900 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && bookmarks.length === 0 ? (
            <div className="text-center text-amber-700 py-8">Loading...</div>
          ) : bookmarks.length === 0 ? (
            <div className="text-center text-amber-700 py-8">
              <div className="text-4xl mb-2">📚</div>
              <p>No bookmarks yet</p>
              <p className="text-sm mt-2">Bookmark posts to read them later</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookmarks.map(post => (
                <div
                  key={post.id}
                  className="bg-white border-2 border-amber-300 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{post.avatar_emoji || '👤'}</span>
                      <div>
                        <div className="font-semibold text-amber-900">{post.author}</div>
                        <div className="text-xs text-amber-600">{formatDate(post.created_at)}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeBookmark(post.id)}
                      className="text-amber-700 hover:text-red-600 transition"
                      title="Remove bookmark"
                    >
                      🔖
                    </button>
                  </div>

                  <div className="text-amber-900 mb-2">
                    <MarkdownContent content={post.content} />
                  </div>

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {post.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-3 text-sm text-amber-700">
                    <span>❤️ {post.reaction_count || 0}</span>
                    <span>💬 {post.comment_count || 0}</span>
                    <span className="text-xs text-amber-600">
                      Saved {formatDate(post.bookmarked_at)}
                    </span>
                  </div>
                </div>
              ))}

              {hasMore && (
                <button
                  onClick={() => setPage(prev => prev + 1)}
                  disabled={loading}
                  className="w-full py-2 text-amber-700 hover:text-amber-900 font-semibold disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
