import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RitualsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Rituals</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Financial Rituals</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
