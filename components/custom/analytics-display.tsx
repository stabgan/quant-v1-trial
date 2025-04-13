'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyticsResult } from '@/lib/types';

interface AnalyticsDisplayProps {
  analytics: AnalyticsResult | null;
  isLoading: boolean;
  error?: string | null;
  className?: string;
}

export function AnalyticsDisplay({ analytics, isLoading, error, className }: AnalyticsDisplayProps) {

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-40 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24" />
        </CardContent>
      </Card>
    );
  }

  if (error && !analytics) {
     return (
      <Card className={className}>
         <CardHeader>
            <CardTitle className="font-serif text-secondary-foreground">Analytics</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
         <CardContent className="text-destructive">
            Error loading analytics.
         </CardContent>
      </Card>
     );
  }

  const cagr = analytics?.cagr;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="font-serif text-secondary-foreground">Analytics</CardTitle>
        <CardDescription>Key performance indicators</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-primary">
          {cagr !== null && cagr !== undefined ? `${cagr.toFixed(2)}%` : 'N/A'}
        </div>
        <p className="text-xs text-muted-foreground">
          CAGR (Compound Annual Growth Rate)
        </p>
        {/* Add more analytics here later */}
      </CardContent>
    </Card>
  );
} 