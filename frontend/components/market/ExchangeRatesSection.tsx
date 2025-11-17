"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExchangeRate } from "@/lib/api"
import { ExchangeRatesTable } from "./ExchangeRatesTable"
import { ExchangeRatesHeatmap } from "./ExchangeRatesHeatmap"

interface ExchangeRatesSectionProps {
  rates: ExchangeRate[];
  loading?: boolean;
}

export function ExchangeRatesSection({ rates, loading = false }: ExchangeRatesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Exchange Rates</CardTitle>
        <CardDescription>
          VCB exchange rates for major currencies
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Loading exchange rates...
          </div>
        ) : (
          <Tabs defaultValue="table" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
            </TabsList>
            <TabsContent value="table" className="mt-6">
              <ExchangeRatesTable rates={rates} />
            </TabsContent>
            <TabsContent value="heatmap" className="mt-6">
              <ExchangeRatesHeatmap rates={rates} />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
