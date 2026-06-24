# Production Data Setup

The app uses MongoDB for durable production storage when `MONGODB_URI` is set.
Without `MONGODB_URI`, it falls back to `data/assessment-db.json`, which is only safe for local development.

## Required Render Environment Variables

- `MONGODB_URI`: MongoDB Atlas connection string.
- `MONGODB_DB`: `personality_test`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Google OAuth web client ID.
- `ADMIN_EMAIL`: admin login email.
- `ADMIN_PASSWORD`: admin login password.
- `COOKIE_SECRET`: random string of at least 32 characters.

## Why This Matters

Render's normal app filesystem can be reset when the service restarts, sleeps, or redeploys. MongoDB keeps registered students, partial progress, submissions, and results outside Render so data survives restarts.
