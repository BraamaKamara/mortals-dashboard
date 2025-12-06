// src/reflect/reflector.js

/* ---------- tiny helpers shared with the app ---------- */
const dateKey = (d) => new Date(d).toISOString().slice(0, 10);
const todayKey = () => dateKey(new Date());

const startOfWeek = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday start
  x.setDate(x.getDate() + diff);
  return x;
};
const endOfWeek = (d) => {
  const s = startOfWeek(d);
  const e = new Date(s);
  e.setDate(s.getDate() + 7);
  e.setMilliseconds(-1);
  return e;
};

const _addYears = (d, y) => {
  const x = new Date(d);
  const target = x.getFullYear() + Number(y || 0);
  // handle Feb 29 gracefully
  if (x.getMonth() === 1 && x.getDate() === 29) {
    const tmp = new Date(x);
    tmp.setFullYear(target, 1, 28);
    return tmp;
  }
  const out = new Date(x);
  out.setFullYear(target);
  return out;
};

const lifeProgress01 = () => {
  try {
    const dob = localStorage.getItem("mortals.dob") || "";
    const span = Number(JSON.parse(localStorage.getItem("mortals.lifespan") || "0"));
    if (!dob || !span) return 0;
    const dobDate = new Date(dob + "T00:00:00");
    const end = _addYears(dobDate, span);
    const total = end - dobDate;
    const elapsed = new Date() - dobDate;
    if (!isFinite(total) || total <= 0) return 0;
    const p = elapsed / total;
    return Math.max(0, Math.min(1, p));
  } catch {
    return 0;
  }
};

/* ---------- public API ---------- */

/** Build a “snapshot” of the user’s current context from localStorage. */
export function buildSnapshot(now = new Date()) {
  const dk = todayKey();

  // Big 3 (today)
  let big3 = [];
  try {
    big3 = JSON.parse(localStorage.getItem(`mortals.big3.${dk}`) || "[]");
  } catch {}

  // Ledger (today)
  let ledger = [];
  try {
    ledger = JSON.parse(localStorage.getItem(`mortals.ledger.${dk}`) || "[]");
  } catch {}

  // DOB & lifespan
  const dob = localStorage.getItem("mortals.dob") || "";
  const lifespan = Number(JSON.parse(localStorage.getItem("mortals.lifespan") || "0"));

  // Values (from Values Compass, optional)
  let values = [];
  try {
    const raw = JSON.parse(localStorage.getItem("mortals.values") || "[]");
    if (Array.isArray(raw)) values = raw.filter(Boolean);
  } catch {}

  // Capsules (all time)
  let capsulesCount = 0;
  try {
    const caps = JSON.parse(localStorage.getItem("mortals.capsules") || "[]");
    if (Array.isArray(caps)) capsulesCount = caps.length;
  } catch {}

  // Weekly window
  const wStart = startOfWeek(now);
  const wEnd = endOfWeek(now);
  const wLabel = `${wStart.toLocaleDateString()} — ${new Date(wEnd).toLocaleDateString()}`;

  // Ledger by day for this week
  const ledgerDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(wStart);
    d.setDate(wStart.getDate() + i);
    const key = dateKey(d);
    let entries = [];
    try {
      entries = JSON.parse(localStorage.getItem(`mortals.ledger.${key}`) || "[]");
      if (!Array.isArray(entries)) entries = [];
    } catch {
      entries = [];
    }
    ledgerDays.push({ key, date: d, entries });
  }

  // Gratitude entries this week (optional feature)
  const gratitude = [];
  for (const day of ledgerDays) {
    try {
      const g = JSON.parse(localStorage.getItem(`mortals.gratitude.${day.key}`) || "[]");
      if (Array.isArray(g) && g.length) gratitude.push(...g);
    } catch {}
  }

  // Life progress (0..1)
  const progress = { pct: lifeProgress01() };

  return {
    now,
    dk,
    // today
    big3,
    ledger,

    // settings
    settings: { dob, lifespan },

    // weekly aggregates
    wLabel,
    ledgerDays, // [{ key, date, entries: [...] }, ...]
    gratitude,  // entries this week (array), may be empty
    capsulesCount,

    // extras
    values,
    progress,
  };
}

/** Produce gentle, human-readable nudges based on the snapshot. */
export function generateInsights(s) {
  const tips = [];

  // Big 3 nudge
  const done = (s.big3 || []).filter((x) => x?.done).length;
  if (done === 0) tips.push("None of today’s Big 3 are checked. Choose one small win before evening.");

  // Time ledger balance (today)
  const sum = (s.ledger || []).reduce((a, b) => a + (Number(b.minutes) || 0), 0);
  if (sum < 25) tips.push("You’ve logged little/no time in: Deep Work, Care, Rest, Admin. Consider one 25-minute block there.");

  // Gratitude nudge (today)
  try {
    const g = JSON.parse(localStorage.getItem(`mortals.gratitude.${s.dk}`) || "[]");
    if (!Array.isArray(g) || g.length === 0) {
      tips.push("No gratitude/help logged today — try one simple thank-you or act of care.");
    }
  } catch {
    tips.push("No gratitude/help logged today — try one simple thank-you or act of care.");
  }

  return tips;
}

/** Answer a reflective question locally (simple rules-based replies). */
export function answerQuestion(s, question) {
  if (!question || !question.trim()) return "Try asking about your time, values, gratitude, neglect, or past seasons.";
  const q = question.toLowerCase();

  // Circle of influence / people
  if (q.includes("circle") || (q.includes("who") && (q.includes("help") || q.includes("people") || q.includes("my")))) {
    try {
      const allPeople = new Set();
      const keys = Object.keys(localStorage);
      const gratitudeKeys = keys.filter(k => k.startsWith("mortals.gratitude.") && k.includes("-W"));
      
      for (const key of gratitudeKeys) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || "[]");
          if (Array.isArray(data)) {
            data.forEach(g => {
              if (g.person) allPeople.add(g.person);
            });
          }
        } catch {}
      }
      
      if (allPeople.size > 0) {
        return `Your circle includes: ${Array.from(allPeople).join(", ")}. These are the people you've connected with through gratitude, help, and support.`;
      }
      
      return "Your circle of influence grows through connection. Start by recording one person you thanked, helped, or supported in the Gratitude Ledger.";
    } catch {
      return "I couldn't access your connection data. Try recording your interactions in the Gratitude Ledger to build your circle.";
    }
  }

  // Milestones / achievements / timeline
  if (q.includes("milestone") || q.includes("achievement") || q.includes("pivotal") || q.includes("moment")) {
    try {
      const timeline = JSON.parse(localStorage.getItem("mortals.timeline.v1") || "[]");
      if (timeline && timeline.length > 0) {
        const sorted = timeline.sort((a, b) => b.year - a.year);
        const recent = sorted.slice(0, 3);
        const summary = recent.map(m => `${m.year}: ${m.event} (${m.significance}★)`).join(" • ");
        return `Your recent pivotal moments: ${summary}. ${timeline.length} total moments recorded in your Life Review Timeline.`;
      }
      
      return "You haven't recorded any pivotal moments yet. Visit the Life Review Timeline to capture the moments that shaped you.";
    } catch {
      return "I couldn't access your timeline. Visit the Life Review Timeline to record your pivotal life moments.";
    }
  }

  // Values / what matters
  if ((q.includes("value") || q.includes("what matters") || q.includes("principle")) && !q.includes("living")) {
    if (s.values && s.values.length > 0) {
      const valuesList = s.values.map(v => v.name || v).join(", ");
      return `Your core values: ${valuesList}. These guide your decisions and define what matters most to you.`;
    }
    return "You haven't defined your core values yet. Visit the Values Compass to identify what truly matters to you.";
  }

  // Time / where time goes
  if (q.includes("time") && (q.includes("where") || q.includes("spend") || q.includes("go"))) {
    const now = new Date(s.now);
    const start = startOfWeek(now);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(dateKey(d));
    }
    let total = 0;
    const byTag = {};
    for (const dk of days) {
      const arr = JSON.parse(localStorage.getItem(`mortals.ledger.${dk}`) || "[]");
      for (const x of arr) {
        const m = Number(x.minutes) || 0;
        const tg = x.tag || "Unlabeled";
        total += m;
        byTag[tg] = (byTag[tg] || 0) + m;
      }
    }
    
    if (total === 0) {
      return "You haven't logged any time this week. Start tracking your activities to see where your time actually goes.";
    }
    
    const breakdown = Object.entries(byTag)
      .sort((a, b) => b[1] - a[1])
      .map(([t, m]) => `${t}: ${Math.round(m / 60)}h ${m % 60}m`)
      .join(" • ");
    
    return `This week's time breakdown (${Math.round(total / 60)}h total): ${breakdown}`;
  }

  // Living values / alignment
  if (q.includes("living") && q.includes("value")) {
    if (!s.values || s.values.length === 0) {
      return "Define your values first in the Values Compass, then I can help you reflect on whether you're living them.";
    }
    
    const total = s.ledgerDays.reduce((sum, day) => {
      return sum + day.entries.reduce((s2, e) => s2 + (Number(e.minutes) || 0), 0);
    }, 0);
    
    if (total < 60) {
      return `You've defined values: ${s.values.map(v => v.name || v).join(", ")}. Track your time this week to see if your actions align with what matters most.`;
    }
    
    return `You've defined values: ${s.values.map(v => v.name || v).join(", ")}. Review your time ledger - are you spending time on what truly matters?`;
  }

  // neglect?
  if (q.includes("neglect")) {
    const tags = (s.ledger || []).map((x) => x.tag || "Unlabeled");
    const hasCare = tags.includes("Care");
    const hasRest = tags.includes("Rest");
    if (!hasCare || !hasRest) {
      return "You might be neglecting Care or Rest. Schedule one small check-in or a 20-minute walk today.";
    }
    return "Nothing obvious is neglected today; pick the smallest task that moves a long-term goal by 1%.";
  }

  // how was my week?
  if (q.includes("how was my week")) {
    const now = new Date(s.now);
    const start = startOfWeek(now);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(dateKey(d));
    }
    let total = 0;
    const byTag = {};
    for (const dk of days) {
      const arr = JSON.parse(localStorage.getItem(`mortals.ledger.${dk}`) || "[]");
      for (const x of arr) {
        const m = Number(x.minutes) || 0;
        const tg = x.tag || "Unlabeled";
        total += m;
        byTag[tg] = (byTag[tg] || 0) + m;
      }
    }
    const mix =
      Object.entries(byTag)
        .sort((a, b) => b[1] - a[1])
        .map(([t, m]) => `${t} ${m}m`)
        .slice(0, 3)
        .join(", ") || "no entries";
    return `This week totals ~${total} minutes. Top mix: ${mix}. Consider one Deep Work block and one act of Care before week’s end.`;
  }

  // last winter / last year (coarse)
  if (q.includes("last winter") || q.includes("last year")) {
    const back = new Date(s.now);
    back.setMonth(back.getMonth() - 11);
    const near = dateKey(back);
    const note = localStorage.getItem(`mortals.review.${near}`)
      ? "You did a daily review around that time."
      : "No stored reviews from that exact day.";
    return `About a year ago (${near}), ${note} Try browsing your capsules or weekly notes to recall what mattered.`;
  }

  // default reflection
  return "I can help you reflect on: your circle of influence (who's helped you), milestones (pivotal moments), values (what matters), time allocation (where your time goes), gratitude patterns, or what you might be neglecting. What would you like to explore?";
}
