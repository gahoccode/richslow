"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

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
import { formatCompact, formatDate } from "@/lib/formatters"

export const description = "Stock price chart with multiple metrics"

interface StockPriceData {
  time: string;
  close: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
}

interface ChartLineMultipleProps {
  data?: StockPriceData[];
  ticker?: string;
  title?: string;
  description?: string;
}

const chartConfig = {
  close: {
    label: "Close Price",
    color: "hsl(var(--chart-1))",
  },
  open: {
    label: "Open Price",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function ChartLineMultiple({
  data,
  ticker = "Stock",
  title = "Stock Price Movement",
  description = "Price trends over time"
}: ChartLineMultipleProps) {
  // If no data provided, show loading/empty state
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No price data available</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate performance (first vs last close)
  const firstClose = data[0]?.close || 0;
  const lastClose = data[data.length - 1]?.close || 0;
  const performance = firstClose > 0
    ? ((lastClose - firstClose) / firstClose * 100).toFixed(2)
    : 0;
  const isPositive = Number(performance) >= 0;

  // Format date range
  const dateRange = `${formatDate(data[0]?.time)} - ${formatDate(data[data.length - 1]?.time)}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title} - {ticker}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => formatCompact(value)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent
                labelFormatter={(label) => formatDate(label)}
                formatter={(value) => formatCompact(value as number)}
              />}
            />
            <Line
              dataKey="close"
              type="monotone"
              stroke="var(--color-close)"
              strokeWidth={2}
              dot={false}
            />
            {data[0]?.open !== undefined && (
              <Line
                dataKey="open"
                type="monotone"
                stroke="var(--color-open)"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="3 3"
              />
            )}
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              {isPositive ? "Up" : "Down"} {Math.abs(Number(performance))}% over period
              <TrendingUp className={`h-4 w-4 ${!isPositive && 'rotate-180'}`} />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              {dateRange}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
