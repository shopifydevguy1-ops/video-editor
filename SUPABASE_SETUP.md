# Supabase PostgreSQL Setup

## Database Connection

Your Supabase PostgreSQL connection string:
```
postgresql://postgres:Zaizai111720@db.cmvgsisomelrlywnnrcl.supabase.co:5432/postgres
```

## Setup Steps

### 1. Run Database Migrations

```bash
cd backend
npx prisma migrate deploy
```

Or for development:
```bash
cd backend
npx prisma migrate dev
```

### 2. Generate Prisma Client

```bash
cd backend
npx prisma generate
```

### 3. Create Admin Account

After migrations are complete:
```bash
cd backend
npm run create-admin
```

## Environment Variables

### For Local Development

Add to `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:Zaizai111720@db.cmvgsisomelrlywnnrcl.supabase.co:5432/postgres"
```

### For Production (Railway/Render)

Add the same `DATABASE_URL` to your backend deployment platform's environment variables.

## Supabase Dashboard

1. Go to https://supabase.com
2. Sign in to your project
3. Go to **Database** → **Connection string** to verify
4. Go to **Database** → **Tables** to see your schema after migrations

## Security Note

⚠️ **Important**: The connection string contains your password. Make sure:
- Never commit `.env` files to Git
- Use environment variables in production
- Consider using Supabase connection pooling for production

## Connection Pooling (Recommended for Production)

For better performance, use Supabase's connection pooler:
```
postgresql://postgres:Zaizai111720@db.cmvgsisomelrlywnnrcl.supabase.co:6543/postgres
```

Note: Port `6543` is for connection pooling, `5432` is direct connection.

## Next Steps

1. ✅ Database connection configured
2. Run migrations: `cd backend && npx prisma migrate deploy`
3. Create admin account: `cd backend && npm run create-admin`
4. Start backend: `cd backend && npm run start:dev`

