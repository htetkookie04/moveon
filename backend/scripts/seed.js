/**
 * Seed script - creates admin user for Move on Calendar
 * Run: npm run db:seed (from backend directory)
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'kookie@moveon.com';
  const adminPassword = 'jk110604';

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      name: 'Admin',
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
    },
    update: {
      passwordHash,
      name: 'Admin',
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('Seed completed: Admin user ready');
  console.log('  Email:', adminEmail);
  console.log('  Password:', adminPassword);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
