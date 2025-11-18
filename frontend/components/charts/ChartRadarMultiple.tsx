"use client"

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts"

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

export const description = "Financial ratios radar chart with industry benchmark"

interface RatioRadarData {
  metric: string;
  company: number;
  industry?: number;
  fullName?: string;
}

interface ChartRadarMultipleProps {
  data?: RatioRadarData[];
  variant?: "valuation" | "general";
  industryName?: string;
  title?: string;
  description?: string;
}

const chartConfig = {
  company: {
    label: "Company",
    color: "hsl(var(--chart-1))",
  },
  industry: {
    label: "Industry",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

// Normalization scales for valuation metrics
const VALUATION_SCALES: Record<string, number> = {
  "P/E": 50,
  "P/B": 10,
  "P/S": 10,
  "EV/EBITDA": 30,
}

export function ChartRadarMultiple({
  data,
  variant = "general",
  industryName,
  title = "Financial Ratios Analysis",
  description = "Key valuation and profitability metrics"
}: ChartRadarMultipleProps) {
  // If no data provided, show empty state
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader className="items-center pb-4">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No ratio data available</p>
        </CardContent>
      </Card>
    )
  }

  // Normalization function based on variant
  const normalizeValue = (value: number, metric: string): number => {
    if (variant === "valuation") {
      const maxScale = VALUATION_SCALES[metric] || 50;
      return Math.min((value / maxScale) * 50, 50);
    }
    // General variant: dynamic normalization
    const maxValue = Math.max(...data.map(d => Math.max(Math.abs(d.company), Math.abs(d.industry || 0))));
    return maxValue > 0 ? (value / maxValue) * 50 : 0;
  };

  // Normalize data for both company and industry
  const normalizedData = data.map(d => ({
    ...d,
    companyNormalized: normalizeValue(d.company, d.metric),
    industryNormalized: d.industry !== undefined ? normalizeValue(d.industry, d.metric) : undefined,
  }));

  // Check if industry data exists
  const hasIndustryData = data.some(d => d.industry !== undefined);

  return (
    <Card>
      <CardHeader className="items-center pb-4">
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description}
          {hasIndustryData && industryName && (
            <span className="block text-xs mt-1">vs {industryName}</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <RadarChart data={normalizedData}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent
                indicator="line"
                labelFormatter={(label) => {
                  const item = normalizedData.find(d => d.metric === label);
                  return item?.fullName || label;
                }}
                formatter={(value, name, item) => {
                  const payload = item.payload as any;
                  if (name === 'companyNormalized') {
                    return [formatRatio(payload.company), 'Company'];
                  }
                  if (name === 'industryNormalized') {
                    return [formatRatio(payload.industry), 'Industry'];
                  }
                  return [formatRatio(value as number), name];
                }}
              />}
            />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fontSize: 12 }}
            />
            <PolarGrid />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 50]}
              tick={false}
            />
            <Radar
              dataKey="companyNormalized"
              fill="var(--color-company)"
              fillOpacity={0.5}
              stroke="var(--color-company)"
              strokeWidth={2}
            />
            {hasIndustryData && (
              <Radar
                dataKey="industryNormalized"
                fill="var(--color-industry)"
                fillOpacity={0.2}
                stroke="var(--color-industry)"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            )}
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardContent className="pt-4">
        <div className="flex flex-wrap gap-4 text-xs">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col">
              <span className="text-muted-foreground">{item.metric}</span>
              <div className="flex gap-2">
                <span className="font-mono font-semibold text-[var(--color-company)]">
                  {formatRatio(item.company)}
                </span>
                {item.industry !== undefined && (
                  <>
                    <span className="text-muted-foreground">/</span>
                    <span className="font-mono font-semibold text-[var(--color-industry)]">
                      {formatRatio(item.industry)}
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
