'use client';

import React, { useState, useEffect } from 'react';
import { useQueryState } from 'nuqs';
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { dateParser } from '@/lib/parsers'; // Import the parser
import { format, parseISO, isValid, startOfMonth, endOfMonth, subYears } from 'date-fns';
import { cn } from "@/lib/utils";

interface DateRangeSliderProps {
  minDate: Date; // Earliest possible date overall
  maxDate: Date; // Latest possible date overall
  className?: string;
}

// Helper to clamp date within min/max bounds
const clampDate = (date: Date, min: Date, max: Date): Date => {
  if (date < min) return min;
  if (date > max) return max;
  return date;
};

export function DateRangeSlider({ minDate, maxDate, className }: DateRangeSliderProps) {
  // Default range: last 5 years or full range if less than 5 years
  const defaultStartDate = clampDate(subYears(maxDate, 5), minDate, maxDate);
  const defaultEndDate = maxDate;

  const [startDate, setStartDate] = useQueryState(
    'start',
    dateParser.withDefault(defaultStartDate)
  );
  const [endDate, setEndDate] = useQueryState(
    'end',
    dateParser.withDefault(defaultEndDate)
  );

  // Convert dates to numerical values (days since minDate) for the slider
  const minTime = minDate.getTime();
  const maxTime = maxDate.getTime();
  const totalDays = (maxTime - minTime) / (1000 * 60 * 60 * 24);

  const startTime = startDate ? startDate.getTime() : minTime;
  const endTime = endDate ? endDate.getTime() : maxTime;

  const startValue = Math.round(((startTime - minTime) / (maxTime - minTime)) * totalDays);
  const endValue = Math.round(((endTime - minTime) / (maxTime - minTime)) * totalDays);

  const handleValueChange = (value: number[]) => {
    const [newStartValue, newEndValue] = value;

    // Convert slider values back to dates
    const newStartTime = minTime + (newStartValue / totalDays) * (maxTime - minTime);
    const newEndTime = minTime + (newEndValue / totalDays) * (maxTime - minTime);

    let newStartDate = new Date(newStartTime);
    let newEndDate = new Date(newEndTime);

    // Ensure dates are valid and within bounds
    newStartDate = clampDate(startOfMonth(newStartDate), minDate, maxDate);
    newEndDate = clampDate(endOfMonth(newEndDate), minDate, maxDate);

    if (isValid(newStartDate)) {
      setStartDate(newStartDate);
    }
    if (isValid(newEndDate) && newEndDate >= newStartDate) {
      setEndDate(newEndDate);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Label htmlFor="date-range" className="text-muted-foreground">Date Range</Label>
      <Slider
        id="date-range"
        min={0}
        max={totalDays}
        step={1} // Step by day
        value={[startValue, endValue]}
        onValueChange={handleValueChange}
        minStepsBetweenThumbs={30} // Minimum 1 month apart approx
        className={cn(
          "w-full",
          "[&>span:first-child]:bg-muted", // Track background using muted
          "[&>span:nth-child(2)>span]:bg-primary", // Range fill using primary
          "[&>span:last-child>span]:bg-primary", // Thumb using primary
          "[&>span:last-child>span]:border-primary-foreground/50", // Thumb border
          className
        )}
      />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{startDate ? format(startDate, 'MMM yyyy') : 'Start'}</span>
        <span>{endDate ? format(endDate, 'MMM yyyy') : 'End'}</span>
      </div>
    </div>
  );
} 