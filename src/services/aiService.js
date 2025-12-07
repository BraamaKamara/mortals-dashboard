const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function getAuthToken() {
  return localStorage.getItem('mortals.auth.token');
}

async function fetchInsights() {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE}/api/ai/insights`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'AI request failed' }));
    throw new Error(error.error || 'AI request failed');
  }

  return response.json();
}

export const aiService = {
  fetchInsights
};
