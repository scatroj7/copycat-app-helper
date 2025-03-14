
import { useState } from 'react';
import { Transaction } from './useTransactions';

interface MonthlyForecastData {
  month: string;
  income: number;
  expense: number;
  balance: number;
  isCurrentMonth: boolean;
}

interface ForecastHook {
  forecastMonths: number;
  setForecastMonths: (months: number) => void;
  calculateForecast: (transactions: Transaction[]) => {
    monthlyData: MonthlyForecastData[];
    totalIncome: number;
    totalExpense: number;
    totalBalance: number;
  };
}

export const useForecast = (): ForecastHook => {
  const [forecastMonths, setForecastMonths] = useState<number>(6);

  const calculateForecast = (transactions: Transaction[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let totalIncome = 0;
    let totalExpense = 0;
    const monthlyData: MonthlyForecastData[] = [];

    for (let i = 0; i < forecastMonths; i++) {
      const forecastMonth = (currentMonth + i) % 12;
      const forecastYear = currentYear + Math.floor((currentMonth + i) / 12);
      const monthName = new Date(forecastYear, forecastMonth, 1).toLocaleString('tr-TR', { month: 'short', year: '2-digit' });

      let monthIncome = 0;
      let monthExpense = 0;

      // Check each transaction
      transactions.forEach(t => {
        const transactionDate = new Date(t.date);

        if (t.frequency === 'once') {
          // One-time transaction
          if (transactionDate.getMonth() === forecastMonth && 
              transactionDate.getFullYear() === forecastYear) {
            if (t.type === 'income') {
              monthIncome += t.amount;
            } else {
              monthExpense += t.amount;
            }
          }
        } else {
          // Recurring transaction
          if (new Date(forecastYear, forecastMonth, 1) >= new Date(transactionDate.getFullYear(), transactionDate.getMonth(), 1)) {
            let applies = false;

            switch (t.frequency) {
              case 'monthly':
                applies = true;
                break;
              case 'quarterly':
                const quarterDiff = (forecastYear - transactionDate.getFullYear()) * 4 + 
                  Math.floor(forecastMonth / 3) - Math.floor(transactionDate.getMonth() / 3);
                applies = quarterDiff >= 0 && quarterDiff % 1 === 0;
                break;
              case 'biannual':
                const halfYearDiff = (forecastYear - transactionDate.getFullYear()) * 2 + 
                  Math.floor(forecastMonth / 6) - Math.floor(transactionDate.getMonth() / 6);
                applies = halfYearDiff >= 0 && halfYearDiff % 1 === 0;
                break;
              case 'yearly':
                applies = (forecastMonth === transactionDate.getMonth());
                break;
              case 'custom':
                if (t.installmentCount) {
                  const startYear = transactionDate.getFullYear();
                  const startMonth = transactionDate.getMonth();
                  const monthDiff = (forecastYear - startYear) * 12 + (forecastMonth - startMonth);
                  applies = monthDiff >= 0 && monthDiff < t.installmentCount;
                }
                break;
            }

            if (applies) {
              if (t.type === 'income') {
                monthIncome += t.amount;
              } else {
                monthExpense += t.amount;
              }
            }
          }
        }
      });

      totalIncome += monthIncome;
      totalExpense += monthExpense;

      monthlyData.push({
        month: monthName,
        income: monthIncome,
        expense: monthExpense,
        balance: monthIncome - monthExpense,
        isCurrentMonth: i === 0
      });
    }

    return {
      monthlyData,
      totalIncome,
      totalExpense,
      totalBalance: totalIncome - totalExpense
    };
  };

  return {
    forecastMonths,
    setForecastMonths,
    calculateForecast
  };
};
