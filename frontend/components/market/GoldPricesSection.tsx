"use client"

import { GoldSJC, GoldBTMC } from "@/lib/api"
import { ChartGoldSJC } from "@/components/charts/ChartGoldSJC"
import { BTMCGoldList } from "./BTMCGoldList"

interface GoldPricesSectionProps {
  sjcData: GoldSJC[];
  btmcData: GoldBTMC[];
  loading?: boolean;
}

export function GoldPricesSection({ sjcData, btmcData, loading = false }: GoldPricesSectionProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex items-center justify-center h-[400px] border rounded-lg">
          <p className="text-muted-foreground">Loading SJC gold prices...</p>
        </div>
        <div className="flex items-center justify-center h-[400px] border rounded-lg">
          <p className="text-muted-foreground">Loading BTMC gold prices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartGoldSJC data={sjcData} />
      <BTMCGoldList data={btmcData} />
    </div>
  );
}
