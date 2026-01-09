# AI Battle Arena — Database Reference

This document describes the MongoDB data model used by the AI Battle Arena project, collection schemas, indexes, relationships, and operational guidance.

## Overview

MongoDB is used as the primary datastore and the application uses a set of normalized collections to represent users, roles, teams, events, rounds, submissions, and scores. IDs are MongoDB ObjectIds by default; some seed entries store stringified IDs in related collections for simplicity (see seed script behavior).

## Collections & Fields

Below are the common collections, typical fields, and notes about relations.

1. `users`
   - _id: ObjectId
   - email: string (unique)
   - passwordHash: string
   - createdAt: Date
   - (optional) profile references are stored in `profiles` with the same `_id`

2. `profiles`
   - _id: ObjectId (matches `users._id`)
   - email: string
   - team_name: string
   - created_at: Date
   - updated_at: Date

3. `user_roles`
   - _id: ObjectId
   - user_id: string (stringified user ObjectId in current seed code)
   - role: string (e.g., `admin`, `participant`)
   - created_at: Date

4. `teams`
   - _id: ObjectId
   - event_id: string (stringified event ObjectId)
   - name: string
   - shortlist_status: string
   - dataset_name, dataset_description: string
   - created_at: Date

5. `team_members`
   - _id: ObjectId
   - team_id: string (stringified team ObjectId)
   - user_id: string (stringified user ObjectId)
   - role: string (e.g., `member`, `captain`)
   - joined_at: Date

6. `events`
   - _id: ObjectId
   - title: string
   - description: string
   - status: string (e.g., `active`, `closed`)
   - start_time, end_time: Date
   - problem_statement, rules: string
   - submissions_locked: boolean
   - created_at, updated_at: Date

7. `competition_levels`
   - _id: ObjectId
   - event_id: string (stringified event ObjectId)
   - name: string
   - description: string
   - max_points: number
   - order_index: number
   - created_at: Date

8. `rounds`
   - _id: ObjectId
   - event_id: string
   - number: number
   - start_time, end_time: Date
   - meta: object

9. `qualifications`
   - _id: ObjectId
   - round_id: string
   - team_id: string
   - qualified: boolean

10. `api_submissions`
   - _id: ObjectId
   - team_id: string
   - event_id: string
   - payload: object or string
   - endpoint: string
   - status: string (e.g., `pending`, `scored`, `failed`)
   - created_at: Date

11. `scores`
   - _id: ObjectId
   - team_id: string
   - event_id: string
   - round_id: (optional) string
   - points: number
   - meta: object (details about scoring)
   - created_at: Date

## Indexes

The seed script creates a few important indexes. Recommended indexes:

- `users`: `{ email: 1 }` with uniqueness.
- `user_roles`: `{ user_id: 1 }` for fast role lookups.
- `teams`: `{ event_id: 1 }` for listing teams per event.
- `team_members`: `{ team_id: 1, user_id: 1 }` for membership checks.
- `scores`: `{ team_id: 1, event_id: 1 }` to fetch scores for leaderboards.
- `rounds`: `{ event_id: 1, number: 1 }` for round ordering.
- `qualifications`: `{ round_id: 1, team_id: 1 }` for quick lookups.

Create additional compound indexes when writing queries that filter on multiple fields frequently (e.g., `{ event_id: 1, points: -1 }` for leaderboard queries).

## Relationships & Access Patterns

- Users ⇄ Profiles: 1:1 (profile `_id` equals user `_id`)
- Users → User_roles: 1:many (a user can have multiple roles)
- Event → Teams: 1:many
- Teams → Team_members → Users: many-to-many via `team_members`
- Event → Rounds: 1:many

Access patterns to optimize for:

- Leaderboard: Read `scores` for an event/round sorted by `points` desc; index `{ event_id:1, points:-1 }` is useful.
- Team roster: Query `team_members` by `team_id`, then fetch `users`/`profiles`.
- User auth: Lookup `users` by `email` (unique index) and verify `passwordHash`.

## Sample Documents

Example `users` doc:

```json
{
  "_id": {"$oid":"..."},
  "email":"participant1@test.com",
  "passwordHash":"$2b$10$...",
  "createdAt":"2026-01-09T..."
}
```

Example `teams` doc:

```json
{
  "_id": {"$oid":"..."},
  "event_id":"<eventIdString>",
  "name":"Team Alpha"
}
```

Example `scores` doc:

```json
{
  "_id": {"$oid":"..."},
  "team_id":"<teamIdString>",
  "event_id":"<eventIdString>",
  "points": 85,
  "meta": {"latency_ms":120}
}
```

## Seed Script Behavior

`server/seed.js` performs these steps:

1. Ensures required collections exist and creates indexes.
2. Creates demo admin users and stores their `user_roles` and `profiles`.
3. Inserts a sample event and a sample `competition_levels` entry.
4. Inserts participant users, creates teams per `teamName`, and inserts `team_members` records.

Important notes: the seed script sometimes stores related IDs as strings (e.g., `team_id` or `event_id` set to `insertedId.toString()` in some collections). Be aware of the mixed usage of raw ObjectId vs stringified ID in queries; normalize in production for consistency.

## Backups and Migrations

- Backups: Use `mongodump`/`mongorestore` or the backup features in MongoDB Atlas for production.
- Migrations: There is no dedicated migration tool included. Use a migration runner (migrate-mongo, or custom scripts) for schema changes. Keep scripts idempotent and test on staging.

## Performance & Scaling Tips

- Add appropriate indexes for query patterns; monitor with `db.currentOp()` and Atlas Performance Advisor.
- Sharding: For very large datasets (scores, submissions), consider sharding by `event_id` or time range.
- Use projection in queries to return only required fields.

## Security

- Never store plain-text passwords — use bcrypt (seed uses bcrypt).
- Secure access to MongoDB with IP whitelisting and credentials (use TLS).
- Validate and sanitize all submission payloads before storing.

## Example Queries

- Leaderboard for an event (top 10):

```js
db.scores.find({ event_id: "<eventIdString>" }).sort({ points: -1 }).limit(10)
```

- Get team members with profile info (aggregation):

```js
db.team_members.aggregate([
  { $match: { team_id: "<teamIdString>" } },
  { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'user' } },
  { $unwind: '$user' },
  { $project: { user: { email: 1 }, role: 1, joined_at: 1 } }
])
```

## Troubleshooting

- Mixed ID types: If queries return empty results, check whether `team_id` / `user_id` values are strings or ObjectIds. Convert consistently using `ObjectId(...)` in queries or store consistent types.
- Index missing: Slow queries mean you may need to add or adjust indexes.

## Next Steps / Recommendations

- Normalize related ID storage (prefer ObjectId across all collections).
- Add migration tooling for schema changes.
- Add data validation at the application layer (e.g., using `zod` or Mongoose schemas for stricter contracts).

---

If you'd like, I can:

- Convert stringified ID usage to ObjectIds across the seed script and collections.
- Add migration scripts or a small admin script for DB maintenance.
