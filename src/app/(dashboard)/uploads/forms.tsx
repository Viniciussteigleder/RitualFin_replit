"use client";

import { uploadIngestionFile } from "@/lib/actions/ingest";
import { uploadScreenshot } from "@/lib/actions/screenshots";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, Camera, CheckCircle2, ArrowRight, AlertCircle, Loader2, FileText } from "lucide-react";
import { createWorker } from "tesseract.js";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CSVForm({ onUploadSuccess }: { onUploadSuccess?: (batchId: string) => void }) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
    const [lastUpload, setLastUpload] = useState<null | { batchId: string; newItems: number; duplicates: number }>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Auto-navigate to preview after successful upload
    useEffect(() => {
        if (lastUpload?.batchId && lastUpload.newItems > 0) {
            // Auto-navigate after short delay to allow user to see success message
            const timer = setTimeout(() => {
                router.push(`/imports/${lastUpload.batchId}/preview`);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [lastUpload, router]);

    async function handleFile(file: File) {
        if (!file.name.endsWith(".csv")) {
            toast.error("Selecione um arquivo CSV (.csv)");
            setErrorMessage("Formato inválido. Apenas arquivos .csv são aceitos.");
            setUploadProgress("error");
            return;
        }

        setIsUploading(true);
        setUploadProgress("uploading");
        setLastUpload(null);
        setErrorMessage(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            setUploadProgress("processing");
            const result = await uploadIngestionFile(formData);

            if ("success" in result && result.success && "batchId" in result && result.batchId) {
                const uploadSummary = {
                    batchId: result.batchId,
                    newItems: "newItems" in result ? (result.newItems ?? 0) : 0,
                    duplicates: "duplicates" in result ? (result.duplicates ?? 0) : 0,
                };
                setLastUpload(uploadSummary);
                setUploadProgress("success");

                if (uploadSummary.newItems === 0 && uploadSummary.duplicates > 0) {
                    toast.warning("Arquivo processado, mas todas as linhas são duplicadas.");
                } else if (uploadSummary.newItems === 0) {
                    toast.warning("Arquivo processado, mas nenhuma transação encontrada.");
                } else {
                    toast.success(`Upload concluído! ${uploadSummary.newItems} novas transações prontas para revisão.`);
                }

                router.refresh();
                onUploadSuccess?.(result.batchId);
            } else {
                const error = ("error" in result && result.error) ? result.error : "Falha no upload";
                setErrorMessage(error);
                setUploadProgress("error");
                toast.error(error);
            }
        } catch (e) {
            setErrorMessage("Erro inesperado durante o upload. Tente novamente.");
            setUploadProgress("error");
            toast.error("Erro inesperado durante o upload");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }

    return (
        <div className="space-y-4">
            {/* Success State - Prominent confirmation */}
            {lastUpload && uploadProgress === "success" && (
                <div
                    className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-700 p-6 text-left animate-in fade-in slide-in-from-top-2 duration-300"
                    role="status"
                    aria-live="polite"
                >
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-emerald-500 text-white shrink-0 animate-in zoom-in duration-300">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-lg font-bold text-emerald-900 dark:text-emerald-100">Upload confirmado!</div>
                            <div className="mt-1 text-sm font-medium text-emerald-800 dark:text-emerald-200">
                                Lote: <span className="font-mono bg-emerald-100 dark:bg-emerald-900 px-2 py-0.5 rounded">{lastUpload.batchId.slice(0, 8)}...</span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/50 px-3 py-1.5 rounded-lg">
                                    <FileText className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                                    <span className="font-bold text-emerald-900 dark:text-emerald-100">{lastUpload.newItems}</span>
                                    <span className="text-emerald-700 dark:text-emerald-300">novas</span>
                                </div>
                                {lastUpload.duplicates > 0 && (
                                    <div className="flex items-center gap-2 bg-amber-100 dark:bg-amber-900/50 px-3 py-1.5 rounded-lg">
                                        <span className="font-bold text-amber-900 dark:text-amber-100">{lastUpload.duplicates}</span>
                                        <span className="text-amber-700 dark:text-amber-300">duplicadas (ignoradas)</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {lastUpload.newItems > 0 && (
                        <div className="mt-4 p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                            <div className="flex items-center gap-2 text-sm text-emerald-800 dark:text-emerald-200">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Redirecionando para revisão em 2 segundos...</span>
                            </div>
                        </div>
                    )}

                    <div className="mt-4 flex flex-col sm:flex-row gap-3">
                        <Button
                            type="button"
                            className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                            onClick={() => router.push(`/imports/${lastUpload.batchId}/preview`)}
                        >
                            Revisar e importar agora <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-xl font-bold border-emerald-300 dark:border-emerald-700"
                            onClick={() => {
                                setLastUpload(null);
                                setUploadProgress("idle");
                            }}
                        >
                            Fazer outro upload
                        </Button>
                    </div>
                </div>
            )}

            {/* Error State */}
            {errorMessage && uploadProgress === "error" && (
                <div className="rounded-2xl border-2 border-rose-300 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-700 p-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-rose-500 text-white shrink-0">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-lg font-bold text-rose-900 dark:text-rose-100">Erro no upload</div>
                            <div className="mt-2 text-sm text-rose-800 dark:text-rose-200">{errorMessage}</div>
                            <div className="mt-3 text-xs text-rose-600 dark:text-rose-400">
                                <strong>Dica:</strong> Verifique se o arquivo é um CSV válido de Sparkasse, Miles & More ou Amex.
                            </div>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        className="mt-4 rounded-xl font-bold border-rose-300 dark:border-rose-700"
                        onClick={() => {
                            setErrorMessage(null);
                            setUploadProgress("idle");
                        }}
                    >
                        Tentar novamente
                    </Button>
                </div>
            )}

            {/* Upload Zone - Only show when not in success/error state */}
            {uploadProgress !== "success" && uploadProgress !== "error" && (
                <div
                    className={cn(
                        "border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer group",
                        isDragging ? "border-primary bg-primary/5 scale-[0.99]" : "border-border hover:border-primary/50 hover:bg-secondary/50",
                        isUploading && "opacity-70 pointer-events-none"
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
                    onClick={() => !isUploading && fileInputRef.current?.click()}
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
                        data-testid="csv-file-input"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFile(file);
                        }}
                    />

                    <div className="flex flex-col items-center gap-4">
                        <div className={cn(
                            "p-4 rounded-full transition-all",
                            isUploading
                                ? "bg-primary/20 text-primary"
                                : "bg-secondary text-muted-foreground group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary",
                            isDragging && "scale-110 bg-primary/20 text-primary"
                        )}>
                            {isUploading ? (
                                <Loader2 className="h-8 w-8 animate-spin" />
                            ) : (
                                <UploadCloud className="h-8 w-8" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-foreground">
                                {isUploading
                                    ? (uploadProgress === "uploading" ? "Enviando arquivo..." : "Processando transações...")
                                    : "Clique ou arraste seu extrato CSV"
                                }
                            </h3>
                            <p className="text-muted-foreground text-sm mt-1 max-w-[280px] mx-auto leading-relaxed">
                                {isUploading
                                    ? "Detectando formato e validando dados..."
                                    : "Suporta Miles & More, Amex e Sparkasse (Máx. 10MB)"
                                }
                            </p>
                        </div>
                        {!isUploading && (
                            <Button variant="outline" className="mt-2 rounded-xl border-border font-bold px-8 shadow-sm group-hover:bg-card group-hover:border-primary group-hover:text-primary transition-all">
                                Selecionar arquivo
                            </Button>
                        )}
                    </div>
                </div>
            )}
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
