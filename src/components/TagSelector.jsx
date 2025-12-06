import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export default function TagSelector({ selectedTags = [], onChange, maxTags = 5, className = '' }) {
  const [availableTags, setAvailableTags] = useState([]);
  const [customTag, setCustomTag] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch(`${API_URL}/posts/tags`);
      if (response.ok) {
        const data = await response.json();
        setAvailableTags(data.tags || []);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const toggleTag = (tagName) => {
    if (selectedTags.includes(tagName)) {
      onChange(selectedTags.filter(t => t !== tagName));
    } else if (selectedTags.length < maxTags) {
      onChange([...selectedTags, tagName]);
    }
  };

  const addCustomTag = () => {
    const tag = customTag.toLowerCase().trim();
    if (tag && !selectedTags.includes(tag) && selectedTags.length < maxTags && tag.length <= 30) {
      onChange([...selectedTags, tag]);
      setCustomTag('');
      setShowDropdown(false);
    }
  };

  const popularTags = availableTags.slice(0, 10);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-amber-800">
          Tags ({selectedTags.length}/{maxTags})
        </label>
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="text-xs text-amber-600 hover:text-amber-700 underline"
        >
          {showDropdown ? 'Hide' : 'Browse Tags'}
        </button>
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-amber-200 text-amber-900 rounded-full text-sm font-medium"
            >
              {tag}
              <button
                type="button"
                onClick={() => toggleTag(tag)}
                className="hover:text-red-600 transition"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Tag Dropdown */}
      {showDropdown && (
        <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200 space-y-3">
          {/* Popular Tags */}
          <div>
            <div className="text-xs font-semibold text-amber-700 mb-2">Popular Tags</div>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <button
                  key={tag.name}
                  type="button"
                  onClick={() => toggleTag(tag.name)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                    selectedTags.includes(tag.name)
                      ? 'bg-amber-600 text-white'
                      : 'bg-white text-amber-800 hover:bg-amber-100 border border-amber-200'
                  }`}
                  disabled={!selectedTags.includes(tag.name) && selectedTags.length >= maxTags}
                >
                  {tag.name} ({tag.post_count})
                </button>
              ))}
            </div>
          </div>

          {/* Custom Tag Input */}
          <div>
            <div className="text-xs font-semibold text-amber-700 mb-2">Add Custom Tag</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                placeholder="Type a tag name..."
                maxLength={30}
                className="flex-1 px-3 py-1.5 text-sm rounded border border-amber-200 outline-none focus:ring-2 focus:ring-amber-400"
                disabled={selectedTags.length >= maxTags}
              />
              <button
                type="button"
                onClick={addCustomTag}
                disabled={!customTag.trim() || selectedTags.length >= maxTags}
                className="px-3 py-1.5 bg-amber-600 text-white text-sm rounded hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedTags.length === 0 && (
        <p className="text-xs text-amber-700/60">
          Add tags to help others discover your post
        </p>
      )}
    </div>
  );
}
