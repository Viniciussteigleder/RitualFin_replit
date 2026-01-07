import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CalendarPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Calendar</h1>
      <Card>
        <CardHeader>
          <CardTitle>Financial Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
