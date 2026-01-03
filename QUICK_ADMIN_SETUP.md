# Quick Admin Setup Guide

## 🎯 Goal
Create an admin account: `admin@example.com` / `admin123`

## 📋 Prerequisites
- PostgreSQL installed and running
- Database created

## 🚀 Quick Steps

### Step 1: Install PostgreSQL (if not installed)

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Verify:**
```bash
pg_isready
# Should show: accepting connections
```

### Step 2: Create Database
```bash
createdb ai_video_editor
```

### Step 3: Run Migrations
```bash
cd backend
npx prisma migrate dev --name init
```

### Step 4: Create Admin Account
```bash
npm run create-admin
```

You should see:
```
✅ Admin account created successfully!
📝 Login credentials:
   Email: admin@example.com
   Password: admin123
```

### Step 5: Login
1. Go to: http://localhost:3001/login
2. Enter:
   - Email: `admin@example.com`
   - Password: `admin123`

## ✅ Done!

You can now access the application with admin privileges.

## 🔧 Troubleshooting

**"Can't reach database server"**
- Make sure PostgreSQL is running: `brew services list | grep postgresql`
- Check DATABASE_URL in `backend/.env`

**"Database does not exist"**
- Create it: `createdb ai_video_editor`

**"Command not found: createdb"**
- PostgreSQL not in PATH
- Add to PATH or use full path: `/opt/homebrew/opt/postgresql@15/bin/createdb ai_video_editor`

