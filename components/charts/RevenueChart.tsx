// components/charts/RevenueChart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";

interface RevenueChartProps {
  data: any[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const { theme } = useTheme();

  // Process data for the chart
  const processedData = data.reduce((acc: any[], item: any) => {
    const month = new Date(item.month).toLocaleString("default", { month: "short" });
    const existing = acc.find((d) => d.month === month);
    
    if (existing) {
      existing[item.type.toLowerCase()] = Number(item.total);
    } else {
      acc.push({
        month,
        income: item.type === "INCOME" ? Number(item.total) : 0,
        expense: item.type === "EXPENSE" ? Number(item.total) : 0,
      });
    }
    
    return acc;
  }, []);

  // Ensure all months have both values
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const chartData = months.map((month) => {
    const existing = processedData.find((d: any) => d.month === month);
    return existing || { month, income: 0, expense: 0 };
  });

  const isDark = theme === "dark";
  const textColor = isDark ? "#9CA3AF" : "#6B7280";
  const gridColor = isDark ? "#374151" : "#E5E7EB";

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis 
          dataKey="month" 
          tick={{ fill: textColor, fontSize: 12 }}
          axisLine={{ stroke: gridColor }}
        />
        <YAxis 
          tick={{ fill: textColor, fontSize: 12 }}
          axisLine={{ stroke: gridColor }}
          tickFormatter={(value) => `$${value / 1000}k`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
            border: `1px solid ${gridColor}`,
            borderRadius: "6px",
          }}
          labelStyle={{ color: isDark ? "#F9FAFB" : "#111827" }}
          formatter={(value) => {
            const num = typeof value === "number" ? value : Number(value ?? 0);
            return [`$${num.toLocaleString()}`, ""];
          }}
        />
        <Legend wrapperStyle={{ color: textColor }} />
        <Bar 
          dataKey="income" 
          name="Revenue" 
          fill="#10B981" 
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="expense" 
          name="Expenses" 
          fill="#EF4444" 
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}