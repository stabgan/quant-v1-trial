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
    
    // Check connection by counting records in NavEntry table
    const navCount = await prisma.navEntry.count();
    console.log(`🟢 Database connection successful! Found ${navCount} NAV entry records.`);
    
    // Get count of funds
    const fundCount = await prisma.fund.count();
    console.log(`Found ${fundCount} funds in the database.`);

    // Get count of categories
    const categoryCount = await prisma.category.count();
    console.log(`Found ${categoryCount} categories in the database.`);

    // Get sample of fund data
    if (fundCount > 0) {
      console.log('Fetching sample fund data...');
      const sampleFunds = await prisma.fund.findMany({
        take: 3,
        orderBy: { scheme_name: 'asc' },
        include: {
          category: true,
          _count: { select: { navEntries: true } },
        },
      });
      
      console.log('Sample funds:');
      console.table(sampleFunds.map(fund => ({
        scheme_code: fund.scheme_code,
        scheme_name: fund.scheme_name,
        category: fund.category.name,
        nav_entries: fund._count.navEntries,
      })));
    }

    // Get sample NAV entries
    if (navCount > 0) {
      console.log('Fetching latest NAV entries...');
      const sampleNav = await prisma.navEntry.findMany({
        take: 3,
        orderBy: { date: 'desc' },
        include: { fund: { select: { scheme_code: true, scheme_name: true } } },
      });

      console.log('Latest NAV entries:');
      console.table(sampleNav.map(entry => ({
        date: entry.date.toISOString().split('T')[0],
        scheme_code: entry.fund.scheme_code,
        scheme_name: entry.fund.scheme_name,
        nav: entry.nav,
      })));
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
