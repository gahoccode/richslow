"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export const description = "Cash conversion cycle trend analysis with period toggle"

interface CashConversionCycleDataPoint {
  period: string;
  ccc?: number | null;
  dso?: number | null;
  dpo?: number | null;
}

interface ChartCashConversionCycleProps {
  annualData?: CashConversionCycleDataPoint[];
  quarterlyData?: CashConversionCycleDataPoint[];
  title?: string;
  description?: string;
}

const chartConfig = {
  ccc: {
    label: "Cash Conversion Cycle",
    color: "hsl(var(--chart-5))",
  },
  dso: {
    label: "Days Sales Outstanding",
    color: "hsl(var(--chart-1))",
  },
  dpo: {
    label: "Days Payable Outstanding",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export function ChartCashConversionCycle({
  annualData,
  quarterlyData,
  title = "Cash Conversion Cycle",
  description = "Time taken to convert inventory and receivables into cash"
}: ChartCashConversionCycleProps) {
  const [viewMode, setViewMode] = useState<"annual" | "quarterly">("annual");

  // Select data based on view mode
  const data = viewMode === "annual" ? annualData : quarterlyData;

  // If no data provided, show empty state
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">
            No {viewMode} cash conversion cycle data available
          </p>
        </CardContent>
      </Card>
    )
  }

  // Calculate trend (last vs first period)
  const firstCCC = data[0]?.ccc ?? 0;
  const lastCCC = data[data.length - 1]?.ccc ?? 0;
  const cccTrend = firstCCC !== 0
    ? (((lastCCC - firstCCC) / Math.abs(firstCCC)) * 100).toFixed(1)
    : 0;

  // Lower CCC is better (faster cash conversion)
  const isImproving = Number(cccTrend) < 0;

  // Calculate average CCC
  const avgCCC = data.length > 0
    ? (data.reduce((sum, d) => sum + (d.ccc ?? 0), 0) / data.length).toFixed(0)
    : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(value) => {
            if (value) setViewMode(value as "annual" | "quarterly");
          }}
          className="gap-1"
        >
          <ToggleGroupItem value="annual" aria-label="Annual view" size="sm">
            Annual
          </ToggleGroupItem>
          <ToggleGroupItem value="quarterly" aria-label="Quarterly view" size="sm">
            Quarterly
          </ToggleGroupItem>
        </ToggleGroup>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
              top: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                // Handle both "2023" and "Q1 2023" formats
                if (value.includes('Q')) {
                  return value.replace(/\s+/g, ' '); // Normalize spacing
                }
                return value.slice(-2); // Show last 2 digits for years
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}d`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent
                formatter={(value) => {
                  const numValue = value as number;
                  return `${numValue.toFixed(0)} days`;
                }}
              />}
            />
            <Line
              dataKey="ccc"
              type="monotone"
              stroke="var(--color-ccc)"
              strokeWidth={3}
              dot={{
                fill: "var(--color-ccc)",
                r: 4,
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          CCC {isImproving ? 'improved' : 'worsened'} by {Math.abs(Number(cccTrend))}%
          {isImproving ? (
            <TrendingDown className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingUp className="h-4 w-4 text-red-500" />
          )}
        </div>
        <div className="text-muted-foreground leading-none">
          Average: {avgCCC} days ({data[0]?.period} - {data[data.length - 1]?.period})
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Lower values indicate faster cash conversion
        </div>
      </CardFooter>
    </Card>
  )
}
