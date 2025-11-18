"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts"

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

export const description = "Monthly insider trading activity (buy/sell volumes)"

interface MonthlyInsiderData {
  month: string;      // "2025-01", "2025-02", etc.
  buyVolume: number;  // Total shares bought in month
  sellVolume: number; // Total shares sold in month
}

interface ChartBarNegativeProps {
  data?: MonthlyInsiderData[];
  title?: string;
  description?: string;
}

const chartConfig = {
  buyVolume: {
    label: "Buy Volume",
    color: "hsl(var(--chart-1))",
  },
  sellVolume: {
    label: "Sell Volume",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function ChartBarNegative({
  data,
  title = "Insider Trading Activity",
  description = "Monthly buy and sell volumes"
}: ChartBarNegativeProps) {
  // If no data provided, show empty state
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No insider trading data available</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate total buy vs sell volumes
  const totalBuy = data.reduce((sum, d) => sum + d.buyVolume, 0);
  const totalSell = data.reduce((sum, d) => sum + d.sellVolume, 0);

  const netSentiment = totalBuy - totalSell;
  const sentimentPositive = netSentiment > 0;

  // Format month label helper
  const formatMonthLabel = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

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
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={formatMonthLabel}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCompact(value)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent
                labelFormatter={formatMonthLabel}
                formatter={(value, name) => (
                  <span className="font-medium">
                    {name}: {formatCompact(value as number)} shares
                  </span>
                )}
              />}
            />
            <Legend />
            <Bar
              dataKey="buyVolume"
              fill="hsl(var(--chart-1))"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="sellVolume"
              fill="hsl(var(--chart-2))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Net {sentimentPositive ? 'buying' : 'selling'} of {formatCompact(Math.abs(netSentiment))} shares
          {sentimentPositive ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </div>
        <div className="text-muted-foreground leading-none">
          {data.length} months tracked • Buy (green) / Sell (red)
        </div>
      </CardFooter>
    </Card>
  )
}
