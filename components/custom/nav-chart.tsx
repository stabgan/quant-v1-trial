'use client';

import * as React from 'react';
import { NavPointWithRollingAvg } from '@/lib/types'; // Import from types instead of calculations
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns'; // Remove unused date-fns imports if any later
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

interface NavChartProps {
  data: NavPointWithRollingAvg[] | null;
  isLoading: boolean;
  error?: string | null;
  className?: string;
  schemeCode?: string | number | null;
}

// Custom Tooltip Formatter
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const date = format(new Date(label), 'PP'); // Format date as 'Sep 6, 2023'
    const nav = payload.find((p: any) => p.dataKey === 'nav');
    const avg = payload.find((p: any) => p.dataKey === 'rollingAverage');

    return (
      <div className="bg-card border border-border p-3 shadow-lg rounded-lg text-sm text-card-foreground">
        <p className="font-semibold mb-1">{date}</p>
        {nav && <p className="text-primary">NAV: {nav.value.toFixed(4)}</p>}
        {avg && avg.value !== null && avg.value !== undefined && (
          <p className="text-secondary">Avg: {avg.value.toFixed(4)}</p>
        )}
      </div>
    );
  }
  return null;
};

// Date Formatter for XAxis
const formatDateTick = (tickItem: number | Date) => {
  return format(new Date(tickItem), 'MMM yyyy');
};

// NAV Formatter for YAxis
const formatNavTick = (tickItem: number) => {
  return tickItem.toFixed(2);
};

export function NavChart({ data, isLoading, error, className, schemeCode }: NavChartProps) {
  if (!schemeCode) {
    return <div className="text-center p-10 text-muted-foreground">Select a fund to view the chart.</div>;
  }

  if (isLoading) {
    return <Skeleton className={`h-[400px] w-full ${className}`} />;
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error Loading Chart</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-[400px] border border-dashed rounded-md ${className}`}>
        <p className="text-muted-foreground">No data available for the selected criteria.</p>
      </div>
    );
  }

  const chartData = data.map(item => ({
    ...item,
    date: item.date.getTime(), // Use timestamp for XAxis type 'number'
    nav: item.nav,
    rollingAverage: item.rollingAverage
  }));

  return (
    <div className={`h-[400px] w-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
          <XAxis
            dataKey="date"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            tickFormatter={formatDateTick}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis
            yAxisId="left"
            tickFormatter={formatNavTick}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--accent))', strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Legend wrapperStyle={{ paddingTop: '10px' }}/>
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="nav"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 1, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))' }}
            name="NAV"
          />
          {/* Only add rolling average line if data exists */}
          {chartData.some(d => d.rollingAverage !== null && d.rollingAverage !== undefined) && (
             <Line
              yAxisId="left"
              type="monotone"
              dataKey="rollingAverage"
              stroke="hsl(var(--secondary))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 1, fill: 'hsl(var(--secondary))', stroke: 'hsl(var(--background))' }}
              name="Rolling Avg"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 