"use client"

import React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTicker } from "@/contexts/TickerContext"
import { useSWRConfig } from "swr"

interface PeriodSelectorProps {
  className?: string
  disabled?: boolean
}

export function PeriodSelector({ className, disabled = false }: PeriodSelectorProps) {
  const { period, setPeriod, ticker } = useTicker()
  const { mutate, cache } = useSWRConfig()

  // Check if data exists in cache for this period
  const getCacheStatus = (periodToCheck: 'quarter' | 'year') => {
    const cacheKey = `/api/statements/${ticker}?period=${periodToCheck}&years=3`
    return cache?.get(cacheKey)
  }

  const handlePeriodChange = (newPeriod: 'quarter' | 'year') => {
    // Update context immediately (instant UI response)
    setPeriod(newPeriod)

    // Check if data exists in cache
    const cachedData = getCacheStatus(newPeriod)

    if (cachedData) {
      // Cache hit - we have data cached
      console.log(`Switched to ${newPeriod}ly view (from cache)`)
    } else {
      // Cache miss - will need to fetch from API
      console.log(`Loading ${newPeriod}ly data from API...`)
    }
  }

  const getCacheIndicator = (periodToCheck: 'quarter' | 'year') => {
    const cached = getCacheStatus(periodToCheck)
    if (cached?.data) {
      return <div className="w-2 h-2 rounded-full bg-green-500" title="Cached data available" />
    }
    return <div className="w-2 h-2 rounded-full bg-gray-300" title="No cached data" />
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm text-muted-foreground hidden lg:block">
        Reports:
      </span>

      <Select
        value={period}
        onValueChange={handlePeriodChange}
        disabled={disabled}
      >
        <SelectTrigger
          className="w-[120px]"
          size="sm"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent align="start">
          <SelectItem value="year">
            <div className="flex items-center gap-2">
              {getCacheIndicator('year')}
              <span>Yearly</span>
            </div>
          </SelectItem>
          <SelectItem value="quarter">
            <div className="flex items-center gap-2">
              {getCacheIndicator('quarter')}
              <span>Quarterly</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}