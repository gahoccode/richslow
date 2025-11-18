"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, PolarAngleAxis } from "recharts";

interface ChartLeverageGaugeProps {
  companyDE?: number;
  industryDE?: number;
  loading?: boolean;
}

// Get color based on D/E ratio
function getDeColor(de: number): string {
  if (de < 1.0) return "hsl(var(--chart-3))"; // Green - Healthy
  if (de < 2.0) return "hsl(var(--chart-2))"; // Yellow - Moderate
  return "hsl(var(--chart-1))"; // Red - High Risk
}

// Get text color for badges
function getDeVariant(de: number): "default" | "secondary" | "destructive" {
  if (de < 1.0) return "default";
  if (de < 2.0) return "secondary";
  return "destructive";
}

export function ChartLeverageGauge({ companyDE = 0, industryDE, loading }: ChartLeverageGaugeProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center space-y-6">
        <Skeleton className="w-64 h-64 rounded-full" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  // Prepare data for radial chart (scale to 100 for visualization, max at 4x D/E)
  const chartData = [
    {
      name: "D/E Ratio",
      value: Math.min((companyDE / 4) * 100, 100),
      fill: getDeColor(companyDE),
    },
  ];

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Radial Gauge Chart */}
      <div className="relative">
        <ResponsiveContainer width={280} height={280}>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="90%"
            barSize={24}
            data={chartData}
            startAngle={180}
            endAngle={0}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background
              dataKey="value"
              cornerRadius={10}
              fill={chartData[0].fill}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Center Value Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold">{companyDE.toFixed(2)}x</span>
          <span className="text-sm text-muted-foreground mt-1">D/E Ratio</span>
          <Badge variant={getDeVariant(companyDE)} className="mt-2">
            {companyDE < 1.0 ? "Healthy" : companyDE < 2.0 ? "Moderate" : "High Risk"}
          </Badge>
        </div>
      </div>

      {/* Industry Comparison */}
      {industryDE !== undefined && (
        <div className="w-full space-y-4">
          <div className="text-center space-y-2">
            <h4 className="text-sm font-semibold">Industry Comparison</h4>
            <div className="flex items-center justify-center gap-3">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Company</p>
                <p className="text-lg font-bold">{companyDE.toFixed(2)}x</p>
              </div>
              <div className="text-muted-foreground">vs</div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Industry Median</p>
                <p className="text-lg font-bold">{industryDE.toFixed(2)}x</p>
              </div>
            </div>
            <p className="text-sm">
              {companyDE < industryDE ? (
                <span className="text-green-600 dark:text-green-400">
                  ✓ Below industry median - Lower financial risk
                </span>
              ) : companyDE === industryDE ? (
                <span className="text-yellow-600 dark:text-yellow-400">
                  ≈ At industry median - Average leverage
                </span>
              ) : (
                <span className="text-orange-600 dark:text-orange-400">
                  ⚠ Above industry median - Higher financial risk
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Explanation Section */}
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">What is Debt-to-Equity Ratio?</h4>
              <p className="text-sm text-muted-foreground">
                D/E ratio measures the proportion of debt financing relative to shareholder equity.
                It indicates financial leverage and bankruptcy risk.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Interpretation Guide:</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">&lt;1.0 (Healthy):</span>
                    <span className="text-muted-foreground ml-1">
                      More equity than debt. Conservative financing, lower risk.
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">1.0-2.0 (Moderate):</span>
                    <span className="text-muted-foreground ml-1">
                      Balanced capital structure. Acceptable for most industries.
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">&gt;2.0 (High Risk):</span>
                    <span className="text-muted-foreground ml-1">
                      Heavy debt burden. Higher financial risk and interest costs.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Note:</span> Optimal D/E varies by industry.
                Capital-intensive industries (utilities, real estate) typically have higher ratios.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Color Legend (Simple) */}
      <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Healthy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span>Moderate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>High Risk</span>
        </div>
      </div>
    </div>
  );
}
