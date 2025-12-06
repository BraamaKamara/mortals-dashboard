import React from 'react';

export function SkeletonPost() {
  return (
    <div className="skeleton-post">
      <div className="flex items-center gap-3 mb-3">
        <div className="skeleton-avatar" />
        <div className="flex-1">
          <div className="skeleton-text-short" style={{ width: '40%' }} />
          <div className="skeleton-text-short" style={{ width: '25%', height: '12px' }} />
        </div>
      </div>
      <div className="skeleton-text" />
      <div className="skeleton-text" />
      <div className="skeleton-text-short" style={{ width: '60%' }} />
      <div className="flex gap-2 mt-3">
        <div className="skeleton" style={{ width: '80px', height: '28px', borderRadius: '14px' }} />
        <div className="skeleton" style={{ width: '80px', height: '28px', borderRadius: '14px' }} />
      </div>
    </div>
  );
}

export function SkeletonPostList({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonPost key={i} />
      ))}
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '50%' }} />
        <div className="flex-1">
          <div className="skeleton-text-short" style={{ width: '50%', height: '24px', marginBottom: '8px' }} />
          <div className="skeleton-text-short" style={{ width: '70%', height: '16px' }} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="text-center">
            <div className="skeleton" style={{ width: '60px', height: '32px', margin: '0 auto 8px' }} />
            <div className="skeleton-text-short" style={{ width: '80%', height: '12px', margin: '0 auto' }} />
          </div>
        ))}
      </div>
      <SkeletonPostList count={2} />
    </div>
  );
}

export function SkeletonMessage() {
  return (
    <div className="flex gap-3 p-3">
      <div className="skeleton-avatar" style={{ width: '32px', height: '32px' }} />
      <div className="flex-1">
        <div className="skeleton-text-short" style={{ width: '30%', marginBottom: '4px' }} />
        <div className="skeleton-text" style={{ width: '90%' }} />
      </div>
    </div>
  );
}

export function SkeletonMessageList({ count = 5 }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonMessage key={i} />
      ))}
    </div>
  );
}
