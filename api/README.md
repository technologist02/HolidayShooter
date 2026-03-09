# Holiday Shooter API

## Setup

```bash
cp .env.example .env
npm ci
psql "$DATABASE_URL" -f sql/schema.sql
npm run start
```

## Endpoints

- `GET /health`
- `POST /api/scores`
- `GET /api/scores/top?modeId=&limit=10`
- `GET /api/scores/recent?modeId=&limit=50`

## Docker Compose

```bash
docker compose up -d --build
```
