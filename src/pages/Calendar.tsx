
import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

// Sample data - will be replaced with real data later
const events = [
  {
    id: "1",
    title: "Phone Interview",
    company: "Google",
    date: new Date(2023, 5, 18),
    type: "interview",
  },
  {
    id: "2",
    title: "Technical Assessment",
    company: "Apple",
    date: new Date(2023, 5, 20),
    type: "assessment",
  },
  {
    id: "3",
    title: "Final Interview",
    company: "Microsoft",
    date: new Date(2023, 5, 22),
    type: "interview",
  },
];

const Calendar = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  // Filter events for the selected day
  const selectedDayEvents = events.filter(
    (event) => date && event.date.toDateString() === date.toDateString()
  );

  return (
    <AppLayout>
      <div className="space-y-8 animate-slide-up">
        <div>
          <h1 className="font-semibold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">Schedule and track your interviews and deadlines</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-medium">Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                modifiers={{
                  event: events.map(event => event.date),
                }}
                modifiersStyles={{
                  event: {
                    fontWeight: "bold",
                    backgroundColor: "var(--primary)",
                    color: "white",
                    borderRadius: "0.5rem",
                  }
                }}
              />
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="text-base font-medium">
                {date ? (
                  <span>Events for {date.toLocaleDateString()}</span>
                ) : (
                  <span>Select a date to view events</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDayEvents.length > 0 ? (
                <div className="space-y-4">
                  {selectedDayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-3 rounded-lg bg-muted/50 border"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{event.title}</h3>
                        <Badge 
                          variant={event.type === "interview" ? "interview" : "default"}
                        >
                          {event.type === "interview" ? "Interview" : "Assessment"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {event.company}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.date.toLocaleTimeString([], { 
                          hour: "2-digit", 
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-6">
                  No events scheduled for this day
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Calendar;
