export type Locale = "pt-BR" | "de-DE" | "en-US";

export type TranslationTriplet = {
  "pt-BR": string;
  "de-DE": string;
  "en-US": string;
};

export function t(locale: Locale, triplet: TranslationTriplet) {
  return triplet[locale] || triplet["pt-BR"];
}

export const accountBadgeCopy = {
  noAccount: {
    "pt-BR": "Sem conta",
    "de-DE": "Kein Konto",
    "en-US": "No account"
  }
};

export const statusPanelCopy = {
  labels: {
    info: {
      "pt-BR": "Info",
      "de-DE": "Info",
      "en-US": "Info"
    },
    success: {
      "pt-BR": "Sucesso",
      "de-DE": "Erfolg",
      "en-US": "Success"
    },
    warning: {
      "pt-BR": "Aviso",
      "de-DE": "Warnung",
      "en-US": "Warning"
    },
    error: {
      "pt-BR": "Erro",
      "de-DE": "Fehler",
      "en-US": "Error"
    }
  }
};

export const aiAssistantButtonCopy = {
  title: {
    "pt-BR": "Assistente IA",
    "de-DE": "KI-Assistent",
    "en-US": "AI Assistant"
  }
};

export const sidebarCopy = {
  toggleLabel: {
    "pt-BR": "Alternar sidebar",
    "de-DE": "Seitenleiste umschalten",
    "en-US": "Toggle sidebar"
  }
};

export const spinnerCopy = {
  loading: {
    "pt-BR": "Carregando",
    "de-DE": "Lädt",
    "en-US": "Loading"
  }
};

export const paginationCopy = {
  previous: {
    "pt-BR": "Anterior",
    "de-DE": "Zurück",
    "en-US": "Previous"
  },
  next: {
    "pt-BR": "Próximo",
    "de-DE": "Weiter",
    "en-US": "Next"
  },
  previousAria: {
    "pt-BR": "Ir para a página anterior",
    "de-DE": "Zur vorherigen Seite",
    "en-US": "Go to previous page"
  },
  nextAria: {
    "pt-BR": "Ir para a próxima página",
    "de-DE": "Zur nächsten Seite",
    "en-US": "Go to next page"
  }
};

export const iconCopy = {
  accountDefault: {
    "pt-BR": "Conta",
    "de-DE": "Konto",
    "en-US": "Account"
  },
  transaction: {
    income: {
      "pt-BR": "Receita",
      "de-DE": "Einnahme",
      "en-US": "Income"
    },
    expense: {
      "pt-BR": "Despesa",
      "de-DE": "Ausgabe",
      "en-US": "Expense"
    },
    fixed: {
      "pt-BR": "Fixo",
      "de-DE": "Fix",
      "en-US": "Fixed"
    },
    variable: {
      "pt-BR": "Variável",
      "de-DE": "Variabel",
      "en-US": "Variable"
    },
    recurring: {
      "pt-BR": "Recorrente",
      "de-DE": "Wiederkehrend",
      "en-US": "Recurring"
    },
    refund: {
      "pt-BR": "Reembolso",
      "de-DE": "Erstattung",
      "en-US": "Refund"
    },
    internal: {
      "pt-BR": "Interna",
      "de-DE": "Intern",
      "en-US": "Internal"
    }
  },
  status: {
    unclassified: {
      "pt-BR": "Não classificado",
      "de-DE": "Nicht klassifiziert",
      "en-US": "Unclassified"
    },
    lowConfidence: {
      "pt-BR": "Baixa confiança",
      "de-DE": "Niedrige Zuversicht",
      "en-US": "Low confidence"
    },
    confirmed: {
      "pt-BR": "Confirmado",
      "de-DE": "Bestätigt",
      "en-US": "Confirmed"
    },
    needsReview: {
      "pt-BR": "Requer revisão",
      "de-DE": "Prüfung erforderlich",
      "en-US": "Needs review"
    }
  }
};

export const categoryLabels: Record<Locale, Record<string, string>> = {
  "pt-BR": {
    "Moradia": "Moradia",
    "Mercado": "Mercado",
    "Transporte": "Transporte",
    "Saúde": "Saúde",
    "Lazer": "Lazer",
    "Compras Online": "Compras Online",
    "Compras & Estilo de Vida": "Compras & Estilo de Vida",
    "Alimentação": "Alimentação",
    "Educação": "Educação",
    "Receitas": "Receitas",
    "Viagem": "Viagem",
    "Streaming": "Streaming",
    "Academia": "Academia",
    "Roupas": "Roupas",
    "Tecnologia": "Tecnologia",
    "Internet": "Internet",
    "Interno": "Interno",
    "Interna": "Interna",
    "Outros": "Outros",
    "Mobilidade": "Mobilidade",
    "Saúde & Seguros": "Saúde & Seguros",
    "Educação & Crianças": "Educação & Crianças",
    "Lazer & Viagens": "Lazer & Viagens",
    "Finanças & Transferências": "Finanças & Transferências",
    "Trabalho & Receitas": "Trabalho & Receitas",
    "Doações & Outros": "Doações & Outros",
    "Revisão & Não Classificado": "Revisão & Não Classificado"
  },
  "de-DE": {
    "Moradia": "Wohnen",
    "Mercado": "Lebensmittel",
    "Transporte": "Transport",
    "Saúde": "Gesundheit",
    "Lazer": "Freizeit",
    "Compras Online": "Online-Einkauf",
    "Compras & Estilo de Vida": "Shopping & Lifestyle",
    "Alimentação": "Essen",
    "Educação": "Bildung",
    "Receitas": "Einnahmen",
    "Viagem": "Reisen",
    "Streaming": "Streaming",
    "Academia": "Fitnessstudio",
    "Roupas": "Kleidung",
    "Tecnologia": "Technologie",
    "Internet": "Internet",
    "Interno": "Intern",
    "Interna": "Intern",
    "Outros": "Sonstiges",
    "Mobilidade": "Mobilität",
    "Saúde & Seguros": "Gesundheit & Versicherungen",
    "Educação & Crianças": "Bildung & Kinder",
    "Lazer & Viagens": "Freizeit & Reisen",
    "Finanças & Transferências": "Finanzen & Überweisungen",
    "Trabalho & Receitas": "Arbeit & Einnahmen",
    "Doações & Outros": "Spenden & Sonstiges",
    "Revisão & Não Classificado": "Review & Nicht klassifiziert"
  },
  "en-US": {
    "Moradia": "Housing",
    "Mercado": "Groceries",
    "Transporte": "Transport",
    "Saúde": "Health",
    "Lazer": "Leisure",
    "Compras Online": "Online shopping",
    "Compras & Estilo de Vida": "Shopping & lifestyle",
    "Alimentação": "Food",
    "Educação": "Education",
    "Receitas": "Income",
    "Viagem": "Travel",
    "Streaming": "Streaming",
    "Academia": "Gym",
    "Roupas": "Clothing",
    "Tecnologia": "Technology",
    "Internet": "Internet",
    "Interno": "Internal",
    "Interna": "Internal",
    "Outros": "Other",
    "Mobilidade": "Mobility",
    "Saúde & Seguros": "Health & insurance",
    "Educação & Crianças": "Education & children",
    "Lazer & Viagens": "Leisure & travel",
    "Finanças & Transferências": "Finance & transfers",
    "Trabalho & Receitas": "Work & income",
    "Doações & Outros": "Donations & other",
    "Revisão & Não Classificado": "Review & unclassified"
  }
};

export function translateCategory(locale: Locale, category?: string) {
  if (!category) return "";
  const labels = categoryLabels[locale] || categoryLabels["pt-BR"];
  return labels[category] || category;
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
  previewFailedTitle: {
    "pt-BR": "Pré-visualização falhou",
    "de-DE": "Vorschau fehlgeschlagen",
    "en-US": "Preview failed"
  },
  importSummaryTitle: {
    "pt-BR": "Resumo da importação",
    "de-DE": "Importzusammenfassung",
    "en-US": "Import summary"
  },
  validatingTransactions: {
    "pt-BR": "Validando e categorizando transações",
    "de-DE": "Transaktionen werden validiert und kategorisiert",
    "en-US": "Validating and categorizing transactions"
  },
  conflictResolved: {
    "pt-BR": "Resolução aplicada: {action} ({count} duplicadas)",
    "de-DE": "Auflösung angewendet: {action} ({count} Duplikate)",
    "en-US": "Resolution applied: {action} ({count} duplicates)"
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
  importDuplicatesSuffix: {
    "pt-BR": "{count} duplicadas",
    "de-DE": "{count} Duplikate",
    "en-US": "{count} duplicates"
  },
  importDuplicatesExisting: {
    "pt-BR": "{count} {label} já existem no sistema",
    "de-DE": "{count} {label} sind bereits im System vorhanden",
    "en-US": "{count} {label} already exist in the system"
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

export const notFoundCopy = {
  title: {
    "pt-BR": "Página não encontrada",
    "de-DE": "Seite nicht gefunden",
    "en-US": "Page not found"
  },
  subtitle: {
    "pt-BR": "Parece que você se perdeu. A página que você está procurando não existe ou foi movida.",
    "de-DE": "Es sieht so aus, als hätten Sie sich verirrt. Die Seite existiert nicht oder wurde verschoben.",
    "en-US": "It looks like you got lost. The page you're looking for doesn't exist or was moved."
  },
  backDashboard: {
    "pt-BR": "Voltar ao Dashboard",
    "de-DE": "Zurück zum Dashboard",
    "en-US": "Back to dashboard"
  },
  back: {
    "pt-BR": "Voltar",
    "de-DE": "Zurück",
    "en-US": "Go back"
  },
  popularPages: {
    "pt-BR": "Páginas populares:",
    "de-DE": "Beliebte Seiten:",
    "en-US": "Popular pages:"
  },
  helpTitle: {
    "pt-BR": "Precisa de ajuda?",
    "de-DE": "Brauchen Sie Hilfe?",
    "en-US": "Need help?"
  },
  helpBody: {
    "pt-BR": "Se você acha que isso é um erro, entre em contato com o suporte.",
    "de-DE": "Wenn Sie glauben, dass dies ein Fehler ist, kontaktieren Sie den Support.",
    "en-US": "If you think this is an error, contact support."
  },
  pageDashboard: {
    "pt-BR": "Dashboard",
    "de-DE": "Dashboard",
    "en-US": "Dashboard"
  },
  pageUploads: {
    "pt-BR": "Uploads",
    "de-DE": "Uploads",
    "en-US": "Uploads"
  },
  pageTransactions: {
    "pt-BR": "Transações",
    "de-DE": "Transaktionen",
    "en-US": "Transactions"
  }
};

export const keyboardShortcutsCopy = {
  title: {
    "pt-BR": "Atalhos de Teclado",
    "de-DE": "Tastenkürzel",
    "en-US": "Keyboard shortcuts"
  },
  tipLabel: {
    "pt-BR": "Dica:",
    "de-DE": "Tipp:",
    "en-US": "Tip:"
  },
  tipPrefix: {
    "pt-BR": "Pressione",
    "de-DE": "Drücken Sie",
    "en-US": "Press"
  },
  tipSuffix: {
    "pt-BR": "a qualquer momento para ver estes atalhos.",
    "de-DE": "jederzeit, um diese Tastenkürzel zu sehen.",
    "en-US": "at any time to view these shortcuts."
  },
  categoryGeneral: {
    "pt-BR": "Geral",
    "de-DE": "Allgemein",
    "en-US": "General"
  },
  categoryConfirmation: {
    "pt-BR": "Confirmação",
    "de-DE": "Bestätigung",
    "en-US": "Confirmation"
  },
  categoryTransactions: {
    "pt-BR": "Transações",
    "de-DE": "Transaktionen",
    "en-US": "Transactions"
  },
  categoryOther: {
    "pt-BR": "Outros",
    "de-DE": "Sonstiges",
    "en-US": "Other"
  },
  toggleShortcuts: {
    "pt-BR": "Mostrar/ocultar atalhos",
    "de-DE": "Tastenkürzel anzeigen/ausblenden",
    "en-US": "Show/hide shortcuts"
  },
  closeDialog: {
    "pt-BR": "Fechar modal ou diálogo",
    "de-DE": "Modal/Dialog schließen",
    "en-US": "Close modal or dialog"
  },
  confirmTransaction: {
    "pt-BR": "Confirmar transação selecionada",
    "de-DE": "Ausgewählte Transaktion bestätigen",
    "en-US": "Confirm selected transaction"
  },
  navigateTransactions: {
    "pt-BR": "Navegar entre transações",
    "de-DE": "Zwischen Transaktionen navigieren",
    "en-US": "Navigate between transactions"
  },
  toggleSelection: {
    "pt-BR": "Selecionar/desselecionar transação",
    "de-DE": "Transaktion auswählen/abwählen",
    "en-US": "Select/deselect transaction"
  },
  selectAll: {
    "pt-BR": "Selecionar todas as transações",
    "de-DE": "Alle Transaktionen auswählen",
    "en-US": "Select all transactions"
  },
  focusSearch: {
    "pt-BR": "Focar na busca",
    "de-DE": "Suche fokussieren",
    "en-US": "Focus search"
  },
  quickSearch: {
    "pt-BR": "Busca rápida (em breve)",
    "de-DE": "Schnellsuche (bald verfügbar)",
    "en-US": "Quick search (coming soon)"
  }
};

export const onboardingCopy = {
  step1Title: {
    "pt-BR": "Bem-vindo ao RitualFin",
    "de-DE": "Willkommen bei RitualFin",
    "en-US": "Welcome to RitualFin"
  },
  step1Description: {
    "pt-BR": "Sua vida financeira organizada em minutos, não horas.",
    "de-DE": "Ihre Finanzen in Minuten organisiert, nicht in Stunden.",
    "en-US": "Your financial life organized in minutes, not hours."
  },
  step1Body: {
    "pt-BR": "RitualFin usa inteligência artificial para categorizar suas transações automaticamente. Você só precisa revisar e confirmar.",
    "de-DE": "RitualFin nutzt KI, um Ihre Transaktionen automatisch zu kategorisieren. Sie müssen nur prüfen und bestätigen.",
    "en-US": "RitualFin uses AI to automatically categorize your transactions. You only need to review and confirm."
  },
  step1CardImport: {
    "pt-BR": "Importe CSV",
    "de-DE": "CSV importieren",
    "en-US": "Import CSV"
  },
  step1CardAi: {
    "pt-BR": "IA Categoriza",
    "de-DE": "KI kategorisiert",
    "en-US": "AI categorizes"
  },
  step1CardConfirm: {
    "pt-BR": "Você Confirma",
    "de-DE": "Sie bestätigen",
    "en-US": "You confirm"
  },
  step1BadgeTitle: {
    "pt-BR": "Modo Lazy Ativado",
    "de-DE": "Lazy-Modus aktiviert",
    "en-US": "Lazy mode enabled"
  },
  step1BadgeBody: {
    "pt-BR": "O sistema aprende com suas confirmações e melhora a cada mês.",
    "de-DE": "Das System lernt aus Ihren Bestätigungen und verbessert sich monatlich.",
    "en-US": "The system learns from your confirmations and improves each month."
  },
  step2Title: {
    "pt-BR": "Bancos Suportados",
    "de-DE": "Unterstützte Banken",
    "en-US": "Supported banks"
  },
  step2Description: {
    "pt-BR": "Importe extratos de múltiplos bancos e cartões.",
    "de-DE": "Importieren Sie Auszüge von mehreren Banken und Karten.",
    "en-US": "Import statements from multiple banks and cards."
  },
  step2Body: {
    "pt-BR": "RitualFin detecta automaticamente o formato do seu CSV e extrai todas as informações.",
    "de-DE": "RitualFin erkennt das CSV-Format automatisch und extrahiert alle Informationen.",
    "en-US": "RitualFin automatically detects your CSV format and extracts all information."
  },
  step2MilesDesc: {
    "pt-BR": "Cartão de crédito Lufthansa",
    "de-DE": "Lufthansa-Kreditkarte",
    "en-US": "Lufthansa credit card"
  },
  step2AmexDesc: {
    "pt-BR": "Multi-cartões suportado",
    "de-DE": "Mehrere Karten unterstützt",
    "en-US": "Multi-card supported"
  },
  step2SparkasseDesc: {
    "pt-BR": "Conta bancária IBAN",
    "de-DE": "IBAN-Bankkonto",
    "en-US": "IBAN bank account"
  },
  statusActive: {
    "pt-BR": "Ativo",
    "de-DE": "Aktiv",
    "en-US": "Active"
  },
  step2ComingSoon: {
    "pt-BR": "Em breve: Nubank, Revolut, N26, Wise",
    "de-DE": "Demnächst: Nubank, Revolut, N26, Wise",
    "en-US": "Coming soon: Nubank, Revolut, N26, Wise"
  },
  step3Title: {
    "pt-BR": "Pronto para começar!",
    "de-DE": "Bereit loszulegen!",
    "en-US": "Ready to start!"
  },
  step3Description: {
    "pt-BR": "Vamos importar seu primeiro arquivo CSV.",
    "de-DE": "Lassen Sie uns Ihre erste CSV importieren.",
    "en-US": "Let's import your first CSV file."
  },
  step3Body: {
    "pt-BR": "Depois de importar, você poderá:",
    "de-DE": "Nach dem Import können Sie:",
    "en-US": "After importing, you'll be able to:"
  },
  step3BulletReviewTitle: {
    "pt-BR": "Revisar transações pendentes",
    "de-DE": "Offene Transaktionen prüfen",
    "en-US": "Review pending transactions"
  },
  step3BulletReviewBody: {
    "pt-BR": "Confirme as categorizações sugeridas pela IA",
    "de-DE": "Bestätigen Sie die von der KI vorgeschlagenen Kategorien",
    "en-US": "Confirm the categories suggested by AI"
  },
  step3BulletRulesTitle: {
    "pt-BR": "Criar regras de categorização",
    "de-DE": "Kategorisierungsregeln erstellen",
    "en-US": "Create categorization rules"
  },
  step3BulletRulesBody: {
    "pt-BR": "Ensine o sistema a reconhecer suas despesas recorrentes",
    "de-DE": "Bringen Sie dem System wiederkehrende Ausgaben bei",
    "en-US": "Teach the system to recognize recurring expenses"
  },
  step3BulletInsightsTitle: {
    "pt-BR": "Visualizar insights financeiros",
    "de-DE": "Finanzielle Insights ansehen",
    "en-US": "View financial insights"
  },
  step3BulletInsightsBody: {
    "pt-BR": "Dashboard com gastos por categoria e projeções",
    "de-DE": "Dashboard mit Ausgaben nach Kategorie und Prognosen",
    "en-US": "Dashboard with category spend and forecasts"
  },
  step3Tip: {
    "pt-BR": "Dica: Comece importando o último mês para ver o RitualFin em ação!",
    "de-DE": "Tipp: Importieren Sie den letzten Monat, um RitualFin in Aktion zu sehen!",
    "en-US": "Tip: Start by importing the last month to see RitualFin in action!"
  },
  back: {
    "pt-BR": "Voltar",
    "de-DE": "Zurück",
    "en-US": "Back"
  },
  skipIntro: {
    "pt-BR": "Pular introdução",
    "de-DE": "Einführung überspringen",
    "en-US": "Skip intro"
  },
  next: {
    "pt-BR": "Próximo",
    "de-DE": "Weiter",
    "en-US": "Next"
  },
  start: {
    "pt-BR": "Começar",
    "de-DE": "Starten",
    "en-US": "Start"
  }
};

export const layoutCopy = {
  nav: {
    "pt-BR": {
      dashboard: "Painel",
      transactions: "Transações",
      settings: "Configurações",
      uploadCsv: "Upload CSV"
    },
    "de-DE": {
      dashboard: "Dashboard",
      transactions: "Transaktionen",
      settings: "Einstellungen",
      uploadCsv: "CSV hochladen"
    },
    "en-US": {
      dashboard: "Dashboard",
      transactions: "Transactions",
      settings: "Settings",
      uploadCsv: "Upload CSV"
    }
  },
  sidebar: {
    "pt-BR": {
      period: "Período",
      system: "Sistema",
      toggleGroup: "Alternar grupo {group}",
      groups: {
        overview: "Visão Geral",
        operations: "Operações",
        planning: "Planejamento",
        rituals: "Rituais"
      },
      items: {
        dashboard: "Dashboard",
        calendar: "Calendário",
        forecast: "Previsão",
        transactions: "Transações",
        accounts: "Contas",
        insights: "Insights",
        upload: "Upload",
        confirm: "Lista de Confirmação",
        rules: "Regras",
        aiKeywords: "AI Keywords",
        notifications: "Notificações",
        budgets: "Orçamento",
        goals: "Metas",
        ritualWeekly: "Semanal",
        ritualMonthly: "Mensal",
        settings: "Configurações",
        logout: "Sair"
      },
      descriptions: {
        dashboard: "Visão geral do mês",
        calendar: "Eventos e compromissos",
        forecast: "Recorrências e projeções",
        transactions: "Histórico completo",
        accounts: "Gerenciar cartões e contas",
        insights: "Leituras e tendências",
        upload: "Importar CSV",
        confirm: "Pendências para revisar",
        rules: "Gerenciar regras",
        aiKeywords: "Sugestões com IA",
        notifications: "Alertas e mensagens",
        budgets: "Limites por categoria",
        goals: "Planejamento financeiro",
        ritualWeekly: "Revisão semanal",
        ritualMonthly: "Revisão mensal"
      }
    },
    "de-DE": {
      period: "Zeitraum",
      system: "System",
      toggleGroup: "Gruppe {group} umschalten",
      groups: {
        overview: "Übersicht",
        operations: "Operationen",
        planning: "Planung",
        rituals: "Rituale"
      },
      items: {
        dashboard: "Dashboard",
        calendar: "Kalender",
        forecast: "Prognose",
        transactions: "Transaktionen",
        accounts: "Konten",
        insights: "Insights",
        upload: "Upload",
        confirm: "Bestätigungsliste",
        rules: "Regeln",
        aiKeywords: "AI Keywords",
        notifications: "Benachrichtigungen",
        budgets: "Budget",
        goals: "Ziele",
        ritualWeekly: "Wöchentlich",
        ritualMonthly: "Monatlich",
        settings: "Einstellungen",
        logout: "Abmelden"
      },
      descriptions: {
        dashboard: "Monatsübersicht",
        calendar: "Ereignisse und Termine",
        forecast: "Wiederkehrendes und Prognosen",
        transactions: "Vollständige Historie",
        accounts: "Karten und Konten verwalten",
        insights: "Auswertungen und Trends",
        upload: "CSV importieren",
        confirm: "Ausstehende prüfen",
        rules: "Regeln verwalten",
        aiKeywords: "KI-Vorschläge",
        notifications: "Warnungen und Nachrichten",
        budgets: "Grenzen pro Kategorie",
        goals: "Finanzplanung",
        ritualWeekly: "Wöchentliche Prüfung",
        ritualMonthly: "Monatliche Prüfung"
      }
    },
    "en-US": {
      period: "Period",
      system: "System",
      toggleGroup: "Toggle {group} group",
      groups: {
        overview: "Overview",
        operations: "Operations",
        planning: "Planning",
        rituals: "Rituals"
      },
      items: {
        dashboard: "Dashboard",
        calendar: "Calendar",
        forecast: "Forecast",
        transactions: "Transactions",
        accounts: "Accounts",
        insights: "Insights",
        upload: "Upload",
        confirm: "Confirmation list",
        rules: "Rules",
        aiKeywords: "AI Keywords",
        notifications: "Notifications",
        budgets: "Budget",
        goals: "Goals",
        ritualWeekly: "Weekly",
        ritualMonthly: "Monthly",
        settings: "Settings",
        logout: "Log out"
      },
      descriptions: {
        dashboard: "Monthly overview",
        calendar: "Events and commitments",
        forecast: "Recurrence and projections",
        transactions: "Full history",
        accounts: "Manage cards and accounts",
        insights: "Readouts and trends",
        upload: "Import CSV",
        confirm: "Pending reviews",
        rules: "Manage rules",
        aiKeywords: "AI suggestions",
        notifications: "Alerts and messages",
        budgets: "Limits by category",
        goals: "Financial planning",
        ritualWeekly: "Weekly review",
        ritualMonthly: "Monthly review"
      }
    }
  }
};

export const loginCopy = {
  tagline: {
    "pt-BR": "Gestão Financeira Inteligente",
    "de-DE": "Intelligentes Finanzmanagement",
    "en-US": "Smart financial management"
  },
  welcomeTitle: {
    "pt-BR": "Bem-vindo de volta",
    "de-DE": "Willkommen zurück",
    "en-US": "Welcome back"
  },
  welcomeSubtitle: {
    "pt-BR": "Gerencie suas finanças com clareza e simplicidade",
    "de-DE": "Verwalten Sie Ihre Finanzen klar und einfach",
    "en-US": "Manage your finances with clarity and simplicity"
  },
  demoTitle: {
    "pt-BR": "Modo Demo Ativo",
    "de-DE": "Demo-Modus aktiv",
    "en-US": "Demo mode active"
  },
  demoBody: {
    "pt-BR": "Clique em qualquer botão para entrar. Sem necessidade de credenciais.",
    "de-DE": "Klicken Sie auf eine Schaltfläche, um sich anzumelden. Keine Zugangsdaten erforderlich.",
    "en-US": "Click any button to sign in. No credentials needed."
  },
  googleContinue: {
    "pt-BR": "Continuar com Google",
    "de-DE": "Mit Google fortfahren",
    "en-US": "Continue with Google"
  },
  googleSuccess: {
    "pt-BR": "Conectado! Redirecionando...",
    "de-DE": "Verbunden! Weiterleitung...",
    "en-US": "Connected! Redirecting..."
  },
  divider: {
    "pt-BR": "ou continue com email",
    "de-DE": "oder weiter mit E-Mail",
    "en-US": "or continue with email"
  },
  emailLabel: {
    "pt-BR": "Email",
    "de-DE": "E-Mail",
    "en-US": "Email"
  },
  emailPlaceholder: {
    "pt-BR": "seu@email.com",
    "de-DE": "dein@email.com",
    "en-US": "you@email.com"
  },
  passwordLabel: {
    "pt-BR": "Senha",
    "de-DE": "Passwort",
    "en-US": "Password"
  },
  passwordPlaceholder: {
    "pt-BR": "Digite sua senha",
    "de-DE": "Passwort eingeben",
    "en-US": "Enter your password"
  },
  forgot: {
    "pt-BR": "Esqueceu?",
    "de-DE": "Vergessen?",
    "en-US": "Forgot?"
  },
  loginAction: {
    "pt-BR": "Entrar",
    "de-DE": "Anmelden",
    "en-US": "Sign in"
  },
  loginLoading: {
    "pt-BR": "Entrando...",
    "de-DE": "Anmeldung...",
    "en-US": "Signing in..."
  },
  loginSuccess: {
    "pt-BR": "Sucesso!",
    "de-DE": "Erfolg!",
    "en-US": "Success!"
  },
  signupPrompt: {
    "pt-BR": "Não tem uma conta?",
    "de-DE": "Sie haben noch kein Konto?",
    "en-US": "Don't have an account?"
  },
  signupCta: {
    "pt-BR": "Cadastre-se gratuitamente",
    "de-DE": "Kostenlos registrieren",
    "en-US": "Sign up for free"
  },
  footer: {
    "pt-BR": "Feito com ❤️ para simplificar suas finanças.",
    "de-DE": "Mit ❤️ gebaut, um Ihre Finanzen zu vereinfachen.",
    "en-US": "Made with ❤️ to simplify your finances."
  }
};

export const insightsCopy = {
  title: {
    "pt-BR": "Insights",
    "de-DE": "Insights",
    "en-US": "Insights"
  },
  subtitle: {
    "pt-BR": "Leituras automáticas para {month}.",
    "de-DE": "Automatische Einblicke für {month}.",
    "en-US": "Automated insights for {month}."
  },
  savedTitle: {
    "pt-BR": "Economia em {category}",
    "de-DE": "Ersparnis bei {category}",
    "en-US": "Savings in {category}"
  },
  savedDescription: {
    "pt-BR": "Você economizou {percent}% em {category} comparado ao mês anterior.",
    "de-DE": "Sie haben {percent}% bei {category} gegenüber dem Vormonat gespart.",
    "en-US": "You saved {percent}% on {category} compared to last month."
  },
  warningTitle: {
    "pt-BR": "Atenção com {category}",
    "de-DE": "Achtung bei {category}",
    "en-US": "Watch out for {category}"
  },
  warningDescription: {
    "pt-BR": "Seus gastos em {category} aumentaram {percent}% este mês.",
    "de-DE": "Ihre Ausgaben für {category} sind diesen Monat um {percent}% gestiegen.",
    "en-US": "Your spending on {category} increased {percent}% this month."
  },
  neutralTitle: {
    "pt-BR": "Gastos estáveis no período",
    "de-DE": "Ausgaben im Zeitraum stabil",
    "en-US": "Spending steady for the period"
  },
  neutralDescription: {
    "pt-BR": "Continue acompanhando para manter o controle financeiro.",
    "de-DE": "Behalten Sie den Überblick, um die Finanzen im Griff zu behalten.",
    "en-US": "Keep tracking to maintain financial control."
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
  toastConfirmed: {
    "pt-BR": "{count} transação(ões) confirmada(s)",
    "de-DE": "{count} Transaktion(en) bestätigt",
    "en-US": "{count} transaction(s) confirmed"
  },
  statusSuccessTitle: {
    "pt-BR": "Confirmação concluída",
    "de-DE": "Bestätigung abgeschlossen",
    "en-US": "Confirmation completed"
  },
  statusSuccessBody: {
    "pt-BR": "{count} transação(ões) confirmada(s).",
    "de-DE": "{count} Transaktion(en) bestätigt.",
    "en-US": "{count} transaction(s) confirmed."
  },
  statusErrorTitle: {
    "pt-BR": "Falha ao confirmar transações",
    "de-DE": "Bestätigung fehlgeschlagen",
    "en-US": "Failed to confirm transactions"
  },
  statusErrorBody: {
    "pt-BR": "Não foi possível concluir a confirmação.",
    "de-DE": "Bestätigung konnte nicht abgeschlossen werden.",
    "en-US": "Confirmation could not be completed."
  },
  acceptHigh: {
    "pt-BR": "Aceitar alta confiança",
    "de-DE": "Hohe Zuversicht akzeptieren",
    "en-US": "Accept high confidence"
  },
  autoBadge: {
    "pt-BR": "Auto",
    "de-DE": "Auto",
    "en-US": "Auto"
  },
  aiBadge: {
    "pt-BR": "IA",
    "de-DE": "KI",
    "en-US": "AI"
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
  statusReapplyFailedBody: {
    "pt-BR": "Não foi possível reaplicar as regras.",
    "de-DE": "Die Regeln konnten nicht erneut angewendet werden.",
    "en-US": "Could not reapply rules."
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
  },
  aiBadge: {
    "pt-BR": "IA",
    "de-DE": "KI",
    "en-US": "AI"
  },
  categoriesLabel: {
    "pt-BR": "Categorias",
    "de-DE": "Kategorien",
    "en-US": "Categories"
  },
  searchPlaceholder: {
    "pt-BR": "Buscar regras por palavra-chave...",
    "de-DE": "Regeln nach Stichwort suchen...",
    "en-US": "Search rules by keyword..."
  },
  filterCategoryPlaceholder: {
    "pt-BR": "Categoria",
    "de-DE": "Kategorie",
    "en-US": "Category"
  },
  filterAllCategories: {
    "pt-BR": "Todas Categorias",
    "de-DE": "Alle Kategorien",
    "en-US": "All categories"
  },
  createManual: {
    "pt-BR": "Criar Manualmente",
    "de-DE": "Manuell erstellen",
    "en-US": "Create manually"
  },
  strictBadge: {
    "pt-BR": "Estrita",
    "de-DE": "Strikt",
    "en-US": "Strict"
  },
  dialogEditTitle: {
    "pt-BR": "Editar Regra",
    "de-DE": "Regel bearbeiten",
    "en-US": "Edit rule"
  },
  dialogNewTitle: {
    "pt-BR": "Nova Regra",
    "de-DE": "Neue Regel",
    "en-US": "New rule"
  },
  fieldNameLabel: {
    "pt-BR": "Nome",
    "de-DE": "Name",
    "en-US": "Name"
  },
  fieldNamePlaceholder: {
    "pt-BR": "Ex: Supermercado LIDL",
    "de-DE": "z. B. Supermarkt LIDL",
    "en-US": "e.g. Supermarket LIDL"
  },
  fieldCategory1Label: {
    "pt-BR": "Categoria (Nível 1)",
    "de-DE": "Kategorie (Ebene 1)",
    "en-US": "Category (Level 1)"
  },
  fieldCategory2Label: {
    "pt-BR": "Subcategoria (Nível 2)",
    "de-DE": "Unterkategorie (Ebene 2)",
    "en-US": "Subcategory (Level 2)"
  },
  fieldCategory3Label: {
    "pt-BR": "Especificação (Nível 3)",
    "de-DE": "Spezifizierung (Ebene 3)",
    "en-US": "Specification (Level 3)"
  },
  fieldCategory2Placeholder: {
    "pt-BR": "Ex: Supermercado",
    "de-DE": "z. B. Supermarkt",
    "en-US": "e.g. Supermarket"
  },
  fieldCategory3Placeholder: {
    "pt-BR": "Ex: LIDL",
    "de-DE": "z. B. LIDL",
    "en-US": "e.g. LIDL"
  },
  fieldKeywordsLabel: {
    "pt-BR": "Palavras-chave",
    "de-DE": "Schlüsselwörter",
    "en-US": "Keywords"
  },
  fieldKeywordsPlaceholder: {
    "pt-BR": "REWE;EDEKA;ALDI (separar com ;)",
    "de-DE": "REWE;EDEKA;ALDI (mit ; trennen)",
    "en-US": "REWE;EDEKA;ALDI (separate with ;)"
  },
  fieldKeywordsHelper: {
    "pt-BR": "Separe múltiplas palavras com ponto e vírgula (;)",
    "de-DE": "Mehrere Wörter mit Semikolon (;) trennen",
    "en-US": "Separate multiple words with semicolons (;)"
  },
  fieldTypeLabel: {
    "pt-BR": "Tipo",
    "de-DE": "Typ",
    "en-US": "Type"
  },
  fieldTypeExpense: {
    "pt-BR": "Despesa",
    "de-DE": "Ausgabe",
    "en-US": "Expense"
  },
  fieldTypeIncome: {
    "pt-BR": "Receita",
    "de-DE": "Einnahme",
    "en-US": "Income"
  },
  fieldVariationLabel: {
    "pt-BR": "Variação",
    "de-DE": "Variation",
    "en-US": "Variation"
  },
  fieldVariationFixed: {
    "pt-BR": "Fixo",
    "de-DE": "Fix",
    "en-US": "Fixed"
  },
  fieldVariationVariable: {
    "pt-BR": "Variável",
    "de-DE": "Variabel",
    "en-US": "Variable"
  },
  strictTitle: {
    "pt-BR": "Regra Estrita",
    "de-DE": "Strikte Regel",
    "en-US": "Strict rule"
  },
  strictDescription: {
    "pt-BR": "Aplicar automaticamente com 100% confiança",
    "de-DE": "Automatisch mit 100 % Vertrauen anwenden",
    "en-US": "Apply automatically with 100% confidence"
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
  create: {
    "pt-BR": "Criar",
    "de-DE": "Erstellen",
    "en-US": "Create"
  },
  exportLabel: {
    "pt-BR": "Exportar",
    "de-DE": "Exportieren",
    "en-US": "Export"
  },
  exportSuccessTitle: {
    "pt-BR": "{count} regras exportadas com sucesso",
    "de-DE": "{count} Regeln erfolgreich exportiert",
    "en-US": "{count} rules exported successfully"
  },
  exportSuccessBody: {
    "pt-BR": "Inclui categorias disponíveis e instruções",
    "de-DE": "Enthält verfügbare Kategorien und Anweisungen",
    "en-US": "Includes available categories and instructions"
  },
  statusRuleCreatedBody: {
    "pt-BR": "A nova regra foi adicionada com sucesso.",
    "de-DE": "Die neue Regel wurde erfolgreich hinzugefügt.",
    "en-US": "The new rule was added successfully."
  },
  statusRuleUpdatedBody: {
    "pt-BR": "As alterações foram salvas.",
    "de-DE": "Die Änderungen wurden gespeichert.",
    "en-US": "Changes have been saved."
  },
  statusRuleRemovedBody: {
    "pt-BR": "A regra foi excluída com sucesso.",
    "de-DE": "Die Regel wurde erfolgreich gelöscht.",
    "en-US": "The rule was deleted successfully."
  },
  statusRuleCreateFailedBody: {
    "pt-BR": "Não foi possível criar a regra.",
    "de-DE": "Die Regel konnte nicht erstellt werden.",
    "en-US": "Could not create the rule."
  },
  statusRuleUpdateFailedBody: {
    "pt-BR": "Não foi possível atualizar a regra.",
    "de-DE": "Die Regel konnte nicht aktualisiert werden.",
    "en-US": "Could not update the rule."
  },
  statusRuleRemoveFailedBody: {
    "pt-BR": "Não foi possível remover a regra.",
    "de-DE": "Die Regel konnte nicht entfernt werden.",
    "en-US": "Could not remove the rule."
  },
  reapplyToastTitle: {
    "pt-BR": "Regras reaplicadas",
    "de-DE": "Regeln erneut angewendet",
    "en-US": "Rules reapplied"
  },
  reapplyToastBody: {
    "pt-BR": "{categorized} categorizadas automaticamente, {pending} pendentes",
    "de-DE": "{categorized} automatisch kategorisiert, {pending} ausstehend",
    "en-US": "{categorized} auto-categorized, {pending} pending"
  },
  aiAddedToastTitle: {
    "pt-BR": "{count} regras IA adicionadas",
    "de-DE": "{count} KI-Regeln hinzugefügt",
    "en-US": "{count} AI rules added"
  },
  aiAddedToastBody: {
    "pt-BR": "{count} regras importadas pela IA.",
    "de-DE": "{count} Regeln wurden von der KI importiert.",
    "en-US": "{count} rules imported by AI."
  },
  importEmptyBody: {
    "pt-BR": "O arquivo está vazio.",
    "de-DE": "Die Datei ist leer.",
    "en-US": "The file is empty."
  },
  importErrorsTitle: {
    "pt-BR": "Erros encontrados no arquivo",
    "de-DE": "Fehler in der Datei gefunden",
    "en-US": "Errors found in file"
  },
  importNoValidBody: {
    "pt-BR": "Nenhuma regra válida encontrada no arquivo.",
    "de-DE": "Keine gültigen Regeln in der Datei gefunden.",
    "en-US": "No valid rules found in the file."
  },
  importSuccessBody: {
    "pt-BR": "{count} regras importadas com sucesso.",
    "de-DE": "{count} Regeln erfolgreich importiert.",
    "en-US": "{count} rules imported successfully."
  },
  importPartialTitle: {
    "pt-BR": "Importação concluída com erros",
    "de-DE": "Import abgeschlossen mit Fehlern",
    "en-US": "Import completed with errors"
  },
  importPartialBody: {
    "pt-BR": "{success} importadas, {fail} falharam",
    "de-DE": "{success} importiert, {fail} fehlgeschlagen",
    "en-US": "{success} imported, {fail} failed"
  },
  importProcessErrorTitle: {
    "pt-BR": "Erro ao processar arquivo",
    "de-DE": "Fehler beim Verarbeiten der Datei",
    "en-US": "Error processing file"
  },
  importProcessErrorBody: {
    "pt-BR": "Não foi possível processar o arquivo.",
    "de-DE": "Die Datei konnte nicht verarbeitet werden.",
    "en-US": "Could not process the file."
  },
  importRowNameError: {
    "pt-BR": "Linha {row}: Nome é obrigatório",
    "de-DE": "Zeile {row}: Name ist erforderlich",
    "en-US": "Row {row}: Name is required"
  },
  importRowKeywordsError: {
    "pt-BR": "Linha {row}: Palavras-chave é obrigatório",
    "de-DE": "Zeile {row}: Schlüsselwörter sind erforderlich",
    "en-US": "Row {row}: Keywords are required"
  },
  importRowTypeError: {
    "pt-BR": "Linha {row}: Tipo deve ser \"Despesa\" ou \"Receita\"",
    "de-DE": "Zeile {row}: Typ muss \"Ausgabe\" oder \"Einnahme\" sein",
    "en-US": "Row {row}: Type must be \"Expense\" or \"Income\""
  },
  importRowFixVarError: {
    "pt-BR": "Linha {row}: Deve ser \"Fixo\" ou \"Variável\"",
    "de-DE": "Zeile {row}: Muss \"Fix\" oder \"Variabel\" sein",
    "en-US": "Row {row}: Must be \"Fixed\" or \"Variable\""
  },
  importRowCategoryError: {
    "pt-BR": "Linha {row}: Categoria 1 é obrigatória",
    "de-DE": "Zeile {row}: Kategorie 1 ist erforderlich",
    "en-US": "Row {row}: Category 1 is required"
  },
  exportSheetRules: {
    "pt-BR": "Regras",
    "de-DE": "Regeln",
    "en-US": "Rules"
  },
  exportSheetCategories: {
    "pt-BR": "Categorias Disponíveis",
    "de-DE": "Verfügbare Kategorien",
    "en-US": "Available Categories"
  },
  exportSheetInstructions: {
    "pt-BR": "Instruções",
    "de-DE": "Anweisungen",
    "en-US": "Instructions"
  },
  exportInstructionHeader: {
    "pt-BR": "INSTRUÇÕES",
    "de-DE": "ANWEISUNGEN",
    "en-US": "INSTRUCTIONS"
  },
  exportColumns: {
    "pt-BR": {
      name: "Nome",
      type: "Tipo (Despesa/Receita)",
      fixVar: "Fixo/Variável",
      category1: "Categoria 1",
      category2: "Categoria 2",
      category3: "Categoria 3",
      keywords: "Palavras-chave",
      priority: "Prioridade",
      strict: "Regra Estrita",
      system: "Sistema"
    },
    "de-DE": {
      name: "Name",
      type: "Typ (Ausgabe/Einnahme)",
      fixVar: "Fix/Variabel",
      category1: "Kategorie 1",
      category2: "Kategorie 2",
      category3: "Kategorie 3",
      keywords: "Schlüsselwörter",
      priority: "Priorität",
      strict: "Strikte Regel",
      system: "System"
    },
    "en-US": {
      name: "Name",
      type: "Type (Expense/Income)",
      fixVar: "Fixed/Variable",
      category1: "Category 1",
      category2: "Category 2",
      category3: "Category 3",
      keywords: "Keywords",
      priority: "Priority",
      strict: "Strict Rule",
      system: "System"
    }
  },
  exportCategoryHeaders: {
    "pt-BR": {
      level1: "Categoria Nível 1",
      level2: "Exemplos Nível 2",
      level3: "Exemplos Nível 3"
    },
    "de-DE": {
      level1: "Kategorie Ebene 1",
      level2: "Beispiele Ebene 2",
      level3: "Beispiele Ebene 3"
    },
    "en-US": {
      level1: "Category Level 1",
      level2: "Level 2 Examples",
      level3: "Level 3 Examples"
    }
  },
  exportInstructions: {
    "pt-BR": [
      "Como usar este arquivo de regras",
      "",
      "1. Aba \"Regras\": Suas regras de categorização atuais",
      "2. Aba \"Categorias Disponíveis\": Lista completa de categorias e exemplos",
      "",
      "Para importar regras:",
      "- Edite a aba \"Regras\" com suas alterações",
      "- Use categorias da aba \"Categorias Disponíveis\"",
      "- Categorias 2 e 3 são opcionais",
      "- Salve e importe de volta no RitualFin",
      "",
      "Hierarquia de Categorias:",
      "- Nível 1: Categoria principal (obrigatório)",
      "- Nível 2: Subcategoria (opcional, texto livre)",
      "- Nível 3: Especificação (opcional, texto livre)"
    ],
    "de-DE": [
      "So verwenden Sie diese Regeldatei",
      "",
      "1. Tab \"Regeln\": Ihre aktuellen Kategorisierungsregeln",
      "2. Tab \"Verfügbare Kategorien\": Vollständige Kategorienliste mit Beispielen",
      "",
      "Regeln importieren:",
      "- Bearbeiten Sie den Tab \"Regeln\" mit Ihren Änderungen",
      "- Verwenden Sie Kategorien aus \"Verfügbare Kategorien\"",
      "- Kategorien 2 und 3 sind optional",
      "- Speichern und in RitualFin erneut importieren",
      "",
      "Kategorienhierarchie:",
      "- Ebene 1: Hauptkategorie (erforderlich)",
      "- Ebene 2: Unterkategorie (optional, Freitext)",
      "- Ebene 3: Spezifizierung (optional, Freitext)"
    ],
    "en-US": [
      "How to use this rules file",
      "",
      "1. Tab \"Rules\": Your current categorization rules",
      "2. Tab \"Available Categories\": Full list of categories and examples",
      "",
      "To import rules:",
      "- Edit the \"Rules\" tab with your changes",
      "- Use categories from \"Available Categories\"",
      "- Categories 2 and 3 are optional",
      "- Save and import back into RitualFin",
      "",
      "Category hierarchy:",
      "- Level 1: Primary category (required)",
      "- Level 2: Subcategory (optional, free text)",
      "- Level 3: Specification (optional, free text)"
    ]
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
  toastSettingsSaved: {
    "pt-BR": "Configurações salvas",
    "de-DE": "Einstellungen gespeichert",
    "en-US": "Settings saved"
  },
  toastSettingsSavedBody: {
    "pt-BR": "Suas preferências foram atualizadas com sucesso.",
    "de-DE": "Ihre Einstellungen wurden erfolgreich aktualisiert.",
    "en-US": "Your preferences were updated successfully."
  },
  toastSettingsErrorTitle: {
    "pt-BR": "Erro ao salvar",
    "de-DE": "Fehler beim Speichern",
    "en-US": "Save error"
  },
  toastSettingsErrorBody: {
    "pt-BR": "Não foi possível salvar as configurações.",
    "de-DE": "Die Einstellungen konnten nicht gespeichert werden.",
    "en-US": "Could not save settings."
  },
  previewValidationFailed: {
    "pt-BR": "Falha na validação do arquivo.",
    "de-DE": "Dateivalidierung fehlgeschlagen.",
    "en-US": "File validation failed."
  },
  previewFailedTitle: {
    "pt-BR": "Pré-visualização falhou",
    "de-DE": "Vorschau fehlgeschlagen",
    "en-US": "Preview failed"
  },
  previewDoneTitle: {
    "pt-BR": "Pré-visualização concluída",
    "de-DE": "Vorschau abgeschlossen",
    "en-US": "Preview completed"
  },
  previewDoneBody: {
    "pt-BR": "Revisão pronta para confirmação.",
    "de-DE": "Überprüfung bereit zur Bestätigung.",
    "en-US": "Review ready for confirmation."
  },
  previewErrorTitle: {
    "pt-BR": "Erro na pré-visualização",
    "de-DE": "Fehler bei der Vorschau",
    "en-US": "Preview error"
  },
  importAppliedTitle: {
    "pt-BR": "Importação aplicada",
    "de-DE": "Import angewendet",
    "en-US": "Import applied"
  },
  importAppliedBody: {
    "pt-BR": "Importação concluída: {count} linhas aplicadas.",
    "de-DE": "Import abgeschlossen: {count} Zeilen angewendet.",
    "en-US": "Import completed: {count} rows applied."
  },
  importAppliedRows: {
    "pt-BR": "Linhas aplicadas: {count}",
    "de-DE": "Angewendete Zeilen: {count}",
    "en-US": "Rows applied: {count}"
  },
  applyFailedMessage: {
    "pt-BR": "Falha ao aplicar: {error}",
    "de-DE": "Anwenden fehlgeschlagen: {error}",
    "en-US": "Failed to apply: {error}"
  },
  aliasesAppliedTitle: {
    "pt-BR": "Aliases aplicados",
    "de-DE": "Aliases angewendet",
    "en-US": "Aliases applied"
  },
  importApplyFailedTitle: {
    "pt-BR": "Falha ao aplicar importação",
    "de-DE": "Import konnte nicht angewendet werden",
    "en-US": "Failed to apply import"
  },
  importApplyFailedBody: {
    "pt-BR": "Não foi possível aplicar a importação.",
    "de-DE": "Import konnte nicht angewendet werden.",
    "en-US": "Could not apply the import."
  },
  aliasesApplyFailedBody: {
    "pt-BR": "Não foi possível aplicar os aliases.",
    "de-DE": "Die Aliase konnten nicht angewendet werden.",
    "en-US": "Could not apply aliases."
  },
  logosApplyFailedBody: {
    "pt-BR": "Não foi possível aplicar os logos.",
    "de-DE": "Die Logos konnten nicht angewendet werden.",
    "en-US": "Could not apply logos."
  },
  exportAuditTitle: {
    "pt-BR": "Exportação concluída",
    "de-DE": "Export abgeschlossen",
    "en-US": "Export completed"
  },
  exportAuditBody: {
    "pt-BR": "O arquivo CSV do log foi gerado com sucesso.",
    "de-DE": "Die CSV-Datei des Logs wurde erfolgreich erstellt.",
    "en-US": "The audit log CSV was generated successfully."
  },
  exportAuditErrorTitle: {
    "pt-BR": "Falha ao exportar log",
    "de-DE": "Log-Export fehlgeschlagen",
    "en-US": "Failed to export log"
  },
  exportAuditErrorBody: {
    "pt-BR": "Não foi possível exportar o log de auditoria.",
    "de-DE": "Audit-Log konnte nicht exportiert werden.",
    "en-US": "Could not export audit log."
  },
  logosProcessedLabel: {
    "pt-BR": "Processados: {count}",
    "de-DE": "Verarbeitet: {count}",
    "en-US": "Processed: {count}"
  },
  refreshLogosTotal: {
    "pt-BR": "Total: {count}",
    "de-DE": "Gesamt: {count}",
    "en-US": "Total: {count}"
  },
  dangerSummaryTransactions: {
    "pt-BR": "Transações",
    "de-DE": "Transaktionen",
    "en-US": "Transactions"
  },
  dangerSummaryCategories: {
    "pt-BR": "Categorias e Regras",
    "de-DE": "Kategorien und Regeln",
    "en-US": "Categories and Rules"
  },
  dangerSummaryAliases: {
    "pt-BR": "Aliases e Logos",
    "de-DE": "Aliases und Logos",
    "en-US": "Aliases and Logos"
  },
  dangerSummaryAll: {
    "pt-BR": "Tudo",
    "de-DE": "Alles",
    "en-US": "Everything"
  },
  profileNameDefault: {
    "pt-BR": "Usuário",
    "de-DE": "Benutzer",
    "en-US": "User"
  },
  csvExportAccents: {
    "pt-BR": "Exportações CSV usam UTF-8 com BOM para preservar acentos.",
    "de-DE": "CSV-Exporte verwenden UTF-8 mit BOM, um Akzente zu erhalten.",
    "en-US": "CSV exports use UTF-8 with BOM to preserve accents."
  },
  csvDownloadsAccents: {
    "pt-BR": "Downloads em CSV são gerados em UTF-8 com BOM para preservar acentos.",
    "de-DE": "CSV-Downloads werden in UTF-8 mit BOM erzeugt, um Akzente zu erhalten.",
    "en-US": "CSV downloads are generated in UTF-8 with BOM to preserve accents."
  },
  classificationSectionTitle: {
    "pt-BR": "Classificação & Dados",
    "de-DE": "Klassifikation & Daten",
    "en-US": "Classification & Data"
  },
  classificationSectionBody: {
    "pt-BR": "Importações, categorias, aliases e revisão de pendências.",
    "de-DE": "Importe, Kategorien, Aliase und Review offener Punkte.",
    "en-US": "Imports, categories, aliases, and pending reviews."
  },
  classificationTabCategories: {
    "pt-BR": "Categorias",
    "de-DE": "Kategorien",
    "en-US": "Categories"
  },
  classificationTabRules: {
    "pt-BR": "Regras KeyWords",
    "de-DE": "Keyword-Regeln",
    "en-US": "Keyword rules"
  },
  classificationTabReview: {
    "pt-BR": "Fila de Revisão",
    "de-DE": "Review-Queue",
    "en-US": "Review queue"
  },
  downloadTemplateCsv: {
    "pt-BR": "Baixar template CSV",
    "de-DE": "CSV-Template herunterladen",
    "en-US": "Download CSV template"
  },
  downloadDataCsv: {
    "pt-BR": "Baixar dados CSV",
    "de-DE": "CSV-Daten herunterladen",
    "en-US": "Download CSV data"
  },
  downloadExcel: {
    "pt-BR": "Baixar Excel",
    "de-DE": "Excel herunterladen",
    "en-US": "Download Excel"
  },
  reviewQueueTab: {
    "pt-BR": "Fila de Revisão",
    "de-DE": "Review-Queue",
    "en-US": "Review queue"
  },
  reviewQueueFilesHint: {
    "pt-BR": "Os arquivos de extrato ficam em Operações → Upload.",
    "de-DE": "Auszugsdateien finden Sie unter Operationen → Upload.",
    "en-US": "Statement files are under Operations → Upload."
  },
  reviewQueueFilesHintPrefix: {
    "pt-BR": "Os arquivos de extrato ficam em",
    "de-DE": "Auszugsdateien finden Sie unter",
    "en-US": "Statement files are under"
  },
  reviewQueueFilesHintLink: {
    "pt-BR": "Operações → Upload",
    "de-DE": "Operationen → Upload",
    "en-US": "Operations → Upload"
  },
  lastImportTitle: {
    "pt-BR": "Última importação",
    "de-DE": "Letzter Import",
    "en-US": "Last import"
  },
  lastImportRows: {
    "pt-BR": "{valid}/{total} linhas válidas",
    "de-DE": "{valid}/{total} gültige Zeilen",
    "en-US": "{valid}/{total} valid rows"
  },
  lastImportEmpty: {
    "pt-BR": "Sem importações anteriores.",
    "de-DE": "Keine vorherigen Importe.",
    "en-US": "No previous imports."
  },
  previewReasonCodeLabel: {
    "pt-BR": "Código: {codes}",
    "de-DE": "Code: {codes}",
    "en-US": "Code: {codes}"
  },
  changePreviewTitle: {
    "pt-BR": "Prévia de alterações",
    "de-DE": "Vorschau der Änderungen",
    "en-US": "Change preview"
  },
  previewEncodingLabel: {
    "pt-BR": "Codificação",
    "de-DE": "Kodierung",
    "en-US": "Encoding"
  },
  previewDelimiterLabel: {
    "pt-BR": "Delimitador",
    "de-DE": "Trennzeichen",
    "en-US": "Delimiter"
  },
  previewRowsLabel: {
    "pt-BR": "Linhas",
    "de-DE": "Zeilen",
    "en-US": "Rows"
  },
  previewColumnsLabel: {
    "pt-BR": "Colunas",
    "de-DE": "Spalten",
    "en-US": "Columns"
  },
  previewColumnsDetectedTitle: {
    "pt-BR": "Colunas detectadas",
    "de-DE": "Erkannte Spalten",
    "en-US": "Detected columns"
  },
  previewNewCategories: {
    "pt-BR": "Novas categorias",
    "de-DE": "Neue Kategorien",
    "en-US": "New categories"
  },
  previewRemoved: {
    "pt-BR": "Removidas",
    "de-DE": "Entfernt",
    "en-US": "Removed"
  },
  previewUpdatedRules: {
    "pt-BR": "Regras atualizadas",
    "de-DE": "Regeln aktualisiert",
    "en-US": "Rules updated"
  },
  previewSamplePrefix: {
    "pt-BR": "Ex.:",
    "de-DE": "Bsp.:",
    "en-US": "E.g.:"
  },
  confirmRemapLabel: {
    "pt-BR": "Confirmo o remapeamento de categorias da UI",
    "de-DE": "Ich bestätige die UI-Kategorien-Zuordnung",
    "en-US": "I confirm the UI category remapping"
  },
  dialogCancel: {
    "pt-BR": "Cancelar",
    "de-DE": "Abbrechen",
    "en-US": "Cancel"
  },
  rulesEditorTitle: {
    "pt-BR": "Editor de Regras",
    "de-DE": "Regel-Editor",
    "en-US": "Rules editor"
  },
  rulesEditorBody: {
    "pt-BR": "Gerencie regras de classificação baseadas em KeyWords.",
    "de-DE": "Verwalten Sie Klassifizierungsregeln auf Keyword-Basis.",
    "en-US": "Manage classification rules based on keywords."
  },
  rulesEditorAction: {
    "pt-BR": "Abrir Regras",
    "de-DE": "Regeln öffnen",
    "en-US": "Open rules"
  },
  aiKeywordsTitle: {
    "pt-BR": "AI Keywords",
    "de-DE": "KI-Keywords",
    "en-US": "AI Keywords"
  },
  aiKeywordsBody: {
    "pt-BR": "Revisão de sugestões automáticas de palavras-chave.",
    "de-DE": "Überprüfung automatischer Keyword-Vorschläge.",
    "en-US": "Review automatic keyword suggestions."
  },
  aiKeywordsAction: {
    "pt-BR": "Ver sugestões",
    "de-DE": "Vorschläge ansehen",
    "en-US": "View suggestions"
  },
  aliasTestTitle: {
    "pt-BR": "Teste de alias (key_desc)",
    "de-DE": "Alias-Test (key_desc)",
    "en-US": "Alias test (key_desc)"
  },
  aliasTestAction: {
    "pt-BR": "Testar",
    "de-DE": "Testen",
    "en-US": "Test"
  },
  aliasTestResult: {
    "pt-BR": "Alias: {alias}",
    "de-DE": "Alias: {alias}",
    "en-US": "Alias: {alias}"
  },
  aliasTestNone: {
    "pt-BR": "nenhum",
    "de-DE": "keiner",
    "en-US": "none"
  },
  refreshLogosAction: {
    "pt-BR": "Atualizar logos",
    "de-DE": "Logos aktualisieren",
    "en-US": "Refresh logos"
  },
  confirmChangesTitle: {
    "pt-BR": "Deseja aplicar as alterações?",
    "de-DE": "Änderungen anwenden?",
    "en-US": "Apply changes?"
  },
  confirmChangesBody: {
    "pt-BR": "Isso atualizará regras existentes. Revise a pré-visualização antes de continuar.",
    "de-DE": "Dies aktualisiert bestehende Regeln. Bitte Vorschau prüfen.",
    "en-US": "This will update existing rules. Review the preview before continuing."
  },
  classificationRulesTitle: {
    "pt-BR": "Gerencie regras de classificação baseadas em KeyWords.",
    "de-DE": "Verwalten Sie klassifizierende Regeln basierend auf Keywords.",
    "en-US": "Manage classification rules based on keywords."
  },
  classificationSuggestionsTitle: {
    "pt-BR": "Revisão de sugestões automáticas de palavras-chave.",
    "de-DE": "Überprüfung automatischer Keyword-Vorschläge.",
    "en-US": "Review automatic keyword suggestions."
  },
  classificationSuggestionsAction: {
    "pt-BR": "Ver sugestões",
    "de-DE": "Vorschläge ansehen",
    "en-US": "View suggestions"
  },
  classificationAssistTitle: {
    "pt-BR": "Assistência de Classificação",
    "de-DE": "Klassifizierungsassistenz",
    "en-US": "Classification assistance"
  },
  classificationAssistBody: {
    "pt-BR": "Ajuste o nível de confiança para auto-confirmação.",
    "de-DE": "Passen Sie die Vertrauensschwelle für Auto-Bestätigung an.",
    "en-US": "Adjust confidence threshold for auto-confirmation."
  },
  autoConfirmTitle: {
    "pt-BR": "Auto-confirmar Alta Confiança",
    "de-DE": "Hohe Zuversicht automatisch bestätigen",
    "en-US": "Auto-confirm high confidence"
  },
  autoConfirmBody: {
    "pt-BR": "Aceitar automaticamente sugestões acima do limite.",
    "de-DE": "Vorschläge oberhalb des Grenzwerts automatisch akzeptieren.",
    "en-US": "Automatically accept suggestions above the threshold."
  },
  confidenceLimitLabel: {
    "pt-BR": "Limite de Confiança",
    "de-DE": "Vertrauensschwelle",
    "en-US": "Confidence threshold"
  },
  confidenceLimitHint: {
    "pt-BR": "Transações acima desse limite serão confirmadas automaticamente.",
    "de-DE": "Transaktionen über diesem Wert werden automatisch bestätigt.",
    "en-US": "Transactions above this threshold will be auto-confirmed."
  },
  rulesValidationTitle: {
    "pt-BR": "Valide o comportamento de regras e expressões.",
    "de-DE": "Validieren Sie das Verhalten von Regeln und Ausdrücken.",
    "en-US": "Validate rule and expression behavior."
  },
  ruleTestTitle: {
    "pt-BR": "Teste de Regra (key_desc)",
    "de-DE": "Regeltest (key_desc)",
    "en-US": "Rule test (key_desc)"
  },
  ruleTestAction: {
    "pt-BR": "Testar",
    "de-DE": "Testen",
    "en-US": "Test"
  },
  ruleTestResult: {
    "pt-BR": "Leaf: {leaf} | Regra: {rule}",
    "de-DE": "Leaf: {leaf} | Regel: {rule}",
    "en-US": "Leaf: {leaf} | Rule: {rule}"
  },
  ruleTestNone: {
    "pt-BR": "nenhuma",
    "de-DE": "keine",
    "en-US": "none"
  },
  expressionsHint: {
    "pt-BR": "Expressões são separadas apenas por “;”. Espaços dentro da expressão não são divididos.",
    "de-DE": "Ausdrücke werden nur durch “;” getrennt. Leerzeichen innerhalb des Ausdrucks bleiben erhalten.",
    "en-US": "Expressions are separated only by “;”. Spaces inside an expression are not split."
  },
  levelPlaceholder1: {
    "pt-BR": "Nível 1",
    "de-DE": "Ebene 1",
    "en-US": "Level 1"
  },
  levelPlaceholder2: {
    "pt-BR": "Nível 2",
    "de-DE": "Ebene 2",
    "en-US": "Level 2"
  },
  levelPlaceholder3: {
    "pt-BR": "Nível 3 (folha)",
    "de-DE": "Ebene 3 (Blatt)",
    "en-US": "Level 3 (leaf)"
  },
  newExpressionPlaceholder: {
    "pt-BR": "Nova expressão (opcional, uma por vez)",
    "de-DE": "Neuer Ausdruck (optional, einzeln)",
    "en-US": "New expression (optional, one at a time)"
  },
  reviewApplyAction: {
    "pt-BR": "Aplicar",
    "de-DE": "Anwenden",
    "en-US": "Apply"
  },
  reviewKeywordsCurrent: {
    "pt-BR": "Key words atuais",
    "de-DE": "Aktuelle Keywords",
    "en-US": "Current keywords"
  },
  reviewKeywordsEmpty: {
    "pt-BR": "Nenhuma palavra-chave cadastrada.",
    "de-DE": "Keine Keywords vorhanden.",
    "en-US": "No keywords saved."
  },
  reviewKeywordsNegative: {
    "pt-BR": "Key words negativos",
    "de-DE": "Negative Keywords",
    "en-US": "Negative keywords"
  },
  reviewKeywordsNegativeEmpty: {
    "pt-BR": "Nenhuma negativa cadastrada.",
    "de-DE": "Keine negativen Keywords vorhanden.",
    "en-US": "No negative keywords saved."
  },
  addExpressionsTitle: {
    "pt-BR": "Adicionar novas expressões",
    "de-DE": "Neue Ausdrücke hinzufügen",
    "en-US": "Add new expressions"
  },
  keywordsPlaceholder: {
    "pt-BR": "Palavras-chave (use ';' entre expressões)",
    "de-DE": "Schlüsselwörter (mit ';' trennen)",
    "en-US": "Keywords (use ';' between expressions)"
  },
  keywordsNegativePlaceholder: {
    "pt-BR": "Palavras-chave negativas (use ';')",
    "de-DE": "Negative Schlüsselwörter (mit ';')",
    "en-US": "Negative keywords (use ';')"
  },
  saveKeywordsAdd: {
    "pt-BR": "Salvar +",
    "de-DE": "Speichern +",
    "en-US": "Save +"
  },
  saveKeywordsRemove: {
    "pt-BR": "Salvar -",
    "de-DE": "Speichern -",
    "en-US": "Save -"
  },
  expressionsHelp: {
    "pt-BR": "Cada expressão deve ser separada por ponto e vírgula (;). Ex: 'Farmácia Müller; Apotheke'.",
    "de-DE": "Jeder Ausdruck muss durch Semikolon (;) getrennt sein. Z. B. 'Farmácia Müller; Apotheke'.",
    "en-US": "Each expression must be separated by a semicolon (;). E.g. 'Farmácia Müller; Apotheke'."
  },
  dictionaryTitle: {
    "pt-BR": "Dicionário de Comerciantes",
    "de-DE": "Händlerverzeichnis",
    "en-US": "Merchant dictionary"
  },
  dictionarySubtitle: {
    "pt-BR": "Gerencie aliases padronizados para descrições de transações",
    "de-DE": "Standardisierte Aliase für Transaktionsbeschreibungen verwalten",
    "en-US": "Manage standardized aliases for transaction descriptions"
  },
  dictionaryCardTitle: {
    "pt-BR": "Centralize suas descrições",
    "de-DE": "Beschreibungen zentralisieren",
    "en-US": "Centralize your descriptions"
  },
  dictionaryCardBody: {
    "pt-BR": "Crie aliases personalizados para comerciantes e transações recorrentes.",
    "de-DE": "Erstellen Sie Aliase für Händler und wiederkehrende Transaktionen.",
    "en-US": "Create custom aliases for merchants and recurring transactions."
  },
  dictionaryCardBody2: {
    "pt-BR": "Mantenha suas finanças organizadas com descrições consistentes e fáceis de entender.",
    "de-DE": "Halten Sie Ihre Finanzen mit konsistenten, leicht verständlichen Beschreibungen organisiert.",
    "en-US": "Keep your finances organized with consistent, easy-to-understand descriptions."
  },
  dictionaryAction: {
    "pt-BR": "Acessar Dicionário Completo",
    "de-DE": "Vollständiges Verzeichnis öffnen",
    "en-US": "Open full dictionary"
  },
  aliasesSectionTitle: {
    "pt-BR": "Aliases (CSV UTF-8 com BOM)",
    "de-DE": "Aliases (CSV UTF-8 mit BOM)",
    "en-US": "Aliases (CSV UTF-8 with BOM)"
  },
  aliasesSectionDesc: {
    "pt-BR": "Importe e exporte aliases com acentos preservados.",
    "de-DE": "Aliases importieren/exportieren mit erhaltenen Akzenten.",
    "en-US": "Import and export aliases with accents preserved."
  },
  logosSectionTitle: {
    "pt-BR": "Logos (CSV UTF-8 com BOM)",
    "de-DE": "Logos (CSV UTF-8 mit BOM)",
    "en-US": "Logos (CSV UTF-8 with BOM)"
  },
  logosSectionDesc: {
    "pt-BR": "Importe logos e refresque imagens armazenadas.",
    "de-DE": "Logos importieren und gespeicherte Bilder aktualisieren.",
    "en-US": "Import logos and refresh stored images."
  },
  requiredColumnsLabel: {
    "pt-BR": "Colunas obrigatórias: Alias_Desc · Key_words_alias · URL_icon_internet",
    "de-DE": "Pflichtspalten: Alias_Desc · Key_words_alias · URL_icon_internet",
    "en-US": "Required columns: Alias_Desc · Key_words_alias · URL_icon_internet"
  },
  previewHeader: {
    "pt-BR": "Pré-visualizar",
    "de-DE": "Vorschau",
    "en-US": "Preview"
  },
  logosTableAlias: {
    "pt-BR": "Alias",
    "de-DE": "Alias",
    "en-US": "Alias"
  },
  logosTableStatus: {
    "pt-BR": "Status",
    "de-DE": "Status",
    "en-US": "Status"
  },
  integrationsIntro: {
    "pt-BR": "Conecte suas contas bancárias e cartões via importação CSV.",
    "de-DE": "Verbinden Sie Ihre Bankkonten und Karten per CSV-Import.",
    "en-US": "Connect your bank accounts and cards via CSV import."
  },
  integrationsTitle: {
    "pt-BR": "Fontes de Dados",
    "de-DE": "Datenquellen",
    "en-US": "Data sources"
  },
  integrationsCsvLabel: {
    "pt-BR": "Integração via CSV",
    "de-DE": "CSV-Integration",
    "en-US": "CSV integration"
  },
  integrationsMappingAction: {
    "pt-BR": "Ver mapeamento CSV",
    "de-DE": "CSV-Mapping ansehen",
    "en-US": "View CSV mapping"
  },
  integrationsMappingTitle: {
    "pt-BR": "Mapeamento CSV · {name}",
    "de-DE": "CSV-Mapping · {name}",
    "en-US": "CSV mapping · {name}"
  },
  integrationsSoon: {
    "pt-BR": "Em breve: importação de capturas/fotos de extrato (documentado, não implementado).",
    "de-DE": "Demnächst: Import von Kontoauszug-Fotos (dokumentiert, nicht implementiert).",
    "en-US": "Coming soon: import statement captures/photos (documented, not implemented)."
  },
  integrationsNext: {
    "pt-BR": "Próximas integrações: Nubank, Revolut, N26, Wise",
    "de-DE": "Nächste Integrationen: Nubank, Revolut, N26, Wise",
    "en-US": "Next integrations: Nubank, Revolut, N26, Wise"
  },
  integrationsRulesTitle: {
    "pt-BR": "Regras de importação e contratos esperados.",
    "de-DE": "Importregeln und erwartete Verträge.",
    "en-US": "Import rules and expected contracts."
  },
  integrationsEncodingLabel: {
    "pt-BR": "Codificação",
    "de-DE": "Kodierung",
    "en-US": "Encoding"
  },
  integrationsDateFormatLabel: {
    "pt-BR": "Formato de Data",
    "de-DE": "Datumsformat",
    "en-US": "Date format"
  },
  integrationsHeadersLabel: {
    "pt-BR": "Cabeçalhos obrigatórios",
    "de-DE": "Pflicht-Header",
    "en-US": "Required headers"
  },
  integrationsPreviewColumnsLabel: {
    "pt-BR": "Colunas do preview",
    "de-DE": "Vorschau-Spalten",
    "en-US": "Preview columns"
  },
  integrationsKeyFieldsLabel: {
    "pt-BR": "Campos-chave usados pelo pipeline",
    "de-DE": "Schlüsselfelder im Pipeline",
    "en-US": "Key fields used by the pipeline"
  },
  integrationsFailuresLabel: {
    "pt-BR": "Falhas comuns (com ações)",
    "de-DE": "Häufige Fehler (mit Aktionen)",
    "en-US": "Common failures (with actions)"
  },
  integrationsPhotosSoon: {
    "pt-BR": "Em breve: importação de fotos/prints de extrato diretamente pelo app.",
    "de-DE": "Demnächst: Import von Auszugsfotos direkt in der App.",
    "en-US": "Coming soon: import statement photos directly in the app."
  },
  auditSectionIntro: {
    "pt-BR": "Registro de importações, alterações e exclusões críticas.",
    "de-DE": "Protokoll von Importen, Änderungen und kritischen Löschungen.",
    "en-US": "Log of imports, changes, and critical deletions."
  },
  dangerCompletedAt: {
    "pt-BR": "Concluída em {date}.",
    "de-DE": "Abgeschlossen am {date}.",
    "en-US": "Completed on {date}."
  },
  dangerCompletedAtShort: {
    "pt-BR": "Concluído em {date}.",
    "de-DE": "Abgeschlossen am {date}.",
    "en-US": "Completed on {date}."
  }
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
  },
  auditActionLabels: {
    "pt-BR": {
      importacao_csv: "Importação CSV",
      importacao_classificacao: "Importação de categorias",
      importacao_aliases: "Importação de aliases",
      importacao_logos: "Importação de logos",
      importacao_dados: "Importação de dados",
      regra_criada: "Regra criada",
      regra_atualizada: "Regra atualizada",
      regra_excluida: "Regra excluída",
      regra_keywords_add: "KeyWords adicionadas",
      regra_keywords_create: "Regra por KeyWords",
      regra_keywords_negative_add: "Negativas adicionadas",
      regra_keywords_negative_create: "Regra com negativas",
      fila_revisao_classificacao: "Fila de revisão",
      alias_import_apply: "Aliases aplicados",
      logos_import: "Logos importados",
      logos_refresh: "Logos atualizados",
      zona_de_perigo_delete: "Zona de perigo"
    },
    "de-DE": {
      importacao_csv: "CSV-Import",
      importacao_classificacao: "Kategorieimport",
      importacao_aliases: "Alias-Import",
      importacao_logos: "Logo-Import",
      importacao_dados: "Datenimport",
      regra_criada: "Regel erstellt",
      regra_atualizada: "Regel aktualisiert",
      regra_excluida: "Regel gelöscht",
      regra_keywords_add: "Keywords hinzugefügt",
      regra_keywords_create: "Keyword-Regel",
      regra_keywords_negative_add: "Negative Keywords hinzugefügt",
      regra_keywords_negative_create: "Regel mit negativen Keywords",
      fila_revisao_classificacao: "Review-Queue",
      alias_import_apply: "Aliases angewendet",
      logos_import: "Logos importiert",
      logos_refresh: "Logos aktualisiert",
      zona_de_perigo_delete: "Gefahrenzone"
    },
    "en-US": {
      importacao_csv: "CSV import",
      importacao_classificacao: "Category import",
      importacao_aliases: "Alias import",
      importacao_logos: "Logo import",
      importacao_dados: "Data import",
      regra_criada: "Rule created",
      regra_atualizada: "Rule updated",
      regra_excluida: "Rule deleted",
      regra_keywords_add: "Keywords added",
      regra_keywords_create: "Keyword rule",
      regra_keywords_negative_add: "Negative keywords added",
      regra_keywords_negative_create: "Rule with negatives",
      fila_revisao_classificacao: "Review queue",
      alias_import_apply: "Aliases applied",
      logos_import: "Logos imported",
      logos_refresh: "Logos refreshed",
      zona_de_perigo_delete: "Danger zone"
    }
  },
  integrationProviders: {
    "pt-BR": [
      {
        id: "miles_and_more",
        name: "Miles & More",
        logo: "/providers/miles-and-more.svg",
        status: "Ativo",
        csv: {
          delimiter: ";",
          encoding: "UTF-8 com BOM (Excel) ou ISO-8859-1",
          dateFormat: "dd.mm.yyyy",
          requiredHeaders: ["Authorised on", "Amount", "Currency", "Description", "Payment type", "Status"],
          previewColumns: [
            "Fonte",
            "Data (bookingDate)",
            "Valor",
            "Moeda",
            "Descrição (simpleDesc)",
            "Key Desc",
            "Conta",
            "Key"
          ],
          keyFields: "key_desc + bookingDate + amount (+ processed on como referência)",
          failureReasons: [
            "Colunas obrigatórias ausentes (baixe o template e não renomeie colunas).",
            "Delimitador inconsistente (exporte com ';' como separador).",
            "Codificação inválida (salve como CSV UTF-8 com BOM)."
          ]
        }
      },
      {
        id: "amex",
        name: "American Express",
        logo: "/providers/american-express.svg",
        status: "Ativo",
        csv: {
          delimiter: ",",
          encoding: "UTF-8 com BOM (Excel) ou ISO-8859-1",
          dateFormat: "dd/mm/yyyy",
          requiredHeaders: ["Datum", "Beschreibung", "Karteninhaber", "Betrag"],
          previewColumns: [
            "Fonte",
            "Data (bookingDate)",
            "Valor",
            "Moeda",
            "Descrição (simpleDesc)",
            "Key Desc",
            "Conta",
            "Key"
          ],
          keyFields: "key_desc + bookingDate + amount (+ Betreff como referência)",
          failureReasons: [
            "Cabeçalhos Amex ausentes (Datum, Beschreibung, Karteninhaber, Betrag).",
            "Arquivo não está em CSV ou está com delimitador errado (use ',').",
            "Caracteres corrompidos (reexporte em UTF-8 com BOM)."
          ]
        }
      },
      {
        id: "sparkasse",
        name: "Sparkasse",
        logo: "/providers/sparkasse.svg",
        status: "Ativo",
        csv: {
          delimiter: ";",
          encoding: "UTF-8 com BOM (Excel) ou ISO-8859-1",
          dateFormat: "dd.mm.yyyy",
          requiredHeaders: ["Auftragskonto", "Buchungstag", "Verwendungszweck", "Betrag"],
          previewColumns: [
            "Fonte",
            "Data (bookingDate)",
            "Valor",
            "Moeda",
            "Descrição (simpleDesc)",
            "Key Desc",
            "Conta",
            "Key"
          ],
          keyFields: "key_desc + bookingDate + amount (+ referência/IBAN quando disponível)",
          failureReasons: [
            "Colunas obrigatórias Sparkasse ausentes (reexporte o CSV original).",
            "Delimitador diferente de ';' (ajuste o separador no Excel).",
            "Data inválida no formato dd.mm.yyyy (verifique a coluna Buchungstag)."
          ]
        }
      }
    ],
    "de-DE": [
      {
        id: "miles_and_more",
        name: "Miles & More",
        logo: "/providers/miles-and-more.svg",
        status: "Aktiv",
        csv: {
          delimiter: ";",
          encoding: "UTF-8 mit BOM (Excel) oder ISO-8859-1",
          dateFormat: "dd.mm.yyyy",
          requiredHeaders: ["Authorised on", "Amount", "Currency", "Description", "Payment type", "Status"],
          previewColumns: [
            "Quelle",
            "Datum (bookingDate)",
            "Betrag",
            "Währung",
            "Beschreibung (simpleDesc)",
            "Key Desc",
            "Konto",
            "Key"
          ],
          keyFields: "key_desc + bookingDate + amount (+ processed on als Referenz)",
          failureReasons: [
            "Pflichtspalten fehlen (Template herunterladen und Spalten nicht umbenennen).",
            "Inkonsistentes Trennzeichen (mit ';' exportieren).",
            "Ungültige Kodierung (als CSV UTF-8 mit BOM speichern)."
          ]
        }
      },
      {
        id: "amex",
        name: "American Express",
        logo: "/providers/american-express.svg",
        status: "Aktiv",
        csv: {
          delimiter: ",",
          encoding: "UTF-8 mit BOM (Excel) oder ISO-8859-1",
          dateFormat: "dd/mm/yyyy",
          requiredHeaders: ["Datum", "Beschreibung", "Karteninhaber", "Betrag"],
          previewColumns: [
            "Quelle",
            "Datum (bookingDate)",
            "Betrag",
            "Währung",
            "Beschreibung (simpleDesc)",
            "Key Desc",
            "Konto",
            "Key"
          ],
          keyFields: "key_desc + bookingDate + amount (+ Betreff als Referenz)",
          failureReasons: [
            "Amex-Header fehlen (Datum, Beschreibung, Karteninhaber, Betrag).",
            "Datei ist kein CSV oder falsches Trennzeichen (verwenden Sie ',').",
            "Zeichen beschädigt (als UTF-8 mit BOM erneut exportieren)."
          ]
        }
      },
      {
        id: "sparkasse",
        name: "Sparkasse",
        logo: "/providers/sparkasse.svg",
        status: "Aktiv",
        csv: {
          delimiter: ";",
          encoding: "UTF-8 mit BOM (Excel) oder ISO-8859-1",
          dateFormat: "dd.mm.yyyy",
          requiredHeaders: ["Auftragskonto", "Buchungstag", "Verwendungszweck", "Betrag"],
          previewColumns: [
            "Quelle",
            "Datum (bookingDate)",
            "Betrag",
            "Währung",
            "Beschreibung (simpleDesc)",
            "Key Desc",
            "Konto",
            "Key"
          ],
          keyFields: "key_desc + bookingDate + amount (+ Referenz/IBAN wenn verfügbar)",
          failureReasons: [
            "Pflichtspalten der Sparkasse fehlen (CSV erneut exportieren).",
            "Trennzeichen ungleich ';' (Separator in Excel anpassen).",
            "Ungültiges Datum im Format dd.mm.yyyy (Spalte Buchungstag prüfen)."
          ]
        }
      }
    ],
    "en-US": [
      {
        id: "miles_and_more",
        name: "Miles & More",
        logo: "/providers/miles-and-more.svg",
        status: "Active",
        csv: {
          delimiter: ";",
          encoding: "UTF-8 with BOM (Excel) or ISO-8859-1",
          dateFormat: "dd.mm.yyyy",
          requiredHeaders: ["Authorised on", "Amount", "Currency", "Description", "Payment type", "Status"],
          previewColumns: [
            "Source",
            "Date (bookingDate)",
            "Amount",
            "Currency",
            "Description (simpleDesc)",
            "Key Desc",
            "Account",
            "Key"
          ],
          keyFields: "key_desc + bookingDate + amount (+ processed on as reference)",
          failureReasons: [
            "Missing required columns (download the template and do not rename columns).",
            "Inconsistent delimiter (export with ';' as separator).",
            "Invalid encoding (save as CSV UTF-8 with BOM)."
          ]
        }
      },
      {
        id: "amex",
        name: "American Express",
        logo: "/providers/american-express.svg",
        status: "Active",
        csv: {
          delimiter: ",",
          encoding: "UTF-8 with BOM (Excel) or ISO-8859-1",
          dateFormat: "dd/mm/yyyy",
          requiredHeaders: ["Datum", "Beschreibung", "Karteninhaber", "Betrag"],
          previewColumns: [
            "Source",
            "Date (bookingDate)",
            "Amount",
            "Currency",
            "Description (simpleDesc)",
            "Key Desc",
            "Account",
            "Key"
          ],
          keyFields: "key_desc + bookingDate + amount (+ Betreff as reference)",
          failureReasons: [
            "Missing Amex headers (Datum, Beschreibung, Karteninhaber, Betrag).",
            "File is not CSV or has wrong delimiter (use ',').",
            "Corrupted characters (re-export as UTF-8 with BOM)."
          ]
        }
      },
      {
        id: "sparkasse",
        name: "Sparkasse",
        logo: "/providers/sparkasse.svg",
        status: "Active",
        csv: {
          delimiter: ";",
          encoding: "UTF-8 with BOM (Excel) or ISO-8859-1",
          dateFormat: "dd.mm.yyyy",
          requiredHeaders: ["Auftragskonto", "Buchungstag", "Verwendungszweck", "Betrag"],
          previewColumns: [
            "Source",
            "Date (bookingDate)",
            "Amount",
            "Currency",
            "Description (simpleDesc)",
            "Key Desc",
            "Account",
            "Key"
          ],
          keyFields: "key_desc + bookingDate + amount (+ reference/IBAN when available)",
          failureReasons: [
            "Missing Sparkasse required columns (re-export the original CSV).",
            "Delimiter differs from ';' (adjust separator in Excel).",
            "Invalid date in dd.mm.yyyy format (check Buchungstag column)."
          ]
        }
      }
    ]
  }
};

export const aiChatCopy = {
  title: {
    "pt-BR": "Assistente IA",
    "de-DE": "KI-Assistent",
    "en-US": "AI Assistant"
  },
  poweredBy: {
    "pt-BR": "Powered by GPT-4",
    "de-DE": "Powered by GPT-4",
    "en-US": "Powered by GPT-4"
  },
  beta: {
    "pt-BR": "Beta",
    "de-DE": "Beta",
    "en-US": "Beta"
  },
  quickActions: {
    "pt-BR": "Ações Rápidas",
    "de-DE": "Schnellaktionen",
    "en-US": "Quick actions"
  },
  inputPlaceholder: {
    "pt-BR": "Digite sua pergunta...",
    "de-DE": "Stellen Sie Ihre Frage...",
    "en-US": "Type your question..."
  },
  userInitial: {
    "pt-BR": "V",
    "de-DE": "V",
    "en-US": "U"
  },
  welcomeMessage: {
    "pt-BR": "Olá! 👋 Sou seu assistente financeiro inteligente. Posso ajudar a analisar seus gastos, encontrar padrões e dar sugestões personalizadas. Como posso ajudar?",
    "de-DE": "Hallo! 👋 Ich bin Ihr intelligenter Finanzassistent. Ich kann Ausgaben analysieren, Muster finden und personalisierte Vorschläge geben. Wie kann ich helfen?",
    "en-US": "Hi! 👋 I'm your smart finance assistant. I can analyze spending, find patterns, and give personalized suggestions. How can I help?"
  },
  quickActionMonthLabel: {
    "pt-BR": "Análise deste mês",
    "de-DE": "Analyse dieses Monats",
    "en-US": "This month analysis"
  },
  quickActionMonthPrompt: {
    "pt-BR": "Analise meus gastos este mês e dê sugestões.",
    "de-DE": "Analysiere meine Ausgaben in diesem Monat und gib mir Vorschläge.",
    "en-US": "Analyze my spending this month and give suggestions."
  },
  quickActionSaveLabel: {
    "pt-BR": "Sugerir economia",
    "de-DE": "Sparmöglichkeiten",
    "en-US": "Suggest savings"
  },
  quickActionSavePrompt: {
    "pt-BR": "Onde posso economizar mais?",
    "de-DE": "Wo kann ich am meisten sparen?",
    "en-US": "Where can I save the most?"
  },
  quickActionDupesLabel: {
    "pt-BR": "Encontrar duplicatas",
    "de-DE": "Duplikate finden",
    "en-US": "Find duplicates"
  },
  quickActionDupesPrompt: {
    "pt-BR": "Há transações duplicadas?",
    "de-DE": "Gibt es doppelte Transaktionen?",
    "en-US": "Are there duplicate transactions?"
  },
  backendStub: {
    "pt-BR": "🚧 **Backend em desenvolvimento**\n\nEste é um protótipo da interface do assistente IA. A integração com OpenAI será implementada pelo Codex.\n\nFuncionalidades planejadas:\n- Análise de gastos com insights personalizados\n- Detecção de padrões e anomalias\n- Sugestões de economia baseadas em histórico\n- Busca natural por transações\n- Previsões de gastos futuros",
    "de-DE": "🚧 **Backend in Entwicklung**\n\nDies ist ein Prototyp der KI-Assistenten-Oberfläche. Die OpenAI-Integration wird von Codex implementiert.\n\nGeplante Funktionen:\n- Ausgabenanalyse mit personalisierten Insights\n- Muster- und Anomalieerkennung\n- Spartipps basierend auf Historie\n- Natürliche Suche nach Transaktionen\n- Prognosen für zukünftige Ausgaben",
    "en-US": "🚧 **Backend in development**\n\nThis is a prototype of the AI assistant UI. OpenAI integration will be implemented by Codex.\n\nPlanned features:\n- Spending analysis with personalized insights\n- Pattern and anomaly detection\n- Savings suggestions based on history\n- Natural language transaction search\n- Forecasts for future spending"
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
