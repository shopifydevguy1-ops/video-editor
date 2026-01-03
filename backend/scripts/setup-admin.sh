#!/bin/bash

echo "🚀 Setting up admin account..."
echo ""

# Check if database exists
echo "📊 Checking database..."
if psql -lqt | cut -d \| -f 1 | grep -qw ai_video_editor; then
    echo "✅ Database 'ai_video_editor' exists"
else
    echo "❌ Database 'ai_video_editor' does not exist"
    echo "📝 Creating database..."
    createdb ai_video_editor
    if [ $? -eq 0 ]; then
        echo "✅ Database created"
    else
        echo "❌ Failed to create database. Make sure PostgreSQL is running."
        exit 1
    fi
fi

# Run migrations
echo ""
echo "🔄 Running migrations..."
cd "$(dirname "$0")/.."
npx prisma migrate dev --name init

if [ $? -ne 0 ]; then
    echo "❌ Migrations failed"
    exit 1
fi

# Create admin
echo ""
echo "👤 Creating admin account..."
npm run create-admin

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Admin credentials:"
echo "   Email: admin@example.com"
echo "   Password: admin123"
echo ""
echo "🌐 Login at: http://localhost:3001/login"

