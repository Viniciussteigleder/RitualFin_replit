import { getIngestionBatches, commitBatch, rollbackBatch } from "@/lib/actions/ingest";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Undo2 } from "lucide-react";

export async function BatchList() {
    const batches = await getIngestionBatches();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Imports</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {batches.length === 0 ? <div className="text-muted-foreground">No imports yet.</div> : null}
                    {batches.map(batch => (
                        <div key={batch.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                            <div>
                                <div className="font-medium">{batch.filename}</div>
                                <div className="text-xs text-muted-foreground">
                                    {new Date(batch.createdAt).toLocaleDateString()} • {batch.sourceType} • {batch.items.length} items
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant={
                                    batch.status === "completed" ? "secondary" : 
                                    batch.status === "committed" ? "outline" : 
                                    batch.status === "preview" ? "secondary" :
                                    "destructive"
                                }>
                                    {batch.status}
                                </Badge>
                                
                                {batch.status === "completed" || batch.status === "preview" ? (
                                    <form action={async () => {
                                        "use server";
                                        await commitBatch(batch.id);
                                    }}>
                                        <Button size="sm" variant="default">Process & Import</Button>
                                    </form>
                                ) : batch.status === "committed" ? (
                                    <form action={async () => {
                                        "use server";
                                        await rollbackBatch(batch.id);
                                    }}>
                                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                            <Undo2 className="h-4 w-4 mr-1" /> Rollback
                                        </Button>
                                    </form>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
