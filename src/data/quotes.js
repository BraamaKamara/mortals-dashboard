// src/data/quotes.js
export const QUOTES = [
  { text: "You could leave life right now. Let that determine what you do and say and think.", author: "Marcus Aurelius", tag: "Stoic" },
  { text: "We suffer more in imagination than in reality.", author: "Seneca", tag: "Stoic" },
  { text: "No man has the power to have everything he wants, but he has it in his power not to want what he has not.", author: "Seneca", tag: "Stoic" },
  { text: "He who has a why to live can bear almost any how.", author: "Nietzsche", tag: "Philosophy" },
  { text: "What you do makes a difference, and you have to decide what kind of difference you want to make.", author: "Jane Goodall", tag: "Ethics" },
  { text: "I am because we are.", author: "Ubuntu Proverb", tag: "African" },
  { text: "Wisdom is like a baobab tree; no one individual can embrace it.", author: "Akan Proverb", tag: "African" },
  { text: "If you want to go fast, go alone. If you want to go far, go together.", author: "African Proverb", tag: "African" },
  { text: "When there is no enemy within, the enemies outside cannot hurt you.", author: "African Proverb", tag: "African" },
  { text: "You are not a drop in the ocean. You are the entire ocean in a drop.", author: "Rumi", tag: "Mystic" },
  { text: "Let yourself be silently drawn by the strange pull of what you really love.", author: "Rumi", tag: "Mystic" },
  { text: "Your work is to discover your work and then with all your heart to give yourself to it.", author: "Buddha (attrib.)", tag: "Wisdom" },
  { text: "Attention is the rarest and purest form of generosity.", author: "Simone Weil", tag: "Ethics" },
  { text: "The time you enjoy wasting is not wasted time.", author: "Bertrand Russell", tag: "Philosophy" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act but a habit.", author: "Will Durant (on Aristotle)", tag: "Habits" },
  { text: "One kind word can warm three winter months.", author: "Japanese Proverb", tag: "Kindness" },
  { text: "Silence is a source of great strength.", author: "Lao Tzu", tag: "Stillness" },
  { text: "To know what you know and what you do not know, that is true knowledge.", author: "Confucius", tag: "Wisdom" },
  { text: "What you seek is seeking you.", author: "Rumi", tag: "Mystic" },
  { text: "Character is fate.", author: "Heraclitus", tag: "Ethics" },
];

export const WEEKLY_PROMPTS = [
  "What would you still do if you had five years left?",
  "Whose memory of you do you wish to shape this week?",
  "What truth are you avoiding that wants to be faced?",
  "What small generosity could echo beyond today?",
  "What wisdom should you record so it outlives you?",
  "Where do you need patience more than speed?",
];

export function quoteOfToday(date = new Date()) {
  const idx = stableIndex(`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`, QUOTES.length);
  return QUOTES[idx];
}

export function weeklyPromptFor(date = new Date()) {
  // ISO week index
  const wk = isoWeekNumber(date);
  const idx = wk % WEEKLY_PROMPTS.length;
  return WEEKLY_PROMPTS[idx];
}

// --- optional debug helpers for console use ---
if (typeof window !== "undefined") {
  window.__mortals = window.__mortals || {};
  window.__mortals.quoteOf = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return quoteOfToday(d);
  };
  window.__mortals.weeklyPrompt = () => weeklyPromptFor(new Date());
}

// --- helpers ---
function stableIndex(seed, mod) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % mod;
}

function isoWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
  return Math.ceil((((date - yearStart) / 86400000) + 1)/7);
}
