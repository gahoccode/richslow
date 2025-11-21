"use client"

import React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CashFlowData } from "@/lib/api/facade"
import { formatBillionVND } from "@/lib/formatters"
import { CASH_FLOW_FIELDS } from "@/lib/statement-fields"

interface CashFlowStatementTableProps {
  data: CashFlowData[];
  years: number[];
}

export function CashFlowStatementTable({ data, years }: CashFlowStatementTableProps) {
  // Create year-to-data mapping
  const dataByYear = new Map(
    data.map(stmt => [stmt.year_report, stmt])
  );

  const renderSection = (key: string, sectionKey: string, section: { label: string; fields: Record<string, { label: string; format: string; bold?: boolean }> }) => (
    <React.Fragment key={key}>
      {/* Section Header */}
      <TableRow className="bg-muted/50">
        <TableCell colSpan={years.length + 1} className="font-bold uppercase text-xs">
          {section.label}
        </TableCell>
      </TableRow>

      {/* Section Fields */}
      {Object.entries(section.fields).map(([fieldKey, fieldMeta]) => (
        <TableRow key={fieldKey} className="hover:bg-muted/30">
          <TableCell className={`font-medium ${fieldMeta.bold ? 'font-bold' : ''}`}>
            {fieldMeta.label}
          </TableCell>
          {years.map(year => {
            const stmt = dataByYear.get(year);
            const value = stmt?.[fieldKey as keyof CashFlowData] as number | null;
            const formattedValue = formatBillionVND(value);

            // Show negative values in red
            const isNegative = value !== null && value !== undefined && value < 0;

            return (
              <TableCell
                key={year}
                className={`text-right tabular-nums ${isNegative ? 'text-destructive' : ''}`}
              >
                {formattedValue}
              </TableCell>
            );
          })}
        </TableRow>
      ))}
    </React.Fragment>
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[250px] sticky left-0 bg-background">Line Item</TableHead>
          {years.map(year => (
            <TableHead key={year} className="text-right min-w-[120px]">
              {year}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.entries(CASH_FLOW_FIELDS).map(([key, section]) =>
          renderSection(key, key, section)
        )}
      </TableBody>
    </Table>
  );
}
