// UPLOAD PREVIEW SECTION - IMPROVED VERSION
// This is the replacement for lines 440-575 in client/src/pages/uploads.tsx

// Add these state variables at the top of the component (around line 40):
const [previewRowLimit, setPreviewRowLimit] = useState(10); // NEW: Default 10 rows
const [visibleColumns, setVisibleColumns] = useState<string[]>([ // NEW: Column selection
  'source', 'bookingDate', 'amount', 'currency', 'simpleDesc', 'keyDesc'
]); // Default columns

// Add this helper function before the return statement:
const getLastTransactionDate = (rows: any[]) => {
  if (!rows || rows.length === 0) return null;
  const dates = rows
    .map(r => r.bookingDate)
    .filter(Boolean)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  return dates[0];
};

// Replace the entire preview card section (lines 440-575) with this:
{selectedFile && (
  <Card className="bg-white border border-gray-200 shadow-sm">
    <CardHeader className="pb-3">
      <CardTitle className="text-base">{t(locale, uploadsCopy.previewTitle)}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* File Info & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold">{selectedFile.name}</p>
          <p className="text-xs text-muted-foreground">
            {previewEncoding ? `${t(locale, uploadsCopy.encodingDetected)}: ${previewEncoding}` : t(locale, uploadsCopy.encodingAuto)}
          </p>
          {previewData?.rows && (
            <p className="text-xs text-muted-foreground">
              Última transação: {getLastTransactionDate(previewData.rows) || "N/A"}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{t(locale, uploadsCopy.importDate)}</Label>
            <Input
              type="date"
              value={importDate}
              onChange={(e) => setImportDate(e.target.value)}
              className="w-[180px]"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => void handlePreview(selectedFile)}
              disabled={isPreviewing}
              className="gap-2"
            >
              {isPreviewing ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertCircle className="h-4 w-4" />}
              {t(locale, uploadsCopy.previewButton)}
            </Button>
            <Button
              onClick={handleImport}
              disabled={uploadMutation.isPending || !previewData?.success || !isPreviewConfirmed}
              className="gap-2"
            >
              {uploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {t(locale, uploadsCopy.importButton)}
            </Button>
          </div>
        </div>
      </div>

      {previewError && (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 whitespace-pre-wrap">
          {previewError}
        </div>
      )}

      {previewData?.success && (
        <div className="space-y-3">
          {/* MOVED TO TOP: Confirmation Checkbox */}
          <label className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md cursor-pointer hover:bg-blue-100 transition-colors">
            <Checkbox
              checked={isPreviewConfirmed}
              onCheckedChange={(checked) => setIsPreviewConfirmed(Boolean(checked))}
              className="shrink-0"
            />
            <span className="text-sm font-medium text-blue-900">
              {t(locale, uploadsCopy.previewConfirm)}
            </span>
          </label>

          {/* Format Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
              <p className="text-muted-foreground">{t(locale, uploadsCopy.previewFormat)}</p>
              <p className="font-medium">{previewData.format || "-"}</p>
            </div>
            <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
              <p className="text-muted-foreground">{t(locale, uploadsCopy.previewDelimiter)}</p>
              <p className="font-medium">{previewData.meta?.delimiter || ";"}</p>
            </div>
            <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
              <p className="text-muted-foreground">{t(locale, uploadsCopy.previewDate)}</p>
              <p className="font-medium">{previewData.meta?.dateFormat || "-"}</p>
            </div>
            <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
              <p className="text-muted-foreground">Linhas</p>
              <Select value={String(previewRowLimit)} onValueChange={(v) => setPreviewRowLimit(v === "all" ? previewData.rows?.length || 999 : Number(v))}>
                <SelectTrigger className="h-6 w-full text-xs font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="all">Todas ({previewData.rows?.length || 0})</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
              <p className="text-muted-foreground">{t(locale, uploadsCopy.previewRows)}</p>
              <p className="font-medium">{previewData.rows?.length || 0}</p>
            </div>
          </div>

          {/* Column Selection */}
          {previewData.meta?.headersFound?.length ? (
            <Accordion type="single" collapsible className="border rounded-md">
              <AccordionItem value="columns" className="border-none">
                <AccordionTrigger className="px-3 py-2 text-xs hover:no-underline">
                  <span className="font-semibold">{t(locale, uploadsCopy.columnsDetected)}</span>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {[
                      { key: 'source', label: 'Fonte', isDefault: true },
                      { key: 'bookingDate', label: 'Data', isDefault: true },
                      { key: 'amount', label: 'Valor', isDefault: true },
                      { key: 'currency', label: 'Moeda', isDefault: true },
                      { key: 'simpleDesc', label: 'Descrição', isDefault: true },
                      { key: 'keyDesc', label: 'Key_desc', isDefault: true },
                      { key: 'accountSource', label: 'Conta', isDefault: false },
                      { key: 'key', label: 'Key', isDefault: false },
                    ].map((col) => (
                      <label key={col.key} className="flex items-center gap-2 text-xs cursor-pointer">
                        <Checkbox
                          checked={visibleColumns.includes(col.key)}
                          onCheckedChange={(checked) => {
                            setVisibleColumns(prev =>
                              checked
                                ? [...prev, col.key]
                                : prev.filter(c => c !== col.key)
                            );
                          }}
                        />
                        <span className={cn(col.isDefault && "font-medium")}>{col.label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setVisibleColumns(['source', 'bookingDate', 'amount', 'currency', 'simpleDesc', 'keyDesc', 'accountSource', 'key'])}
                      className="text-xs h-7"
                    >
                      Mostrar todas
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setVisibleColumns(['source', 'bookingDate', 'amount', 'currency', 'simpleDesc', 'keyDesc'])}
                      className="text-xs h-7"
                    >
                      Restaurar padrão
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : null}

          {/* Warnings */}
          {previewData.meta?.warnings?.length ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
              <p className="font-semibold">{t(locale, uploadsCopy.labelWarnings)}</p>
              <ul className="mt-1 space-y-1">
                {previewData.meta.warnings.map((warning: string, index: number) => (
                  <li key={`${warning}-${index}`}>• {warning}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Preview Table with Color-Coded Amounts */}
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/30 text-muted-foreground">
                <tr>
                  {visibleColumns.includes('source') && <th className="px-3 py-2 text-left">{t(locale, uploadsCopy.tableSource)}</th>}
                  {visibleColumns.includes('bookingDate') && <th className="px-3 py-2 text-left">{t(locale, uploadsCopy.tableDate)}</th>}
                  {visibleColumns.includes('amount') && <th className="px-3 py-2 text-right">{t(locale, uploadsCopy.tableAmount)}</th>}
                  {visibleColumns.includes('currency') && <th className="px-3 py-2 text-left">{t(locale, uploadsCopy.tableCurrency)}</th>}
                  {visibleColumns.includes('simpleDesc') && <th className="px-3 py-2 text-left">{t(locale, uploadsCopy.tableDescription)}</th>}
                  {visibleColumns.includes('keyDesc') && <th className="px-3 py-2 text-left">{t(locale, uploadsCopy.tableKeyDesc)}</th>}
                  {visibleColumns.includes('accountSource') && <th className="px-3 py-2 text-left">{t(locale, uploadsCopy.tableAccount)}</th>}
                  {visibleColumns.includes('key') && <th className="px-3 py-2 text-left">{t(locale, uploadsCopy.tableKey)}</th>}
                </tr>
              </thead>
              <tbody>
                {previewData.rows?.slice(0, previewRowLimit).map((row: any, idx: number) => (
                  <tr key={`${row.key}-${idx}`} className="border-t hover:bg-muted/20">
                    {visibleColumns.includes('source') && <td className="px-3 py-2">{row.source}</td>}
                    {visibleColumns.includes('bookingDate') && <td className="px-3 py-2 whitespace-nowrap">{row.bookingDate}</td>}
                    {visibleColumns.includes('amount') && (
                      <td className="px-3 py-2 text-right">
                        <span className={cn(
                          "font-mono font-semibold",
                          row.amount < 0 ? "text-red-600" : "text-green-600"
                        )}>
                          {row.amount >= 0 ? '+' : ''}{Number(row.amount).toFixed(2)}
                        </span>
                      </td>
                    )}
                    {visibleColumns.includes('currency') && <td className="px-3 py-2">{row.currency}</td>}
                    {visibleColumns.includes('simpleDesc') && <td className="px-3 py-2 max-w-xs truncate" title={row.simpleDesc}>{row.simpleDesc}</td>}
                    {visibleColumns.includes('keyDesc') && <td className="px-3 py-2 max-w-xs truncate text-muted-foreground" title={row.keyDesc}>{row.keyDesc}</td>}
                    {visibleColumns.includes('accountSource') && <td className="px-3 py-2">{row.accountSource}</td>}
                    {visibleColumns.includes('key') && <td className="px-3 py-2 text-muted-foreground font-mono text-[10px]">{row.key}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Row Count Info */}
          <p className="text-xs text-muted-foreground text-center">
            Mostrando {Math.min(previewRowLimit, previewData.rows?.length || 0)} de {previewData.rows?.length || 0} linhas
          </p>

          <p className="text-xs text-muted-foreground">
            {t(locale, uploadsCopy.previewNote)}
          </p>
        </div>
      )}
    </CardContent>
  </Card>
)}
