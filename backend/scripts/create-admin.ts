import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
  const adminEmail = 'admin@example.com';
  const adminPassword = 'admin123';
  
  console.log('🔐 Creating admin account...');
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log('');

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('   Updating password...');
      
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await prisma.user.update({
        where: { email: adminEmail },
        data: { passwordHash },
      });
      
      console.log('✅ Admin password updated!');
      console.log(`\n📝 Login credentials:`);
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
      return;
    }

    // Create new admin
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: 'Admin User',
        subscriptionTier: 'enterprise',
      },
    });

    console.log('✅ Admin account created successfully!');
    console.log(`\n📝 Login credentials:`);
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   User ID: ${admin.id}`);
    console.log(`   Subscription: ${admin.subscriptionTier}`);
  } catch (error: any) {
    console.error('❌ Error creating admin:', error.message);
    
    if (error.message.includes('connect')) {
      console.error('\n💡 Make sure PostgreSQL is running and DATABASE_URL is correct in .env');
      console.error('   Try: createdb ai_video_editor');
      console.error('   Then: cd backend && npx prisma migrate dev');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();

