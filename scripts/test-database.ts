/**
 * Database connectivity test script
 * Run with: bun run scripts/test-database.ts
 */

import { PrismaClient } from '../app/generated/prisma';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  try {
    console.log('Testing database connection...');

    // Check connection by counting records in NavEntry table
    const navCount = await prisma.navEntry.count();
    console.log(`🟢 Database connection successful! Found ${navCount} NavEntry records.`);

    // Get sample of data
    if (navCount > 0) {
      console.log('Fetching sample data...');
      const sampleData = await prisma.navEntry.findMany({
        take: 3,
        orderBy: { date: 'desc' },
        include: { fund: true },
      });

      console.log('Sample data:');
      console.table(sampleData.map(item => ({
        date: item.date.toISOString().split('T')[0],
        scheme_code: item.fund.scheme_code,
        scheme_name: item.fund.scheme_name,
        nav: item.nav,
      })));

      // Get distinct fund count
      const fundCount = await prisma.fund.count();
      console.log(`Database contains ${fundCount} distinct funds.`);
    }
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => console.log('Database test complete'))
  .catch((e) => {
    console.error('Script failed with error:', e);
    process.exit(1);
  });
