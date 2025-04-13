'use client';

import React from 'react';
import { useQueryState } from 'nuqs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FundInfo } from '@/lib/types';
import { fundParser } from '@/lib/parsers';
import { cn } from '@/lib/utils';

interface FundSelectorProps {
  funds: FundInfo[];
  className?: string;
}

export function FundSelector({ funds, className }: FundSelectorProps) {
  // Use nuqs for state, parsing the value as a string
  const [fundCode, setFundCode] = useQueryState('fund', fundParser);

  const handleValueChange = (value: string) => {
    // value received from SelectItem is the scheme_code string.
    // Set the state directly with the string, or null if the value is empty/placeholder
    setFundCode(value || null);
  };

  return (
    <Select
      onValueChange={handleValueChange}
      value={fundCode ?? ''}
    >
      <SelectTrigger 
        className={cn(
          "w-full bg-card text-card-foreground border-border focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "hover:bg-accent/10",
          className
        )}>
        <SelectValue placeholder="Select a Fund" />
      </SelectTrigger>
      <SelectContent className="bg-card text-card-foreground border-border">
        {funds.map((fund) => (
          <SelectItem 
            key={fund.scheme_code} 
            value={fund.scheme_code}
            className="focus:bg-accent focus:text-accent-foreground data-[highlighted]:bg-accent/10 data-[highlighted]:text-accent-foreground"
          >
            {fund.scheme_name} ({fund.scheme_code})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 