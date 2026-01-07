import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CSVForm, ScreenshotForm } from "./forms";
import { BatchList } from "./batch-list";

export default function UploadsPage() {
  return (
    <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Data Ingestion</h1>
        
        <Tabs defaultValue="csv" className="w-full">
            <TabsList>
                <TabsTrigger value="csv">Bank CSV</TabsTrigger>
                <TabsTrigger value="screenshot">Screenshot (Evidence)</TabsTrigger>
            </TabsList>
            
            <TabsContent value="csv">
                <Card>
                    <CardHeader>
                        <CardTitle>Upload Bank Statement</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CSVForm />
                    </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="screenshot">
                 <Card>
                    <CardHeader>
                        <CardTitle>Capture Receipt / Statement</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScreenshotForm />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>

        <BatchList />
    </div>
  );
}
