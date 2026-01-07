"use client";

import { useFormState, useFormStatus } from "react-dom";
import { uploadIngestionFile } from "@/lib/actions/ingest";
import { uploadScreenshot } from "@/lib/actions/screenshots";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, Camera } from "lucide-react";
import { createWorker } from "tesseract.js";
import { useState } from "react";

const initialState = { error: "", success: false, newItems: 0, duplicates: 0 };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending} className="w-full" data-testid="upload-csv-btn">
      {pending ? (
        <span className="flex items-center gap-2">Processing...</span>
      ) : (
        <span className="flex items-center gap-2">
          <UploadCloud className="h-4 w-4" /> Upload CSV
        </span>
      )}
    </Button>
  );
}

export function CSVForm() {
    const [state, formAction] = useFormState(async (_prev: any, formData: FormData) => {
        const result = await uploadIngestionFile(formData);
        return result;
     }, initialState);

    return (
        <form action={formAction} className="space-y-4 max-w-md">
            <div className="grid w-full items-center gap-1.5">
                <Input id="file" name="file" type="file" accept=".csv" required />
            </div>
            <SubmitButton />
            
            {state?.error && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                    {state.error}
                </div>
            )}
            
            {state?.success && (
                <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">
                    Success! Imported {state.newItems} new items ({state.duplicates} duplicates skipped).
                </div>
            )}
        </form>
    );
}

export function ScreenshotForm() {
    const [ocrStatus, setOcrStatus] = useState("idle");
    const [message, setMessage] = useState("");

    async function handleSubmit(formData: FormData) {
        setOcrStatus("processing");
        setMessage("Running client-side OCR...");
        
        const file = formData.get("file") as File;
        if (!file) return;

        try {
            let text = "";
            // @ts-ignore - Playwright mock
            if (typeof window !== "undefined" && window.__MOCK_OCR_TEXT__) {
                // @ts-ignore
                text = window.__MOCK_OCR_TEXT__;
                setMessage("Using mock OCR data...");
            } else {
                const worker = await createWorker("eng"); // Setup Tesseract
                await worker.setParameters({
                    tessedit_char_whitelist: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.,:- '
                });
                const ret = await worker.recognize(file);
                text = ret.data.text;
                await worker.terminate();
            }
            
            setMessage("OCR Complete. Uploading...");

            // Append text to formData
            formData.set("ocrText", text);

            const result = await uploadScreenshot(formData);
            if (result.success) {
                setOcrStatus("success");
                setMessage("Screenshot uploaded and parsed successfully!");
            } else {
                setOcrStatus("error");
                setMessage(`Error: ${result.error}`);
            }

        } catch (e: any) {
            console.error(e);
            setOcrStatus("error");
            setMessage("Failed to run OCR.");
        }
    }

    return (
        <form action={handleSubmit} className="space-y-4 max-w-md">
             <div className="grid w-full items-center gap-1.5">
                <Input id="screenshot" name="file" type="file" accept="image/*" required />
            </div>
            
            <Button disabled={ocrStatus === "processing"} className="w-full" data-testid="upload-screenshot-btn">
                {ocrStatus === "processing" ? "Scanning..." : (
                    <span className="flex items-center gap-2">
                        <Camera className="h-4 w-4" /> Scan & Upload
                    </span>
                )}
            </Button>

            {message && (
                <div className={`p-3 rounded-md text-sm ${ocrStatus === "error" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>
                    {message}
                </div>
            )}
        </form>
    );
}
