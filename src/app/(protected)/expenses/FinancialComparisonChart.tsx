"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

type MonthlyData = {
  month: string;
  income: number;
  expenses: number;
};

const currencyFormatter = new Intl.NumberFormat("en-PK", {
  maximumFractionDigits: 0,
});

export default function FinancialComparisonChart({
  data,
}: {
  data: MonthlyData[];
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">
        Fees Collected vs Expenses
      </h2>

      <p className="mb-6 mt-1 text-sm text-gray-500">
        Monthly comparison for the last 12 months
      </p>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
            barCategoryGap="20%"
            barGap={6}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
            />

            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickLine={false}
              axisLine={{ stroke: "#d1d5db" }}
              interval={0}
            />

            <YAxis
              tickFormatter={(value) =>
                `Rs. ${Number(value).toLocaleString("en-PK")}`
              }
              width={100}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip
              formatter={(value, name) => [
                `Rs. ${currencyFormatter.format(Number(value ?? 0))}`,
                name === "income" ? "Fees Collected" : "Expenses",
              ]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
              }}
              cursor={{ fill: "#f3f4f6" }}
            />

            <Legend
              formatter={(value) =>
                value === "income" ? "Fees Collected" : "Expenses"
              }
              wrapperStyle={{ paddingTop: "12px" }}
            />

            <Bar
              dataKey="income"
              name="income"
              fill="#16a34a"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />

            <Bar
              dataKey="expenses"
              name="expenses"
              fill="#ea580c"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
