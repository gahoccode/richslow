"use client";

import { useMarketData } from "@/hooks/useMarketData";
import { ExchangeRatesSection } from "@/components/market/ExchangeRatesSection";
import { GoldPricesSection } from "@/components/market/GoldPricesSection";
import { FundsSection } from "@/components/market/FundsSection";
import { FloatingNav } from "@/components/FloatingNav";

export default function MarketPage() {
  const { data, loading, error } = useMarketData();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">RichSlow</h1>
            <span className="text-sm text-muted-foreground hidden md:block">
              Market Data
            </span>
          </div>
          {loading && (
            <div className="ml-auto text-sm text-muted-foreground hidden lg:block">Loading market data...</div>
          )}
          {error && (
            <div className="ml-auto text-sm text-destructive hidden lg:block">Error loading data</div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Market Data</h2>
          <p className="text-muted-foreground">
            Real-time exchange rates, gold prices, and mutual fund data from Vietnamese markets
          </p>
        </div>

        {/* Exchange Rates Section */}
        <div className="mb-8">
          <ExchangeRatesSection
            rates={data.exchangeRates}
            loading={loading}
          />
        </div>

        {/* Gold Prices Section */}
        <div>
          <h3 className="text-2xl font-semibold mb-4">Gold Prices</h3>
          <GoldPricesSection
            sjcData={data.goldSJC}
            btmcData={data.goldBTMC}
            loading={loading}
          />
        </div>

        {/* Funds Section */}
        <div className="mt-8">
          <FundsSection loading={loading} />
        </div>

        {/* Data Summary */}
        {!loading && !error && (
          <div className="mt-8 p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Data Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Currencies:</span>{" "}
                <span className="font-mono">{data.exchangeRates.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">SJC Products:</span>{" "}
                <span className="font-mono">{data.goldSJC.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">BTMC Products:</span>{" "}
                <span className="font-mono">{data.goldBTMC.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Funds Listed:</span>{" "}
                <span className="font-mono">10+</span>
              </div>
            </div>
          </div>
        )}
      </main>
      <FloatingNav />
    </div>
  );
}
