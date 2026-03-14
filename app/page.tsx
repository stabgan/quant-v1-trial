import { Suspense } from 'react';
import { FundSelector } from "@/components/custom/fund-selector";
import { DateRangeSlider } from "@/components/custom/date-range-slider";
import { RollingWindowSlider } from "@/components/custom/rolling-window-slider";
import { NavChart } from "@/components/custom/nav-chart";
import { AnalyticsDisplay } from "@/components/custom/analytics-display";
import { getDistinctFunds, getNavData } from "@/lib/actions";
import { fundParser, dateParser, windowParser } from "@/lib/parsers";
import type { FundInfo } from "@/lib/types";
import { subYears, startOfDay } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import type { NavPointWithRollingAvg, AnalyticsResult } from '@/lib/types';

// Define the search params structure expected by the page
interface HomePageSearchParams {
  fund?: string;
  start?: string;
  end?: string;
  window?: string;
}

type SearchParamsPromise = Promise<HomePageSearchParams>;

// Skeleton component for Suspense fallback
function ChartAndAnalyticsSkeleton() {
  return (
    <div>
      <Skeleton className="h-24 w-full md:col-span-2 mb-6 bg-muted rounded-md" />
      <Skeleton className="h-[400px] w-full bg-muted rounded-md" />
    </div>
  );
}

// This is a Server Component - no 'use client'
export default async function HomePage({ 
  searchParams 
}: { 
  searchParams: SearchParamsPromise 
}) {
  // Fetch distinct funds directly on the server
  const funds: FundInfo[] = await getDistinctFunds().catch(error => {
      console.error("Error fetching funds for selector:", error);
      return []; // Return empty array on error
  });

  const minDate = startOfDay(subYears(new Date(), 10));
  const maxDate = startOfDay(new Date());
  
  // Await the searchParams promise (Next.js 15 async searchParams)
  const parsedParams = await searchParams;
  
  const parsedFundCode: string | null = typeof parsedParams?.fund === 'string' 
    ? fundParser.parseServerSide(parsedParams.fund) 
    : null;
    
  const parsedStartDate: Date | null = typeof parsedParams?.start === 'string'
    ? dateParser.parseServerSide(parsedParams.start)
    : null;
    
  const parsedEndDate: Date | null = typeof parsedParams?.end === 'string'
    ? dateParser.parseServerSide(parsedParams.end)
    : null;
    
  const parsedWindowDays: number | null = typeof parsedParams?.window === 'string'
    ? windowParser.parseServerSide(parsedParams.window)
    : null;

  return (
    <div className="container mx-auto bg-card rounded-lg shadow-sm my-8 p-6">
      <h1
        className="text-3xl font-semibold font-serif mb-6 pb-4 text-center text-primary border-b border-border"
      >
        Mutual Fund NAV Visualizer
      </h1>

      {/* Controls remain client components, reading/writing URL state */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 p-6 border border-border rounded-md">
        <FundSelector funds={funds} className="md:col-span-1" />
        <DateRangeSlider
          minDate={minDate}
          maxDate={maxDate}
          className="md:col-span-2"
        />
        <RollingWindowSlider className="md:col-span-1" minDays={7} maxDays={180} />
      </div>

      {/* Use Suspense for the data loading part */}
      <Suspense fallback={<ChartAndAnalyticsSkeleton />}>
        <ChartAndAnalyticsLoader
          fundCode={parsedFundCode}
          startDate={parsedStartDate}
          endDate={parsedEndDate}
          windowDays={parsedWindowDays}
        />
      </Suspense>
    </div>
  );
}

// Server Component that loads data
async function ChartAndAnalyticsLoader({
  fundCode,
  startDate,
  endDate,
  windowDays,
}: {
  fundCode: string | null;
  startDate: Date | null;
  endDate: Date | null;
  windowDays: number | null;
}) {
  let chartData: NavPointWithRollingAvg[] = [];
  let analytics: AnalyticsResult | null = null;
  let error: string | null = null;
  
  // Only fetch data if a valid fund code is present
  if (fundCode && startDate && endDate && windowDays) {
    try {
      // Call the server action directly
      const result = await getNavData(fundCode, startDate, endDate, windowDays);
      chartData = result.chartData;
      analytics = result.analytics;
    } catch (err) {
      console.error("Error fetching data server-side:", err);
      error = "Failed to load data."; // Set error state
      chartData = []; // Ensure data is empty on error
      analytics = null;
    }
  } else if (fundCode) {
    // Handle case where fund is selected but dates/window might be missing/invalid initially
    error = "Please ensure a valid date range and rolling window are selected.";
  }

  return (
    <div>
      <div className="mb-6">
        <AnalyticsDisplay
          analytics={analytics}
          isLoading={false}
          error={error}
          className="md:col-span-2"
        />
      </div>
      <NavChart
        data={chartData}
        isLoading={false}
        error={error}
        schemeCode={fundCode}
      />
    </div>
  );
}
