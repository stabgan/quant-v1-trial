import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { PrismaClient } from '../app/generated/prisma';
import { z } from 'zod';

// Zod schema for CSV row validation
const csvRowSchema = z.object({
  date: z.string().transform((val) => {
    const date = new Date(val);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date format: ${val}`);
    }
    return date;
  }),
  nav: z.string().transform((val) => {
    const num = parseFloat(val);
    if (isNaN(num)) {
      throw new Error(`Invalid NAV value: ${val}`);
    }
    return num;
  }),
  scheme_code: z.string().min(1, 'Scheme code is required'),
  scheme_name: z.string().optional().default(''),
  category: z.string().optional().default('Uncategorized'),
}).transform((data) => ({
  ...data,
  scheme_name: data.scheme_name || `Fund ${data.scheme_code}`,
}));

// Adjust the path to your actual combined CSV file
const csvFilePath = path.join(__dirname, '../../nav_data/combined_nav_data_20250411_114601.csv');
const prisma = new PrismaClient();

type ValidatedCsvRow = z.infer<typeof csvRowSchema>;

async function main() {
  console.log(`Reading CSV file from: ${csvFilePath}`);
  
  if (!fs.existsSync(csvFilePath)) {
    throw new Error(`CSV file not found at: ${csvFilePath}`);
  }

  const csvFile = fs.readFileSync(csvFilePath, 'utf8');

  console.log('Parsing CSV data...');
  const parseResult = Papa.parse<Record<string, string>>(csvFile, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  if (parseResult.errors.length > 0) {
    console.error('Error parsing CSV:', parseResult.errors);
    throw new Error('CSV parsing failed');
  }

  console.log(`Found ${parseResult.data.length} rows in CSV. Starting validation...`);

  const validatedData: ValidatedCsvRow[] = [];
  let invalidRows = 0;

  for (let i = 0; i < parseResult.data.length; i++) {
    try {
      const result = csvRowSchema.safeParse(parseResult.data[i]);
      if (result.success) {
        validatedData.push(result.data);
      } else {
        console.warn(`Row ${i + 2} validation failed:`, result.error.flatten().fieldErrors);
        invalidRows++;
      }
    } catch (error) {
      console.warn(`Row ${i + 2} unexpected processing error:`, error);
      invalidRows++;
    }

    if ((i + 1) % 100000 === 0) {
      console.log(`Validated ${i + 1} rows...`);
    }
  }

  if (!validatedData.length) {
    console.log('No valid data found in CSV to insert.');
    return;
  }

  console.log(`Validation complete. ${validatedData.length} valid records, ${invalidRows} invalid records.`);

  // --- Data Upsertion/Insertion ---
  console.log('Processing categories and funds...');

  const uniqueCategories = new Map<string, string>();
  const uniqueFunds = new Map<string, { scheme_name: string; category: string }>();

  for (const row of validatedData) {
    if (!uniqueCategories.has(row.category)) {
      uniqueCategories.set(row.category, row.category);
    }
    if (!uniqueFunds.has(row.scheme_code)) {
      uniqueFunds.set(row.scheme_code, {
        scheme_name: row.scheme_name,
        category: row.category,
      });
    }
  }
  console.log(`Found ${uniqueCategories.size} unique categories and ${uniqueFunds.size} unique funds.`);

  console.log('Upserting categories...');
  const categoryMap = new Map<string, number>();
  for (const categoryName of uniqueCategories.keys()) {
    try {
      const category = await prisma.category.upsert({
        where: { name: categoryName },
        update: {},
        create: { name: categoryName },
      });
      categoryMap.set(categoryName, category.id);
    } catch (error) {
      console.error(`Error upserting category "${categoryName}":`, error);
    }
  }
  console.log('Category upsert complete.');

  console.log('Upserting funds...');
  const fundMap = new Map<string, number>();
  let fundUpsertCount = 0;
  for (const [schemeCode, fundDetails] of uniqueFunds.entries()) {
    const categoryId = categoryMap.get(fundDetails.category);
    if (categoryId === undefined) {
      console.warn(`Skipping fund ${schemeCode}: Category "${fundDetails.category}" was not successfully upserted.`);
      continue;
    }
    try {
      const fund = await prisma.fund.upsert({
        where: { scheme_code: schemeCode },
        update: {
          scheme_name: fundDetails.scheme_name,
          categoryId: categoryId,
        },
        create: {
          scheme_code: schemeCode,
          scheme_name: fundDetails.scheme_name,
          categoryId: categoryId,
        },
      });
      fundMap.set(schemeCode, fund.id);
      fundUpsertCount++;
      if (fundUpsertCount % 100 === 0) {
        console.log(`Upserted ${fundUpsertCount}/${uniqueFunds.size} funds...`);
      }
    } catch (error) {
      console.error(`Error upserting fund ${schemeCode}:`, error);
    }
  }
  console.log(`Fund upsert complete. ${fundUpsertCount} funds processed.`);

  console.log('Preparing NavEntry data for insertion...');
  const navEntriesToInsert: { date: Date; nav: number; fundId: number }[] = [];
  for (const row of validatedData) {
    const fundId = fundMap.get(row.scheme_code);
    if (fundId !== undefined) {
      navEntriesToInsert.push({
        date: row.date,
        nav: row.nav,
        fundId: fundId,
      });
    }
  }

  console.log(`Inserting ${navEntriesToInsert.length} NavEntry records... This might take a while.`);
  try {
    const batchSize = 5000;
    let insertedCount = 0;

    for (let i = 0; i < navEntriesToInsert.length; i += batchSize) {
      const batch = navEntriesToInsert.slice(i, i + batchSize);
      const result = await prisma.navEntry.createMany({
        data: batch,
        skipDuplicates: false,
      });

      insertedCount += result.count;

      console.log(
        `NavEntry Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(navEntriesToInsert.length / batchSize)}: ` +
        `${result.count} records inserted.`
      );
    }

    console.log('\nImport Summary:');
    console.log(`Total rows processed from CSV: ${parseResult.data.length}`);
    console.log(`Valid rows for processing: ${validatedData.length}`);
    console.log(`Invalid rows skipped: ${invalidRows}`);
    console.log(`Unique Categories processed: ${uniqueCategories.size}`);
    console.log(`Unique Funds processed: ${fundUpsertCount}`);
    console.log(`NavEntry records inserted: ${insertedCount}`);

  } catch (error) {
    console.error('Error inserting NavEntry data:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 