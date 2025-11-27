"use client"

import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"

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
import { formatRatio } from "@/lib/formatters"

export const description = "Profitability ratios gauge"

interface ProfitabilityGaugeData {
  roe: number;
  roa: number;
  roic: number;
}

interface ChartRadialStackedProps {
  data?: ProfitabilityGaugeData;
  title?: string;
  description?: string;
}

const chartConfig = {
  roe: {
    label: "ROE (Return on Equity)",
    color: "hsl(var(--chart-1))",
  },
  roa: {
    label: "ROA (Return on Assets)",
    color: "hsl(var(--chart-2))",
  },
  roic: {
    label: "ROIC (Return on Invested Capital)",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export function ChartRadialStacked({
  data,
  title = "Profitability Gauges",
  description = "Return on equity, assets, and invested capital"
}: ChartRadialStackedProps) {
  // If no data provided, show empty state
  if (!data) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-4">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No profitability data available</p>
        </CardContent>
      </Card>
    )
  }

  // Convert to percentage and prepare for radial chart
  // Scale to 0-100 range for better visualization
  const chartData = [{
    metric: "profitability",
    roe: Math.min((data.roe || 0) * 100, 100),
    roa: Math.min((data.roa || 0) * 100, 100),
    roic: Math.min((data.roic || 0) * 100, 100),
  }];

  // Calculate average profitability
  const avgProfitability = (chartData[0].roe + chartData[0].roa + chartData[0].roic) / 3;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <RadialBarChart
            data={chartData}
            endAngle={180}
            innerRadius={80}
            outerRadius={130}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent
                hideLabel
                formatter={(value, name) => {
                  const originalValue = data[name as keyof ProfitabilityGaugeData] || 0;
                  return formatRatio(originalValue);
                }}
              />}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 16}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {avgProfitability.toFixed(1)}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-muted-foreground"
                        >
                          Avg Profitability
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="roe"
              stackId="a"
              cornerRadius={5}
              fill="var(--color-roe)"
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="roa"
              fill="var(--color-roa)"
              stackId="a"
              cornerRadius={5}
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="roic"
              fill="var(--color-roic)"
              stackId="a"
              cornerRadius={5}
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardContent className="pt-4">
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="flex flex-col items-center">
            <span className="text-muted-foreground">ROE</span>
            <span className="font-mono font-semibold text-lg">
              {formatRatio(data.roe, 'roe (%)')}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-muted-foreground">ROA</span>
            <span className="font-mono font-semibold text-lg">
              {formatRatio(data.roa, 'roa (%)')}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-muted-foreground">ROIC</span>
            <span className="font-mono font-semibold text-lg">
              {formatRatio(data.roic, 'roic (%)')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
