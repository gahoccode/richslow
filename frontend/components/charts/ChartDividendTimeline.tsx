"use client"

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
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { DividendEvent } from "@/lib/api"

interface ChartDividendTimelineProps {
  data: DividendEvent[]
  title?: string
  description?: string
}

const chartConfig = {
  cashDividend: {
    label: "Cash Dividend",
    color: "hsl(var(--chart-1))",
  },
  stockDividend: {
    label: "Stock Dividend",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function ChartDividendTimeline({
  data,
  title = "Dividend Timeline",
  description = "Historical dividend payments over time",
}: ChartDividendTimelineProps) {
  // Transform data for charting
  const chartData = data
    .filter((d) => d.exercise_date && d.cash_dividend_percentage !== null)
    .map((d) => {
      const date = new Date(d.exercise_date)
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      return {
        date: formattedDate,
        fullDate: d.exercise_date,
        dividend: d.cash_dividend_percentage,
        year: d.cash_year,
        method: d.issue_method,
        isCash: d.issue_method?.toLowerCase().includes('cash') || d.issue_method?.toLowerCase().includes('tiền'),
      }
    })
    .sort((a, b) => a.fullDate.localeCompare(b.fullDate))

  if (!chartData || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-sm text-muted-foreground">No dividend data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${value}%`}
                className="text-xs"
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value, payload) => {
                      if (payload && payload[0]) {
                        const data = payload[0].payload
                        return `${data.fullDate} (${data.year})`
                      }
                      return value
                    }}
                    formatter={(value, name, item) => {
                      const method = item.payload.method || 'N/A'
                      return [
                        <span key="dividend-value">
                          <span className="font-medium">{value}%</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({method})
                          </span>
                        </span>,
                        'Dividend'
                      ]
                    }}
                  />
                }
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="dividend"
                stroke="var(--color-dividend)"
                strokeWidth={2}
                dot={{ fill: "var(--color-dividend)", r: 4 }}
                activeDot={{ r: 6 }}
                name="Dividend %"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total Payments</p>
            <p className="font-semibold">{chartData.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Average Dividend</p>
            <p className="font-semibold">
              {(chartData.reduce((sum, d) => sum + d.dividend, 0) / chartData.length).toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Latest Dividend</p>
            <p className="font-semibold">
              {chartData[chartData.length - 1]?.dividend.toFixed(2)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
