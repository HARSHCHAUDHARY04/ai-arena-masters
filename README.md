# AI Battle Arena — Project README (Complete)

## Overview

AI Battle Arena is a web application for hosting AI agent competitions. It provides participant management, team management, event/round scheduling, API submission handling, scoring, and leaderboard display. The project is implemented as a Vite + React TypeScript frontend with a small Node.js server using MongoDB as the primary datastore.

This README explains how the project is organized, how the pieces interact, how to run and develop locally, and where to look for key functionality.

## Key Features

- User authentication and roles (admin, participant)
- Team creation and membership management
- Event & round lifecycle (create, schedule, open/close submissions)
- API submission handling and scoring pipeline
- Live scoreboard and analytics UI components
- MongoDB-backed data model with seed data for development

## Architecture Overview

- Frontend: React + TypeScript (src/)
  - Uses Vite as dev server and bundler.
  - UI components live under `src/components` and `src/components/ui`.
  - Pages are in `src/pages` (Admin, Dashboard, Auth, Scoreboard, etc.).

- Backend: Minimal Node.js server (server/index.js)
  - Provides API endpoints for auth, teams, events, submissions, scores.
  - Uses `server/seed.js` to bootstrap demo data.

- Database: MongoDB (integrations/mongo/client.ts)
  - Collections include `users`, `profiles`, `user_roles`, `teams`, `team_members`, `events`, `rounds`, `qualifications`, `competition_levels`, `api_submissions`, `scores`.

## Repository Structure

- `index.html` — Main HTML entry and meta (site title & favicon)
- `src/` — React application source
- `public/` — Static assets (favicon, robots.txt)
- `server/` — Node server and seed script
- `tools/` — helper scripts (favicon generator)
- `integrations/mongo/` — Mongo client configuration

## Environment & Prerequisites

- Node.js >= 18 (tested with Node 24)
- npm or yarn
- MongoDB instance (local or hosted)

Environment variables (use `.env` in project root):

- `MONGODB_URI` — Mongo connection string (default `mongodb://localhost:27017`)
- `DB_NAME` — Database name (default `ai_arena`)

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Start the frontend dev server:

```bash
npm run dev
```

3. Start the Node server (if present):

Open a terminal and run:

```bash
cd server
node index.js
```

Note: The `server` directory contains a small Express-like server (or similar minimal API). Adjust start commands if your environment uses PM2 or Nodemon.

## Seeding Demo Data

The repository includes `server/seed.js` which inserts sample admin users, participant users, a sample event, competition levels, teams, and team members. To seed your local MongoDB database:

```bash
cd server
node seed.js
```

The seed script creates demo admin accounts and participant teams described in the seed file. You can inspect or modify `server/seed.js` to change seeded emails, passwords, or data shapes.

## Authentication & Roles

- Users are stored in the `users` collection with hashed passwords (`passwordHash`). Passwords are hashed with `bcrypt` before insertion.
- Roles are stored in `user_roles` and reference `user_id` and a `role` string (e.g., `admin`, `participant`).
- Profiles are stored in `profiles` and contain additional user metadata such as `team_name` and contact info.

## Teams & Events

- `events` collection holds event-level data (title, description, start/end times, rules, dataset metadata).
- `competition_levels` holds scoring-level definitions for an event (e.g., Beginner, Advanced) and their config.
- `teams` are created per event and referenced by `team_members` which connect `user_id` to `team_id`.

## Submissions & Scoring

- `api_submissions` collects incoming submission metadata (team, endpoint, payload, timestamp, status).
- `scores` holds scoring results for team-event combinations.
- The scoring pipeline may be implemented on the server or as worker services; the UI components read from `scores` and the `rounds` collection for ranking/round progress.

## Frontend Notes

- Components under `src/components/ui` are designed as reusable building blocks.
- Important top-level pages: `src/pages/Dashboard.tsx`, `src/pages/Scoreboard.tsx`, `src/pages/Admin.tsx`.
- API requests are sent from the frontend to the server endpoints (see `server/index.js`). Ensure CORS is configured if running frontend and server separately.

## Deployment Guidance

- Build frontend for production:

```bash
npm run build
```

- Serve `dist/` with any static host (Netlify, Vercel, S3 + CloudFront) and host the Node server (if used) on a server or serverless instance.
- Ensure `MONGODB_URI` in production points to a secure, backed-up MongoDB (Atlas or managed DB).

## Testing & Debugging

- Use browser devtools for frontend debugging.
- Inspect server logs for API issues.
- Check MongoDB collections and indexes (see `README_DATABASE.md` for prescriptive guidance).

## Maintenance & Extensibility

- To add a new role or permission, extend `user_roles` semantics and check role access in server API handlers.
- To add new submission types, update `api_submissions` shape and scoring logic.

## Where To Look For Code

- Server endpoints: [server/index.js](server/index.js)
- Seed & demo data: [server/seed.js](server/seed.js)
- Mongo client & helpers: [integrations/mongo/client.ts](integrations/mongo/client.ts)
- Frontend pages and components: [src/pages](src/pages) and [src/components](src/components)

## Contributing

1. Create an issue describing the feature or bug.
2. Branch from `main` with a descriptive name.
3. Open a pull request with clear notes.

## Contact / Support

If you need help understanding flows, or want me to assist with tasks like adding new endpoints, tests, or CI/CD, ask and I’ll help.
