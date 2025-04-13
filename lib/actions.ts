'use server';

import { db } from './db';
import { Prisma } from '../app/generated/prisma';
// Import types from the new types file
import type { SchemeInfo, FundInfo, NavPoint, NavPointWithRollingAvg, AnalyticsResult } from './types';
// Import calculation functions only
import { calculateRollingAverage, calculateCAGR } from './calculations';
import { subDays, startOfDay } from 'date-fns';

/**
 * Fetches a distinct list of funds (scheme codes and names) from the Fund table.
 */
export async function getDistinctFunds(): Promise<FundInfo[]> {
  try {
    // Query the Fund table directly
    const funds = await db.fund.findMany({
      select: {
        id: true,
        scheme_code: true,
        scheme_name: true,
      },
      orderBy: {
        scheme_name: 'asc',
      },
    });
    return funds;
  } catch (error) {
    console.error('Error fetching distinct funds:', error);
    throw new Error('Failed to fetch fund list.');
  }
}

/**
 * Fetches NAV data points for a specific scheme code within an optional date range.
 * @param schemeCode The scheme code to fetch data for.
 * @param startDate Optional start date (inclusive).
 * @param endDate Optional end date (inclusive).
 * @param rollingWindowDays Optional number of days for rolling average.
 */
export async function getNavData(
  schemeCode: string | null,
  startDate?: Date | null,
  endDate?: Date | null,
  rollingWindowDays?: number | null
): Promise<{ chartData: NavPointWithRollingAvg[]; analytics: AnalyticsResult | null; }> {
  if (!schemeCode) {
    return { chartData: [], analytics: null };
  }

  try {
    // 1. Find the fundId based on the schemeCode
    const fund = await db.fund.findUnique({
      where: { scheme_code: schemeCode },
      select: { id: true },
    });

    if (!fund) {
      console.warn(`Fund with scheme_code ${schemeCode} not found.`);
      return { chartData: [], analytics: null };
    }
    const fundId = fund.id;

    // 2. Determine the query start date needed for rolling average
    const queryStartDate = (startDate && rollingWindowDays)
      ? subDays(startDate, rollingWindowDays)
      : startDate;

    // 3. Define the where clause for NavEntry query
    const whereClause: Prisma.NavEntryWhereInput = {
      fundId: fundId, // Filter by the found fundId
      date: {
        gte: queryStartDate ? startOfDay(queryStartDate) : undefined,
        lte: endDate ? startOfDay(endDate) : undefined,
      },
    };

    // 4. Fetch raw NAV data from NavEntry table
    const rawData = await db.navEntry.findMany({
      where: whereClause,
      select: {
        date: true,
        nav: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // 5. Format data (already number, no Decimal conversion needed)
    const formattedData: NavPoint[] = rawData.map(d => ({
      date: d.date,
      nav: d.nav,
    }));

    // 6. Calculate analytics
    const analytics: AnalyticsResult = {
      cagr: calculateCAGR(formattedData)
    };

    // 7. Calculate rolling average if needed
    let processedData: NavPointWithRollingAvg[] = [];
    if (rollingWindowDays && rollingWindowDays > 0) {
       processedData = calculateRollingAverage(formattedData, rollingWindowDays);
       // Filter out the extra data fetched only for calculation
       if (startDate) {
            processedData = processedData.filter(p => p.date >= startOfDay(startDate));
       }
    } else {
      processedData = formattedData.map(p => ({ ...p, rollingAverage: null }));
    }

    // 8. Return results
    return { chartData: processedData, analytics };

  } catch (error) {
    console.error(`Error fetching NAV data for scheme ${schemeCode}:`, error);
    return { chartData: [], analytics: null }; // Return empty structure on error
  }
} 