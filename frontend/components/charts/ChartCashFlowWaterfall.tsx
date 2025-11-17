"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell, LabelList } from "recharts"

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

export const description = "Cash flow waterfall chart showing operating, investing, and financing activities"

interface CashFlowWaterfallData {
  category: string;
  value: number;
  fill: string;
}

interface ChartCashFlowWaterfallProps {
  cashFlowData?: {
    operating_cash_flow?: number | null;
    investing_cash_flow?: number | null;
    financing_cash_flow?: number | null;
    net_change_in_cash?: number | null;
  };
  title?: string;
  description?: string;
}

const chartConfig = {
  value: {
    label: "Cash Flow",
  },
  operating: {
    label: "Operating",
    color: "hsl(var(--chart-2))",
  },
  investing: {
    label: "Investing",
    color: "hsl(var(--chart-3))",
  },
  financing: {
    label: "Financing",
    color: "hsl(var(--chart-4))",
  },
  netChange: {
    label: "Net Change",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

export function ChartCashFlowWaterfall({
  cashFlowData,
  title = "Cash Flow Analysis",
  description = "Operating, Investing, and Financing activities"
}: ChartCashFlowWaterfallProps) {
  // If no data provided, show empty state
  if (!cashFlowData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No cash flow data available</p>
        </CardContent>
      </Card>
    )
  }

  const operating = cashFlowData.operating_cash_flow ?? 0;
  const investing = cashFlowData.investing_cash_flow ?? 0;
  const financing = cashFlowData.financing_cash_flow ?? 0;
  const netChange = cashFlowData.net_change_in_cash ?? 0;

  // Prepare waterfall chart data with color coding
  const data: CashFlowWaterfallData[] = [
    {
      category: "Operating",
      value: operating,
      fill: operating >= 0 ? "hsl(var(--chart-2))" : "hsl(var(--destructive))",
    },
    {
      category: "Investing",
      value: investing,
      fill: investing >= 0 ? "hsl(var(--chart-2))" : "hsl(var(--destructive))",
    },
    {
      category: "Financing",
      value: financing,
      fill: financing >= 0 ? "hsl(var(--chart-2))" : "hsl(var(--destructive))",
    },
    {
      category: "Net Change",
      value: netChange,
      fill: netChange >= 0 ? "hsl(var(--chart-5))" : "hsl(var(--destructive))",
    },
  ];

  // Calculate summary statistics
  const totalInflows = Math.abs(operating) + Math.abs(investing) + Math.abs(financing);
  const netChangePercent = totalInflows > 0
    ? ((Math.abs(netChange) / totalInflows) * 100).toFixed(1)
    : 0;

  const isPositiveNet = netChange >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data} margin={{ top: 20, right: 30, left: 30, bottom: 5 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCompact(value)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent
                labelFormatter={(label) => `${label} Cash Flow`}
                formatter={(value) => {
                  const numValue = value as number;
                  return `${numValue >= 0 ? '+' : ''}${formatCompact(numValue)} VND`;
                }}
              />}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
              <LabelList
                dataKey="value"
                position="top"
                formatter={(value: number) => {
                  // Only show label if value is significant
                  if (Math.abs(value) < 1) return '';
                  return formatCompact(value);
                }}
                className="fill-foreground text-xs"
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {isPositiveNet ? 'Positive' : 'Negative'} net cash flow of {formatCompact(Math.abs(netChange))} VND
          {isPositiveNet ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </div>
        <div className="text-muted-foreground leading-none">
          {isPositiveNet ? 'Increased' : 'Decreased'} by {netChangePercent}% of total cash movements
        </div>
      </CardFooter>
    </Card>
  )
}
