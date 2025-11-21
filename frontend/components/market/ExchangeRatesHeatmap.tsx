"use client"

import { ExchangeRate } from "@/lib/api/facade"
import { formatVNDShort, formatVNDRate } from "@/lib/formatters"

interface ExchangeRatesHeatmapProps {
  rates: ExchangeRate[];
}

export function ExchangeRatesHeatmap({ rates }: ExchangeRatesHeatmapProps) {
  if (!rates || rates.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No exchange rate data available
      </div>
    );
  }

  // Extract sell rates for color scaling
  const sellRates = rates
    .map(r => r.sell)
    .filter((v): v is number => v !== null && v !== undefined);

  if (sellRates.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No valid exchange rate data for heatmap
      </div>
    );
  }

  const minRate = Math.min(...sellRates);
  const maxRate = Math.max(...sellRates);

  // Calculate color intensity for each rate
  const getColorStyle = (sell: number | undefined) => {
    if (sell === null || sell === undefined) {
      return {
        backgroundColor: 'hsl(var(--muted))',
        color: 'hsl(var(--muted-foreground))'
      };
    }

    // Normalize to 0-1 range
    const intensity = maxRate > minRate
      ? (sell - minRate) / (maxRate - minRate)
      : 0.5;

    // Color from light blue (low rates) to dark blue (high rates)
    // HSL: hue=211 (blue), saturation=70%, lightness varies
    const lightness = 90 - (intensity * 40); // 90% to 50%
    const textColor = intensity > 0.5 ? '#ffffff' : 'hsl(var(--foreground))';

    return {
      backgroundColor: `hsl(211, 70%, ${lightness}%)`,
      color: textColor
    };
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {rates.map((rate, index) => {
          const style = getColorStyle(rate.sell);

          return (
            <div
              key={index}
              className="relative p-4 rounded-lg border transition-all hover:scale-105 hover:shadow-lg cursor-pointer"
              style={style}
              title={`${rate.currency_name}: ${rate.sell ? formatVNDRate(rate.sell) : 'N/A'} VND`}
            >
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold">{rate.currency_code}</div>
                <div className="text-xs opacity-90 truncate">
                  {rate.currency_name}
                </div>
                <div className="text-sm font-semibold mt-2">
                  {rate.sell ? formatVNDShort(rate.sell) : 'N/A'}
                </div>
                {rate.buy_transfer !== null && rate.buy_transfer !== undefined && (
                  <div className="text-xs opacity-75">
                    Buy: {formatVNDShort(rate.buy_transfer)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Color legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(211, 70%, 90%)' }} />
          <span>Low rates</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(211, 70%, 50%)' }} />
          <span>High rates</span>
        </div>
      </div>
    </div>
  );
}
