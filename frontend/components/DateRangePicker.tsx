"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useTicker } from "@/contexts/TickerContext"

// Date range presets
const PRESETS = [
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "6M", days: 180 },
  { label: "YTD", days: null }, // Special case: from Jan 1 of current year
  { label: "1Y", days: 365 },
  { label: "3Y", days: 1095 },
  { label: "5Y", days: 1825 },
]

export function DateRangePicker() {
  const { startDate, endDate, setDateRange } = useTicker()
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(startDate),
    to: new Date(endDate),
  })

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range)
    if (range?.from && range?.to) {
      setDateRange(
        format(range.from, "yyyy-MM-dd"),
        format(range.to, "yyyy-MM-dd")
      )
    }
  }

  const handlePreset = (days: number | null) => {
    const to = new Date()
    let from: Date

    if (days === null) {
      // YTD: from January 1 of current year
      from = new Date(to.getFullYear(), 0, 1)
    } else {
      from = new Date()
      from.setDate(from.getDate() - days)
    }

    const newRange = { from, to }
    setDate(newRange)
    setDateRange(format(from, "yyyy-MM-dd"), format(to, "yyyy-MM-dd"))
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground hidden lg:block">
        Period:
      </span>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            <div className="border-r p-2 space-y-1">
              <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                Presets
              </div>
              {PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start font-normal"
                  onClick={() => handlePreset(preset.days)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleSelect}
              numberOfMonths={2}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
