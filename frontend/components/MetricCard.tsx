"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: number | null | undefined
  unit?: string
  change?: number | null
  loading?: boolean
  invertColors?: boolean // For metrics where lower is better
  description?: string
}

export function MetricCard({
  title,
  value,
  unit = "",
  change,
  loading = false,
  invertColors = false,
  description,
}: MetricCardProps) {
  // Determine trend and color
  const getTrend = () => {
    if (change === null || change === undefined || change === 0) {
      return { icon: Minus, color: "text-muted-foreground" }
    }

    const isPositive = change > 0
    const shouldBeGreen = invertColors ? !isPositive : isPositive

    return {
      icon: isPositive ? TrendingUp : TrendingDown,
      color: shouldBeGreen ? "text-green-600" : "text-red-600",
    }
  }

  const formatValue = (val: number | null | undefined): string => {
    if (val === null || val === undefined) return "N/A"

    // Format based on magnitude
    if (unit === "%") {
      return (val * 100).toFixed(2)
    }

    if (Math.abs(val) >= 1000) {
      return val.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })
    }

    return val.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const formatChange = (val: number | null | undefined): string => {
    if (val === null || val === undefined) return ""
    const sign = val > 0 ? "+" : ""
    return `${sign}${val.toFixed(2)}%`
  }

  const trend = getTrend()
  const TrendIcon = trend.icon

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            {description && (
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {change !== null && change !== undefined && (
          <TrendIcon className={cn("h-4 w-4", trend.color)} />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatValue(value)}
          {value !== null && value !== undefined && unit && (
            <span className="text-lg text-muted-foreground ml-1">{unit}</span>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {change !== null && change !== undefined && change !== 0 && (
          <p className={cn("text-xs mt-1", trend.color)}>
            {formatChange(change)} from last period
          </p>
        )}
      </CardContent>
    </Card>
  )
}
