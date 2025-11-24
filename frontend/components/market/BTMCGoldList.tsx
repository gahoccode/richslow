"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { GoldBTMC } from "@/lib/api/facade"
import { formatGoldPrice, formatDateTime } from "@/lib/formatters"

interface BTMCGoldListProps {
  data?: GoldBTMC[];
  title?: string;
  description?: string;
}

export function BTMCGoldList({
  data,
  title = "BTMC Gold Prices",
  description = "Buy and sell prices for BTMC gold products"
}: BTMCGoldListProps) {
  // If no data provided, show empty state
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No BTMC gold price data available</p>
        </CardContent>
      </Card>
    )
  }

  // Get latest timestamp
  const latestTime = data[0]?.time ? formatDateTime(data[0].time) : 'N/A';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="text-xs text-muted-foreground mt-2">
          Last updated: {latestTime}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {data.map((item, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{item.name}</h4>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {item.karat}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {item.gold_content}% pure
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                  <div>
                    <div className="text-muted-foreground text-xs">Buy Price</div>
                    <div className="font-semibold text-green-600">
                      {formatGoldPrice(item.buy_price)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Sell Price</div>
                    <div className="font-semibold text-red-600">
                      {formatGoldPrice(item.sell_price)}
                    </div>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>World Price Reference</span>
                    <span className="font-mono">{formatGoldPrice(item.world_price)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="mt-4 text-xs text-muted-foreground text-center">
          {data.length} products • Source: BTMC
        </div>
      </CardContent>
    </Card>
  )
}
