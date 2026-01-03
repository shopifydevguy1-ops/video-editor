# Supabase Quick Start

## ✅ Database Connected

Your Supabase PostgreSQL is connected:
```
postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
```

## Next Steps

### 1. Create Initial Migration (if not done)

```bash
cd backend
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres" npx prisma migrate dev --name init
```

### 2. Generate Prisma Client

```bash
cd backend
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres" npx prisma generate
```

### 3. Create Admin Account

```bash
cd backend
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres" npm run create-admin
```

### 4. Start Backend

```bash
cd backend
# Create .env file with DATABASE_URL
echo 'DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"' > .env
npm run start:dev
```

## For Production Deployment

When deploying backend to Railway/Render, add this environment variable:

```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
```

## Supabase Dashboard

- View your database: https://supabase.com/dashboard/project/_/database/tables
- Check connection: https://supabase.com/dashboard/project/_/settings/database

## Security Note

⚠️ The connection string contains your password. Make sure:
- Never commit `.env` files
- Use environment variables in production
- Consider rotating the password periodically

