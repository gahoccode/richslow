"use client"

import { useState, FormEvent } from "react"
import { useTicker } from "@/contexts/TickerContext"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Loader2 } from "lucide-react"

// Common Vietnamese stock tickers
const COMMON_TICKERS = [
  { value: "VNM", label: "VNM - Vinamilk" },
  { value: "VCB", label: "VCB - Vietcombank" },
  { value: "FPT", label: "FPT - FPT Corporation" },
  { value: "HPG", label: "HPG - Hoa Phat Group" },
  { value: "VHM", label: "VHM - Vinhomes" },
  { value: "VIC", label: "VIC - Vingroup" },
  { value: "MSN", label: "MSN - Masan Group" },
  { value: "TCB", label: "TCB - Techcombank" },
  { value: "VPB", label: "VPB - VPBank" },
  { value: "MWG", label: "MWG - Mobile World" },
]

export function TickerSelector() {
  const { ticker, setTicker } = useTicker()
  const [inputValue, setInputValue] = useState(ticker)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const newTicker = inputValue.trim().toUpperCase()

    // Validate ticker format (3-4 letters)
    if (!/^[A-Z]{3,4}$/.test(newTicker)) {
      return
    }

    // Don't refetch if same ticker
    if (newTicker === ticker) {
      return
    }

    setIsLoading(true)
    setTicker(newTicker)

    // Loading state will be managed by useStockData hook
    // Reset after a short delay to allow data fetching to start
    setTimeout(() => setIsLoading(false), 500)
  }

  const handleSelectChange = (value: string) => {
    setInputValue(value)
    setTicker(value)
  }

  return (
    <div className="flex items-center gap-2">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <label htmlFor="ticker" className="text-sm text-muted-foreground whitespace-nowrap">
            Ticker:
          </label>
          <Input
            id="ticker"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.toUpperCase())}
            placeholder="VNM, VCB, FPT..."
            className="w-24 uppercase font-mono"
            maxLength={4}
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="sm"
            disabled={isLoading || !/^[A-Z]{3,4}$/.test(inputValue.trim())}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>

      <div className="hidden sm:block text-sm text-muted-foreground">or</div>

      <Select value={ticker} onValueChange={handleSelectChange}>
        <SelectTrigger className="w-[180px] hidden sm:flex">
          <SelectValue placeholder="Select ticker" />
        </SelectTrigger>
        <SelectContent>
          {COMMON_TICKERS.map((stock) => (
            <SelectItem key={stock.value} value={stock.value}>
              {stock.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
