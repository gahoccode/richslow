"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

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

export const description = "Profitability margins trend analysis"

interface ProfitabilityMarginData {
  period: string;
  grossMargin?: number | null;
  ebitMargin?: number | null;
  netMargin?: number | null;
}

interface ChartProfitabilityMarginsProps {
  data?: ProfitabilityMarginData[];
  title?: string;
  description?: string;
}

const chartConfig = {
  grossMargin: {
    label: "Gross Margin",
    color: "hsl(var(--chart-1))",
  },
  ebitMargin: {
    label: "EBIT Margin",
    color: "hsl(var(--chart-3))",
  },
  netMargin: {
    label: "Net Margin",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function ChartProfitabilityMargins({
  data,
  title = "Profitability Margins",
  description = "Gross, EBIT, and Net Profit Margins over time"
}: ChartProfitabilityMarginsProps) {
  // If no data provided, show empty state
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No profitability margin data available</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate trend (last vs first period for net margin)
  const firstNetMargin = data[0]?.netMargin ?? 0;
  const lastNetMargin = data[data.length - 1]?.netMargin ?? 0;
  const marginTrend = firstNetMargin !== 0
    ? (((lastNetMargin - firstNetMargin) / Math.abs(firstNetMargin)) * 100).toFixed(1)
    : 0;
  const isImproving = Number(marginTrend) >= 0;

  // Calculate average margins
  const avgNetMargin = data.length > 0
    ? (data.reduce((sum, d) => sum + (d.netMargin ?? 0), 0) / data.length).toFixed(1)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
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
                  return value; // Show as-is for quarters
                }
                return value.slice(-2); // Show last 2 digits for years
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent
                formatter={(value) => {
                  const numValue = value as number;
                  return `${numValue.toFixed(2)}%`;
                }}
              />}
            />
            <defs>
              <linearGradient id="fillGrossMargin" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-grossMargin)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-grossMargin)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillEbitMargin" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-ebitMargin)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-ebitMargin)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillNetMargin" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-netMargin)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-netMargin)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="grossMargin"
              type="natural"
              fill="url(#fillGrossMargin)"
              fillOpacity={0.4}
              stroke="var(--color-grossMargin)"
              strokeWidth={2}
            />
            <Area
              dataKey="ebitMargin"
              type="natural"
              fill="url(#fillEbitMargin)"
              fillOpacity={0.4}
              stroke="var(--color-ebitMargin)"
              strokeWidth={2}
            />
            <Area
              dataKey="netMargin"
              type="natural"
              fill="url(#fillNetMargin)"
              fillOpacity={0.4}
              stroke="var(--color-netMargin)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Net margin {isImproving ? 'improved' : 'declined'} by {Math.abs(Number(marginTrend))}%
          {isImproving ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </div>
        <div className="text-muted-foreground leading-none">
          Average net margin: {avgNetMargin}% ({data[0]?.period} - {data[data.length - 1]?.period})
        </div>
      </CardFooter>
    </Card>
  )
}
