"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { GoldSJC } from "@/lib/api"
import { formatVNDShort } from "@/lib/formatters"

export const description = "SJC gold prices - buy and sell rates"

interface ChartGoldSJCProps {
  data?: GoldSJC[];
  title?: string;
  description?: string;
}

const chartConfig = {
  buy_price: {
    label: "Buy Price",
    color: "hsl(var(--chart-2))",
  },
  sell_price: {
    label: "Sell Price",
    color: "hsl(var(--destructive))",
  },
} satisfies ChartConfig

export function ChartGoldSJC({
  data,
  title = "SJC Gold Prices",
  description = "Buy and sell prices for SJC gold products"
}: ChartGoldSJCProps) {
  // If no data provided, show empty state
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No SJC gold price data available</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate average spread
  const avgSpread = data.length > 0
    ? (data.reduce((sum, item) => sum + (item.sell_price - item.buy_price), 0) / data.length).toFixed(0)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={80}
              tickFormatter={(value) => {
                // Truncate long names
                return value.length > 15 ? value.substring(0, 15) + '...' : value;
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatVNDShort(value)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent
                formatter={(value, name) => {
                  const label = name === 'buy_price' ? 'Buy Price' : 'Sell Price';
                  return `${label}: ${formatVNDShort(value as number)}`;
                }}
              />}
            />
            <Legend />
            <Bar
              dataKey="buy_price"
              fill="var(--color-buy_price)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="sell_price"
              fill="var(--color-sell_price)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
        <div className="mt-4 text-xs text-muted-foreground text-center">
          Average spread: {formatVNDShort(Number(avgSpread))} • {data.length} products
        </div>
      </CardContent>
    </Card>
  )
}
