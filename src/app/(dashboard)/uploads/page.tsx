import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CSVForm, ScreenshotForm } from "./forms";
import { BatchList } from "./batch-list";
import { PageHeader } from "@/components/ui/page-header";
import { ImportWizard } from "@/components/imports/import-wizard";

export default function UploadsPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Imports" 
        description="Connect your bank statements or upload evidence."
        breadcrumbs={[
          { label: "Imports" }
        ]}
      />

      <ImportWizard>
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
      </ImportWizard>

        <BatchList />
    </div>
  );
}

