
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  balance: number;
  isCurrentMonth: boolean;
}

interface ForecastChartProps {
  monthlyData: MonthlyData[];
  formatter: Intl.NumberFormat;
}

const ForecastChart = ({ monthlyData, formatter }: ForecastChartProps) => {
  // Find the highest value to determine chart scale
  const maxValue = Math.max(
    ...monthlyData.map(d => Math.max(d.income, d.expense, 1))
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gelir & Gider Tahmini</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-[200px] gap-4 items-end pt-4 overflow-x-auto">
          {monthlyData.map((data, index) => {
            const incomeHeight = maxValue ? (data.income / maxValue) * 150 : 0;
            const expenseHeight = maxValue ? (data.expense / maxValue) * 150 : 0;

            return (
              <div key={index} className="flex flex-col items-center gap-2 min-w-[60px]">
                <div className={`text-sm font-medium ${data.isCurrentMonth ? 'bg-muted py-1 px-2 rounded-md' : ''}`}>
                  {data.month}
                </div>
                <div className="flex gap-2">
                  <div 
                    className="w-[20px] bg-[var(--income-color)] rounded-t-md transition-all"
                    style={{ height: `${incomeHeight}px` }}
                    title={`Gelir: ${formatter.format(data.income)}`}
                  />
                  <div 
                    className="w-[20px] bg-[var(--expense-color)] rounded-t-md transition-all"
                    style={{ height: `${expenseHeight}px` }}
                    title={`Gider: ${formatter.format(data.expense)}`}
                  />
                </div>
                <div className={`text-xs font-medium ${data.balance >= 0 ? 'text-[var(--income-color)]' : 'text-[var(--expense-color)]'}`}>
                  {formatter.format(data.balance)}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ForecastChart;
