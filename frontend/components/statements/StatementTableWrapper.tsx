"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

interface StatementTableWrapperProps {
  title: string;
  description: string;
  years: (string | number)[]; // Can be years (2024) for annual or period IDs (2024-Q1) for quarterly
  period: 'quarter' | 'year'; // Period type from TickerContext
  loading?: boolean;
  children: React.ReactNode;
}

export function StatementTableWrapper({
  title,
  description,
  years,
  period,
  loading = false,
  children
}: StatementTableWrapperProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[600px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description} • Showing {years.length} {period === 'quarter' ? 'quarters' : 'years'}: {years[years.length - 1]} - {years[0]}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="overflow-x-auto">
            {children}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
