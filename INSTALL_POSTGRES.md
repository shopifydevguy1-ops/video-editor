# Installing PostgreSQL

## macOS Installation

### Using Homebrew (Recommended)
```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Add to PATH (add to ~/.zshrc or ~/.bash_profile)
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Verify Installation
```bash
# Check if PostgreSQL is running
pg_isready

# Should return: /tmp/.s.PGSQL.5432: accepting connections
```

## After Installation

Once PostgreSQL is installed and running:

### 1. Create Database
```bash
createdb ai_video_editor
```

### 2. Run Setup Script
```bash
cd backend
./scripts/setup-admin.sh
```

Or manually:
```bash
cd backend
npx prisma migrate dev --name init
npm run create-admin
```

## Admin Credentials

After setup, login with:
- **Email**: `admin@example.com`
- **Password**: `admin123`

## Alternative: Use Docker

If you prefer Docker:

```bash
# Run PostgreSQL in Docker
docker run --name postgres-ai-editor \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ai_video_editor \
  -p 5432:5432 \
  -d postgres:15

# Update DATABASE_URL in backend/.env:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_video_editor?schema=public"

# Then run migrations and create admin
cd backend
npx prisma migrate dev --name init
npm run create-admin
```

