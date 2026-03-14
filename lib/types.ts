// Originally from actions.ts
export interface SchemeInfo {
  scheme_code: string;
  scheme_name: string;
}

// Originally from actions.ts
export interface FundInfo {
  id: number;
  scheme_code: string;
  scheme_name: string;
}

// Originally from actions.ts
export interface NavPoint {
  date: Date;
  nav: number; // Assuming nav is a number based on db schema and prior conversions
}

// Originally from calculations.ts
export interface NavPointWithRollingAvg extends NavPoint {
  rollingAverage: number | null;
}

// Originally from calculations.ts
export interface AnalyticsResult {
  cagr: number | null;
} 