import { useMemo } from 'react';
import * as ss from 'simple-statistics';

interface MonthlyData {
  month: string; // YYYY-MM
  outcome: number;
  income: number;
}

export function useSpendingForecast(data: MonthlyData[]) {
  const forecast = useMemo(() => {
    if (!data || data.length < 3) return null;

    // 1. Prepare data for regression (x = index, y = outcome)
    // Sort by month first just in case
    const sortedData = [...data].sort((a, b) => a.month.localeCompare(b.month));
    
    // Extract outcome values
    const expenses = sortedData.map((d, i) => [i, d.outcome]);

    // 2. Perform Linear Regression
    const regressionLine = ss.linearRegression(expenses);
    const regressionLineFn = ss.linearRegressionLine(regressionLine);

    // 3. Predict next month (index = length)
    const nextMonthIndex = sortedData.length;
    const predictedSpend = regressionLineFn(nextMonthIndex);

    // 4. Calculate R-squared to gauge reliability (optional but good)
    // const rSquared = ss.rSquared(expenses, regressionLineFn);

    // 5. Determine trend direction
    const trend = regressionLine.m > 0 ? 'increasing' : 'decreasing';

    return {
      predictedAmount: Math.max(0, predictedSpend), // No negative spending
      trend: trend,
      slope: regressionLine.m,
      lastMonthAmount: sortedData[sortedData.length - 1].outcome
    };
  }, [data]);

  return forecast;
}
