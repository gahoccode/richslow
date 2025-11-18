"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface LiquidityData {
  current_ratio?: number;
  quick_ratio?: number;
  cash_ratio?: number;
}

interface ChartLiquidityProgressProps {
  data?: LiquidityData;
  loading?: boolean;
}

// Helper to determine color variant based on ratio vs threshold
function getRatioVariant(ratio: number, threshold: number): "default" | "secondary" | "destructive" | "outline" {
  if (ratio >= threshold) return "default"; // Green - healthy
  if (ratio >= threshold * 0.7) return "secondary"; // Yellow - caution
  return "destructive"; // Red - danger
}

// Helper to calculate progress percentage (capped at 100%)
function getProgressPercentage(ratio: number, maxScale: number): number {
  return Math.min((ratio / maxScale) * 100, 100);
}

// Helper to get progress color class
function getProgressColor(ratio: number, threshold: number): string {
  if (ratio >= threshold) return "bg-green-500";
  if (ratio >= threshold * 0.7) return "bg-yellow-500";
  return "bg-red-500";
}

export function ChartLiquidityProgress({ data, loading }: ChartLiquidityProgressProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const currentRatio = data?.current_ratio || 0;
  const quickRatio = data?.quick_ratio || 0;
  const cashRatio = data?.cash_ratio || 0;

  return (
    <div className="space-y-6">
      {/* Current Ratio */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium">Current Ratio</h4>
            <p className="text-xs text-muted-foreground">
              Current Assets / Current Liabilities
            </p>
          </div>
          <Badge variant={getRatioVariant(currentRatio, 1.5)}>
            {currentRatio.toFixed(2)}x
          </Badge>
        </div>
        <Progress
          value={getProgressPercentage(currentRatio, 3)}
          className="h-3"
          indicatorClassName={getProgressColor(currentRatio, 1.5)}
        />
        <p className="text-xs text-muted-foreground">
          Target: &gt;1.5 (Healthy liquidity position)
        </p>
      </div>

      {/* Quick Ratio */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium">Quick Ratio</h4>
            <p className="text-xs text-muted-foreground">
              (Current Assets - Inventory) / Current Liabilities
            </p>
          </div>
          <Badge variant={getRatioVariant(quickRatio, 1.0)}>
            {quickRatio.toFixed(2)}x
          </Badge>
        </div>
        <Progress
          value={getProgressPercentage(quickRatio, 2)}
          className="h-3"
          indicatorClassName={getProgressColor(quickRatio, 1.0)}
        />
        <p className="text-xs text-muted-foreground">
          Target: &gt;1.0 (Ability to pay short-term debts)
        </p>
      </div>

      {/* Cash Ratio */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium">Cash Ratio</h4>
            <p className="text-xs text-muted-foreground">
              Cash & Equivalents / Current Liabilities
            </p>
          </div>
          <Badge variant={getRatioVariant(cashRatio, 0.5)}>
            {cashRatio.toFixed(2)}x
          </Badge>
        </div>
        <Progress
          value={getProgressPercentage(cashRatio, 1)}
          className="h-3"
          indicatorClassName={getProgressColor(cashRatio, 0.5)}
        />
        <p className="text-xs text-muted-foreground">
          Target: &gt;0.5 (Most conservative liquidity measure)
        </p>
      </div>

      {/* Summary Section */}
      <div className="pt-4 border-t">
        <h4 className="text-sm font-semibold mb-2">Liquidity Assessment</h4>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            <span className="font-medium">Overall Health:</span>{" "}
            {currentRatio >= 1.5 && quickRatio >= 1.0 && cashRatio >= 0.5
              ? "Strong - Company can comfortably meet short-term obligations"
              : currentRatio >= 1.0 && quickRatio >= 0.7
              ? "Moderate - Adequate liquidity with some room for improvement"
              : "Weak - May face challenges meeting short-term obligations"}
          </p>
        </div>
      </div>

      {/* Color Legend */}
      <div className="flex flex-wrap gap-4 text-xs pt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Healthy (&gt; target)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span>Caution (70-100% of target)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Risk (&lt; 70% of target)</span>
        </div>
      </div>
    </div>
  );
}
