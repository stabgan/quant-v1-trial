'use client';

import * as React from 'react';
import { useQueryState } from 'nuqs';
import { getNavData } from '@/lib/actions';
import { NavChart } from './nav-chart';
import { AnalyticsDisplay } from './analytics-display';
import type { NavPointWithRollingAvg, AnalyticsResult } from '@/lib/types';
import { fundParser, dateParser, windowParser } from '@/lib/parsers';

export function ChartAndAnalyticsContainer() {
  const [schemeCode] = useQueryState('fund', fundParser.withDefault(''));
  const [startDate] = useQueryState('start', dateParser);
  const [endDate] = useQueryState('end', dateParser);
  const [rollingWindow] = useQueryState('window', windowParser);

  const [chartData, setChartData] = React.useState<NavPointWithRollingAvg[] | null>(null);
  const [analytics, setAnalytics] = React.useState<AnalyticsResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const effectiveSchemeCode = schemeCode || null;

    if (!effectiveSchemeCode) {
      setChartData([]);
      setAnalytics(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getNavData(
          effectiveSchemeCode,
          startDate,
          endDate,
          rollingWindow
        );
        setChartData(result.chartData);
        setAnalytics(result.analytics);
      } catch (err) {
        console.error("Error fetching chart/analytics data:", err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setChartData([]);
        setAnalytics(null);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [schemeCode, startDate, endDate, rollingWindow]);

  const currentSchemeCode = schemeCode || null;

  return (
    <div className="space-y-6">
      <NavChart
        data={chartData}
        isLoading={isLoading && !chartData}
        error={error}
        schemeCode={currentSchemeCode}
      />
      <AnalyticsDisplay
        analytics={analytics}
        isLoading={isLoading && !analytics}
        error={error}
      />
    </div>
  );
} 