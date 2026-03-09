# Holiday Shooter

## Frontend

- Основная игра: `index.html` (для Vercel)
- Страница статистики: `stats.html` (доступна как `/stats` на Vercel)
- API endpoint задается через `window.HS_API_BASE_URL` (по умолчанию `http://localhost:3000/api`).

### Локальный запуск frontend

Используйте любой статический сервер, например:

```bash
npx serve .
```

## Backend (Node.js + PostgreSQL)

Файлы находятся в `api/`.

### Подготовка БД

```bash
psql "$DATABASE_URL" -f api/sql/schema.sql
```

### Локальный запуск API

```bash
cd api
cp .env.example .env
npm ci
npm run start
```

### Docker Compose (VPS)

```bash
cd /opt/holiday-shooter/api
git pull
cp .env.example .env # если делаете первый запуск
# отредактировать .env
docker compose up -d --build
```

### Обновление API по SSH

```bash
cd /opt/holiday-shooter/api
git pull
docker compose up -d --build
docker image prune -f
```

Рекомендуется поставить Nginx как reverse proxy и SSL через Let's Encrypt.
