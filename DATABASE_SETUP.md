# Database Setup for Multi-User MORTALS Dashboard

## Overview
Converting from localStorage to PostgreSQL database for multi-user support.

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  stripe_customer_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  email_verified BOOLEAN DEFAULT FALSE,
  avatar_emoji VARCHAR(10) DEFAULT '🕯️',
  avatar_image TEXT,
  bio TEXT,
  dob DATE
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(100) UNIQUE NOT NULL,
  stripe_subscription_id VARCHAR(100),
  plan VARCHAR(20) DEFAULT 'free',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Posts Table (Eternal Board)
```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  philosopher VARCHAR(100),
  is_anonymous BOOLEAN DEFAULT FALSE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Comments Table
```sql
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Moods Table (Optional - for server sync)
```sql
CREATE TABLE moods (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  mood_type VARCHAR(50) NOT NULL,
  intensity INTEGER,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Installation Steps

### 1. Install PostgreSQL

**Windows (using Winget):**
```powershell
winget install PostgreSQL.PostgreSQL
```

**Or download installer:**
https://www.postgresql.org/download/windows/

### 2. Create Database

After installation, open PostgreSQL command prompt (psql) or pgAdmin:

```sql
CREATE DATABASE mortals_dashboard;
```

### 3. Set Database Credentials

Add to `server/.env`:
```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/mortals_dashboard
```

### 4. Run Migration Script

We'll create an initialization script that sets up all tables.

## Migration Strategy

1. **Phase 1**: Set up database and auth (users, sessions, subscriptions)
2. **Phase 2**: Migrate Stripe entitlements from JSON to database
3. **Phase 3**: Add Eternal Board backend (posts, comments)
4. **Phase 4**: Update frontend to use API endpoints
5. **Phase 5**: Optional - migrate mood data to server for sync

## Data Privacy

- Passwords: bcrypt hashed (never stored plain)
- Sessions: JWT tokens with expiration
- Personal data: Can remain local or sync to server (user choice)
- Posts: Stored server-side for sharing
- Encryption: Can add field-level encryption for sensitive data
