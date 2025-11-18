"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

interface StatementTableWrapperProps {
  title: string;
  description: string;
  years: number[];
  loading?: boolean;
  children: React.ReactNode;
}

export function StatementTableWrapper({
  title,
  description,
  years,
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
          {description} • Showing {years.length} years: {years[years.length - 1]} - {years[0]}
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
