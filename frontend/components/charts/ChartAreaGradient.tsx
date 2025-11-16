"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

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
import { formatCompact } from "@/lib/formatters"

export const description = "Revenue & profitability trend analysis"

interface ProfitabilityData {
  period: string;
  revenue: number;
  grossProfit: number;
  operatingProfit: number;
  netProfit: number;
}

interface ChartAreaGradientProps {
  data?: ProfitabilityData[];
  title?: string;
  description?: string;
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  grossProfit: {
    label: "Gross Profit",
    color: "hsl(var(--chart-2))",
  },
  operatingProfit: {
    label: "Operating Profit",
    color: "hsl(var(--chart-3))",
  },
  netProfit: {
    label: "Net Profit",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

export function ChartAreaGradient({
  data,
  title = "Revenue & Profitability Trends",
  description = "Financial performance over time"
}: ChartAreaGradientProps) {
  // If no data provided, show loading/empty state
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate trend (last vs first period)
  const firstRevenue = data[0]?.revenue || 0;
  const lastRevenue = data[data.length - 1]?.revenue || 0;
  const trend = firstRevenue > 0
    ? ((lastRevenue - firstRevenue) / firstRevenue * 100).toFixed(1)
    : 0;
  const trendDirection = Number(trend) >= 0;

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
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent
                formatter={(value) => formatCompact(value as number)}
              />}
            />
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillNetProfit" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-netProfit)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-netProfit)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="netProfit"
              type="natural"
              fill="url(#fillNetProfit)"
              fillOpacity={0.4}
              stroke="var(--color-netProfit)"
              stackId="a"
            />
            <Area
              dataKey="revenue"
              type="natural"
              fill="url(#fillRevenue)"
              fillOpacity={0.4}
              stroke="var(--color-revenue)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              {trendDirection ? "Trending up" : "Trending down"} by {Math.abs(Number(trend))}%
              <TrendingUp className={`h-4 w-4 ${!trendDirection && 'rotate-180'}`} />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              {data[0]?.period} - {data[data.length - 1]?.period}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
