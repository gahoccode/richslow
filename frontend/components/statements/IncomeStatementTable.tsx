"use client"

import React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { IncomeStatementData } from "@/lib/api/facade"
import { formatBillionVND, formatYoY } from "@/lib/formatters"
import { INCOME_STATEMENT_FIELDS } from "@/lib/statement-fields"

interface IncomeStatementTableProps {
  data: IncomeStatementData[];
  years: (string | number)[]; // Can be years (2024) for annual or period IDs (2024-Q1) for quarterly
}

export function IncomeStatementTable({ data, years }: IncomeStatementTableProps) {
  // Create period-to-data mapping (supports both annual and quarterly data)
  const dataByYear = new Map(
    data.map(stmt => {
      // For quarterly data, use period_id; for annual data, use year_report
      const periodKey = stmt.period_id || stmt.year_report?.toString();
      return [periodKey, stmt];
    })
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
            const periodKey = typeof year === 'number' ? year.toString() : year;
            const stmt = dataByYear.get(periodKey);
            const value = stmt?.[fieldKey as keyof IncomeStatementData] as number | null;

            let formattedValue = 'N/A';
            if (fieldMeta.format === 'yoy') {
              const result = formatYoY(value);
              formattedValue = result.text;
            } else {
              formattedValue = formatBillionVND(value);
            }

            return (
              <TableCell key={year} className="text-right tabular-nums">
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
        {Object.entries(INCOME_STATEMENT_FIELDS).map(([key, section]) =>
          renderSection(key, key, section)
        )}
      </TableBody>
    </Table>
  );
}
