"use client";

import { useFormState, useFormStatus } from "react-dom";
import { uploadIngestionFile } from "@/lib/actions/ingest";
import { uploadScreenshot } from "@/lib/actions/screenshots";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, Camera, CheckCircle2, ArrowRight } from "lucide-react";
import { createWorker } from "tesseract.js";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CSVForm({ onUploadSuccess }: { onUploadSuccess?: (batchId: string) => void }) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [lastUpload, setLastUpload] = useState<null | { batchId: string; newItems: number; duplicates: number }>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    async function handleFile(file: File) {
        if (!file.name.endsWith(".csv")) {
            toast.error("Selecione um arquivo CSV (.csv)");
            return;
        }

        setIsUploading(true);
        setLastUpload(null);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const result = await uploadIngestionFile(formData);
            if ("success" in result && result.success && "batchId" in result && result.batchId) {
                const uploadSummary = {
                    batchId: result.batchId,
                    newItems: "newItems" in result ? (result.newItems ?? 0) : 0,
                    duplicates: "duplicates" in result ? (result.duplicates ?? 0) : 0,
                };
                setLastUpload(uploadSummary);
                toast.success("Upload concluído. Arquivo processado com sucesso.");
                router.refresh();
                onUploadSuccess?.(result.batchId);
            } else {
                toast.error(("error" in result && result.error) ? result.error : "Falha no upload");
            }
        } catch (e) {
            toast.error("Erro inesperado durante o upload");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }

    return (
        <div className="space-y-4">
            {lastUpload && (
                <div
                    className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left"
                    role="status"
                    aria-live="polite"
                >
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-700 mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                            <div className="text-sm font-extrabold text-emerald-900">Upload confirmado</div>
                            <div className="mt-1 text-xs font-semibold text-emerald-900/80">
                                Lote: <span className="font-mono">{lastUpload.batchId}</span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-emerald-900/80">
                                <span>{lastUpload.newItems} novas linhas</span>
                                <span>{lastUpload.duplicates} duplicadas</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-3 flex flex-col sm:flex-row gap-2">
                        <Button
                            type="button"
                            className="rounded-xl font-extrabold"
                            onClick={() => router.push(`/imports/${lastUpload.batchId}/preview`)}
                        >
                            Revisar e importar <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-xl font-extrabold"
                            onClick={() => setLastUpload(null)}
                        >
                            Fazer outro upload
                        </Button>
                    </div>
                </div>
            )}

        <div 
            className={cn(
                "border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer group",
                isDragging ? "border-primary bg-primary/5 scale-[0.99]" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                isUploading && "opacity-50 pointer-events-none"
            )}
            role="button"
            tabIndex={0}
            aria-disabled={isUploading}
            aria-busy={isUploading}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files[0];
                if (file) handleFile(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
                if (isUploading) return;
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                }
            }}
        >
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".csv"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                }}
            />
            
            <div className="flex flex-col items-center gap-4">
                <div className={cn(
                    "p-4 rounded-full bg-slate-100 text-slate-400 transition-all group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary",
                    isDragging && "scale-110 bg-primary/20 text-primary"
                )}>
                    {isUploading ? (
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    ) : (
                        <UploadCloud className="h-8 w-8" />
                    )}
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900">
                        {isUploading ? "Enviando e processando..." : "Clique ou arraste seu extrato CSV"}
                    </h3>
                    <p className="text-slate-500 text-sm mt-1 max-w-[280px] mx-auto leading-relaxed">
                        Suporta Miles & More, Amex e Sparkasse. (Máx. 10MB)
                    </p>
                </div>
                {!isUploading && (
                    <Button variant="outline" className="mt-2 rounded-xl border-slate-200 font-bold px-8 shadow-sm group-hover:bg-white group-hover:border-primary group-hover:text-primary transition-all">
                        Selecionar arquivo
                    </Button>
                )}
            </div>
        </div>
        </div>
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
