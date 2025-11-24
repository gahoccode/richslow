"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ExchangeRate } from "@/lib/api/facade"
import { formatVNDRate, formatDate } from "@/lib/formatters"

interface ExchangeRatesTableProps {
  rates: ExchangeRate[];
}

export function ExchangeRatesTable({ rates }: ExchangeRatesTableProps) {
  if (!rates || rates.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No exchange rate data available
      </div>
    );
  }

  // Get date from first rate
  const rateDate = rates[0]?.date ? formatDate(rates[0].date) : 'N/A';

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Exchange rates as of {rateDate}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Currency</TableHead>
              <TableHead className="text-right">Buy Cash</TableHead>
              <TableHead className="text-right">Buy Transfer</TableHead>
              <TableHead className="text-right font-semibold">Sell</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rates.map((rate, index) => (
              <TableRow key={index} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{rate.currency_code}</span>
                    <span className="text-sm text-muted-foreground">
                      {rate.currency_name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {rate.buy_cash !== null && rate.buy_cash !== undefined
                    ? formatVNDRate(rate.buy_cash)
                    : <span className="text-muted-foreground">N/A</span>
                  }
                </TableCell>
                <TableCell className="text-right">
                  {rate.buy_transfer !== null && rate.buy_transfer !== undefined
                    ? formatVNDRate(rate.buy_transfer)
                    : <span className="text-muted-foreground">N/A</span>
                  }
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatVNDRate(rate.sell)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="text-xs text-muted-foreground text-center">
        {rates.length} currencies • Source: VCB Exchange Rates
      </div>
    </div>
  );
}
