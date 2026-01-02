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
