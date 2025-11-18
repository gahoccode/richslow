"use client"

import { TrendingUp } from "lucide-react"
import { Area, Bar, CartesianGrid, ComposedChart, XAxis, YAxis } from "recharts"

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

export const description = "Stock price chart with volume bars on dual Y-axis"

interface StockPriceVolumeData {
  time: string;
  close: number;
  volume: number;
  open?: number;
  high?: number;
  low?: number;
}

interface ChartStockPriceVolumeProps {
  data?: StockPriceVolumeData[];
  ticker?: string;
  title?: string;
  description?: string;
}

const chartConfig = {
  close: {
    label: "Close Price",
    color: "hsl(var(--chart-1))",
  },
  volume: {
    label: "Volume",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

export function ChartStockPriceVolume({
  data,
  ticker = "Stock",
  title = "Stock Price & Volume",
  description = "Price trends with trading volume"
}: ChartStockPriceVolumeProps) {
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
          <ComposedChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <defs>
              <linearGradient id="fillClose" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-close)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-close)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
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
              yAxisId="price"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => formatCompact(value)}
              orientation="left"
            />
            <YAxis
              yAxisId="volume"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => formatCompact(value)}
              orientation="right"
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(label) => formatDate(label)}
                  formatter={(value, name) => {
                    if (name === 'volume') {
                      return [formatCompact(value as number), 'Volume'];
                    }
                    return [formatCompact(value as number) + ' VND', 'Price'];
                  }}
                />
              }
            />
            <Area
              yAxisId="price"
              dataKey="close"
              type="monotone"
              fill="url(#fillClose)"
              fillOpacity={1}
              stroke="var(--color-close)"
              strokeWidth={2}
            />
            <Bar
              yAxisId="volume"
              dataKey="volume"
              fill="var(--color-volume)"
              fillOpacity={0.5}
              radius={[4, 4, 0, 0]}
            />
          </ComposedChart>
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
