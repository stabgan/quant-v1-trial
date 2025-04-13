import * as React from 'react';
import { getDistinctFunds } from '@/lib/actions';
import { FundSelector } from '@/components/custom/fund-selector';
import { DateRangeSlider } from '@/components/custom/date-range-slider';
import { ChartAndAnalyticsContainer } from '@/components/custom/chart-and-analytics-container';
import { RollingWindowSlider } from '@/components/custom/rolling-window-slider';
import { Skeleton } from '@/components/ui/skeleton';

export default async function HomePage() {
  // Fetch the list of funds on the server
  const funds = await getDistinctFunds();

  return (
    <main className="container mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Mutual Fund NAV Visualizer</h1>

      {/* Controls Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-start">
        {/* Fund Selector (passes server-fetched funds) */}
        <div className="flex-shrink-0">
          <FundSelector funds={funds} />
        </div>

        {/* Date Range Slider */}
        <React.Suspense fallback={<Skeleton className="h-10 w-full" />}>
          <DateRangeSlider />
        </React.Suspense>

        {/* Rolling Window Slider */}
        <React.Suspense fallback={<Skeleton className="h-10 w-full" />}>
          <RollingWindowSlider />
        </React.Suspense>
      </div>

      {/* Use the container component for Chart and Analytics */}
      <div className="mt-8 border rounded-lg p-4 bg-card shadow-sm">
         {/* Suspense might still be useful here for the initial load of the container */}
         <React.Suspense fallback={<Skeleton className="h-[480px] w-full" />}> {/* Adjust height if needed */}
           <ChartAndAnalyticsContainer />
         </React.Suspense>
       </div>

    </main>
  );
} 