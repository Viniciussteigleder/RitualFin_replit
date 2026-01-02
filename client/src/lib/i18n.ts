export type Locale = "pt-BR" | "de-DE" | "en-US";

export type TranslationTriplet = {
  "pt-BR": string;
  "de-DE": string;
  "en-US": string;
};

export function t(locale: Locale, triplet: TranslationTriplet) {
  return triplet[locale] || triplet["pt-BR"];
}

export const uploadsCopy = {
  title: {
    "pt-BR": "Centro de Importação",
    "de-DE": "Import-Center",
    "en-US": "Import Center"
  },
  subtitle: {
    "pt-BR": "Importe seus extratos CSV para categorizar transações automaticamente.",
    "de-DE": "Importieren Sie CSV-Auszüge, um Transaktionen automatisch zu kategorisieren.",
    "en-US": "Import CSV statements to categorize transactions automatically."
  },
  dropTitle: {
    "pt-BR": "Arraste seu arquivo CSV",
    "de-DE": "CSV-Datei hier ablegen",
    "en-US": "Drag your CSV file"
  },
  dropActive: {
    "pt-BR": "Solte o arquivo aqui",
    "de-DE": "Datei hier ablegen",
    "en-US": "Drop the file here"
  },
  dropHint: {
    "pt-BR": "Ou clique para selecionar do seu computador",
    "de-DE": "Oder klicken, um vom Computer auszuwählen",
    "en-US": "Or click to select from your computer"
  },
  selectFile: {
    "pt-BR": "Selecionar Arquivo",
    "de-DE": "Datei auswählen",
    "en-US": "Select File"
  },
  formatsHint: {
    "pt-BR": "Formatos aceitos: Miles & More, American Express, Sparkasse. Limite de 10MB.",
    "de-DE": "Akzeptierte Formate: Miles & More, American Express, Sparkasse. Limit 10 MB.",
    "en-US": "Accepted formats: Miles & More, American Express, Sparkasse. 10MB limit."
  },
  previewTitle: {
    "pt-BR": "Pré-visualização & Importação",
    "de-DE": "Vorschau & Import",
    "en-US": "Preview & Import"
  },
  importDate: {
    "pt-BR": "Data de importação",
    "de-DE": "Importdatum",
    "en-US": "Import date"
  },
  previewButton: {
    "pt-BR": "Pré-visualizar",
    "de-DE": "Vorschau",
    "en-US": "Preview"
  },
  importButton: {
    "pt-BR": "Importar",
    "de-DE": "Importieren",
    "en-US": "Import"
  },
  previewConfirm: {
    "pt-BR": "Confirmo que revisei a pré-visualização e desejo importar.",
    "de-DE": "Ich habe die Vorschau geprüft und möchte importieren.",
    "en-US": "I reviewed the preview and want to import."
  },
  previewNote: {
    "pt-BR": "A pré-visualização mostra exatamente o que será importado. Ajuste a data de importação se necessário.",
    "de-DE": "Die Vorschau zeigt genau, was importiert wird. Passen Sie das Importdatum bei Bedarf an.",
    "en-US": "The preview shows exactly what will be imported. Adjust the import date if needed."
  },
  statusTitle: {
    "pt-BR": "Status da importação",
    "de-DE": "Importstatus",
    "en-US": "Import status"
  },
  parsingReport: {
    "pt-BR": "Relatório de Parsing",
    "de-DE": "Parsing-Bericht",
    "en-US": "Parsing Report"
  },
  encodingDetected: {
    "pt-BR": "Codificação detectada",
    "de-DE": "Erkannte Kodierung",
    "en-US": "Detected encoding"
  },
  encodingAuto: {
    "pt-BR": "Codificação será detectada automaticamente.",
    "de-DE": "Die Kodierung wird automatisch erkannt.",
    "en-US": "Encoding will be detected automatically."
  },
  invalidFormatTitle: {
    "pt-BR": "Formato inválido",
    "de-DE": "Ungültiges Format",
    "en-US": "Invalid format"
  },
  invalidFormatDesc: {
    "pt-BR": "Por favor, selecione um arquivo CSV",
    "de-DE": "Bitte wählen Sie eine CSV-Datei aus.",
    "en-US": "Please select a CSV file."
  },
  previewFailed: {
    "pt-BR": "Falha na leitura do arquivo. Verifique delimitador, colunas e codificação.",
    "de-DE": "Datei konnte nicht gelesen werden. Prüfen Sie Trennzeichen, Spalten und Kodierung.",
    "en-US": "Failed to read the file. Check delimiter, columns, and encoding."
  },
  previewTryAgain: {
    "pt-BR": "Falha na pré-visualização. Verifique o arquivo e tente novamente.",
    "de-DE": "Vorschau fehlgeschlagen. Datei prüfen und erneut versuchen.",
    "en-US": "Preview failed. Check the file and try again."
  },
  previewErrorTitle: {
    "pt-BR": "Erro na pré-visualização",
    "de-DE": "Fehler bei der Vorschau",
    "en-US": "Preview error"
  },
  importDoneTitle: {
    "pt-BR": "Importação concluída",
    "de-DE": "Import abgeschlossen",
    "en-US": "Import completed"
  },
  importDuplicateTitle: {
    "pt-BR": "Arquivo já importado",
    "de-DE": "Datei bereits importiert",
    "en-US": "File already imported"
  },
  importErrorTitle: {
    "pt-BR": "Erro na importação",
    "de-DE": "Importfehler",
    "en-US": "Import error"
  },
  importErrorDesc: {
    "pt-BR": "Falha ao processar o arquivo",
    "de-DE": "Datei konnte nicht verarbeitet werden.",
    "en-US": "Failed to process the file."
  },
  needFileTitle: {
    "pt-BR": "Selecione um arquivo primeiro",
    "de-DE": "Bitte zuerst eine Datei auswählen",
    "en-US": "Select a file first"
  },
  needPreviewTitle: {
    "pt-BR": "Faça a pré-visualização antes de importar",
    "de-DE": "Vor dem Import eine Vorschau erstellen",
    "en-US": "Preview before importing"
  },
  needConfirmTitle: {
    "pt-BR": "Confirme a pré-visualização antes de importar",
    "de-DE": "Vorschau vor dem Import bestätigen",
    "en-US": "Confirm the preview before importing"
  },
  statsTotalImported: {
    "pt-BR": "Total Importado",
    "de-DE": "Insgesamt importiert",
    "en-US": "Total Imported"
  },
  statsTransactions: {
    "pt-BR": "transações",
    "de-DE": "Transaktionen",
    "en-US": "transactions"
  },
  statsSuccessful: {
    "pt-BR": "Importações concluídas",
    "de-DE": "Erfolgreiche Importe",
    "en-US": "Successful imports"
  },
  statsFiles: {
    "pt-BR": "arquivos",
    "de-DE": "Dateien",
    "en-US": "files"
  },
  statsFilesLabel: {
    "pt-BR": "Arquivos",
    "de-DE": "Dateien",
    "en-US": "Files"
  },
  statsProcessed: {
    "pt-BR": "processados",
    "de-DE": "verarbeitet",
    "en-US": "processed"
  },
  nextStep: {
    "pt-BR": "Próximo Passo",
    "de-DE": "Nächster Schritt",
    "en-US": "Next Step"
  },
  nextStepReview: {
    "pt-BR": "Revisar",
    "de-DE": "Überprüfen",
    "en-US": "Review"
  },
  viewQueue: {
    "pt-BR": "Ver fila",
    "de-DE": "Zur Warteschlange",
    "en-US": "View queue"
  },
  previewFormat: {
    "pt-BR": "Formato",
    "de-DE": "Format",
    "en-US": "Format"
  },
  previewDelimiter: {
    "pt-BR": "Delimiter",
    "de-DE": "Trennzeichen",
    "en-US": "Delimiter"
  },
  previewDate: {
    "pt-BR": "Data",
    "de-DE": "Datum",
    "en-US": "Date"
  },
  previewRows: {
    "pt-BR": "Linhas",
    "de-DE": "Zeilen",
    "en-US": "Rows"
  },
  columnsDetected: {
    "pt-BR": "Colunas detectadas",
    "de-DE": "Erkannte Spalten",
    "en-US": "Detected columns"
  },
  tableSource: {
    "pt-BR": "Fonte",
    "de-DE": "Quelle",
    "en-US": "Source"
  },
  tableDate: {
    "pt-BR": "Data",
    "de-DE": "Datum",
    "en-US": "Date"
  },
  tableAmount: {
    "pt-BR": "Valor",
    "de-DE": "Betrag",
    "en-US": "Amount"
  },
  tableCurrency: {
    "pt-BR": "Moeda",
    "de-DE": "Währung",
    "en-US": "Currency"
  },
  tableDescription: {
    "pt-BR": "Descrição",
    "de-DE": "Beschreibung",
    "en-US": "Description"
  },
  tableKeyDesc: {
    "pt-BR": "Key Desc",
    "de-DE": "Key Desc",
    "en-US": "Key Desc"
  },
  tableAccount: {
    "pt-BR": "Conta",
    "de-DE": "Konto",
    "en-US": "Account"
  },
  tableKey: {
    "pt-BR": "Key",
    "de-DE": "Key",
    "en-US": "Key"
  },
  labelEncoding: {
    "pt-BR": "Codificação",
    "de-DE": "Kodierung",
    "en-US": "Encoding"
  },
  labelWarnings: {
    "pt-BR": "Avisos encontrados",
    "de-DE": "Warnungen",
    "en-US": "Warnings"
  },
  labelErrors: {
    "pt-BR": "Erros detectados",
    "de-DE": "Fehler erkannt",
    "en-US": "Errors detected"
  },
  labelMissingColumns: {
    "pt-BR": "Colunas obrigatórias faltando",
    "de-DE": "Pflichtspalten fehlen",
    "en-US": "Missing required columns"
  },
  labelRowErrors: {
    "pt-BR": "Erros por linha (amostra)",
    "de-DE": "Zeilenfehler (Beispiel)",
    "en-US": "Row errors (sample)"
  },
  statusNoUpload: {
    "pt-BR": "Sem upload recente",
    "de-DE": "Kein aktueller Upload",
    "en-US": "No recent upload"
  },
  diagnosticsTitle: {
    "pt-BR": "Diagnóstico da importação",
    "de-DE": "Importdiagnose",
    "en-US": "Import diagnostics"
  },
  diagnosticsFailed: {
    "pt-BR": "Falhou",
    "de-DE": "Fehlgeschlagen",
    "en-US": "Failed"
  },
  diagnosticsOk: {
    "pt-BR": "OK",
    "de-DE": "OK",
    "en-US": "OK"
  },
  labelLines: {
    "pt-BR": "Linhas",
    "de-DE": "Zeilen",
    "en-US": "Lines"
  },
  summaryTitle: {
    "pt-BR": "Resumo da importação",
    "de-DE": "Importzusammenfassung",
    "en-US": "Import summary"
  },
  summaryInserted: {
    "pt-BR": "Inseridas",
    "de-DE": "Eingefügt",
    "en-US": "Inserted"
  },
  summaryDuplicates: {
    "pt-BR": "Duplicadas",
    "de-DE": "Duplikate",
    "en-US": "Duplicates"
  },
  detailsTitle: {
    "pt-BR": "Ver detalhes",
    "de-DE": "Details anzeigen",
    "en-US": "View details"
  },
  detailsMissingColumns: {
    "pt-BR": "Colunas obrigatórias faltando",
    "de-DE": "Pflichtspalten fehlen",
    "en-US": "Missing required columns"
  },
  detailsRowErrors: {
    "pt-BR": "Erros por linha (primeiras 3)",
    "de-DE": "Zeilenfehler (erste 3)",
    "en-US": "Row errors (first 3)"
  },
  detailsPreview: {
    "pt-BR": "Prévia (primeiras 20)",
    "de-DE": "Vorschau (erste 20)",
    "en-US": "Preview (first 20)"
  },
  filterStatus: {
    "pt-BR": "Status",
    "de-DE": "Status",
    "en-US": "Status"
  },
  filterAll: {
    "pt-BR": "Todos",
    "de-DE": "Alle",
    "en-US": "All"
  },
  filterSuccess: {
    "pt-BR": "Sucesso",
    "de-DE": "Erfolg",
    "en-US": "Success"
  },
  filterProcessing: {
    "pt-BR": "Processando",
    "de-DE": "In Bearbeitung",
    "en-US": "Processing"
  },
  filterDuplicate: {
    "pt-BR": "Duplicado",
    "de-DE": "Duplikat",
    "en-US": "Duplicate"
  },
  filterError: {
    "pt-BR": "Erro",
    "de-DE": "Fehler",
    "en-US": "Error"
  },
  conflictTitle: {
    "pt-BR": "Resolução de Conflitos",
    "de-DE": "Konfliktlösung",
    "en-US": "Conflict Resolution"
  },
  conflictDescription: {
    "pt-BR": "Foram detectadas duplicatas. Revise antes de aplicar substituições.",
    "de-DE": "Duplikate erkannt. Bitte vor dem Ersetzen prüfen.",
    "en-US": "Duplicates detected. Review before replacing."
  },
  conflictAction: {
    "pt-BR": "Resolver duplicatas",
    "de-DE": "Duplikate lösen",
    "en-US": "Resolve duplicates"
  },
  conflictKeep: {
    "pt-BR": "Manter existentes",
    "de-DE": "Vorhandene behalten",
    "en-US": "Keep existing"
  },
  conflictReplace: {
    "pt-BR": "Substituir por novas",
    "de-DE": "Durch neue ersetzen",
    "en-US": "Replace with new"
  },
  conflictApply: {
    "pt-BR": "Aplicar resolução",
    "de-DE": "Lösung anwenden",
    "en-US": "Apply resolution"
  },
  conflictCancel: {
    "pt-BR": "Cancelar",
    "de-DE": "Abbrechen",
    "en-US": "Cancel"
  },
  statusProcessed: {
    "pt-BR": "Processado",
    "de-DE": "Verarbeitet",
    "en-US": "Processed"
  },
  statusError: {
    "pt-BR": "Erro",
    "de-DE": "Fehler",
    "en-US": "Error"
  },
  labelRef: {
    "pt-BR": "Ref",
    "de-DE": "Ref",
    "en-US": "Ref"
  },
  viewErrors: {
    "pt-BR": "Ver erros",
    "de-DE": "Fehler anzeigen",
    "en-US": "View errors"
  },
  errorsLoading: {
    "pt-BR": "Carregando erros...",
    "de-DE": "Fehler werden geladen...",
    "en-US": "Loading errors..."
  },
  errorsFound: {
    "pt-BR": "erro(s) encontrados.",
    "de-DE": "Fehler gefunden.",
    "en-US": "errors found."
  },
  errorsNone: {
    "pt-BR": "Nenhum erro disponível.",
    "de-DE": "Keine Fehler verfügbar.",
    "en-US": "No errors available."
  },
  diagnosticsLoading: {
    "pt-BR": "Carregando diagnóstico...",
    "de-DE": "Diagnose wird geladen...",
    "en-US": "Loading diagnostics..."
  },
  diagnosticsNone: {
    "pt-BR": "Nenhum diagnóstico disponível.",
    "de-DE": "Keine Diagnose verfügbar.",
    "en-US": "No diagnostics available."
  },
  rowLabel: {
    "pt-BR": "Linha",
    "de-DE": "Zeile",
    "en-US": "Row"
  },
  labelFailure: {
    "pt-BR": "Falha",
    "de-DE": "Fehler",
    "en-US": "Failure"
  },
  labelSuccess: {
    "pt-BR": "Sucesso",
    "de-DE": "Erfolg",
    "en-US": "Success"
  },
  importHistory: {
    "pt-BR": "Histórico de Importações",
    "de-DE": "Importverlauf",
    "en-US": "Import History"
  },
  emptyHistoryTitle: {
    "pt-BR": "Nenhum arquivo importado",
    "de-DE": "Keine Dateien importiert",
    "en-US": "No files imported"
  },
  emptyHistoryDescription: {
    "pt-BR": "Arraste um arquivo CSV acima para começar a organizar suas finanças.",
    "de-DE": "Ziehen Sie oben eine CSV-Datei, um zu starten.",
    "en-US": "Drop a CSV file above to start organizing your finances."
  }
};

export const dashboardCopy = {
  title: {
    "pt-BR": "Seu Mês em Foco",
    "de-DE": "Ihr Monat im Fokus",
    "en-US": "Your Month in Focus"
  },
  subtitle: {
    "pt-BR": "Uma visão clara do seu orçamento. Sempre atualizada.",
    "de-DE": "Ein klarer Blick auf Ihr Budget. Immer aktuell.",
    "en-US": "A clear view of your budget. Always up to date."
  },
  accountFilterPlaceholder: {
    "pt-BR": "Todas as contas",
    "de-DE": "Alle Konten",
    "en-US": "All accounts"
  },
  lastUpdateTitle: {
    "pt-BR": "Última Atualização",
    "de-DE": "Letzte Aktualisierung",
    "en-US": "Last update"
  },
  viewAllUploads: {
    "pt-BR": "Ver todos uploads",
    "de-DE": "Alle Uploads ansehen",
    "en-US": "View all uploads"
  },
  noUpload: {
    "pt-BR": "Sem upload",
    "de-DE": "Kein Upload",
    "en-US": "No upload"
  },
  importedThrough: {
    "pt-BR": "Até {date}",
    "de-DE": "Bis {date}",
    "en-US": "Through {date}"
  },
  monthlyProjection: {
    "pt-BR": "Projeção do Mês",
    "de-DE": "Monatsprognose",
    "en-US": "Monthly projection"
  },
  remainingMonth: {
    "pt-BR": "Restante do Mês",
    "de-DE": "Rest des Monats",
    "en-US": "Remaining this month"
  },
  alreadyCommitted: {
    "pt-BR": "Já Comprometido",
    "de-DE": "Bereits gebunden",
    "en-US": "Already committed"
  },
  remainingCommitments: {
    "pt-BR": "Compromissos Restantes",
    "de-DE": "Verbleibende Verpflichtungen",
    "en-US": "Remaining commitments"
  },
  viewAll: {
    "pt-BR": "Ver todos",
    "de-DE": "Alle anzeigen",
    "en-US": "View all"
  },
  eventsThisMonth: {
    "pt-BR": "{count} evento(s) este mês",
    "de-DE": "{count} Ereignisse in diesem Monat",
    "en-US": "{count} event(s) this month"
  },
  noCommitments: {
    "pt-BR": "Nenhum compromisso cadastrado.",
    "de-DE": "Keine Verpflichtungen erfasst.",
    "en-US": "No commitments recorded."
  },
  addAction: {
    "pt-BR": "Adicionar",
    "de-DE": "Hinzufügen",
    "en-US": "Add"
  },
  weeklyInsight: {
    "pt-BR": "Insight Semanal",
    "de-DE": "Wöchentlicher Einblick",
    "en-US": "Weekly insight"
  },
  viewDetails: {
    "pt-BR": "Ver detalhes",
    "de-DE": "Details ansehen",
    "en-US": "View details"
  },
  spendByCategory: {
    "pt-BR": "Gastos por Categoria",
    "de-DE": "Ausgaben nach Kategorie",
    "en-US": "Spend by Category"
  },
  totalSpent: {
    "pt-BR": "Total Gasto",
    "de-DE": "Gesamtausgaben",
    "en-US": "Total spent"
  },
  recentActivity: {
    "pt-BR": "Atividade Recente",
    "de-DE": "Letzte Aktivität",
    "en-US": "Recent activity"
  },
  moreOptions: {
    "pt-BR": "Mais opções",
    "de-DE": "Weitere Optionen",
    "en-US": "More options"
  },
  viewAllTransactions: {
    "pt-BR": "Ver todas as transações",
    "de-DE": "Alle Transaktionen ansehen",
    "en-US": "View all transactions"
  },
  showAllAccounts: {
    "pt-BR": "Mostrar todas as contas",
    "de-DE": "Alle Konten anzeigen",
    "en-US": "Show all accounts"
  },
  manageUploads: {
    "pt-BR": "Gerenciar uploads",
    "de-DE": "Uploads verwalten",
    "en-US": "Manage uploads"
  },
  noTransactions: {
    "pt-BR": "Nenhuma transação neste mês",
    "de-DE": "Keine Transaktionen in diesem Monat",
    "en-US": "No transactions this month"
  },
  smartCategorizationTitle: {
    "pt-BR": "Categorização Inteligente",
    "de-DE": "Intelligente Kategorisierung",
    "en-US": "Smart categorization"
  },
  smartCategorizationBody: {
    "pt-BR": "{count} transação(ões) aguardando sua confirmação. A IA já pré-analisou cada uma.",
    "de-DE": "{count} Transaktion(en) warten auf Ihre Bestätigung. Die KI hat jede bereits voranalysiert.",
    "en-US": "{count} transaction(s) awaiting your confirmation. AI has pre-analyzed each one."
  },
  reviewNow: {
    "pt-BR": "Revisar agora",
    "de-DE": "Jetzt prüfen",
    "en-US": "Review now"
  },
  insightSaveTitle: {
    "pt-BR": "Economia em {category}",
    "de-DE": "Ersparnis bei {category}",
    "en-US": "Savings in {category}"
  },
  insightSaveDescription: {
    "pt-BR": "Você economizou {percent}% em {category} comparado ao mês anterior.",
    "de-DE": "Sie haben {percent}% bei {category} im Vergleich zum Vormonat gespart.",
    "en-US": "You saved {percent}% on {category} compared to last month."
  },
  insightWarnTitle: {
    "pt-BR": "Atenção com {category}",
    "de-DE": "Achtung bei {category}",
    "en-US": "Watch {category}"
  },
  insightWarnDescription: {
    "pt-BR": "Seus gastos em {category} aumentaram {percent}% este mês.",
    "de-DE": "Ihre Ausgaben für {category} stiegen diesen Monat um {percent}%.",
    "en-US": "Your spending on {category} increased {percent}% this month."
  },
  projectionWarningTitle: {
    "pt-BR": "Projeção acima do orçamento",
    "de-DE": "Prognose über dem Budget",
    "en-US": "Projection above budget"
  },
  projectionWarningDescription: {
    "pt-BR": "Com base no ritmo atual, você pode gastar {amount} a mais que o planejado.",
    "de-DE": "Basierend auf dem aktuellen Tempo könnten Sie {amount} mehr als geplant ausgeben.",
    "en-US": "At the current pace, you may spend {amount} more than planned."
  },
  defaultInsightTitle: {
    "pt-BR": "Seus gastos estão estáveis",
    "de-DE": "Ihre Ausgaben sind stabil",
    "en-US": "Your spending is steady"
  },
  defaultInsightDescription: {
    "pt-BR": "Continue acompanhando suas despesas para manter o controle financeiro.",
    "de-DE": "Behalten Sie Ihre Ausgaben im Blick, um die Kontrolle zu behalten.",
    "en-US": "Keep tracking your expenses to stay in control."
  }
};

export const transactionsCopy = {
  title: {
    "pt-BR": "Transações",
    "de-DE": "Transaktionen",
    "en-US": "Transactions"
  },
  subtitle: {
    "pt-BR": "Visualize e edite todas as suas transações",
    "de-DE": "Alle Transaktionen anzeigen und bearbeiten",
    "en-US": "View and edit all your transactions"
  },
  exportCsv: {
    "pt-BR": "Exportar CSV",
    "de-DE": "CSV exportieren",
    "en-US": "Export CSV"
  },
  toastUpdated: {
    "pt-BR": "Transação atualizada",
    "de-DE": "Transaktion aktualisiert",
    "en-US": "Transaction updated"
  },
  toastUpdateError: {
    "pt-BR": "Erro ao atualizar transação",
    "de-DE": "Fehler beim Aktualisieren der Transaktion",
    "en-US": "Failed to update transaction"
  },
  exportSuccess: {
    "pt-BR": "CSV exportado com sucesso",
    "de-DE": "CSV erfolgreich exportiert",
    "en-US": "CSV exported successfully"
  },
  statsTotal: {
    "pt-BR": "Total de Transações",
    "de-DE": "Transaktionen gesamt",
    "en-US": "Total transactions"
  },
  statsIncome: {
    "pt-BR": "Receitas",
    "de-DE": "Einnahmen",
    "en-US": "Income"
  },
  statsExpense: {
    "pt-BR": "Despesas",
    "de-DE": "Ausgaben",
    "en-US": "Expenses"
  },
  statsBalance: {
    "pt-BR": "Saldo",
    "de-DE": "Saldo",
    "en-US": "Balance"
  },
  searchPlaceholder: {
    "pt-BR": "Buscar por descrição...",
    "de-DE": "Nach Beschreibung suchen...",
    "en-US": "Search by description..."
  },
  filters: {
    "pt-BR": "Filtros",
    "de-DE": "Filter",
    "en-US": "Filters"
  },
  clearFilters: {
    "pt-BR": "Limpar",
    "de-DE": "Zurücksetzen",
    "en-US": "Clear"
  },
  filterAccountLabel: {
    "pt-BR": "Conta",
    "de-DE": "Konto",
    "en-US": "Account"
  },
  filterAccountAll: {
    "pt-BR": "Todas as contas",
    "de-DE": "Alle Konten",
    "en-US": "All accounts"
  },
  filterCategoryLabel: {
    "pt-BR": "Categoria",
    "de-DE": "Kategorie",
    "en-US": "Category"
  },
  filterCategoryAll: {
    "pt-BR": "Todas as categorias",
    "de-DE": "Alle Kategorien",
    "en-US": "All categories"
  },
  filterTypeLabel: {
    "pt-BR": "Tipo",
    "de-DE": "Typ",
    "en-US": "Type"
  },
  filterTypeAll: {
    "pt-BR": "Todos os tipos",
    "de-DE": "Alle Typen",
    "en-US": "All types"
  },
  typeExpense: {
    "pt-BR": "Despesa",
    "de-DE": "Ausgabe",
    "en-US": "Expense"
  },
  typeExpensePlural: {
    "pt-BR": "Despesas",
    "de-DE": "Ausgaben",
    "en-US": "Expenses"
  },
  typeIncome: {
    "pt-BR": "Receita",
    "de-DE": "Einnahme",
    "en-US": "Income"
  },
  typeIncomePlural: {
    "pt-BR": "Receitas",
    "de-DE": "Einnahmen",
    "en-US": "Income"
  },
  emptyWithFilters: {
    "pt-BR": "Nenhuma transação encontrada com os filtros aplicados",
    "de-DE": "Keine Transaktionen mit diesen Filtern gefunden",
    "en-US": "No transactions found with current filters"
  },
  emptyPeriod: {
    "pt-BR": "Nenhuma transação neste período",
    "de-DE": "Keine Transaktionen in diesem Zeitraum",
    "en-US": "No transactions in this period"
  },
  tableDate: {
    "pt-BR": "Data",
    "de-DE": "Datum",
    "en-US": "Date"
  },
  tableAccount: {
    "pt-BR": "Conta",
    "de-DE": "Konto",
    "en-US": "Account"
  },
  tableDescription: {
    "pt-BR": "Descrição",
    "de-DE": "Beschreibung",
    "en-US": "Description"
  },
  tableSignals: {
    "pt-BR": "Sinais",
    "de-DE": "Signale",
    "en-US": "Signals"
  },
  tableAmount: {
    "pt-BR": "Valor",
    "de-DE": "Betrag",
    "en-US": "Amount"
  },
  tableCategory: {
    "pt-BR": "Categoria",
    "de-DE": "Kategorie",
    "en-US": "Category"
  },
  tableStatus: {
    "pt-BR": "Status",
    "de-DE": "Status",
    "en-US": "Status"
  },
  tableActions: {
    "pt-BR": "Ações",
    "de-DE": "Aktionen",
    "en-US": "Actions"
  },
  viewDetails: {
    "pt-BR": "Ver detalhes",
    "de-DE": "Details ansehen",
    "en-US": "View details"
  },
  editAction: {
    "pt-BR": "Editar",
    "de-DE": "Bearbeiten",
    "en-US": "Edit"
  },
  editTitle: {
    "pt-BR": "Editar Transação",
    "de-DE": "Transaktion bearbeiten",
    "en-US": "Edit transaction"
  },
  typeLabel: {
    "pt-BR": "Tipo",
    "de-DE": "Typ",
    "en-US": "Type"
  },
  typeExpense: {
    "pt-BR": "Despesa",
    "de-DE": "Ausgabe",
    "en-US": "Expense"
  },
  typeIncome: {
    "pt-BR": "Receita",
    "de-DE": "Einnahme",
    "en-US": "Income"
  },
  fixVarLabel: {
    "pt-BR": "Fixo/Variável",
    "de-DE": "Fix/Variabel",
    "en-US": "Fixed/Variable"
  },
  fixedOption: {
    "pt-BR": "Fixo",
    "de-DE": "Fix",
    "en-US": "Fixed"
  },
  variableOption: {
    "pt-BR": "Variável",
    "de-DE": "Variabel",
    "en-US": "Variable"
  },
  categoryMainLabel: {
    "pt-BR": "Categoria Principal",
    "de-DE": "Hauptkategorie",
    "en-US": "Primary category"
  },
  subcategoryLabel: {
    "pt-BR": "Subcategoria (opcional)",
    "de-DE": "Unterkategorie (optional)",
    "en-US": "Subcategory (optional)"
  },
  subcategoryPlaceholder: {
    "pt-BR": "Ex: Supermercado, Gasolina...",
    "de-DE": "z. B. Supermarkt, Benzin...",
    "en-US": "e.g., Supermarket, Fuel..."
  },
  detailLabel: {
    "pt-BR": "Detalhamento (opcional)",
    "de-DE": "Detail (optional)",
    "en-US": "Detail (optional)"
  },
  detailPlaceholder: {
    "pt-BR": "Ex: Pão de Açúcar, Shell...",
    "de-DE": "z. B. Shell, Aldi...",
    "en-US": "e.g., Shell, Aldi..."
  },
  excludeBudget: {
    "pt-BR": "Excluir do orçamento",
    "de-DE": "Vom Budget ausschließen",
    "en-US": "Exclude from budget"
  },
  internalTransfer: {
    "pt-BR": "Transferência interna",
    "de-DE": "Interne Überweisung",
    "en-US": "Internal transfer"
  },
  cancel: {
    "pt-BR": "Cancelar",
    "de-DE": "Abbrechen",
    "en-US": "Cancel"
  },
  save: {
    "pt-BR": "Salvar",
    "de-DE": "Speichern",
    "en-US": "Save"
  },
  saving: {
    "pt-BR": "Salvando...",
    "de-DE": "Speichern...",
    "en-US": "Saving..."
  },
  excludeBadge: {
    "pt-BR": "Exc",
    "de-DE": "Exkl.",
    "en-US": "Excl."
  },
  csvHeaderDate: {
    "pt-BR": "Data",
    "de-DE": "Datum",
    "en-US": "Date"
  },
  csvHeaderAccount: {
    "pt-BR": "Conta",
    "de-DE": "Konto",
    "en-US": "Account"
  },
  csvHeaderDescription: {
    "pt-BR": "Descrição",
    "de-DE": "Beschreibung",
    "en-US": "Description"
  },
  csvHeaderAmount: {
    "pt-BR": "Valor",
    "de-DE": "Betrag",
    "en-US": "Amount"
  },
  csvHeaderCategory: {
    "pt-BR": "Categoria",
    "de-DE": "Kategorie",
    "en-US": "Category"
  },
  csvHeaderType: {
    "pt-BR": "Tipo",
    "de-DE": "Typ",
    "en-US": "Type"
  },
  csvHeaderFixVar: {
    "pt-BR": "Fix/Var",
    "de-DE": "Fix/Var",
    "en-US": "Fixed/Var"
  },
  csvFilename: {
    "pt-BR": "transacoes_{month}.csv",
    "de-DE": "transaktionen_{month}.csv",
    "en-US": "transactions_{month}.csv"
  }
};

export const transactionDetailCopy = {
  title: {
    "pt-BR": "Detalhes da Transação",
    "de-DE": "Transaktionsdetails",
    "en-US": "Transaction details"
  },
  manualOverride: {
    "pt-BR": "Ajuste manual",
    "de-DE": "Manuelle Anpassung",
    "en-US": "Manual override"
  },
  internalTransfer: {
    "pt-BR": "Transferência Interna",
    "de-DE": "Interne Überweisung",
    "en-US": "Internal transfer"
  },
  excludedBudget: {
    "pt-BR": "Excluído do Orçamento",
    "de-DE": "Vom Budget ausgeschlossen",
    "en-US": "Excluded from budget"
  },
  amountLabel: {
    "pt-BR": "Valor",
    "de-DE": "Betrag",
    "en-US": "Amount"
  },
  dateLabel: {
    "pt-BR": "Data",
    "de-DE": "Datum",
    "en-US": "Date"
  },
  accountLabel: {
    "pt-BR": "Conta",
    "de-DE": "Konto",
    "en-US": "Account"
  },
  typeLabel: {
    "pt-BR": "Tipo",
    "de-DE": "Typ",
    "en-US": "Type"
  },
  paymentTypeLabel: {
    "pt-BR": "Forma de Pagamento",
    "de-DE": "Zahlungsart",
    "en-US": "Payment type"
  },
  categoryLabel: {
    "pt-BR": "Categorização",
    "de-DE": "Kategorisierung",
    "en-US": "Categorization"
  },
  autoCategorized: {
    "pt-BR": "Categorizado automaticamente por regra",
    "de-DE": "Automatisch durch Regel kategorisiert",
    "en-US": "Auto-categorized by rule"
  },
  confidenceLabel: {
    "pt-BR": "{percent}% confiança",
    "de-DE": "{percent}% Zuversicht",
    "en-US": "{percent}% confidence"
  },
  editAction: {
    "pt-BR": "Editar",
    "de-DE": "Bearbeiten",
    "en-US": "Edit"
  },
  duplicateAction: {
    "pt-BR": "Duplicar",
    "de-DE": "Duplizieren",
    "en-US": "Duplicate"
  },
  deleteAction: {
    "pt-BR": "Excluir",
    "de-DE": "Löschen",
    "en-US": "Delete"
  }
};

export const notificationsCopy = {
  title: {
    "pt-BR": "Notificações",
    "de-DE": "Benachrichtigungen",
    "en-US": "Notifications"
  },
  subtitle: {
    "pt-BR": "Central de mensagens e alertas do sistema",
    "de-DE": "Zentrale für Systemmeldungen und -warnungen",
    "en-US": "System messages and alerts center"
  },
  newSingle: {
    "pt-BR": "nova",
    "de-DE": "neu",
    "en-US": "new"
  },
  newPlural: {
    "pt-BR": "novas",
    "de-DE": "neu",
    "en-US": "new"
  },
  markAllRead: {
    "pt-BR": "Marcar todas como lidas",
    "de-DE": "Alle als gelesen markieren",
    "en-US": "Mark all as read"
  },
  statsTotal: {
    "pt-BR": "Total",
    "de-DE": "Gesamt",
    "en-US": "Total"
  },
  statsNotifications: {
    "pt-BR": "notificações",
    "de-DE": "Benachrichtigungen",
    "en-US": "notifications"
  },
  statsUnread: {
    "pt-BR": "Não lidas",
    "de-DE": "Ungelesen",
    "en-US": "Unread"
  },
  statsPending: {
    "pt-BR": "pendentes",
    "de-DE": "ausstehend",
    "en-US": "pending"
  },
  statsImportant: {
    "pt-BR": "Importantes",
    "de-DE": "Wichtig",
    "en-US": "Important"
  },
  statsAlerts: {
    "pt-BR": "alertas",
    "de-DE": "Warnungen",
    "en-US": "alerts"
  },
  tabAll: {
    "pt-BR": "Todas",
    "de-DE": "Alle",
    "en-US": "All"
  },
  tabUnread: {
    "pt-BR": "Não lidas",
    "de-DE": "Ungelesen",
    "en-US": "Unread"
  },
  tabImportant: {
    "pt-BR": "Importantes",
    "de-DE": "Wichtig",
    "en-US": "Important"
  },
  emptyTitle: {
    "pt-BR": "Nenhuma notificação",
    "de-DE": "Keine Benachrichtigungen",
    "en-US": "No notifications"
  },
  emptyUnread: {
    "pt-BR": "Você está em dia! Não há notificações não lidas.",
    "de-DE": "Alles erledigt! Keine ungelesenen Benachrichtigungen.",
    "en-US": "You're all caught up! No unread notifications."
  },
  emptyAll: {
    "pt-BR": "Não há notificações para exibir neste momento.",
    "de-DE": "Derzeit gibt es keine Benachrichtigungen.",
    "en-US": "There are no notifications to show right now."
  },
  viewDetails: {
    "pt-BR": "Ver detalhes",
    "de-DE": "Details ansehen",
    "en-US": "View details"
  },
  devTitle: {
    "pt-BR": "Página em desenvolvimento",
    "de-DE": "Seite in Entwicklung",
    "en-US": "Page in development"
  },
  devBody: {
    "pt-BR": "Esta é uma interface de demonstração. A integração com o backend para notificações reais está pendente e será implementada na próxima fase.",
    "de-DE": "Dies ist eine Demo-Oberfläche. Die Backend-Integration für echte Benachrichtigungen ist noch ausstehend und wird in der nächsten Phase umgesetzt.",
    "en-US": "This is a demo interface. Backend integration for real notifications is pending and will be implemented in the next phase."
  },
  mockUploadTitle: {
    "pt-BR": "Upload concluído",
    "de-DE": "Upload abgeschlossen",
    "en-US": "Upload complete"
  },
  mockUploadMessage: {
    "pt-BR": "{count} transações importadas de {source}",
    "de-DE": "{count} Transaktionen aus {source} importiert",
    "en-US": "{count} transactions imported from {source}"
  },
  mockBudgetTitle: {
    "pt-BR": "Orçamento excedido",
    "de-DE": "Budget überschritten",
    "en-US": "Budget exceeded"
  },
  mockBudgetMessage: {
    "pt-BR": "Você gastou {spent}/{budget} em {category} este mês",
    "de-DE": "Sie haben diesen Monat {spent}/{budget} für {category} ausgegeben",
    "en-US": "You spent {spent}/{budget} on {category} this month"
  },
  mockWeeklyTitle: {
    "pt-BR": "Ritual semanal disponível",
    "de-DE": "Wöchentliches Ritual verfügbar",
    "en-US": "Weekly ritual available"
  },
  mockWeeklyMessage: {
    "pt-BR": "Está na hora de revisar suas finanças da semana",
    "de-DE": "Zeit, Ihre Finanzen der Woche zu prüfen",
    "en-US": "Time to review your finances for the week"
  },
  mockConfirmTitle: {
    "pt-BR": "Novas transações para confirmar",
    "de-DE": "Neue Transaktionen zur Bestätigung",
    "en-US": "New transactions to confirm"
  },
  mockConfirmMessage: {
    "pt-BR": "{count} transações aguardam revisão na fila de confirmação",
    "de-DE": "{count} Transaktionen warten in der Bestätigungswarteschlange",
    "en-US": "{count} transactions await review in the confirmation queue"
  },
  mockGoalTitle: {
    "pt-BR": "Meta atingida",
    "de-DE": "Ziel erreicht",
    "en-US": "Goal reached"
  },
  mockGoalMessage: {
    "pt-BR": "Parabéns! Você economizou {amount} este mês",
    "de-DE": "Glückwunsch! Sie haben diesen Monat {amount} gespart",
    "en-US": "Congrats! You saved {amount} this month"
  },
  mockCardTitle: {
    "pt-BR": "Fatura do cartão próxima",
    "de-DE": "Kartenabrechnung bald fällig",
    "en-US": "Card bill due soon"
  },
  mockCardMessage: {
    "pt-BR": "{card} vence em {days} dias ({amount})",
    "de-DE": "{card} fällig in {days} Tagen ({amount})",
    "en-US": "{card} due in {days} days ({amount})"
  },
  mockAiTitle: {
    "pt-BR": "Análise de IA disponível",
    "de-DE": "KI-Analyse verfügbar",
    "en-US": "AI analysis available"
  },
  mockAiMessage: {
    "pt-BR": "Identificamos {count} novas palavras-chave para categorização",
    "de-DE": "Wir haben {count} neue Schlüsselwörter für die Kategorisierung gefunden",
    "en-US": "We found {count} new keywords for categorization"
  }
};

export const ritualsCopy = {
  title: {
    "pt-BR": "Rituais Financeiros",
    "de-DE": "Finanzrituale",
    "en-US": "Financial rituals"
  },
  subtitle: {
    "pt-BR": "Revisões guiadas para manter suas finanças sob controle",
    "de-DE": "Geführte Reviews, um Ihre Finanzen im Griff zu behalten",
    "en-US": "Guided reviews to keep your finances on track"
  },
  tabWeekly: {
    "pt-BR": "Semanal",
    "de-DE": "Wöchentlich",
    "en-US": "Weekly"
  },
  tabMonthly: {
    "pt-BR": "Mensal",
    "de-DE": "Monatlich",
    "en-US": "Monthly"
  },
  weeklyDone: {
    "pt-BR": "Revisão Semanal Concluída",
    "de-DE": "Wöchentliche Review abgeschlossen",
    "en-US": "Weekly review completed"
  },
  weeklyTitle: {
    "pt-BR": "Revisão Semanal",
    "de-DE": "Wöchentliche Review",
    "en-US": "Weekly review"
  },
  weekRange: {
    "pt-BR": "Semana de {start} a {end}",
    "de-DE": "Woche von {start} bis {end}",
    "en-US": "Week of {start} to {end}"
  },
  startReview: {
    "pt-BR": "Iniciar Revisão",
    "de-DE": "Review starten",
    "en-US": "Start review"
  },
  weeklySpend: {
    "pt-BR": "Gasto esta Semana",
    "de-DE": "Ausgaben diese Woche",
    "en-US": "Spend this week"
  },
  dailyAverage: {
    "pt-BR": "Média diária: {amount}",
    "de-DE": "Tagesdurchschnitt: {amount}",
    "en-US": "Daily average: {amount}"
  },
  weeklyTransactions: {
    "pt-BR": "Transações",
    "de-DE": "Transaktionen",
    "en-US": "Transactions"
  },
  weeklyAutoCategorized: {
    "pt-BR": "{count} categorizadas automaticamente",
    "de-DE": "{count} automatisch kategorisiert",
    "en-US": "{count} auto-categorized"
  },
  weeklyGoal: {
    "pt-BR": "Objetivo",
    "de-DE": "Ziel",
    "en-US": "Goal"
  },
  weeklyBudget: {
    "pt-BR": "do orçamento semanal",
    "de-DE": "des Wochenbudgets",
    "en-US": "of weekly budget"
  },
  reflectionsTitle: {
    "pt-BR": "Reflexões da Semana",
    "de-DE": "Wochenreflexionen",
    "en-US": "Weekly reflections"
  },
  reflectionPrompt: {
    "pt-BR": "O que funcionou bem esta semana?",
    "de-DE": "Was lief diese Woche gut?",
    "en-US": "What went well this week?"
  },
  reflectionPlaceholder: {
    "pt-BR": "Ex: Consegui evitar compras por impulso...",
    "de-DE": "z. B. Ich habe Impulskäufe vermieden...",
    "en-US": "e.g., I avoided impulse purchases..."
  },
  completedAt: {
    "pt-BR": "Concluído em {date}",
    "de-DE": "Abgeschlossen am {date}",
    "en-US": "Completed on {date}"
  },
  saving: {
    "pt-BR": "Salvando...",
    "de-DE": "Speichern...",
    "en-US": "Saving..."
  },
  completeReview: {
    "pt-BR": "Concluir Revisão",
    "de-DE": "Review abschließen",
    "en-US": "Complete review"
  },
  stepLabel: {
    "pt-BR": "Passo {step} de {total}: {label}",
    "de-DE": "Schritt {step} von {total}: {label}",
    "en-US": "Step {step} of {total}: {label}"
  },
  stepReview: {
    "pt-BR": "Revisão",
    "de-DE": "Review",
    "en-US": "Review"
  },
  stepAnalysis: {
    "pt-BR": "Análise",
    "de-DE": "Analyse",
    "en-US": "Analysis"
  },
  stepPlanning: {
    "pt-BR": "Planejamento",
    "de-DE": "Planung",
    "en-US": "Planning"
  },
  stepConfirm: {
    "pt-BR": "Confirmação",
    "de-DE": "Bestätigung",
    "en-US": "Confirmation"
  },
  percentComplete: {
    "pt-BR": "{percent}% Concluído",
    "de-DE": "{percent}% abgeschlossen",
    "en-US": "{percent}% complete"
  },
  keepRhythmTitle: {
    "pt-BR": "Quer manter o ritmo?",
    "de-DE": "Den Rhythmus beibehalten?",
    "en-US": "Keep the momentum?"
  },
  keepRhythmBody: {
    "pt-BR": "Copie as metas de {month} e ajuste apenas o necessário.",
    "de-DE": "Kopieren Sie die Ziele von {month} und passen Sie nur das Nötige an.",
    "en-US": "Copy goals from {month} and adjust only what you need."
  },
  copyGoals: {
    "pt-BR": "Copiar Metas de {month}",
    "de-DE": "Ziele von {month} kopieren",
    "en-US": "Copy goals from {month}"
  },
  filterAll: {
    "pt-BR": "Todas",
    "de-DE": "Alle",
    "en-US": "All"
  },
  filterEssentials: {
    "pt-BR": "Essenciais",
    "de-DE": "Essenziell",
    "en-US": "Essentials"
  },
  filterLifestyle: {
    "pt-BR": "Estilo de Vida",
    "de-DE": "Lebensstil",
    "en-US": "Lifestyle"
  },
  filterInvestments: {
    "pt-BR": "Investimentos",
    "de-DE": "Investitionen",
    "en-US": "Investments"
  },
  actualLabel: {
    "pt-BR": "{month} (Realizado)",
    "de-DE": "{month} (Ist)",
    "en-US": "{month} (Actual)"
  },
  plannedLabel: {
    "pt-BR": "{month} (Planejado)",
    "de-DE": "{month} (Geplant)",
    "en-US": "{month} (Planned)"
  },
  plannedForCategory: {
    "pt-BR": "Meta para {category}",
    "de-DE": "Ziel für {category}",
    "en-US": "Goal for {category}"
  },
  suggestionIncrease: {
    "pt-BR": "Sugestão: Aumentar?",
    "de-DE": "Vorschlag: Erhöhen?",
    "en-US": "Suggestion: Increase?"
  },
  plannedTotal: {
    "pt-BR": "Total Planejado para {month}",
    "de-DE": "Geplantes Gesamt für {month}",
    "en-US": "Planned total for {month}"
  },
  changeVs: {
    "pt-BR": "{value}% vs {month}",
    "de-DE": "{value}% vs {month}",
    "en-US": "{value}% vs {month}"
  },
  back: {
    "pt-BR": "Voltar",
    "de-DE": "Zurück",
    "en-US": "Back"
  },
  next: {
    "pt-BR": "Próximo",
    "de-DE": "Weiter",
    "en-US": "Next"
  },
  confirm: {
    "pt-BR": "Confirmar",
    "de-DE": "Bestätigen",
    "en-US": "Confirm"
  },
  toastWeeklyStarted: {
    "pt-BR": "Revisão Semanal iniciada",
    "de-DE": "Wöchentliche Review gestartet",
    "en-US": "Weekly review started"
  },
  toastMonthlyStarted: {
    "pt-BR": "Revisão Mensal iniciada",
    "de-DE": "Monatliche Review gestartet",
    "en-US": "Monthly review started"
  },
  toastCompletedTitle: {
    "pt-BR": "Ritual concluído!",
    "de-DE": "Ritual abgeschlossen!",
    "en-US": "Ritual completed!"
  },
  toastCompletedBody: {
    "pt-BR": "Suas reflexões foram salvas.",
    "de-DE": "Ihre Reflexionen wurden gespeichert.",
    "en-US": "Your reflections were saved."
  },
  toastCopyGoals: {
    "pt-BR": "Metas de {prev} copiadas para {next}",
    "de-DE": "Ziele von {prev} nach {next} kopiert",
    "en-US": "Goals copied from {prev} to {next}"
  },
  statusExceeded: {
    "pt-BR": "Ultrapassou {amount}",
    "de-DE": "Überschritten um {amount}",
    "en-US": "Exceeded by {amount}"
  },
  statusWithin: {
    "pt-BR": "Dentro da meta!",
    "de-DE": "Im Zielbereich!",
    "en-US": "Within target!"
  },
  statusWarning: {
    "pt-BR": "Atenção",
    "de-DE": "Achtung",
    "en-US": "Warning"
  }
};

export const calendarCopy = {
  title: {
    "pt-BR": "Calendário",
    "de-DE": "Kalender",
    "en-US": "Calendar"
  },
  subtitle: {
    "pt-BR": "Visualize suas transações por dia ou semana",
    "de-DE": "Transaktionen nach Tag oder Woche anzeigen",
    "en-US": "View your transactions by day or week"
  },
  viewMonth: {
    "pt-BR": "Mês",
    "de-DE": "Monat",
    "en-US": "Month"
  },
  viewWeek: {
    "pt-BR": "4 Semanas",
    "de-DE": "4 Wochen",
    "en-US": "4 weeks"
  },
  loading: {
    "pt-BR": "Carregando...",
    "de-DE": "Laden...",
    "en-US": "Loading..."
  }
};

export const calendarMonthCopy = {
  weekDays: {
    "pt-BR": ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
    "de-DE": ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
    "en-US": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  projected: {
    "pt-BR": "Proj",
    "de-DE": "Proj",
    "en-US": "Proj"
  }
};

export const calendarWeekCopy = {
  weekLabel: {
    "pt-BR": "Semana {index}",
    "de-DE": "Woche {index}",
    "en-US": "Week {index}"
  },
  projected: {
    "pt-BR": "Projetado",
    "de-DE": "Prognostiziert",
    "en-US": "Projected"
  },
  income: {
    "pt-BR": "Receitas",
    "de-DE": "Einnahmen",
    "en-US": "Income"
  },
  expense: {
    "pt-BR": "Despesas",
    "de-DE": "Ausgaben",
    "en-US": "Expenses"
  },
  balance: {
    "pt-BR": "Saldo",
    "de-DE": "Saldo",
    "en-US": "Balance"
  },
  capacityNote: {
    "pt-BR": "Capacidade de gasto disponível",
    "de-DE": "Verfügbare Ausgabenkapazität",
    "en-US": "Available spending capacity"
  }
};

export const calendarDetailCopy = {
  emptyPrompt: {
    "pt-BR": "Selecione um dia ou semana para ver detalhes",
    "de-DE": "Wählen Sie einen Tag oder eine Woche, um Details zu sehen",
    "en-US": "Select a day or week to see details"
  },
  titleDay: {
    "pt-BR": "Detalhes do Dia",
    "de-DE": "Tagesdetails",
    "en-US": "Day details"
  },
  titleWeek: {
    "pt-BR": "Resumo da Semana",
    "de-DE": "Wochenübersicht",
    "en-US": "Week summary"
  },
  income: {
    "pt-BR": "Receitas",
    "de-DE": "Einnahmen",
    "en-US": "Income"
  },
  expense: {
    "pt-BR": "Despesas",
    "de-DE": "Ausgaben",
    "en-US": "Expenses"
  },
  emptyList: {
    "pt-BR": "Nenhuma transação neste período",
    "de-DE": "Keine Transaktionen in diesem Zeitraum",
    "en-US": "No transactions in this period"
  }
};

export const eventDetailCopy = {
  breadcrumbCalendar: {
    "pt-BR": "Calendário",
    "de-DE": "Kalender",
    "en-US": "Calendar"
  },
  breadcrumbEvents: {
    "pt-BR": "Eventos",
    "de-DE": "Ereignisse",
    "en-US": "Events"
  },
  title: {
    "pt-BR": "Detalhes do Evento",
    "de-DE": "Ereignisdetails",
    "en-US": "Event details"
  },
  back: {
    "pt-BR": "Voltar",
    "de-DE": "Zurück",
    "en-US": "Back"
  },
  active: {
    "pt-BR": "Ativo",
    "de-DE": "Aktiv",
    "en-US": "Active"
  },
  inactive: {
    "pt-BR": "Inativo",
    "de-DE": "Inaktiv",
    "en-US": "Inactive"
  },
  nextDue: {
    "pt-BR": "Próximo vencimento: {date}",
    "de-DE": "Nächste Fälligkeit: {date}",
    "en-US": "Next due: {date}"
  },
  recurrencePer: {
    "pt-BR": "/ {label}",
    "de-DE": "/ {label}",
    "en-US": "/ {label}"
  },
  editEvent: {
    "pt-BR": "Editar Evento",
    "de-DE": "Ereignis bearbeiten",
    "en-US": "Edit event"
  },
  delete: {
    "pt-BR": "Excluir",
    "de-DE": "Löschen",
    "en-US": "Delete"
  },
  deleteTitle: {
    "pt-BR": "Confirmar Exclusão",
    "de-DE": "Löschung bestätigen",
    "en-US": "Confirm deletion"
  },
  deleteBody: {
    "pt-BR": "Tem certeza que deseja excluir o evento \"{name}\"? Esta ação não pode ser desfeita.",
    "de-DE": "Möchten Sie das Ereignis \"{name}\" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
    "en-US": "Are you sure you want to delete \"{name}\"? This action cannot be undone."
  },
  cancel: {
    "pt-BR": "Cancelar",
    "de-DE": "Abbrechen",
    "en-US": "Cancel"
  },
  detailsTitle: {
    "pt-BR": "Informações Detalhadas",
    "de-DE": "Detailinformationen",
    "en-US": "Detailed information"
  },
  category: {
    "pt-BR": "Categoria",
    "de-DE": "Kategorie",
    "en-US": "Category"
  },
  recurrence: {
    "pt-BR": "Recorrência",
    "de-DE": "Wiederholung",
    "en-US": "Recurrence"
  },
  paymentMethod: {
    "pt-BR": "Método de Pagamento",
    "de-DE": "Zahlungsmethode",
    "en-US": "Payment method"
  },
  historyTitle: {
    "pt-BR": "Histórico de Ocorrências",
    "de-DE": "Vorkommnisse",
    "en-US": "Occurrence history"
  },
  viewAll: {
    "pt-BR": "Ver tudo",
    "de-DE": "Alle anzeigen",
    "en-US": "View all"
  },
  historyEmptyTitle: {
    "pt-BR": "Nenhum histórico de pagamentos",
    "de-DE": "Kein Zahlungshistorie",
    "en-US": "No payment history"
  },
  historyEmptyBody: {
    "pt-BR": "O histórico será criado conforme os pagamentos forem registrados",
    "de-DE": "Der Verlauf wird erstellt, sobald Zahlungen erfasst werden",
    "en-US": "History will be created as payments are recorded"
  },
  tableDate: {
    "pt-BR": "Data",
    "de-DE": "Datum",
    "en-US": "Date"
  },
  tableAmount: {
    "pt-BR": "Valor",
    "de-DE": "Betrag",
    "en-US": "Amount"
  },
  tableStatus: {
    "pt-BR": "Status",
    "de-DE": "Status",
    "en-US": "Status"
  },
  tableAction: {
    "pt-BR": "Ação",
    "de-DE": "Aktion",
    "en-US": "Action"
  },
  statusPaid: {
    "pt-BR": "Pago",
    "de-DE": "Bezahlt",
    "en-US": "Paid"
  },
  statusPending: {
    "pt-BR": "Pendente",
    "de-DE": "Ausstehend",
    "en-US": "Pending"
  },
  markPending: {
    "pt-BR": "Marcar pendente",
    "de-DE": "Als ausstehend markieren",
    "en-US": "Mark pending"
  },
  markPaid: {
    "pt-BR": "Marcar pago",
    "de-DE": "Als bezahlt markieren",
    "en-US": "Mark paid"
  },
  insightsTitle: {
    "pt-BR": "Insights Relacionados",
    "de-DE": "Zugehörige Insights",
    "en-US": "Related insights"
  },
  insightAboveAvgTitle: {
    "pt-BR": "Gasto acima da média",
    "de-DE": "Ausgaben über dem Durchschnitt",
    "en-US": "Spending above average"
  },
  insightAboveAvgBody: {
    "pt-BR": "Este evento representou {percent}% dos gastos totais do último mês. Considere revisar.",
    "de-DE": "Dieses Ereignis machte {percent}% der Gesamtausgaben des letzten Monats aus. Bitte prüfen.",
    "en-US": "This event accounted for {percent}% of last month's total spend. Consider reviewing."
  },
  trendTitle: {
    "pt-BR": "Tendência de Gastos",
    "de-DE": "Ausgabentrend",
    "en-US": "Spending trend"
  },
  average: {
    "pt-BR": "Média",
    "de-DE": "Durchschnitt",
    "en-US": "Average"
  },
  noData: {
    "pt-BR": "Sem dados suficientes",
    "de-DE": "Nicht genügend Daten",
    "en-US": "Not enough data"
  },
  errorNotFound: {
    "pt-BR": "Evento não encontrado",
    "de-DE": "Ereignis nicht gefunden",
    "en-US": "Event not found"
  },
  errorDelete: {
    "pt-BR": "Erro ao excluir evento",
    "de-DE": "Fehler beim Löschen des Ereignisses",
    "en-US": "Failed to delete event"
  },
  toastDeleted: {
    "pt-BR": "Evento excluído com sucesso",
    "de-DE": "Ereignis erfolgreich gelöscht",
    "en-US": "Event deleted successfully"
  },
  toastStatusUpdated: {
    "pt-BR": "Status atualizado",
    "de-DE": "Status aktualisiert",
    "en-US": "Status updated"
  },
  recurrenceLabels: {
    "pt-BR": {
      none: "Único",
      weekly: "Toda semana",
      biweekly: "Quinzenal",
      monthly: "Todo mês",
      yearly: "Todo ano"
    },
    "de-DE": {
      none: "Einmalig",
      weekly: "Wöchentlich",
      biweekly: "Alle zwei Wochen",
      monthly: "Monatlich",
      yearly: "Jährlich"
    },
    "en-US": {
      none: "One-time",
      weekly: "Weekly",
      biweekly: "Biweekly",
      monthly: "Monthly",
      yearly: "Yearly"
    }
  }
};

export const accountsCopy = {
  title: {
    "pt-BR": "Contas",
    "de-DE": "Konten",
    "en-US": "Accounts"
  },
  subtitle: {
    "pt-BR": "Gerencie seus cartões e contas bancárias",
    "de-DE": "Verwalten Sie Ihre Karten und Bankkonten",
    "en-US": "Manage your cards and bank accounts"
  },
  newAccount: {
    "pt-BR": "Nova Conta",
    "de-DE": "Neues Konto",
    "en-US": "New account"
  },
  searchPlaceholder: {
    "pt-BR": "Buscar conta...",
    "de-DE": "Konto suchen...",
    "en-US": "Search account..."
  },
  netPositionTitle: {
    "pt-BR": "Posição Líquida Simulada",
    "de-DE": "Simulierte Nettoposition",
    "en-US": "Simulated net position"
  },
  netPositionHint: {
    "pt-BR": "Saldo bancário menos saldos dos cartões",
    "de-DE": "Bankguthaben minus Kartensalden",
    "en-US": "Bank balance minus card balances"
  },
  staleBalances: {
    "pt-BR": "Saldos desatualizados",
    "de-DE": "Veraltete Salden",
    "en-US": "Stale balances"
  },
  emptySearch: {
    "pt-BR": "Nenhuma conta encontrada",
    "de-DE": "Kein Konto gefunden",
    "en-US": "No accounts found"
  },
  emptyAll: {
    "pt-BR": "Nenhuma conta cadastrada",
    "de-DE": "Keine Konten registriert",
    "en-US": "No accounts yet"
  },
  createFirst: {
    "pt-BR": "Criar primeira conta",
    "de-DE": "Erstes Konto erstellen",
    "en-US": "Create first account"
  },
  lastUpload: {
    "pt-BR": "Último upload: {date}",
    "de-DE": "Letzter Upload: {date}",
    "en-US": "Last upload: {date}"
  },
  balance: {
    "pt-BR": "Saldo",
    "de-DE": "Saldo",
    "en-US": "Balance"
  },
  updatedAt: {
    "pt-BR": "Atualizado em {date}",
    "de-DE": "Aktualisiert am {date}",
    "en-US": "Updated on {date}"
  },
  limit: {
    "pt-BR": "Limite",
    "de-DE": "Limit",
    "en-US": "Limit"
  },
  used: {
    "pt-BR": "{amount} usado",
    "de-DE": "{amount} genutzt",
    "en-US": "{amount} used"
  },
  available: {
    "pt-BR": "{amount} disponível",
    "de-DE": "{amount} verfügbar",
    "en-US": "{amount} available"
  },
  active: {
    "pt-BR": "Ativa",
    "de-DE": "Aktiv",
    "en-US": "Active"
  },
  editAccount: {
    "pt-BR": "Editar Conta",
    "de-DE": "Konto bearbeiten",
    "en-US": "Edit account"
  },
  createAccountTitle: {
    "pt-BR": "Nova Conta",
    "de-DE": "Neues Konto",
    "en-US": "New account"
  },
  nameLabel: {
    "pt-BR": "Nome da Conta",
    "de-DE": "Kontoname",
    "en-US": "Account name"
  },
  namePlaceholder: {
    "pt-BR": "Ex: Nubank, Itaú, Amex...",
    "de-DE": "z. B. N26, Sparkasse, Amex...",
    "en-US": "e.g., N26, Sparkasse, Amex..."
  },
  typeLabel: {
    "pt-BR": "Tipo",
    "de-DE": "Typ",
    "en-US": "Type"
  },
  lastDigitsLabel: {
    "pt-BR": "Últimos 4 dígitos (opcional)",
    "de-DE": "Letzte 4 Ziffern (optional)",
    "en-US": "Last 4 digits (optional)"
  },
  iconLabel: {
    "pt-BR": "Ícone",
    "de-DE": "Icon",
    "en-US": "Icon"
  },
  colorLabel: {
    "pt-BR": "Cor",
    "de-DE": "Farbe",
    "en-US": "Color"
  },
  previewLabel: {
    "pt-BR": "Preview",
    "de-DE": "Vorschau",
    "en-US": "Preview"
  },
  previewFallback: {
    "pt-BR": "Nome da conta",
    "de-DE": "Kontoname",
    "en-US": "Account name"
  },
  cancel: {
    "pt-BR": "Cancelar",
    "de-DE": "Abbrechen",
    "en-US": "Cancel"
  },
  saving: {
    "pt-BR": "Salvando...",
    "de-DE": "Speichern...",
    "en-US": "Saving..."
  },
  update: {
    "pt-BR": "Atualizar",
    "de-DE": "Aktualisieren",
    "en-US": "Update"
  },
  create: {
    "pt-BR": "Criar Conta",
    "de-DE": "Konto erstellen",
    "en-US": "Create account"
  },
  toastCreated: {
    "pt-BR": "Conta criada com sucesso",
    "de-DE": "Konto erfolgreich erstellt",
    "en-US": "Account created successfully"
  },
  toastCreateError: {
    "pt-BR": "Erro ao criar conta",
    "de-DE": "Fehler beim Erstellen des Kontos",
    "en-US": "Failed to create account"
  },
  toastUpdated: {
    "pt-BR": "Conta atualizada",
    "de-DE": "Konto aktualisiert",
    "en-US": "Account updated"
  },
  toastUpdateError: {
    "pt-BR": "Erro ao atualizar conta",
    "de-DE": "Fehler beim Aktualisieren des Kontos",
    "en-US": "Failed to update account"
  },
  toastArchived: {
    "pt-BR": "Conta arquivada",
    "de-DE": "Konto archiviert",
    "en-US": "Account archived"
  },
  toastArchiveError: {
    "pt-BR": "Erro ao arquivar conta",
    "de-DE": "Fehler beim Archivieren des Kontos",
    "en-US": "Failed to archive account"
  },
  confirmArchive: {
    "pt-BR": "Arquivar esta conta? As transações existentes não serão afetadas.",
    "de-DE": "Dieses Konto archivieren? Bestehende Transaktionen bleiben unverändert.",
    "en-US": "Archive this account? Existing transactions will not be affected."
  },
  typeLabels: {
    "pt-BR": {
      credit_card: "Cartão de Crédito",
      debit_card: "Cartão de Débito",
      bank_account: "Conta Bancária",
      cash: "Dinheiro"
    },
    "de-DE": {
      credit_card: "Kreditkarte",
      debit_card: "Debitkarte",
      bank_account: "Bankkonto",
      cash: "Bargeld"
    },
    "en-US": {
      credit_card: "Credit card",
      debit_card: "Debit card",
      bank_account: "Bank account",
      cash: "Cash"
    }
  },
  colorLabels: {
    "pt-BR": {
      blue: "Azul",
      red: "Vermelho",
      purple: "Roxo",
      green: "Verde",
      orange: "Laranja",
      pink: "Rosa",
      indigo: "Indigo",
      gray: "Cinza"
    },
    "de-DE": {
      blue: "Blau",
      red: "Rot",
      purple: "Lila",
      green: "Grün",
      orange: "Orange",
      pink: "Rosa",
      indigo: "Indigo",
      gray: "Grau"
    },
    "en-US": {
      blue: "Blue",
      red: "Red",
      purple: "Purple",
      green: "Green",
      orange: "Orange",
      pink: "Pink",
      indigo: "Indigo",
      gray: "Gray"
    }
  },
  iconLabels: {
    "pt-BR": {
      "credit-card": "Cartão",
      landmark: "Banco",
      wallet: "Carteira",
      coins: "Moedas"
    },
    "de-DE": {
      "credit-card": "Karte",
      landmark: "Bank",
      wallet: "Brieftasche",
      coins: "Münzen"
    },
    "en-US": {
      "credit-card": "Card",
      landmark: "Bank",
      wallet: "Wallet",
      coins: "Coins"
    }
  }
};

export const goalsCopy = {
  title: {
    "pt-BR": "Metas Financeiras",
    "de-DE": "Finanzziele",
    "en-US": "Financial goals"
  },
  subtitle: {
    "pt-BR": "Planeje e acompanhe seus limites de gastos para {month}",
    "de-DE": "Planen und verfolgen Sie Ihre Ausgabenlimits für {month}",
    "en-US": "Plan and track your spending limits for {month}"
  },
  copyPrevious: {
    "pt-BR": "Copiar anterior",
    "de-DE": "Vorherigen kopieren",
    "en-US": "Copy previous"
  },
  saving: {
    "pt-BR": "Salvando...",
    "de-DE": "Speichern...",
    "en-US": "Saving..."
  },
  saveGoals: {
    "pt-BR": "Salvar Metas",
    "de-DE": "Ziele speichern",
    "en-US": "Save goals"
  },
  aiSuggestionTitle: {
    "pt-BR": "Sugestão Inteligente da IA",
    "de-DE": "Intelligente KI-Empfehlung",
    "en-US": "AI smart suggestion"
  },
  aiSuggestionBody: {
    "pt-BR": "Analisamos o histórico dos últimos 3 meses. Notamos um aumento de {percent}% em '{category}', mas uma economia em '{savingCategory}'. Sugerimos reequilibrar as metas para evitar estouros.",
    "de-DE": "Wir haben die letzten 3 Monate analysiert. Es gab einen Anstieg von {percent}% bei '{category}', aber Einsparungen bei '{savingCategory}'. Wir empfehlen eine Anpassung der Ziele.",
    "en-US": "We analyzed the last 3 months. We saw a {percent}% increase in '{category}', but savings in '{savingCategory}'. We suggest rebalancing goals."
  },
  applySuggestions: {
    "pt-BR": "Aplicar Sugestões",
    "de-DE": "Vorschläge anwenden",
    "en-US": "Apply suggestions"
  },
  incomeLabel: {
    "pt-BR": "Receita Estimada",
    "de-DE": "Geschätztes Einkommen",
    "en-US": "Estimated income"
  },
  incomeConfirmed: {
    "pt-BR": "Confirmado",
    "de-DE": "Bestätigt",
    "en-US": "Confirmed"
  },
  plannedTotalLabel: {
    "pt-BR": "Total Planejado",
    "de-DE": "Geplant gesamt",
    "en-US": "Planned total"
  },
  plannedPercent: {
    "pt-BR": "/ {percent}% da receita",
    "de-DE": "/ {percent}% des Einkommens",
    "en-US": "/ {percent}% of income"
  },
  projectedBalanceLabel: {
    "pt-BR": "Saldo Previsto",
    "de-DE": "Prognostizierter Saldo",
    "en-US": "Projected balance"
  },
  projectedHint: {
    "pt-BR": "para investimentos",
    "de-DE": "für Investitionen",
    "en-US": "for investments"
  },
  categoryBreakdown: {
    "pt-BR": "Detalhamento por Categoria",
    "de-DE": "Aufschlüsselung nach Kategorie",
    "en-US": "Category breakdown"
  },
  categoryHints: {
    "pt-BR": {
      Moradia: "Aluguel, Condomínio, Energia",
      Mercado: "Compras do mês, Feira",
      Transporte: "Combustível, Estacionamento",
      Lazer: "Streaming, Cinema, Passeios",
      "Saúde": "Farmácia, Consultas"
    },
    "de-DE": {
      Moradia: "Miete, Nebenkosten, Energie",
      Mercado: "Einkäufe, Markt",
      Transporte: "Kraftstoff, Parken",
      Lazer: "Streaming, Kino, Ausflüge",
      "Saúde": "Apotheke, Termine"
    },
    "en-US": {
      Moradia: "Rent, utilities, energy",
      Mercado: "Groceries, market",
      Transporte: "Fuel, parking",
      Lazer: "Streaming, cinema, outings",
      "Saúde": "Pharmacy, appointments"
    }
  },
  previousMonthLabel: {
    "pt-BR": "Gasto Mês Anterior",
    "de-DE": "Ausgaben im Vormonat",
    "en-US": "Previous month spend"
  },
  highLabel: {
    "pt-BR": "(Alto)",
    "de-DE": "(Hoch)",
    "en-US": "(High)"
  },
  averageLabel: {
    "pt-BR": "Média 3 Meses",
    "de-DE": "3-Monats-Schnitt",
    "en-US": "3-month average"
  },
  budgetPlaceholder: {
    "pt-BR": "0,00",
    "de-DE": "0,00",
    "en-US": "0.00"
  },
  currentProgress: {
    "pt-BR": "Progresso atual",
    "de-DE": "Aktueller Fortschritt",
    "en-US": "Current progress"
  },
  progressAmount: {
    "pt-BR": "{current} de {target}",
    "de-DE": "{current} von {target}",
    "en-US": "{current} of {target}"
  },
  addCategory: {
    "pt-BR": "Adicionar nova categoria de meta",
    "de-DE": "Neue Zielkategorie hinzufügen",
    "en-US": "Add new goal category"
  },
  toastSavedTitle: {
    "pt-BR": "Metas salvas com sucesso!",
    "de-DE": "Ziele erfolgreich gespeichert!",
    "en-US": "Goals saved successfully!"
  },
  toastSavedBody: {
    "pt-BR": "Suas metas financeiras foram atualizadas.",
    "de-DE": "Ihre Finanzziele wurden aktualisiert.",
    "en-US": "Your financial goals were updated."
  },
  toastSaveError: {
    "pt-BR": "Erro ao salvar metas",
    "de-DE": "Fehler beim Speichern der Ziele",
    "en-US": "Failed to save goals"
  },
  toastCopy: {
    "pt-BR": "Metas copiadas do mês anterior",
    "de-DE": "Ziele aus dem Vormonat kopiert",
    "en-US": "Goals copied from previous month"
  },
  toastSuggestions: {
    "pt-BR": "Sugestões aplicadas (5% de redução)",
    "de-DE": "Vorschläge angewendet (5% Reduktion)",
    "en-US": "Suggestions applied (5% reduction)"
  }
};

export const aiKeywordsCopy = {
  title: {
    "pt-BR": "Análise Inteligente de Keywords",
    "de-DE": "Intelligente Keyword-Analyse",
    "en-US": "Smart keyword analysis"
  },
  subtitle: {
    "pt-BR": "A IA analisa suas transações pendentes e sugere categorias em lote",
    "de-DE": "Die KI analysiert offene Transaktionen und schlägt Kategorien vor",
    "en-US": "AI analyzes pending transactions and suggests categories in bulk"
  },
  analyzeAction: {
    "pt-BR": "Analisar Transações",
    "de-DE": "Transaktionen analysieren",
    "en-US": "Analyze transactions"
  },
  analyzing: {
    "pt-BR": "Analisando...",
    "de-DE": "Analysiere...",
    "en-US": "Analyzing..."
  },
  emptyTitle: {
    "pt-BR": "Pronto para Categorizar em Lote?",
    "de-DE": "Bereit für die Stapel-Kategorisierung?",
    "en-US": "Ready to categorize in bulk?"
  },
  emptyBody: {
    "pt-BR": "Clique em \"Analisar Transações\" para que a IA identifique padrões nas suas transações pendentes e sugira categorias para cada palavra-chave encontrada.",
    "de-DE": "Klicken Sie auf \"Transaktionen analysieren\", damit die KI Muster in offenen Transaktionen erkennt und Kategorien vorschlägt.",
    "en-US": "Click \"Analyze transactions\" so AI can find patterns and suggest categories for each keyword."
  },
  startAnalysis: {
    "pt-BR": "Começar Análise",
    "de-DE": "Analyse starten",
    "en-US": "Start analysis"
  },
  analyzingTitle: {
    "pt-BR": "Analisando suas transações...",
    "de-DE": "Transaktionen werden analysiert...",
    "en-US": "Analyzing your transactions..."
  },
  analyzingBody: {
    "pt-BR": "A IA está identificando padrões e sugerindo categorias",
    "de-DE": "Die KI identifiziert Muster und schlägt Kategorien vor",
    "en-US": "AI is identifying patterns and suggesting categories"
  },
  totalAnalyzed: {
    "pt-BR": "Total Analisado",
    "de-DE": "Insgesamt analysiert",
    "en-US": "Total analyzed"
  },
  transactionsLabel: {
    "pt-BR": "transações",
    "de-DE": "Transaktionen",
    "en-US": "transactions"
  },
  confidenceHigh: {
    "pt-BR": "Alta Confiança",
    "de-DE": "Hohe Zuversicht",
    "en-US": "High confidence"
  },
  confidenceMedium: {
    "pt-BR": "Média Confiança",
    "de-DE": "Mittlere Zuversicht",
    "en-US": "Medium confidence"
  },
  confidenceLow: {
    "pt-BR": "Baixa Confiança",
    "de-DE": "Niedrige Zuversicht",
    "en-US": "Low confidence"
  },
  selectedLabel: {
    "pt-BR": "Selecionadas",
    "de-DE": "Ausgewählt",
    "en-US": "Selected"
  },
  selectedOf: {
    "pt-BR": "de {total} keywords",
    "de-DE": "von {total} Keywords",
    "en-US": "of {total} keywords"
  },
  selectAll: {
    "pt-BR": "Selecionar tudo",
    "de-DE": "Alle auswählen",
    "en-US": "Select all"
  },
  selectNone: {
    "pt-BR": "Limpar seleção",
    "de-DE": "Auswahl entfernen",
    "en-US": "Clear selection"
  },
  suggestionsTitle: {
    "pt-BR": "Sugestões da IA",
    "de-DE": "KI-Vorschläge",
    "en-US": "AI suggestions"
  },
  confidenceHighRange: {
    "pt-BR": "≥80% confiança",
    "de-DE": "≥80% Zuversicht",
    "en-US": "≥80% confidence"
  },
  confidenceMediumRange: {
    "pt-BR": "50-79% confiança",
    "de-DE": "50–79% Zuversicht",
    "en-US": "50–79% confidence"
  },
  confidenceBadge: {
    "pt-BR": "{percent}% confiança",
    "de-DE": "{percent}% Zuversicht",
    "en-US": "{percent}% confidence"
  },
  transactionsCount: {
    "pt-BR": "{count} transações",
    "de-DE": "{count} Transaktionen",
    "en-US": "{count} transactions"
  },
  samplesPrefix: {
    "pt-BR": "Exemplos",
    "de-DE": "Beispiele",
    "en-US": "Samples"
  },
  applySelectedTitle: {
    "pt-BR": "Aplicar Sugestões Selecionadas",
    "de-DE": "Ausgewählte Vorschläge anwenden",
    "en-US": "Apply selected suggestions"
  },
  applySelectedBody: {
    "pt-BR": "Serão criadas {count} regras e atualizadas as transações correspondentes",
    "de-DE": "Es werden {count} Regeln erstellt und entsprechende Transaktionen aktualisiert",
    "en-US": "{count} rules will be created and related transactions updated"
  },
  viewRules: {
    "pt-BR": "Ver Regras Existentes",
    "de-DE": "Bestehende Regeln ansehen",
    "en-US": "View existing rules"
  },
  applyCount: {
    "pt-BR": "Aplicar {count} Sugestões",
    "de-DE": "{count} Vorschläge anwenden",
    "en-US": "Apply {count} suggestions"
  },
  allCategorizedTitle: {
    "pt-BR": "Tudo Categorizado!",
    "de-DE": "Alles kategorisiert!",
    "en-US": "All categorized!"
  },
  allCategorizedBody: {
    "pt-BR": "Não há transações pendentes de categorização. Todas as suas transações já possuem uma categoria definida.",
    "de-DE": "Keine Transaktionen warten auf Kategorisierung. Alle Transaktionen sind kategorisiert.",
    "en-US": "No transactions pending categorization. All transactions already have a category."
  },
  applySelected: {
    "pt-BR": "Aplicar regras",
    "de-DE": "Regeln anwenden",
    "en-US": "Apply rules"
  },
  toastAnalyzeError: {
    "pt-BR": "Erro ao analisar transações",
    "de-DE": "Fehler bei der Transaktionsanalyse",
    "en-US": "Failed to analyze transactions"
  },
  toastAppliedTitle: {
    "pt-BR": "Regras criadas com sucesso!",
    "de-DE": "Regeln erfolgreich erstellt!",
    "en-US": "Rules created successfully!"
  },
  toastAppliedBody: {
    "pt-BR": "{rules} regras criadas, {transactions} transações atualizadas",
    "de-DE": "{rules} Regeln erstellt, {transactions} Transaktionen aktualisiert",
    "en-US": "{rules} rules created, {transactions} transactions updated"
  },
  toastApplyError: {
    "pt-BR": "Erro ao criar regras",
    "de-DE": "Fehler beim Erstellen der Regeln",
    "en-US": "Failed to create rules"
  },
  toastAnalyzed: {
    "pt-BR": "{count} palavras-chave analisadas",
    "de-DE": "{count} Schlüsselwörter analysiert",
    "en-US": "{count} keywords analyzed"
  },
  categoryLabel: {
    "pt-BR": "Categoria",
    "de-DE": "Kategorie",
    "en-US": "Category"
  },
  typeLabel: {
    "pt-BR": "Tipo",
    "de-DE": "Typ",
    "en-US": "Type"
  },
  fixVarLabel: {
    "pt-BR": "Fixo/Variável",
    "de-DE": "Fix/Variabel",
    "en-US": "Fixed/Variable"
  },
  confidenceLabel: {
    "pt-BR": "Confiança",
    "de-DE": "Zuversicht",
    "en-US": "Confidence"
  },
  reasonLabel: {
    "pt-BR": "Motivo",
    "de-DE": "Grund",
    "en-US": "Reason"
  },
  samplesLabel: {
    "pt-BR": "Exemplos",
    "de-DE": "Beispiele",
    "en-US": "Samples"
  },
  pendingEmpty: {
    "pt-BR": "Nenhuma sugestão disponível",
    "de-DE": "Keine Vorschläge verfügbar",
    "en-US": "No suggestions available"
  },
  backDashboard: {
    "pt-BR": "Voltar ao Dashboard",
    "de-DE": "Zurück zum Dashboard",
    "en-US": "Back to dashboard"
  }
};

export const budgetsCopy = {
  title: {
    "pt-BR": "Orçamentos Mensais",
    "de-DE": "Monatliche Budgets",
    "en-US": "Monthly budgets"
  },
  subtitle: {
    "pt-BR": "Defina limites de gasto por categoria para {month}",
    "de-DE": "Legen Sie Ausgabenlimits pro Kategorie für {month} fest",
    "en-US": "Set spending limits per category for {month}"
  },
  toastCreated: {
    "pt-BR": "Orçamento criado",
    "de-DE": "Budget erstellt",
    "en-US": "Budget created"
  },
  toastUpdated: {
    "pt-BR": "Orçamento atualizado",
    "de-DE": "Budget aktualisiert",
    "en-US": "Budget updated"
  },
  toastRemoved: {
    "pt-BR": "Orçamento removido",
    "de-DE": "Budget entfernt",
    "en-US": "Budget removed"
  },
  toastFillAll: {
    "pt-BR": "Preencha todos os campos",
    "de-DE": "Bitte alle Felder ausfüllen",
    "en-US": "Fill in all fields"
  },
  suggestionsTitle: {
    "pt-BR": "Sugestões Inteligentes de Orçamento",
    "de-DE": "Intelligente Budgetvorschläge",
    "en-US": "Smart budget suggestions"
  },
  suggestionsApply: {
    "pt-BR": "Aplicar Sugestões",
    "de-DE": "Vorschläge anwenden",
    "en-US": "Apply suggestions"
  },
  suggestionsBasedOn: {
    "pt-BR": "Baseado nos últimos 3 meses de gastos",
    "de-DE": "Basierend auf den letzten 3 Monaten",
    "en-US": "Based on the last 3 months"
  },
  avg3Months: {
    "pt-BR": "Média 3 meses:",
    "de-DE": "3-Monats-Schnitt:",
    "en-US": "3-month avg:"
  },
  lastMonth: {
    "pt-BR": "Mês anterior:",
    "de-DE": "Vormonat:",
    "en-US": "Last month:"
  },
  addBudgetTitle: {
    "pt-BR": "Adicionar Orçamento",
    "de-DE": "Budget hinzufügen",
    "en-US": "Add budget"
  },
  selectCategory: {
    "pt-BR": "Selecione uma categoria",
    "de-DE": "Kategorie auswählen",
    "en-US": "Select a category"
  },
  amountPlaceholder: {
    "pt-BR": "Valor (€)",
    "de-DE": "Betrag (€)",
    "en-US": "Amount (€)"
  },
  addAction: {
    "pt-BR": "Adicionar",
    "de-DE": "Hinzufügen",
    "en-US": "Add"
  },
  spentOf: {
    "pt-BR": "{spent} de {total}",
    "de-DE": "{spent} von {total}",
    "en-US": "{spent} of {total}"
  },
  updateBudget: {
    "pt-BR": "Atualizar orçamento",
    "de-DE": "Budget aktualisieren",
    "en-US": "Update budget"
  },
  emptyTitle: {
    "pt-BR": "Nenhum orçamento definido para {month}",
    "de-DE": "Kein Budget für {month} definiert",
    "en-US": "No budget set for {month}"
  },
  emptyBody: {
    "pt-BR": "Adicione um orçamento acima para começar a controlar seus gastos",
    "de-DE": "Fügen Sie oben ein Budget hinzu, um Ihre Ausgaben zu kontrollieren",
    "en-US": "Add a budget above to start controlling your spending"
  },
  toastSuggestionsApplied: {
    "pt-BR": "Sugestões aplicadas com sucesso",
    "de-DE": "Vorschläge erfolgreich angewendet",
    "en-US": "Suggestions applied successfully"
  }
};

export const merchantDictionaryCopy = {
  title: {
    "pt-BR": "Dicionário de Comerciantes",
    "de-DE": "Händlerverzeichnis",
    "en-US": "Merchant dictionary"
  },
  subtitle: {
    "pt-BR": "Edite aliases para melhorar a legibilidade das transações",
    "de-DE": "Bearbeiten Sie Aliase, um Transaktionen besser lesbar zu machen",
    "en-US": "Edit aliases to improve transaction readability"
  },
  searchPlaceholder: {
    "pt-BR": "Buscar descrição...",
    "de-DE": "Beschreibung suchen...",
    "en-US": "Search description..."
  },
  filterSource: {
    "pt-BR": "Fonte",
    "de-DE": "Quelle",
    "en-US": "Source"
  },
  filterManual: {
    "pt-BR": "Manual",
    "de-DE": "Manuell",
    "en-US": "Manual"
  },
  filterAll: {
    "pt-BR": "Todos",
    "de-DE": "Alle",
    "en-US": "All"
  },
  filterManualOnly: {
    "pt-BR": "Somente manual",
    "de-DE": "Nur manuell",
    "en-US": "Manual only"
  },
  filterAutoOnly: {
    "pt-BR": "Somente automático",
    "de-DE": "Nur automatisch",
    "en-US": "Auto only"
  },
  editTitle: {
    "pt-BR": "Editar alias",
    "de-DE": "Alias bearbeiten",
    "en-US": "Edit alias"
  },
  aliasLabel: {
    "pt-BR": "Alias",
    "de-DE": "Alias",
    "en-US": "Alias"
  },
  save: {
    "pt-BR": "Salvar",
    "de-DE": "Speichern",
    "en-US": "Save"
  },
  cancel: {
    "pt-BR": "Cancelar",
    "de-DE": "Abbrechen",
    "en-US": "Cancel"
  },
  confirmDelete: {
    "pt-BR": "Remover este mapeamento?",
    "de-DE": "Diese Zuordnung entfernen?",
    "en-US": "Remove this mapping?"
  },
  toastAliasUpdated: {
    "pt-BR": "Alias atualizado com sucesso",
    "de-DE": "Alias erfolgreich aktualisiert",
    "en-US": "Alias updated successfully"
  },
  toastUpdateError: {
    "pt-BR": "Erro ao atualizar",
    "de-DE": "Fehler beim Aktualisieren",
    "en-US": "Failed to update"
  },
  toastRemoved: {
    "pt-BR": "Mapeamento removido",
    "de-DE": "Zuordnung entfernt",
    "en-US": "Mapping removed"
  },
  toastSuggestError: {
    "pt-BR": "Erro ao sugerir alias",
    "de-DE": "Fehler beim Vorschlagen eines Alias",
    "en-US": "Failed to suggest alias"
  },
  toastSuggestionReady: {
    "pt-BR": "Sugestão recebida!",
    "de-DE": "Vorschlag erhalten!",
    "en-US": "Suggestion received!"
  },
  toastSuggestionBody: {
    "pt-BR": "Revise e salve se aprovar",
    "de-DE": "Bitte prüfen und speichern, wenn passend",
    "en-US": "Review and save if approved"
  },
  toastAiError: {
    "pt-BR": "Erro na sugestão AI",
    "de-DE": "Fehler bei der KI-Empfehlung",
    "en-US": "AI suggestion error"
  },
  exportEmpty: {
    "pt-BR": "Nenhum dado para exportar",
    "de-DE": "Keine Daten zum Exportieren",
    "en-US": "No data to export"
  },
  exportCount: {
    "pt-BR": "{count} registros exportados",
    "de-DE": "{count} Einträge exportiert",
    "en-US": "{count} records exported"
  },
  importEmpty: {
    "pt-BR": "Arquivo vazio",
    "de-DE": "Leere Datei",
    "en-US": "Empty file"
  },
  importErrors: {
    "pt-BR": "Erros encontrados no arquivo",
    "de-DE": "Fehler in der Datei gefunden",
    "en-US": "Errors found in file"
  },
  importNoneValid: {
    "pt-BR": "Nenhum registro válido para importar",
    "de-DE": "Keine gültigen Datensätze zum Importieren",
    "en-US": "No valid records to import"
  },
  importSuccess: {
    "pt-BR": "{count} registros importados com sucesso",
    "de-DE": "{count} Einträge erfolgreich importiert",
    "en-US": "{count} records imported successfully"
  },
  importPartialTitle: {
    "pt-BR": "Importação concluída com erros",
    "de-DE": "Import mit Fehlern abgeschlossen",
    "en-US": "Import completed with errors"
  },
  importPartialBody: {
    "pt-BR": "{success} importados, {fail} falharam",
    "de-DE": "{success} importiert, {fail} fehlgeschlagen",
    "en-US": "{success} imported, {fail} failed"
  },
  importProcessError: {
    "pt-BR": "Erro ao processar arquivo",
    "de-DE": "Fehler beim Verarbeiten der Datei",
    "en-US": "Error processing file"
  },
  sourceLabel: {
    "pt-BR": "Fonte",
    "de-DE": "Quelle",
    "en-US": "Source"
  },
  keyDescLabel: {
    "pt-BR": "Descrição Chave",
    "de-DE": "Schlüsselbeschreibung",
    "en-US": "Key description"
  },
  manualLabel: {
    "pt-BR": "Manual",
    "de-DE": "Manuell",
    "en-US": "Manual"
  },
  yes: {
    "pt-BR": "Sim",
    "de-DE": "Ja",
    "en-US": "Yes"
  },
  no: {
    "pt-BR": "Não",
    "de-DE": "Nein",
    "en-US": "No"
  },
  createdAt: {
    "pt-BR": "Criado em",
    "de-DE": "Erstellt am",
    "en-US": "Created at"
  },
  updatedAt: {
    "pt-BR": "Atualizado em",
    "de-DE": "Aktualisiert am",
    "en-US": "Updated at"
  },
  headerTitle: {
    "pt-BR": "Dicionário de Comerciantes",
    "de-DE": "Händlerverzeichnis",
    "en-US": "Merchant dictionary"
  },
  headerSubtitle: {
    "pt-BR": "Gerencie aliases padronizados para descrições de transações",
    "de-DE": "Verwalten Sie standardisierte Aliase für Transaktionsbeschreibungen",
    "en-US": "Manage standardized aliases for transaction descriptions"
  },
  exportLabel: {
    "pt-BR": "Exportar",
    "de-DE": "Exportieren",
    "en-US": "Export"
  },
  importLabel: {
    "pt-BR": "Importar",
    "de-DE": "Importieren",
    "en-US": "Import"
  },
  statTotal: {
    "pt-BR": "Total",
    "de-DE": "Gesamt",
    "en-US": "Total"
  },
  statManual: {
    "pt-BR": "Manual",
    "de-DE": "Manuell",
    "en-US": "Manual"
  },
  statAuto: {
    "pt-BR": "Auto",
    "de-DE": "Auto",
    "en-US": "Auto"
  },
  statSources: {
    "pt-BR": "Fontes",
    "de-DE": "Quellen",
    "en-US": "Sources"
  },
  filterType: {
    "pt-BR": "Tipo",
    "de-DE": "Typ",
    "en-US": "Type"
  },
  filterAllSources: {
    "pt-BR": "Todas as Fontes",
    "de-DE": "Alle Quellen",
    "en-US": "All sources"
  },
  emptyTitle: {
    "pt-BR": "Nenhum alias encontrado",
    "de-DE": "Kein Alias gefunden",
    "en-US": "No aliases found"
  },
  emptyBody: {
    "pt-BR": "Os aliases serão criados automaticamente ao importar transações.",
    "de-DE": "Aliase werden beim Import von Transaktionen automatisch erstellt.",
    "en-US": "Aliases will be created automatically when importing transactions."
  },
  manualBadge: {
    "pt-BR": "Manual",
    "de-DE": "Manuell",
    "en-US": "Manual"
  },
  suggestAi: {
    "pt-BR": "Sugerir com IA",
    "de-DE": "Mit KI vorschlagen",
    "en-US": "Suggest with AI"
  },
  importSourceError: {
    "pt-BR": "Linha {row}: Fonte deve ser \"Sparkasse\", \"Amex\" ou \"M&M\"",
    "de-DE": "Zeile {row}: Quelle muss \"Sparkasse\", \"Amex\" oder \"M&M\" sein",
    "en-US": "Row {row}: Source must be \"Sparkasse\", \"Amex\", or \"M&M\""
  },
  importKeyError: {
    "pt-BR": "Linha {row}: Descrição Chave é obrigatória",
    "de-DE": "Zeile {row}: Schlüsselbeschreibung ist erforderlich",
    "en-US": "Row {row}: Key description is required"
  },
  importAliasError: {
    "pt-BR": "Linha {row}: Alias é obrigatório",
    "de-DE": "Zeile {row}: Alias ist erforderlich",
    "en-US": "Row {row}: Alias is required"
  }
};

export const confirmCopy = {
  title: {
    "pt-BR": "Fila de Confirmação",
    "de-DE": "Bestätigungswarteschlange",
    "en-US": "Confirmation Queue"
  },
  subtitle: {
    "pt-BR": "A IA pré-analisou cada transação. Revise as sugestões e confirme.",
    "de-DE": "Die KI hat Transaktionen voranalysiert. Bitte prüfen und bestätigen.",
    "en-US": "AI pre-analyzed each transaction. Review and confirm."
  },
  acceptHigh: {
    "pt-BR": "Aceitar alta confiança",
    "de-DE": "Hohe Zuversicht akzeptieren",
    "en-US": "Accept high confidence"
  },
  totalPending: {
    "pt-BR": "Total Pendente",
    "de-DE": "Offen insgesamt",
    "en-US": "Total Pending"
  },
  highConfidence: {
    "pt-BR": "Alta Confiança",
    "de-DE": "Hohe Zuversicht",
    "en-US": "High Confidence"
  },
  mediumConfidence: {
    "pt-BR": "Média Confiança",
    "de-DE": "Mittlere Zuversicht",
    "en-US": "Medium Confidence"
  },
  lowConfidence: {
    "pt-BR": "Baixa Confiança",
    "de-DE": "Niedrige Zuversicht",
    "en-US": "Low Confidence"
  },
  noCategory: {
    "pt-BR": "Sem Categoria",
    "de-DE": "Ohne Kategorie",
    "en-US": "No Category"
  },
  confirmSelected: {
    "pt-BR": "Confirmar Selecionados",
    "de-DE": "Ausgewählte bestätigen",
    "en-US": "Confirm Selected"
  },
  accept: {
    "pt-BR": "Aceitar",
    "de-DE": "Akzeptieren",
    "en-US": "Accept"
  },
  confirm: {
    "pt-BR": "Confirmar",
    "de-DE": "Bestätigen",
    "en-US": "Confirm"
  },
  tabAll: {
    "pt-BR": "Todas",
    "de-DE": "Alle",
    "en-US": "All"
  },
  tabHigh: {
    "pt-BR": "Alta",
    "de-DE": "Hoch",
    "en-US": "High"
  },
  tabMedium: {
    "pt-BR": "Média",
    "de-DE": "Mittel",
    "en-US": "Medium"
  },
  tabLow: {
    "pt-BR": "Baixa",
    "de-DE": "Niedrig",
    "en-US": "Low"
  },
  tableConfidence: {
    "pt-BR": "Confiança",
    "de-DE": "Zuversicht",
    "en-US": "Confidence"
  },
  tableDate: {
    "pt-BR": "Data",
    "de-DE": "Datum",
    "en-US": "Date"
  },
  tableAccount: {
    "pt-BR": "Conta",
    "de-DE": "Konto",
    "en-US": "Account"
  },
  tableDescription: {
    "pt-BR": "Descrição",
    "de-DE": "Beschreibung",
    "en-US": "Description"
  },
  tableAmount: {
    "pt-BR": "Valor",
    "de-DE": "Betrag",
    "en-US": "Amount"
  },
  tableCategory: {
    "pt-BR": "Categoria",
    "de-DE": "Kategorie",
    "en-US": "Category"
  },
  tableAction: {
    "pt-BR": "Ação",
    "de-DE": "Aktion",
    "en-US": "Action"
  },
  emptyAll: {
    "pt-BR": "Nenhuma transação pendente de revisão.",
    "de-DE": "Keine Transaktionen zur Überprüfung.",
    "en-US": "No transactions pending review."
  },
  emptyByConfidence: {
    "pt-BR": "Nenhuma transação com {level} confiança.",
    "de-DE": "Keine Transaktionen mit {level} Zuversicht.",
    "en-US": "No transactions with {level} confidence."
  },
  confidenceHighLabel: {
    "pt-BR": "alta",
    "de-DE": "hoher",
    "en-US": "high"
  },
  confidenceMediumLabel: {
    "pt-BR": "média",
    "de-DE": "mittlerer",
    "en-US": "medium"
  },
  confidenceLowLabel: {
    "pt-BR": "baixa",
    "de-DE": "niedriger",
    "en-US": "low"
  },
  emptyTitle: {
    "pt-BR": "Tudo limpo!",
    "de-DE": "Alles erledigt!",
    "en-US": "All clear!"
  },
  showingCount: {
    "pt-BR": "Mostrando {shown} de {total} itens",
    "de-DE": "{shown} von {total} Einträgen angezeigt",
    "en-US": "Showing {shown} of {total} items"
  },
  selectedCount: {
    "pt-BR": "{count} selecionado(s)",
    "de-DE": "{count} ausgewählt",
    "en-US": "{count} selected"
  },
  selectedLabel: {
    "pt-BR": "selecionado(s)",
    "de-DE": "ausgewählt",
    "en-US": "selected"
  }
};

export const rulesCopy = {
  title: {
    "pt-BR": "Motor de Regras",
    "de-DE": "Regel-Engine",
    "en-US": "Rules Engine"
  },
  subtitle: {
    "pt-BR": "Categorize transações automaticamente com regras baseadas em palavras-chave.",
    "de-DE": "Transaktionen automatisch mit keywordbasierten Regeln kategorisieren.",
    "en-US": "Automatically categorize transactions with keyword-based rules."
  },
  newRule: {
    "pt-BR": "Nova Regra",
    "de-DE": "Neue Regel",
    "en-US": "New Rule"
  },
  reapply: {
    "pt-BR": "Reaplicar Regras",
    "de-DE": "Regeln erneut anwenden",
    "en-US": "Reapply Rules"
  },
  importLabel: {
    "pt-BR": "Importar",
    "de-DE": "Importieren",
    "en-US": "Import"
  },
  totalRules: {
    "pt-BR": "Total Regras",
    "de-DE": "Regeln gesamt",
    "en-US": "Total Rules"
  },
  aiRules: {
    "pt-BR": "Regras IA",
    "de-DE": "KI-Regeln",
    "en-US": "AI Rules"
  },
  userRules: {
    "pt-BR": "Suas Regras",
    "de-DE": "Ihre Regeln",
    "en-US": "Your Rules"
  },
  createDefault: {
    "pt-BR": "Criar Regras Padrao",
    "de-DE": "Standardregeln erstellen",
    "en-US": "Create Default Rules"
  },
  generating: {
    "pt-BR": "Gerando...",
    "de-DE": "Wird erzeugt...",
    "en-US": "Generating..."
  },
  emptyTitle: {
    "pt-BR": "Nenhuma regra configurada",
    "de-DE": "Keine Regeln konfiguriert",
    "en-US": "No rules configured"
  },
  emptyBody: {
    "pt-BR": "Crie regras para categorizar suas transações automaticamente durante a importação.",
    "de-DE": "Erstellen Sie Regeln, um Transaktionen beim Import automatisch zu kategorisieren.",
    "en-US": "Create rules to automatically categorize transactions on import."
  },
  toastRuleCreated: {
    "pt-BR": "Regra criada com sucesso",
    "de-DE": "Regel erfolgreich erstellt",
    "en-US": "Rule created successfully"
  },
  toastRuleUpdated: {
    "pt-BR": "Regra atualizada",
    "de-DE": "Regel aktualisiert",
    "en-US": "Rule updated"
  },
  toastRuleRemoved: {
    "pt-BR": "Regra removida",
    "de-DE": "Regel entfernt",
    "en-US": "Rule removed"
  },
  toastCreateError: {
    "pt-BR": "Erro ao criar regra",
    "de-DE": "Fehler beim Erstellen der Regel",
    "en-US": "Failed to create rule"
  },
  toastExportEmpty: {
    "pt-BR": "Nenhuma regra para exportar",
    "de-DE": "Keine Regeln zum Export",
    "en-US": "No rules to export"
  },
  toastFileEmpty: {
    "pt-BR": "Arquivo vazio",
    "de-DE": "Datei ist leer",
    "en-US": "File is empty"
  },
  toastNoValidRules: {
    "pt-BR": "Nenhuma regra válida para importar",
    "de-DE": "Keine gültigen Regeln zum Import",
    "en-US": "No valid rules to import"
  },
  toastImportSuccess: {
    "pt-BR": "regras importadas com sucesso",
    "de-DE": "Regeln erfolgreich importiert",
    "en-US": "rules imported successfully"
  },
  toastFillRequired: {
    "pt-BR": "Preencha nome e palavras-chave",
    "de-DE": "Name und Schlüsselwörter ausfüllen",
    "en-US": "Fill name and keywords"
  },
  statusRuleCreated: {
    "pt-BR": "Regra criada",
    "de-DE": "Regel erstellt",
    "en-US": "Rule created"
  },
  statusRuleCreateFailed: {
    "pt-BR": "Falha ao criar regra",
    "de-DE": "Regel konnte nicht erstellt werden",
    "en-US": "Failed to create rule"
  },
  statusRuleUpdated: {
    "pt-BR": "Regra atualizada",
    "de-DE": "Regel aktualisiert",
    "en-US": "Rule updated"
  },
  statusRuleUpdateFailed: {
    "pt-BR": "Falha ao atualizar regra",
    "de-DE": "Regel konnte nicht aktualisiert werden",
    "en-US": "Failed to update rule"
  },
  statusRuleRemoved: {
    "pt-BR": "Regra removida",
    "de-DE": "Regel entfernt",
    "en-US": "Rule removed"
  },
  statusRuleRemoveFailed: {
    "pt-BR": "Falha ao remover regra",
    "de-DE": "Regel konnte nicht entfernt werden",
    "en-US": "Failed to remove rule"
  },
  statusReapplyDone: {
    "pt-BR": "Regras reaplicadas",
    "de-DE": "Regeln erneut angewendet",
    "en-US": "Rules reapplied"
  },
  statusReapplyFailed: {
    "pt-BR": "Falha ao reaplicar regras",
    "de-DE": "Regeln konnten nicht erneut angewendet werden",
    "en-US": "Failed to reapply rules"
  },
  statusAiAdded: {
    "pt-BR": "Regras IA adicionadas",
    "de-DE": "KI-Regeln hinzugefügt",
    "en-US": "AI rules added"
  },
  statusAiFailed: {
    "pt-BR": "Falha ao gerar regras IA",
    "de-DE": "KI-Regeln konnten nicht erstellt werden",
    "en-US": "Failed to generate AI rules"
  },
  statusImportFailed: {
    "pt-BR": "Importação falhou",
    "de-DE": "Import fehlgeschlagen",
    "en-US": "Import failed"
  },
  statusImportErrorsFound: {
    "pt-BR": "Erros encontrados no arquivo",
    "de-DE": "Fehler in der Datei gefunden",
    "en-US": "Errors found in file"
  },
  statusImportIgnored: {
    "pt-BR": "Importação ignorada",
    "de-DE": "Import ignoriert",
    "en-US": "Import ignored"
  },
  statusImportDone: {
    "pt-BR": "Importação concluída",
    "de-DE": "Import abgeschlossen",
    "en-US": "Import completed"
  },
  statusImportDoneErrors: {
    "pt-BR": "Importação concluída com erros",
    "de-DE": "Import abgeschlossen mit Fehlern",
    "en-US": "Import completed with errors"
  },
  statusFileProcessError: {
    "pt-BR": "Erro ao processar arquivo",
    "de-DE": "Fehler beim Verarbeiten der Datei",
    "en-US": "Error processing file"
  }
};

export const settingsCopy = {
  title: {
    "pt-BR": "Configurações",
    "de-DE": "Einstellungen",
    "en-US": "Settings"
  },
  subtitle: {
    "pt-BR": "Gerencie seu perfil, dados e preferências",
    "de-DE": "Verwalten Sie Ihr Profil, Daten und Präferenzen",
    "en-US": "Manage your profile, data, and preferences"
  },
  tabAccount: {
    "pt-BR": "Conta",
    "de-DE": "Konto",
    "en-US": "Account"
  },
  tabAccountDesc: {
    "pt-BR": "Perfil e informações pessoais",
    "de-DE": "Profil und persönliche Informationen",
    "en-US": "Profile and personal info"
  },
  tabRegional: {
    "pt-BR": "Preferências Regionais",
    "de-DE": "Regionale Einstellungen",
    "en-US": "Regional preferences"
  },
  tabRegionalDesc: {
    "pt-BR": "Idioma, moeda e região fiscal",
    "de-DE": "Sprache, Währung und Steuerregion",
    "en-US": "Language, currency, and fiscal region"
  },
  tabNotifications: {
    "pt-BR": "Notificações",
    "de-DE": "Benachrichtigungen",
    "en-US": "Notifications"
  },
  tabNotificationsDesc: {
    "pt-BR": "Alertas e comunicações",
    "de-DE": "Warnungen und Mitteilungen",
    "en-US": "Alerts and communications"
  },
  tabIntegrations: {
    "pt-BR": "Integrações",
    "de-DE": "Integrationen",
    "en-US": "Integrations"
  },
  tabIntegrationsDesc: {
    "pt-BR": "Fontes de dados via CSV",
    "de-DE": "CSV-Datenquellen",
    "en-US": "CSV data sources"
  },
  tabClassification: {
    "pt-BR": "Classificação & Dados",
    "de-DE": "Klassifikation & Daten",
    "en-US": "Classification & Data"
  },
  tabClassificationDesc: {
    "pt-BR": "Categorias, regras e fila de revisão",
    "de-DE": "Kategorien, Regeln und Review-Queue",
    "en-US": "Categories, rules, and review queue"
  },
  tabDictionary: {
    "pt-BR": "Dicionário de Comerciantes",
    "de-DE": "Händlerverzeichnis",
    "en-US": "Merchant dictionary"
  },
  tabDictionaryDesc: {
    "pt-BR": "Aliases e logos de comerciantes",
    "de-DE": "Händler-Aliase und Logos",
    "en-US": "Merchant aliases and logos"
  },
  tabAudit: {
    "pt-BR": "Log de Auditoria",
    "de-DE": "Audit-Log",
    "en-US": "Audit log"
  },
  tabAuditDesc: {
    "pt-BR": "Registros críticos do sistema",
    "de-DE": "Kritische Systemprotokolle",
    "en-US": "Critical system records"
  },
  tabDanger: {
    "pt-BR": "Zona de Perigo",
    "de-DE": "Gefahrenzone",
    "en-US": "Danger zone"
  },
  tabDangerDesc: {
    "pt-BR": "Exclusões com confirmação reforçada",
    "de-DE": "Löschungen mit zusätzlicher Bestätigung",
    "en-US": "Deletions with reinforced confirmation"
  },
  profileTitle: {
    "pt-BR": "Usuário RitualFin",
    "de-DE": "RitualFin Nutzer",
    "en-US": "RitualFin user"
  },
  profileSince: {
    "pt-BR": "Membro desde 2024",
    "de-DE": "Mitglied seit 2024",
    "en-US": "Member since 2024"
  },
  profilePlan: {
    "pt-BR": "Plano Starter",
    "de-DE": "Starter-Plan",
    "en-US": "Starter plan"
  },
  editPhoto: {
    "pt-BR": "Editar Foto",
    "de-DE": "Foto bearbeiten",
    "en-US": "Edit photo"
  },
  labelName: {
    "pt-BR": "Nome",
    "de-DE": "Name",
    "en-US": "Name"
  },
  labelEmail: {
    "pt-BR": "Email",
    "de-DE": "E-Mail",
    "en-US": "Email"
  },
  saveChanges: {
    "pt-BR": "Salvar Alterações",
    "de-DE": "Änderungen speichern",
    "en-US": "Save changes"
  },
  regionalTitle: {
    "pt-BR": "Preferências Regionais",
    "de-DE": "Regionale Einstellungen",
    "en-US": "Regional preferences"
  },
  labelLanguage: {
    "pt-BR": "Idioma",
    "de-DE": "Sprache",
    "en-US": "Language"
  },
  labelCurrency: {
    "pt-BR": "Moeda",
    "de-DE": "Währung",
    "en-US": "Currency"
  },
  labelFiscalRegion: {
    "pt-BR": "Região Fiscal",
    "de-DE": "Steuerregion",
    "en-US": "Fiscal region"
  },
  langPtBr: {
    "pt-BR": "Português (Brasil)",
    "de-DE": "Portugiesisch (Brasilien)",
    "en-US": "Portuguese (Brazil)"
  },
  langPtPt: {
    "pt-BR": "Português (Portugal)",
    "de-DE": "Portugiesisch (Portugal)",
    "en-US": "Portuguese (Portugal)"
  },
  langEn: {
    "pt-BR": "Inglês",
    "de-DE": "Englisch",
    "en-US": "English"
  },
  currencyEur: {
    "pt-BR": "Euro (EUR)",
    "de-DE": "Euro (EUR)",
    "en-US": "Euro (EUR)"
  },
  currencyBrl: {
    "pt-BR": "Real (BRL)",
    "de-DE": "Real (BRL)",
    "en-US": "Real (BRL)"
  },
  currencyUsd: {
    "pt-BR": "Dólar (USD)",
    "de-DE": "US-Dollar (USD)",
    "en-US": "US Dollar (USD)"
  },
  fiscalPortugal: {
    "pt-BR": "Portugal (PT)",
    "de-DE": "Portugal (PT)",
    "en-US": "Portugal (PT)"
  },
  fiscalEu: {
    "pt-BR": "União Europeia",
    "de-DE": "Europäische Union",
    "en-US": "European Union"
  },
  fiscalOther: {
    "pt-BR": "Outros",
    "de-DE": "Andere",
    "en-US": "Other"
  },
  exportDataTitle: {
    "pt-BR": "Exportar Dados",
    "de-DE": "Daten exportieren",
    "en-US": "Export data"
  },
  exportDataDesc: {
    "pt-BR": "Baixe todas as suas transações e configurações.",
    "de-DE": "Laden Sie alle Transaktionen und Einstellungen herunter.",
    "en-US": "Download all your transactions and settings."
  },
  exportCsv: {
    "pt-BR": "Exportar CSV",
    "de-DE": "CSV exportieren",
    "en-US": "Export CSV"
  },
  exportJson: {
    "pt-BR": "Exportar JSON",
    "de-DE": "JSON exportieren",
    "en-US": "Export JSON"
  },
  regionalDesc: {
    "pt-BR": "Defina idioma, moeda e região fiscal padrão.",
    "de-DE": "Standard-Sprache, Währung und Steuerregion festlegen.",
    "en-US": "Set default language, currency, and fiscal region."
  },
  notificationsTitle: {
    "pt-BR": "Notificações",
    "de-DE": "Benachrichtigungen",
    "en-US": "Notifications"
  },
  notificationsDesc: {
    "pt-BR": "Defina quando deseja receber alertas do RitualFin.",
    "de-DE": "Legen Sie fest, wann Sie RitualFin-Warnungen erhalten möchten.",
    "en-US": "Set when you want to receive RitualFin alerts."
  },
  notifyImportTitle: {
    "pt-BR": "Importações concluídas",
    "de-DE": "Importe abgeschlossen",
    "en-US": "Imports completed"
  },
  notifyImportDesc: {
    "pt-BR": "Resumo após cada upload",
    "de-DE": "Zusammenfassung nach jedem Upload",
    "en-US": "Summary after each upload"
  },
  notifyReviewTitle: {
    "pt-BR": "Fila de revisão",
    "de-DE": "Review-Warteschlange",
    "en-US": "Review queue"
  },
  notifyReviewDesc: {
    "pt-BR": "Lembretes para classificar pendências",
    "de-DE": "Erinnerungen zur Klassifizierung offener Punkte",
    "en-US": "Reminders to classify pending items"
  },
  notifyMonthlyTitle: {
    "pt-BR": "Resumo mensal",
    "de-DE": "Monatsübersicht",
    "en-US": "Monthly summary"
  },
  notifyMonthlyDesc: {
    "pt-BR": "Fechamento e insights do mês",
    "de-DE": "Monatsabschluss und Insights",
    "en-US": "Month close and insights"
  },
  auditTitle: {
    "pt-BR": "Log de Auditoria",
    "de-DE": "Audit-Protokoll",
    "en-US": "Audit Log"
  },
  auditExport: {
    "pt-BR": "Exportar CSV (UTF-8 com BOM)",
    "de-DE": "CSV exportieren (UTF-8 mit BOM)",
    "en-US": "Export CSV (UTF-8 with BOM)"
  },
  auditFilterStatus: {
    "pt-BR": "Status",
    "de-DE": "Status",
    "en-US": "Status"
  },
  auditFilterAll: {
    "pt-BR": "Todos",
    "de-DE": "Alle",
    "en-US": "All"
  },
  auditFilterSuccess: {
    "pt-BR": "Sucesso",
    "de-DE": "Erfolg",
    "en-US": "Success"
  },
  auditFilterWarning: {
    "pt-BR": "Atenção",
    "de-DE": "Warnung",
    "en-US": "Warning"
  },
  auditFilterError: {
    "pt-BR": "Falha",
    "de-DE": "Fehler",
    "en-US": "Failure"
  },
  dangerTitle: {
    "pt-BR": "Zona de Perigo",
    "de-DE": "Gefahrenzone",
    "en-US": "Danger Zone"
  },
  auditLoading: {
    "pt-BR": "Carregando registros...",
    "de-DE": "Einträge werden geladen...",
    "en-US": "Loading records..."
  },
  auditEmpty: {
    "pt-BR": "Nenhum evento registrado.",
    "de-DE": "Keine Ereignisse gefunden.",
    "en-US": "No events recorded."
  },
  auditHeaderDate: {
    "pt-BR": "Data",
    "de-DE": "Datum",
    "en-US": "Date"
  },
  auditHeaderAction: {
    "pt-BR": "Ação",
    "de-DE": "Aktion",
    "en-US": "Action"
  },
  auditHeaderStatus: {
    "pt-BR": "Status",
    "de-DE": "Status",
    "en-US": "Status"
  },
  auditHeaderSummary: {
    "pt-BR": "Resumo",
    "de-DE": "Zusammenfassung",
    "en-US": "Summary"
  },
  previewUpload: {
    "pt-BR": "Pré-visualizar upload",
    "de-DE": "Upload-Vorschau",
    "en-US": "Preview upload"
  },
  confirmImport: {
    "pt-BR": "Confirmar importação",
    "de-DE": "Import bestätigen",
    "en-US": "Confirm import"
  },
  transactionsImports: {
    "pt-BR": "Importações de transações",
    "de-DE": "Transaktionsimporte",
    "en-US": "Transaction imports"
  },
  noOpenTransactions: {
    "pt-BR": "Nenhuma transação em aberto.",
    "de-DE": "Keine offenen Transaktionen.",
    "en-US": "No open transactions."
  },
  deleteData: {
    "pt-BR": "Apagar dados",
    "de-DE": "Daten löschen",
    "en-US": "Delete data"
  },
  confirmAction: {
    "pt-BR": "Confirmar",
    "de-DE": "Bestätigen",
    "en-US": "Confirm"
  },
  toastPreviewError: {
    "pt-BR": "Erro na pré-visualização",
    "de-DE": "Fehler bei der Vorschau",
    "en-US": "Preview error"
  },
  toastCategoriesUpdated: {
    "pt-BR": "Categorias atualizadas",
    "de-DE": "Kategorien aktualisiert",
    "en-US": "Categories updated"
  },
  toastApplyCategoriesError: {
    "pt-BR": "Erro ao aplicar categorias",
    "de-DE": "Fehler beim Anwenden der Kategorien",
    "en-US": "Failed to apply categories"
  },
  toastAliasesUpdated: {
    "pt-BR": "Aliases atualizados",
    "de-DE": "Aliases aktualisiert",
    "en-US": "Aliases updated"
  },
  toastApplyAliasesError: {
    "pt-BR": "Erro ao aplicar aliases",
    "de-DE": "Fehler beim Anwenden der Aliases",
    "en-US": "Failed to apply aliases"
  },
  toastLogosImported: {
    "pt-BR": "Logos importados",
    "de-DE": "Logos importiert",
    "en-US": "Logos imported"
  },
  toastLogosError: {
    "pt-BR": "Erro ao importar logos",
    "de-DE": "Fehler beim Import der Logos",
    "en-US": "Failed to import logos"
  },
  toastLogosUpdated: {
    "pt-BR": "Logos atualizados",
    "de-DE": "Logos aktualisiert",
    "en-US": "Logos updated"
  },
  toastDataReset: {
    "pt-BR": "Dados resetados",
    "de-DE": "Daten zurückgesetzt",
    "en-US": "Data reset"
  },
  toastDataResetDesc: {
    "pt-BR": "Seu ambiente foi reinicializado.",
    "de-DE": "Ihre Umgebung wurde zurückgesetzt.",
    "en-US": "Your environment was reset."
  },
  toastSelectCategory: {
    "pt-BR": "Selecione uma categoria",
    "de-DE": "Kategorie auswählen",
    "en-US": "Select a category"
  },
  toastClassificationUpdated: {
    "pt-BR": "Classificação atualizada",
    "de-DE": "Klassifikation aktualisiert",
    "en-US": "Classification updated"
  },
  toastEnterExpression: {
    "pt-BR": "Informe ao menos uma expressão",
    "de-DE": "Mindestens einen Ausdruck eingeben",
    "en-US": "Enter at least one expression"
  },
  toastKeywordsUpdated: {
    "pt-BR": "Palavras-chave atualizadas",
    "de-DE": "Schlüsselwörter aktualisiert",
    "en-US": "Keywords updated"
  },
  toastKeywordsError: {
    "pt-BR": "Erro ao salvar palavras-chave",
    "de-DE": "Fehler beim Speichern der Schlüsselwörter",
    "en-US": "Failed to save keywords"
  },
  toastNegativeRequired: {
    "pt-BR": "Informe ao menos uma expressão negativa",
    "de-DE": "Mindestens einen negativen Ausdruck eingeben",
    "en-US": "Enter at least one negative expression"
  },
  toastNegativeUpdated: {
    "pt-BR": "Palavras-chave negativas atualizadas",
    "de-DE": "Negative Schlüsselwörter aktualisiert",
    "en-US": "Negative keywords updated"
  },
  toastNegativeError: {
    "pt-BR": "Erro ao salvar negativas",
    "de-DE": "Fehler beim Speichern der negativen Schlüsselwörter",
    "en-US": "Failed to save negative keywords"
  },
  toastDangerSuccess: {
    "pt-BR": "Os dados selecionados foram apagados com sucesso.",
    "de-DE": "Ausgewählte Daten wurden gelöscht.",
    "en-US": "Selected data deleted successfully."
  },
  toastDangerError: {
    "pt-BR": "Erro ao apagar dados",
    "de-DE": "Fehler beim Löschen der Daten",
    "en-US": "Failed to delete data"
  },
  statusSuccess: {
    "pt-BR": "Sucesso",
    "de-DE": "Erfolg",
    "en-US": "Success"
  },
  statusPreview: {
    "pt-BR": "Prévia",
    "de-DE": "Vorschau",
    "en-US": "Preview"
  },
  statusFailure: {
    "pt-BR": "Falha",
    "de-DE": "Fehler",
    "en-US": "Failure"
  },
  dangerDescription: {
    "pt-BR": "Remova transações, categorias, regras, aliases e logos com confirmação em etapas.",
    "de-DE": "Entfernen Sie Transaktionen, Kategorien, Regeln, Aliases und Logos mit Bestätigung.",
    "en-US": "Remove transactions, categories, rules, aliases, and logos with step confirmation."
  },
  dangerLastDeleted: {
    "pt-BR": "Última exclusão",
    "de-DE": "Letzte Löschung",
    "en-US": "Last deletion"
  },
  dangerLastTitle: {
    "pt-BR": "Última exclusão registrada",
    "de-DE": "Letzte Löschung erfasst",
    "en-US": "Last deletion recorded"
  },
  dangerSelectTitle: {
    "pt-BR": "Tem certeza que deseja apagar dados?",
    "de-DE": "Sind Sie sicher, dass Sie Daten löschen möchten?",
    "en-US": "Are you sure you want to delete data?"
  },
  dangerSelectDesc: {
    "pt-BR": "Selecione quais dados deseja remover:",
    "de-DE": "Wählen Sie aus, welche Daten entfernt werden sollen:",
    "en-US": "Select which data to remove:"
  },
  dangerOptionTransactions: {
    "pt-BR": "Transações",
    "de-DE": "Transaktionen",
    "en-US": "Transactions"
  },
  dangerOptionCategories: {
    "pt-BR": "Categorias e Regras",
    "de-DE": "Kategorien und Regeln",
    "en-US": "Categories and Rules"
  },
  dangerOptionAliases: {
    "pt-BR": "Aliases e Logos",
    "de-DE": "Aliases und Logos",
    "en-US": "Aliases and Logos"
  },
  dangerOptionAll: {
    "pt-BR": "Tudo (Reset total)",
    "de-DE": "Alles (Vollständiger Reset)",
    "en-US": "Everything (Full reset)"
  },
  dangerNext: {
    "pt-BR": "Avançar",
    "de-DE": "Weiter",
    "en-US": "Next"
  },
  dangerConfirmTitle: {
    "pt-BR": "Confirma exclusão permanente?",
    "de-DE": "Löschung endgültig bestätigen?",
    "en-US": "Confirm permanent deletion?"
  },
  dangerConfirmDesc: {
    "pt-BR": "Essa ação não pode ser desfeita. Confirme digitando \"APAGAR\".",
    "de-DE": "Diese Aktion kann nicht rückgängig gemacht werden. Bitte \"LÖSCHEN\" eingeben.",
    "en-US": "This action cannot be undone. Type \"DELETE\" to confirm."
  },
  dangerConfirmPlaceholder: {
    "pt-BR": "Digite APAGAR",
    "de-DE": "LÖSCHEN eingeben",
    "en-US": "Type DELETE"
  },
  dangerBack: {
    "pt-BR": "Voltar",
    "de-DE": "Zurück",
    "en-US": "Back"
  },
  dangerDoneTitle: {
    "pt-BR": "Exclusão concluída",
    "de-DE": "Löschung abgeschlossen",
    "en-US": "Deletion complete"
  },
  dangerDoneFallback: {
    "pt-BR": "Os dados selecionados foram apagados com sucesso.",
    "de-DE": "Ausgewählte Daten wurden gelöscht.",
    "en-US": "Selected data deleted successfully."
  },
  dangerDeletedItems: {
    "pt-BR": "Itens apagados",
    "de-DE": "Gelöschte Elemente",
    "en-US": "Deleted items"
  },
  dangerClose: {
    "pt-BR": "Fechar",
    "de-DE": "Schließen",
    "en-US": "Close"
  }
};

export const forecastCopy = {
  title: {
    "pt-BR": "Previsão & Recorrência",
    "de-DE": "Prognose & Wiederkehrend",
    "en-US": "Forecast & Recurrence"
  },
  subtitle: {
    "pt-BR": "Veja pagamentos recorrentes previstos, confiança e variações esperadas.",
    "de-DE": "Sehen Sie wiederkehrende Zahlungen mit Zuversicht und Abweichung.",
    "en-US": "See predicted recurring payments with confidence and variance."
  },
  preparing: {
    "pt-BR": "Em preparação",
    "de-DE": "In Vorbereitung",
    "en-US": "In preparation"
  },
  preparingBody: {
    "pt-BR": "Esta tela exibirá o calendário de previsões com razões e níveis de confiança.",
    "de-DE": "Diese Ansicht zeigt den Prognosekalender mit Begründungen und Zuversicht.",
    "en-US": "This view will show the forecast calendar with rationale and confidence."
  }
};
