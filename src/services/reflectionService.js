/**
 * Reflection Suite API Service
 * Client-side service for interacting with backend reflection endpoints
 */

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Helper function to get auth token
function getAuthToken() {
  const auth = JSON.parse(localStorage.getItem('mortals.auth') || '{}');
  return auth.token || null;
}

// Helper to make authenticated requests
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };

  const response = await fetch(`${API_BASE}/api/reflection${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `API Error: ${response.status}`);
  }

  return await response.json();
}

// ============================================================================
// PRESENCE INDEX
// ============================================================================

export const presenceIndexService = {
  /**
   * Save presence index for today
   * @param {number} score - 0-100
   * @param {object} breakdown - { reflection, gratitude, relationships, deep_work, sleep }
   */
  async savePresenceIndex(score, breakdown) {
    return apiRequest('/presence-index', {
      method: 'POST',
      body: JSON.stringify({ score, breakdown })
    });
  },

  /**
   * Get presence index for a specific date
   * @param {string} date - YYYY-MM-DD format
   */
  async getPresenceIndex(date) {
    return apiRequest(`/presence-index/${date}`, { method: 'GET' });
  },

  /**
   * Get presence index stats for last N days
   * @param {number} days - Number of days to fetch (default 7)
   */
  async getPresenceStats(days = 7) {
    return apiRequest(`/presence-index-stats/${days}`, { method: 'GET' });
  }
};

// ============================================================================
// CONTINUITY TRACKER
// ============================================================================

export const continuityTrackerService = {
  /**
   * Log a day as intentional or not
   * @param {boolean} is_intentional - Whether the day was intentionally lived
   * @param {string} note - Optional note about the day
   * @param {string} date - Optional date (YYYY-MM-DD), defaults to today
   */
  async logContinuityDay(is_intentional, note = null, date = null) {
    return apiRequest('/continuity-tracker', {
      method: 'POST',
      body: JSON.stringify({ date, is_intentional, note })
    });
  },

  /**
   * Get current and longest streaks
   */
  async getStreaks() {
    return apiRequest('/continuity-streak', { method: 'GET' });
  },

  /**
   * Get continuity history for last N days
   * @param {number} days - Default 84 (12 weeks)
   */
  async getContinuityHistory(days = 84) {
    return apiRequest(`/continuity-history/${days}`, { method: 'GET' });
  }
};

// ============================================================================
// ETHICAL NUDGES
// ============================================================================

export const ethicalNudgeService = {
  /**
   * Get all active (unacknowledged) nudges
   */
  async getActiveNudges() {
    return apiRequest('/ethical-nudges', { method: 'GET' });
  },

  /**
   * Create a new nudge (usually by system)
   */
  async createNudge(nudge_type, title, message, severity = 'warning', color = 'slate') {
    return apiRequest('/ethical-nudges', {
      method: 'POST',
      body: JSON.stringify({ nudge_type, title, message, severity, color })
    });
  },

  /**
   * Acknowledge a nudge
   * @param {number} nudgeId - The nudge to acknowledge
   */
  async acknowledgeNudge(nudgeId) {
    return apiRequest(`/ethical-nudges/${nudgeId}/acknowledge`, { method: 'PUT' });
  }
};

// ============================================================================
// ETHICAL REFLECTIONS
// ============================================================================

export const ethicalReflectionService = {
  /**
   * Save an ethical reflection response
   */
  async saveReflection(prompt_id, prompt_category, question, user_response) {
    return apiRequest('/ethical-reflections', {
      method: 'POST',
      body: JSON.stringify({
        prompt_id,
        prompt_category,
        question,
        user_response
      })
    });
  },

  /**
   * Get all reflections for user
   * @param {number} limit - Max number of reflections to return (default 50)
   */
  async getReflections(limit = 50) {
    return apiRequest(`/ethical-reflections?limit=${limit}`, { method: 'GET' });
  },

  /**
   * Get a specific reflection
   */
  async getReflection(reflectionId) {
    return apiRequest(`/ethical-reflections/${reflectionId}`, { method: 'GET' });
  },

  /**
   * Add AI insight to a reflection
   */
  async updateReflectionInsight(reflectionId, ai_insight) {
    return apiRequest(`/ethical-reflections/${reflectionId}/insight`, {
      method: 'PUT',
      body: JSON.stringify({ ai_insight })
    });
  }
};

// ============================================================================
// MORAL PRESENCE LOG
// ============================================================================

export const moralPresenceService = {
  /**
   * Log a real-time moral presence score
   * @param {number} presence_score - 0-100
   * @param {object} contributors - { reflection, gratitude, relationships, mirror_mode, lost_time }
   */
  async logPresence(presence_score, contributors = {}) {
    return apiRequest('/moral-presence-log', {
      method: 'POST',
      body: JSON.stringify({ presence_score, contributors })
    });
  },

  /**
   * Get moral presence history for last N hours
   * @param {number} hours - Number of hours to fetch (default 24)
   */
  async getPresenceHistory(hours = 24) {
    return apiRequest(`/moral-presence-history/${hours}`, { method: 'GET' });
  }
};

export default {
  presenceIndexService,
  continuityTrackerService,
  ethicalNudgeService,
  ethicalReflectionService,
  moralPresenceService
};
