import type { NavPoint, NavPointWithRollingAvg, AnalyticsResult } from './types'; // Import from the new types file

/**
 * Calculates the rolling average for a given set of NAV points.
 * @param data Array of NavPoint objects, sorted chronologically.
 * @param windowDays The number of days in the rolling window.
 * @returns Array of NavPointWithRollingAvg objects, including the calculated rolling average.
 */
export function calculateRollingAverage(
  data: NavPoint[],
  windowDays: number
): NavPointWithRollingAvg[] {
  if (windowDays <= 0 || data.length < windowDays) {
    // Return original data without averages if window is invalid or not enough data
    return data.map(p => ({ ...p, rollingAverage: null }));
  }

  const result: NavPointWithRollingAvg[] = [];
  let sum = 0;
  const windowData: number[] = []; // Keep track of NAV values in the current window

  for (let i = 0; i < data.length; i++) {
    const currentPoint = data[i];
    windowData.push(currentPoint.nav);
    sum += currentPoint.nav;

    let rollingAverage: number | null = null;
    if (windowData.length > windowDays) {
      // Remove the oldest point from the sum and window data
      sum -= windowData.shift()!;
    }

    if (windowData.length === windowDays) {
      rollingAverage = sum / windowDays;
    }

    result.push({
      ...currentPoint,
      rollingAverage: rollingAverage,
    });
  }

  return result;
}

/**
 * Calculates the Compound Annual Growth Rate (CAGR).
 * Assumes data is sorted chronologically.
 * @param data Array of NavPoint objects.
 * @returns The CAGR as a percentage, or null if calculation is not possible.
 */
export function calculateCAGR(data: NavPoint[]): number | null {
  if (!data || data.length < 2) {
    return null; // Need at least two points (start and end)
  }

  const startPoint = data[0];
  const endPoint = data[data.length - 1];

  if (!startPoint?.nav || !endPoint?.nav || startPoint.nav <= 0) {
    return null; // Invalid data points
  }

  const startValue = startPoint.nav;
  const endValue = endPoint.nav;
  const startDate = startPoint.date;
  const endDate = endPoint.date;

  const years = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

  if (years <= 0) {
    return null; // Duration must be positive
  }

  const cagr = Math.pow(endValue / startValue, 1 / years) - 1;

  return cagr * 100; // Return as a percentage
}

// Interface AnalyticsResult removed 