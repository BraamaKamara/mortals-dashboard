# Phase 4: McMahan Philosophical Enhancements
## Deepening MORTALS with "The Ethics of Killing" Framework

**Date:** December 7, 2025  
**Status:** Planning & Design  
**Based on:** Jeff McMahan's "The Ethics of Killing" + ChatGPT philosophical assessment

---

## Executive Summary

Your MORTALS dashboard already captures McMahan's core ideas (psychological continuity, conscious states, death/value). Phase 4 enhances it with 7 new visualizations that operationalize McMahan's most sophisticated arguments—making abstract moral philosophy visually interactive and personally meaningful.

**Key insight:** McMahan isn't about judgment—he's about *visibility*. These features make identity, time value, and future potential *visible* as moral quantities.

---

## Mapping: Existing Modules → McMahan Depth

| Your Module | McMahan Connection | Enhancement Opportunity |
|---|---|---|
| **Presence Index** | Conscious states are ethically weighty | 3-layer consciousness bar (biological/conscious/narrative/reflective) |
| **Continuity Tracker** | Psychological connectedness (scalar, not binary) | Spiral showing memory/intention/value/narrative layers |
| **Moral Presence Gauge** | Capacity for moral reasons | Already aligned; enhance with threshold notifications |
| **Ethical Nudges** | Behavioral feedback | Add "lost future value" scoring to decisions |
| **Legacy/Epitaph** | Death matters because it ends the subject | Add "Life's Potential Curve" showing future value projection |

---

## Phase 4 Feature Set (Ordered by Implementation Complexity)

### 🟢 **TIER 1: Core Enhancements (Weeks 1-2)**
High impact, moderate complexity. Build on existing data.

#### 1. **Degrees of Self Spiral** ⭐ (Uniquely McMahan)
**What it is:** Visual spiral where each layer represents identity continuity dimensions

**McMahan foundation:**  
- Identity is scalar (degrees), not binary (yes/no)
- Psychological connectedness has multiple vectors: memory, intention, values, narrative
- Days with strong unity = tight spiral; fragmented days = loose spiral

**Data inputs:**
- Memory continuity score (from Continuity Tracker)
- Intention alignment (goals vs. actions today)
- Value coherence (reflections vs. behaviors)
- Narrative coherence (story-sense of day)

**Visual design:**
```
      Day 1 (Unified)          Day 5 (Fragmented)
      
         /|               /‾‾‾‾‾‾\
        / |              |        |
       /  |     vs      /          \
      /____|            |          |
          |             \____  ___/
          |                  \/
      (tight spiral)     (loose spiral)
```

**User experience:**
- Each morning: "Your identity spiral today is 73% unified"
- Hover layers: See memory/intention/value/narrative breakdown
- Weekly: "Your most unified day was Thursday (87%)"

**Database:** Add to `presence_index` or new `identity_spiral` table
```sql
CREATE TABLE identity_spiral (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  memory_continuity FLOAT, -- 0-1
  intention_continuity FLOAT,
  value_continuity FLOAT,
  narrative_continuity FLOAT,
  overall_unity FLOAT, -- average
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Frontend component:** `src/components/DegreesOfSelfSpiral.jsx`

---

#### 2. **Moral Weight of Moments** (Consciousness Quality Meter)
**What it is:** Daily breakdown showing how much time you spent in different consciousness tiers

**McMahan foundation:**  
- Conscious life > biological life
- Narrative/reflective life > mere consciousness
- Ethical weight scales with consciousness quality

**Data inputs:**
- Presence Index (existing)
- Focus time (from tracking)
- Reflective activities (journaling, meditation, ethical reflection)

**Visual design:** Stacked bar chart
```
Ethical-generative consciousness (dark purple)  [2h]
Reflective consciousness (purple)               [6h]
Rich consciousness (lavender)                   [8h]
Shallow consciousness (gray)                    [8h]
                                               Total: 24h
```

**Scoring logic:**
- Shallow (scrolling, routine tasks): 1 point/hour
- Rich (engaged work, hobbies, learning): 3 points/hour
- Reflective (journaling, meditation, philosophy): 5 points/hour
- Ethical-generative (helping others, moral deliberation): 7 points/hour

**User insight:**
- "Today's consciousness quality: 92/168 points (55%)"
- "You spent 12h in shallow consciousness—what's one reflective activity tomorrow?"
- Weekly trend: "Your quality is improving (Mon: 48% → Fri: 62%)"

**Database:**
```sql
ALTER TABLE presence_index ADD COLUMN consciousness_tier VARCHAR(20);
-- Values: 'shallow', 'rich', 'reflective', 'ethical_generative'
```

**Frontend:** `src/components/MoralWeightOfMoments.jsx`

---

#### 3. **Threshold Moments Alerts** (Identity Crossing Notifications)
**What it is:** Smart notifications when psychological continuity crosses McMahan's theoretical thresholds

**McMahan foundation:**  
- There are thresholds: when personhood emerges, fades, when moral concern shifts
- Modern life is full of identity threshold-crossings (burnout, values shift, connection loss)

**Threshold types & triggers:**

| Threshold | Trigger | Message |
|---|---|---|
| **Identity Crisis** | Continuity drops <40% for 3 days | "You are below the identity threshold—who are you becoming?" |
| **Unity Rise** | Continuity jumps >20% in 1 day | "You crossed a moral threshold—tomorrow's self will thank you." |
| **Consciousness Collapse** | Ethical-generative time drops 50% | "Your moral presence is fading. What matters to you?" |
| **Future-Self Bifurcation** | High variance in daily scores | "Your future selves are diverging. Which path calls to you?" |
| **Narrative Breakage** | Value coherence <50% | "Your story is fragmenting. Pause. What are you building?" |

**User experience:**
- Notification appears in dashboard
- Click → reveals which metric triggered it
- Suggest reflection prompt or nudge

**Database:** New table for threshold events
```sql
CREATE TABLE threshold_events (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  threshold_type VARCHAR(50),
  triggered_at TIMESTAMP,
  metric_value FLOAT,
  message TEXT,
  reflection_prompt TEXT
);
```

**Frontend:** Toast/banner notifications in `MortalsDashboard.jsx`

---

#### 4. **Life's Potential Curve** (Moral Value Projection)
**What it is:** Graph showing projected moral value trajectory over remaining lifespan, with dips for crises/burnout

**McMahan foundation:**  
- Death harm = future good lost
- Some periods of life have more potential moral value (youth, health, energy)
- Current trajectory affects future value projection

**Data inputs:**
- Age + estimated lifespan
- Current well-being/engagement (from Presence Index)
- Continuity/unity (from Spiral)
- Recent trends

**Visual design:** Line graph
```
Moral Value Potential
|
| ╱╲      ╱‾‾╲          ╱‾
|╱  ╲____╱    ╲        ╱   ← Burnout dip
|              ╲______╱      ← Recovery rise
|_____________________________→ Years Remaining
  Now   5y    10y   20y   40y
```

**Calculation logic (simplified McMahan model):**
```
future_moral_value = (life_satisfaction × consciousness_quality × continuity × years_remaining)
```

**User insights:**
- "Based on your current trajectory, your remaining moral value is $X"
- "Your burnout period (age 28-30) cost you ~$50k in lost future value"
- "Your recovery phase is adding +$2k/month back"

**Psychological impact:** Not guilt-inducing, but *clarifying*. Shows that time choices have real moral stakes.

**Database:** Projection table (regenerated weekly)
```sql
CREATE TABLE moral_value_projection (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  projection_date DATE,
  year_ahead INT, -- 0 = now, 1 = 1 year from now
  projected_value FLOAT,
  confidence_interval FLOAT
);
```

**Frontend:** `src/components/LifesPotentialCurve.jsx`

---

### 🟡 **TIER 2: Advanced Features (Weeks 3-4)**
More sophisticated, requires new data collection.

#### 5. **Future Selves Map** (Multiverse Tree)
**What it is:** Interactive branching tree showing your possible future selves, weighted by current habits/moods

**McMahan foundation:**  
- You have multiple possible future selves
- You have moral duties to each
- Which one are you "feeding" today?

**Data inputs:**
- Current habits (exercise, sleep, social connection, learning)
- Mood patterns (from daily check-ins)
- Values stated in reflections
- Decision patterns (choices made in nudges)

**Visual design:** Animated tree
```
                    Fulfilled Self (35%)
                   /
    You (today) ──┤── Creative Self (25%)
                   \
                    Depressed Self (20%)
                    
                    Burned-out Self (20%)
```

**User interaction:**
- Click a future self → see what daily habits feed it
- "Which future self are you becoming?" daily prompt
- Drag bars to see how changes shift probabilities

**Calculation:** Bayesian network or simple scoring
```
disciplined_self_weight = exercise_streak × sleep_quality × early_rising
creative_self_weight = learning_hours × reflection_depth × new_projects
depressed_self_weight = isolation_days × negative_reflection × inaction
```

**Database:** New table
```sql
CREATE TABLE future_self_branches (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  branch_name VARCHAR(50),
  baseline_weight FLOAT,
  created_at TIMESTAMP
);

CREATE TABLE future_self_weights (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  branch_id INT,
  weight_date DATE,
  weight_value FLOAT
);
```

**Frontend:** `src/components/FutureSelvesMap.jsx` (SVG-based interactive tree)

---

#### 6. **Counterfactual Survival Simulator** (Therapeutic Identity Tool)
**What it is:** Thought experiment module exploring which parts of your identity would "survive" different scenarios

**McMahan foundation:**  
- Personal identity ≠ biological continuity
- Identity can persist without memory, body, even values
- Clarifying what's essential to "you"

**Scenarios to explore:**
1. **Memory wipe:** "If you lost all memories, who would you still be?"
2. **Value collapse:** "If your core values changed, would you survive morally?"
3. **Relationship loss:** "If all social connections ended, what remains?"
4. **Skill/health loss:** "If you lost your abilities, would you still be you?"
5. **Consciousness pause:** "If you slept for 20 years, would you wake up as yourself?"

**User experience:** Interactive questionnaire
```
SCENARIO: Memory Wipe
"You wake up with no memories. Which of these would survive?"

☑ Your values & principles
☑ Your sense of humor
☑ Your body & appearance
☐ Your relationships
☐ Your knowledge & skills

You = 60% preserved (core values + personality)
Lost = 40% (memories, relationships, expertise)
```

**Output:** 
- Self-loss meter (% of identity that survives)
- Self-recovery timeline (how long to rebuild)
- Essential vs. accidental identity components

**Database:** Survey responses
```sql
CREATE TABLE counterfactual_scenarios (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  scenario_name VARCHAR(100),
  response_json JSONB,
  survival_percentage FLOAT,
  date TIMESTAMP
);
```

**Frontend:** `src/components/CounterfactualSurvivalSimulator.jsx`

---

#### 7. **Moral Harm of Wasted Time** (Future Value Ledger)
**What it is:** Hour-by-hour scoring showing which activities gain, neutral, or lose future moral value

**McMahan foundation:**  
- Wasted time = lost future good
- Some activities actively diminish future potential (compulsive loops, escapism)
- Visibility without guilt; awareness without judgment

**Scoring framework:**
```
GAINED FUTURE VALUE (Future-building)
  +3: Learning, creation, deep work
  +2: Exercise, sleep, meditation, connection
  +1: Maintenance (cooking, cleaning, admin)

NEUTRAL VALUE (Necessary baseline)
   0: Commute, necessary meetings, errands

LOST FUTURE VALUE (Future-diminishing)
  -1: Social media scrolling, TV binges
  -2: Procrastination spirals, substance use
  -3: Self-harm behaviors, toxic relationships
```

**User experience:** Activity logger
```
What did you do this hour?
[Dropdown: Deep work, Social media, Exercise, Sleep, ...]

Today's Future Value Score: +8
(6 hours building, 14 hours neutral, 2 hours wasting)

This week trend: Mon: +5 → Fri: +14 (improving!)
```

**Key messaging:** Not "you wasted time," but "that hour cost you $X in future value."

**Database:**
```sql
CREATE TABLE hourly_future_value (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  hour_date TIMESTAMP,
  activity VARCHAR(100),
  value_score INT, -- -3 to +3
  reflection TEXT
);
```

**Frontend:** `src/components/MoralHarmOfWastedTime.jsx`

---

### 🔴 **TIER 3: Integrations & Polish (Weeks 5-6)**

#### 8. **Dashboard Integration & Visualization Hub**
- New section: "McMahan Metrics"
- Weekly digest email showing philosophy summary
- Export data as "Identity Report"

#### 9. **AI-Powered Reflection Prompts**
- Use OpenAI (once AI route fixed) to generate McMahan-aligned reflections
- "Your continuity dipped 20%. What could your future self tell you?"
- "This activity cost you -3 future value. Why?"

#### 10. **Streak Analytics & Anomaly Detection**
- Detect when you cross thresholds automatically
- Pattern matching for burnout, identity fragmentation, etc.

---

## Implementation Priority

### **Phase 4A (Quick Wins - Do First)**
1. ✅ **Degrees of Self Spiral** (visual, uses existing data)
2. ✅ **Moral Weight of Moments** (enhancement to Presence Index)
3. ✅ **Threshold Moments Alerts** (rule engine)
4. ✅ **Life's Potential Curve** (calculation + graph)

### **Phase 4B (Medium Effort)**
5. **Future Selves Map** (tree visualization, moderate data)
6. **Moral Harm of Wasted Time** (activity logging UI)

### **Phase 4C (Complex)**
7. **Counterfactual Survival Simulator** (questionnaire, philosophical)
8. Full integration & AI prompts

---

## Technical Architecture

### **New Database Tables**
```sql
-- Identity Spiral
CREATE TABLE identity_spiral (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  date DATE NOT NULL,
  memory_continuity FLOAT,
  intention_continuity FLOAT,
  value_continuity FLOAT,
  narrative_continuity FLOAT,
  overall_unity FLOAT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Threshold Events
CREATE TABLE threshold_events (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  threshold_type VARCHAR(50),
  triggered_at TIMESTAMP DEFAULT NOW(),
  metric_value FLOAT,
  message TEXT,
  dismissed_at TIMESTAMP
);

-- Moral Value Projection
CREATE TABLE moral_value_projection (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  projection_date DATE,
  year_ahead INT,
  projected_value FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Future Selves
CREATE TABLE future_self_branches (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  branch_name VARCHAR(50),
  baseline_weight FLOAT
);

CREATE TABLE future_self_weights (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  branch_id INT NOT NULL REFERENCES future_self_branches(id),
  weight_date DATE,
  weight_value FLOAT
);

-- Hourly Future Value
CREATE TABLE hourly_future_value (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  hour_date TIMESTAMP,
  activity VARCHAR(100),
  value_score INT,
  reflection TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Counterfactual Scenarios
CREATE TABLE counterfactual_scenarios (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  scenario_name VARCHAR(100),
  response_json JSONB,
  survival_percentage FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **Frontend Components to Create**
- `src/components/DegreesOfSelfSpiral.jsx` (SVG spiral visualization)
- `src/components/MoralWeightOfMoments.jsx` (stacked bar chart)
- `src/components/ThresholdMomentsAlerts.jsx` (notification system)
- `src/components/LifesPotentialCurve.jsx` (line chart with projection)
- `src/components/FutureSelvesMap.jsx` (interactive tree)
- `src/components/CounterfactualSurvivalSimulator.jsx` (questionnaire)
- `src/components/MoralHarmOfWastedTime.jsx` (activity logger + scoring)
- `src/components/McMahanMetricsDashboard.jsx` (hub view)

### **Backend Routes (Phase 4)**
```
POST   /api/reflection/identity-spiral    -- Calculate & store spiral
GET    /api/reflection/identity-spiral/:date
POST   /api/reflection/threshold-check    -- Check & trigger alerts
GET    /api/reflection/moral-projection   -- Get future value curve
POST   /api/reflection/future-selves      -- Calculate branch weights
POST   /api/reflection/hourly-value       -- Log activity + score
POST   /api/reflection/counterfactual     -- Store scenario response
GET    /api/reflection/mcmahan-dashboard  -- Aggregate all metrics
```

---

## Philosophical Alignment Checklist

- [x] Operationalizes McMahan's identity scalar (not binary)
- [x] Visualizes consciousness quality tiers (biological → reflective → ethical)
- [x] Makes time value morally visible (future loss accounting)
- [x] Explores identity thresholds & transitions
- [x] Lets users see their possible futures (multiverse of selves)
- [x] Clarifies what's essential to "you" (counterfactual analysis)
- [x] Integrates deprivation account of death (potential curve)
- [x] Non-judgmental, awareness-raising (not guilt-inducing)

---

## Success Metrics

**By end of Phase 4:**
- Users spending 15+ min/day with McMahan metrics
- Continuity variance decreases (more stable identity)
- Threshold alerts correlate with actual behavior change
- User feedback: "This makes my choices feel morally weighty"
- AI can generate hyper-personalized McMahan-aligned reflections

---

## Next Steps

1. **Decide which TIER 1 feature to build first** (my recommendation: Start with Spiral)
2. **Create database migrations** for new tables
3. **Design API endpoints** for each module
4. **Build React components** with dummy data first
5. **Integrate with existing Presence/Continuity data**
6. **Test threshold logic** with various scenarios

Which feature excites you most? I'd recommend starting with **Degrees of Self Spiral** because it's visual, uses data you already have, and is the most directly McMahan-inspired.

