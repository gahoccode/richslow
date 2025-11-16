"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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

export const description = "Quarterly revenue comparison"

interface QuarterlyRevenueData {
  period: string;
  revenue: number;
}

interface ChartBarDefaultProps {
  data?: QuarterlyRevenueData[];
  title?: string;
  description?: string;
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function ChartBarDefault({
  data,
  title = "Quarterly Revenue",
  description = "Revenue comparison by quarter"
}: ChartBarDefaultProps) {
  // If no data provided, show empty state
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No quarterly revenue data available</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate quarter-over-quarter growth
  const firstRevenue = data[0]?.revenue || 0;
  const lastRevenue = data[data.length - 1]?.revenue || 0;
  const qoqGrowth = firstRevenue > 0
    ? ((lastRevenue - firstRevenue) / firstRevenue * 100).toFixed(1)
    : 0;
  const isPositive = Number(qoqGrowth) >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="period"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => {
                // Format period label (e.g., "Q1 2023" or "2023")
                return value.length > 6 ? value.slice(0, 6) : value;
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCompact(value)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent
                labelFormatter={(label) => `Period: ${label}`}
                formatter={(value) => formatCompact(value as number)}
              />}
            />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {isPositive ? 'Growth' : 'Decline'} of {Math.abs(Number(qoqGrowth))}% over period
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </div>
        <div className="text-muted-foreground leading-none">
          Comparing {data.length} reporting periods
        </div>
      </CardFooter>
    </Card>
  )
}
