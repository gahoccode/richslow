"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { sortByPeriodAscending } from "@/lib/utils";
import { formatPeriod } from "@/lib/utils/period-utils";

import type { FinancialStatements } from "@/lib/api/facade";

interface EfficiencyRatios {
  ae?: number;  // Asset efficiency/turnover
  fae?: number; // Fixed asset efficiency
  dso?: number; // Days sales outstanding
  dpo?: number; // Days payable outstanding
  ccc?: string | null; // Cash conversion cycle
}

interface ChartEfficiencyMetricsProps {
  ratios?: EfficiencyRatios;
  statements?: FinancialStatements;
  loading?: boolean;
}

export function ChartEfficiencyMetrics({ ratios, statements, loading }: ChartEfficiencyMetricsProps) {
  const [period, setPeriod] = React.useState<"year" | "quarter">("year");

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }

  // Prepare efficiency ratios data for bar chart
  const efficiencyData = React.useMemo(() => {
    if (!ratios) return [];

    return [
      {
        metric: "Asset Turnover",
        value: ratios.ae || 0,
        description: "Revenue / Total Assets",
      },
      {
        metric: "Fixed Asset Turnover",
        value: ratios.fae || 0,
        description: "Revenue / Fixed Assets",
      },
      {
        metric: "DSO",
        value: ratios.dso || 0,
        description: "Days Sales Outstanding",
      },
      {
        metric: "DPO",
        value: ratios.dpo || 0,
        description: "Days Payable Outstanding",
      },
    ];
  }, [ratios]);

  // Calculate Cash Conversion Cycle data from statements
  const cccData = React.useMemo(() => {
    if (!statements?.income_statements || !statements?.balance_sheets) return [];

    const data = statements.income_statements.map((income, idx) => {
      const balance = statements.balance_sheets?.[idx];
      if (!balance || !income.revenue) return null;

      // Simple CCC estimation: DSO + DIO - DPO
      // If API provides CCC directly, use that instead
      const dso = ratios?.dso || 0;
      const dpo = ratios?.dpo || 0;
      const dio = 30; // Simplified - should calculate from inventory turnover

      const ccc = dso + dio - dpo;

      return {
        // Use period_id if available (e.g., "2024-Q1"), otherwise fallback to "YEAR-Annual"
        period: income.period_id || (income.year_report ? `${income.year_report}-Annual` : 'N/A'),
        ccc: Math.round(ccc),
        dso: Math.round(dso),
        dpo: Math.round(dpo),
      };
    }).filter(Boolean) as Array<{ period: string; ccc: number; dso: number; dpo: number }>;

    // Sort ascending for proper timeline visualization
    return sortByPeriodAscending(data);
  }, [statements, ratios]);

  return (
    <div className="space-y-4">
      {/* Header with Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h4 className="text-lg font-semibold">Efficiency Metrics</h4>
          <p className="text-sm text-muted-foreground">
            Asset utilization and working capital efficiency
          </p>
        </div>
        <ToggleGroup
          type="single"
          value={period}
          onValueChange={(value) => value && setPeriod(value as "year" | "quarter")}
          className="border rounded-lg p-1"
        >
          <ToggleGroupItem value="year" aria-label="Toggle yearly view">
            Year
          </ToggleGroupItem>
          <ToggleGroupItem value="quarter" aria-label="Toggle quarterly view">
            Quarter
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Efficiency Ratios Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Efficiency Ratios</CardTitle>
            <CardDescription>
              How effectively the company uses its assets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={efficiencyData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  type="number"
                  className="text-xs"
                />
                <YAxis
                  type="category"
                  dataKey="metric"
                  width={120}
                  className="text-xs"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-semibold text-sm">{data.metric}</p>
                        <p className="text-xs text-muted-foreground mb-1">
                          {data.description}
                        </p>
                        <p className="text-sm">
                          Value: <span className="font-bold">{data.value.toFixed(2)}</span>
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="hsl(var(--chart-2))"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 pt-4 border-t space-y-2 text-xs text-muted-foreground">
              <p>
                <span className="font-medium">Asset Turnover:</span> Higher is better (more revenue per asset)
              </p>
              <p>
                <span className="font-medium">DSO/DPO:</span> Lower DSO and higher DPO improve cash flow
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right: Cash Conversion Cycle Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cash Conversion Cycle</CardTitle>
            <CardDescription>
              Time to convert investments back to cash (days)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={cccData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="period"
                  className="text-xs"
                  tickFormatter={(value) => formatPeriod(value, 'short')}
                />
                <YAxis
                  className="text-xs"
                  label={{ value: 'Days', angle: -90, position: 'insideLeft', className: 'text-xs' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-semibold text-sm mb-2">Period: {formatPeriod(data.period, 'short')}</p>
                        <div className="space-y-1 text-xs">
                          <p className="flex justify-between gap-4">
                            <span className="text-muted-foreground">CCC:</span>
                            <span className="font-bold">{data.ccc} days</span>
                          </p>
                          <p className="flex justify-between gap-4">
                            <span className="text-muted-foreground">DSO:</span>
                            <span>{data.dso} days</span>
                          </p>
                          <p className="flex justify-between gap-4">
                            <span className="text-muted-foreground">DPO:</span>
                            <span>{data.dpo} days</span>
                          </p>
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="ccc"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Cash Conversion Cycle"
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-4 pt-4 border-t space-y-2 text-xs text-muted-foreground">
              <p>
                <span className="font-medium">CCC Formula:</span> DSO + DIO - DPO
              </p>
              <p>
                <span className="font-medium">Lower is better:</span> Shorter cycle means faster cash generation
              </p>
              <p>
                <span className="font-medium">Negative CCC:</span> Company collects before paying suppliers (ideal)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Period Note */}
      <p className="text-xs text-muted-foreground text-center">
        Currently showing <span className="font-medium">{period === "year" ? "yearly" : "quarterly"}</span> data.
        Toggle to switch between views.
      </p>
    </div>
  );
}
