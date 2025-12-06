import React, { useState } from 'react';

const REACTIONS = [
  { type: 'like', emoji: '👍', label: 'Like' },
  { type: 'love', emoji: '❤️', label: 'Love' },
  { type: 'inspire', emoji: '✨', label: 'Inspire' },
  { type: 'reflect', emoji: '🤔', label: 'Reflect' },
  { type: 'wisdom', emoji: '🦉', label: 'Wisdom' }
];

export default function ReactionsBar({ postId, reactions = {}, userReactions = [], onReact }) {
  const [showPicker, setShowPicker] = useState(false);
  const [isAnimating, setIsAnimating] = useState(null);

  const handleReact = async (type) => {
    setIsAnimating(type);
    await onReact(postId, type);
    setTimeout(() => setIsAnimating(null), 300);
    setShowPicker(false);
  };

  // Calculate total reactions
  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);

  return (
    <div className="relative flex items-center gap-2">
      {/* Reaction picker button */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="text-[11px] rounded-lg border border-amber-300/60 bg-amber-50/40 px-2.5 py-0.5 text-amber-800 hover:bg-amber-100/60 transition-colors font-serif flex items-center gap-1"
          title="React to this post"
        >
          <span className="text-sm">+</span>
          <span>React</span>
        </button>

        {/* Reaction picker dropdown */}
        {showPicker && (
          <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border border-amber-200 p-2 flex gap-1 z-50">
            {REACTIONS.map(({ type, emoji, label }) => (
              <button
                key={type}
                onClick={() => handleReact(type)}
                className={`
                  text-2xl hover:scale-125 transition-transform p-2 rounded
                  ${userReactions.includes(type) ? 'bg-amber-100 ring-2 ring-amber-400' : 'hover:bg-amber-50'}
                  ${isAnimating === type ? 'animate-bounce' : ''}
                `}
                title={label}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Display existing reactions */}
      {totalReactions > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {REACTIONS.map(({ type, emoji }) => {
            const count = reactions[type] || 0;
            if (count === 0) return null;

            const isUserReaction = userReactions.includes(type);

            return (
              <button
                key={type}
                onClick={() => handleReact(type)}
                className={`
                  text-xs rounded-full px-2 py-0.5 transition-all font-serif
                  flex items-center gap-1
                  ${isUserReaction 
                    ? 'bg-amber-200 text-amber-900 border border-amber-400 font-semibold' 
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }
                `}
                title={`${count} ${type} reaction${count !== 1 ? 's' : ''}`}
              >
                <span>{emoji}</span>
                <span>{count}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
