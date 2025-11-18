"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { CorporateEvent } from "@/lib/api"
import { Calendar, Circle } from "lucide-react"

interface CorporateEventsTimelineProps {
  events?: CorporateEvent[];
  loading?: boolean;
  title?: string;
  description?: string;
}

export function CorporateEventsTimeline({
  events,
  loading = false,
  title = "Corporate Events",
  description = "Timeline of key corporate actions and events"
}: CorporateEventsTimelineProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <p className="text-muted-foreground">Loading events...</p>
        </CardContent>
      </Card>
    )
  }

  if (!events || events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <p className="text-muted-foreground">No corporate events available</p>
        </CardContent>
      </Card>
    )
  }

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  // Sort events by date (newest first)
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = a.exer_date;
    const dateB = b.exer_date;
    if (!dateA || !dateB) return 0;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  const getEventColor = (eventCode: string | undefined) => {
    if (!eventCode) return 'hsl(var(--muted))';

    // Color coding based on common event types
    const colorMap: { [key: string]: string } = {
      'DIV': 'hsl(var(--chart-2))',      // Dividend - green
      'AGM': 'hsl(var(--chart-1))',      // Annual General Meeting - blue
      'EGM': 'hsl(var(--chart-3))',      // Extraordinary General Meeting - orange
      'ISS': 'hsl(var(--chart-4))',      // Stock issuance - purple
      'SPL': 'hsl(var(--chart-5))',      // Stock split - pink
    };

    return colorMap[eventCode] || 'hsl(var(--muted-foreground))';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="relative pl-6 space-y-4">
            {/* Timeline line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-border" />

            {sortedEvents.map((event, index) => (
              <div key={index} className="relative">
                {/* Timeline dot */}
                <Circle
                  className="absolute left-[-23px] top-1 h-4 w-4"
                  style={{ color: getEventColor(event.event_code) }}
                  fill="currentColor"
                />

                {/* Event card */}
                <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm leading-tight">
                        {event.event_desc || event.event_name || 'Untitled Event'}
                      </h4>
                    </div>
                    {event.exer_date && (
                      <Badge variant="outline" className="flex-shrink-0 text-xs">
                        {formatDate(event.exer_date)}
                      </Badge>
                    )}
                  </div>

                  {event.event_name && event.event_name !== event.event_desc && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {event.event_name}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    {event.event_code && (
                      <Badge
                        variant="secondary"
                        className="text-xs font-mono"
                        style={{
                          backgroundColor: getEventColor(event.event_code) + '20',
                          borderColor: getEventColor(event.event_code)
                        }}
                      >
                        {event.event_code}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="mt-4 text-xs text-muted-foreground text-center border-t pt-3">
          {events.length} event{events.length !== 1 ? 's' : ''} recorded
        </div>
      </CardContent>
    </Card>
  )
}
