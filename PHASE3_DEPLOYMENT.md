# Phase 3 Deployment Guide: AI Synthesis

## What's New

**Backend (`server/`):**
- New `/api/ai/insights` endpoint (auth-protected) synthesizes recent reflections using OpenAI GPT-4o-mini
- Results cached in new `ai_insights` table (reused if <6h old)
- Requires `OPENAI_API_KEY` env var; optional `OPENAI_MODEL` (defaults to `gpt-4o-mini`)

**Frontend (`src/`):**
- New `AIInsightsPanel` component on dashboard header with "Synthesize" button
- Shows themes, suggestions, confidence, and cache status
- Integrated `aiService.js` for API calls with error/loading states

**Database:**
- New migration: `server/migrate-ai-insights.js` creates `ai_insights` table

---

## Deployment Steps

### 1. Configure Vercel Environment Variables

Go to **Vercel Dashboard** → **Settings** → **Environment Variables** for your backend project and add:

```
OPENAI_API_KEY=sk-...  (your OpenAI secret key)
OPENAI_MODEL=gpt-4o-mini  (optional; this is default)
```

### 2. Run Database Migration

**One-time on backend**:
```bash
cd server
node migrate-ai-insights.js
```

This creates the `ai_insights` table in Neon PostgreSQL.

### 3. Redeploy

Push a fresh build or manually trigger in Vercel:
- Frontend will serve new `AIInsightsPanel` and `aiService`
- Backend will load OpenAI SDK and register `/api/ai/insights` route

### 4. Verify

1. Dashboard should load without errors
2. Click "Synthesize" button in the AI Insights panel (under header)
3. Should fetch recent reflections and return a 2-3 line summary + themes + suggestion

---

## Architecture Notes

- **Snapshot Model**: AI fetches last 14 days presence, 21 days continuity, 8 nudges/reflections, 30 recent moral presence logs
- **Prompt**: System instructs model to produce 3 themes, 1 behavioral suggestion, confidence level in <180 words
- **Cache**: 6-hour TTL; reuse if within window, else regenerate
- **Tokens**: Logged in `ai_insights.tokens_used` for observability

---

## Troubleshooting

**"AI is not configured" error:**
- Check `OPENAI_API_KEY` is set in Vercel env vars (not in code)
- Verify key is active on platform.openai.com

**"No authentication token found":**
- User must be logged in before clicking Synthesize

**No insights returned:**
- User might have <7 days of reflection history; AI still generates but based on limited data
- Check backend logs for OpenAI API errors (rate limit, invalid key, etc.)

---

## Next Steps (Phase 4)

- Pattern detection: compute rolling streaks, anomaly alerts
- Advanced analytics: sparklines, volatility charts per modal
- Personalized nudges: AI-generated suggestions based on reflections

Good luck! 🚀
