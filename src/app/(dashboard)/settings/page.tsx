import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function SettingsProfilePage() {
  const session = await auth();
  
  return (
    <Card>
        <CardHeader>
            <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={session?.user?.email || ""} disabled />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={session?.user?.name || "User"} disabled />
            </div>
        </CardContent>
    </Card>
  );
}
