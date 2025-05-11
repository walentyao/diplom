# Monitoring Server

A simple Express server to receive and store monitoring data in PostgreSQL.

## API

- POST `/api/log` — accepts JSON logs with fields:
  - `type`: string
  - `projectId`: string
  - `timestamp`: number (ms)
  - `data`: any

## Environment

- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: (optional) server port (default 4000)

## Example table schema

```sql
CREATE TABLE logs (
  id SERIAL PRIMARY KEY,
  type TEXT,
  data JSONB,
  project_id TEXT,
  timestamp TIMESTAMPTZ
);
```