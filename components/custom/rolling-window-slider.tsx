'use client';

import React from 'react';
import { useQueryState } from 'nuqs';
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { windowParser } from '@/lib/parsers'; // Import the parser from the correct location

interface RollingWindowSliderProps {
  className?: string;
  minDays?: number;
  maxDays?: number;
}

export function RollingWindowSlider({ className, minDays = 7, maxDays = 180 }: RollingWindowSliderProps) {
  const [windowDays, setWindowDays] = useQueryState('window', windowParser);

  const handleValueChange = (value: number[]) => {
    setWindowDays(value[0]);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Label htmlFor="rolling-window">Rolling Average Window (Days)</Label>
      <Slider
        id="rolling-window"
        min={minDays}
        max={maxDays}
        step={1}
        value={[windowDays ?? 30]} // Provide a default if null
        onValueChange={handleValueChange}
        className="w-full"
      />
      <div className="text-center text-sm text-muted-foreground">
        {windowDays ?? 30} days
      </div>
    </div>
  );
} 