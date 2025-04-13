import { describe, test, expect } from 'bun:test';
import { calculateRollingAverage, calculateCAGR } from './calculations';
import type { NavPoint } from './types';

describe('calculateRollingAverage', () => {
  test('should correctly calculate rolling average for valid window', () => {
    const data: NavPoint[] = [
      { date: new Date('2020-01-01'), nav: 100 },
      { date: new Date('2020-01-02'), nav: 110 },
      { date: new Date('2020-01-03'), nav: 120 },
      { date: new Date('2020-01-04'), nav: 130 },
      { date: new Date('2020-01-05'), nav: 140 },
    ];
    
    const result = calculateRollingAverage(data, 3);
    
    // First two points should have null rolling average
    expect(result[0].rollingAverage).toBeNull();
    expect(result[1].rollingAverage).toBeNull();
    
    // Third point should have average of first 3 points
    expect(result[2].rollingAverage).toEqual((100 + 110 + 120) / 3);
    
    // Fourth point should have average of 2nd, 3rd, and 4th points
    expect(result[3].rollingAverage).toEqual((110 + 120 + 130) / 3);
    
    // Fifth point should have average of 3rd, 4th, and 5th points
    expect(result[4].rollingAverage).toEqual((120 + 130 + 140) / 3);
  });
  
  test('should return original data with null averages for invalid window', () => {
    const data: NavPoint[] = [
      { date: new Date('2020-01-01'), nav: 100 },
      { date: new Date('2020-01-02'), nav: 110 },
    ];
    
    // Window larger than data length
    const result = calculateRollingAverage(data, 3);
    
    expect(result.length).toEqual(data.length);
    expect(result[0].rollingAverage).toBeNull();
    expect(result[1].rollingAverage).toBeNull();
  });
});

describe('calculateCAGR', () => {
  test('should calculate CAGR correctly for positive growth', () => {
    const data: NavPoint[] = [
      { date: new Date('2020-01-01'), nav: 100 },
      { date: new Date('2021-01-01'), nav: 110 }, // 10% growth in 1 year
    ];
    
    const cagr = calculateCAGR(data);
    // Should be approximately 10%
    expect(cagr).toBeCloseTo(10, 1);
  });
  
  test('should handle invalid inputs', () => {
    // Not enough data points
    expect(calculateCAGR([])).toBeNull();
    expect(calculateCAGR([{ date: new Date(), nav: 100 }])).toBeNull();
    
    // Invalid NAV values
    const badData: NavPoint[] = [
      { date: new Date('2020-01-01'), nav: 0 }, // Can't have 0 as start value
      { date: new Date('2021-01-01'), nav: 100 },
    ];
    expect(calculateCAGR(badData)).toBeNull();
  });
}); 