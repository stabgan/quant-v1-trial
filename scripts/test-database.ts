/**
 * Database connectivity test script
 * Run with: bun run scripts/test-database.ts
 */

import { PrismaClient } from '../app/generated/prisma';

// Create a new instance of PrismaClient
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  try {
    console.log('Testing database connection...');
    
    // Check connection by counting records in NavData table
    const navCount = await prisma.navData.count();
    console.log(`🟢 Database connection successful! Found ${navCount} NAV data records.`);
    
    // Get sample of data
    if (navCount > 0) {
      console.log('Fetching sample data...');
      const sampleData = await prisma.navData.findMany({
        take: 3,
        orderBy: { date: 'desc' },
      });
      
      console.log('Sample data:');
      console.table(sampleData.map(item => ({
        date: item.date.toISOString().split('T')[0],
        scheme_code: item.scheme_code,
        scheme_name: item.scheme_name,
        nav: item.nav,
      })));
      
      // Get distinct schemes
      const schemeCount = await prisma.$queryRaw`
        SELECT COUNT(DISTINCT scheme_code) as count FROM "NavData"
      `;
      
      console.log(`Database contains ${schemeCount[0].count} distinct scheme codes.`);
    }
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the main function
main()
  .then(() => console.log('Database test complete'))
  .catch((e) => {
    console.error('Script failed with error:', e);
    process.exit(1);
  }); 