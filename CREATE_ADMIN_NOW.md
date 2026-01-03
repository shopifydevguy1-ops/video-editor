# Create Admin Account - Ready to Use

## Admin Credentials (After Database Setup)
- **Email**: admin@example.com
- **Password**: admin123

## To Create the Admin Account:

### If PostgreSQL is installed:
```bash
cd backend
npm run create-admin
```

### If you need to set up PostgreSQL first:
1. Install: `brew install postgresql@15`
2. Start: `brew services start postgresql@15`
3. Create DB: `createdb ai_video_editor`
4. Migrate: `cd backend && npx prisma migrate dev`
5. Create admin: `npm run create-admin`

## Scripts Created:
- `backend/scripts/create-admin.ts` - Creates admin account
- `backend/scripts/setup-admin.sh` - Full automated setup
- `backend/prisma/seed.ts` - Database seed (includes admin)

## Once Created:
Login at: http://localhost:3001/login
