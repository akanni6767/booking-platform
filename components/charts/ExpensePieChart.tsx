// components/charts/ExpensePieChart.tsx
"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useTheme } from "next-themes";

interface ExpensePieChartProps {
  data: any[];
}

export function ExpensePieChart({ data }: ExpensePieChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const chartData = data.map((item: any) => ({
    name: item.category,
    value: Number(item.total),
    color: item.color,
  }));

  const textColor = isDark ? "#9CA3AF" : "#6B7280";

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
            border: `1px solid ${isDark ? "#374151" : "#E5E7EB"}`,
            borderRadius: "6px",
          }}
          labelStyle={{ color: isDark ? "#F9FAFB" : "#111827" }}
          formatter={(value, name) => {
            const num = typeof value === "number" ? value : Number(value ?? 0);
            return [`$${num.toLocaleString()}`, String(name)];
          }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          wrapperStyle={{ color: textColor, fontSize: "12px" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}