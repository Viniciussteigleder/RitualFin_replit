export type CsvDataset = "classification" | "aliases_key_desc" | "aliases_assets";

export type CsvExportSettings = {
  bom: boolean;
  crlf: boolean;
  delimiter: string;
  escapeFormulas: boolean;
};

export type CsvContract = {
  dataset: CsvDataset;
  expectedHeaders: string[];
  strictHeaderOrder: boolean;
  delimiter: string;
  maxSizeBytes: number;
  export: CsvExportSettings;
};

export type CsvReasonCode =
  | "FILE_NOT_CSV"
  | "FILE_TOO_LARGE"
  | "ENCODING_UNSUPPORTED"
  | "DECODE_CORRUPTION"
  | "DELIMITER_INCONSISTENT"
  | "HEADER_MISMATCH"
  | "ROW_SHAPE_INVALID"
  | "QUOTING_PARSE_ERROR";

export type CsvReasonInfo = {
  message: string;
  fixes: string[];
};

export const csvReasonInfo: Record<CsvReasonCode, CsvReasonInfo> = {
  FILE_NOT_CSV: {
    message: "Formato inválido. Envie um arquivo CSV.",
    fixes: ["Exporte novamente como CSV.", "Evite enviar Excel (.xlsx)."]
  },
  FILE_TOO_LARGE: {
    message: "Arquivo muito grande para importação.",
    fixes: ["Divida o arquivo em partes menores.", "Remova linhas desnecessárias."]
  },
  ENCODING_UNSUPPORTED: {
    message: "Codificação não suportada. Salve o arquivo como UTF-8.",
    fixes: ["No Excel: Salvar como → CSV UTF-8.", "Evite copiar/colar de outras fontes."]
  },
  DECODE_CORRUPTION: {
    message: "O arquivo contém caracteres corrompidos.",
    fixes: ["Reexporte o CSV original.", "Evite edições em editores não confiáveis."]
  },
  DELIMITER_INCONSISTENT: {
    message: "Delimitador inconsistente. O CSV deve usar um único separador.",
    fixes: ["Use o delimitador padrão do template (;) .", "Reexporte o arquivo sem misturar separadores."]
  },
  HEADER_MISMATCH: {
    message: "Template incompatível. Os cabeçalhos não conferem.",
    fixes: ["Baixe o template novamente no RitualFin.", "Não renomeie ou traduza colunas."]
  },
  ROW_SHAPE_INVALID: {
    message: "Há linhas com número de colunas diferente do cabeçalho.",
    fixes: ["Verifique separadores extras ou faltantes.", "Reexporte o CSV do template."]
  },
  QUOTING_PARSE_ERROR: {
    message: "Falha ao ler o CSV. Aspas ou quebras de linha estão inválidas.",
    fixes: ["Evite quebras de linha dentro de células.", "Reexporte o CSV do template."]
  }
};

const DEFAULT_EXPORT_SETTINGS: CsvExportSettings = {
  bom: true,
  crlf: true,
  delimiter: ";",
  escapeFormulas: true
};

const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export const csvContracts: Record<CsvDataset, CsvContract> = {
  classification: {
    dataset: "classification",
    expectedHeaders: [
      "App classificação",
      "Nível_1_PT",
      "Nível_2_PT",
      "Nível_3_PT",
      "Key_words",
      "Key_words_negative",
      "Receita/Despesa",
      "Fixo/Variável",
      "Recorrente"
    ],
    strictHeaderOrder: true,
    delimiter: ";",
    maxSizeBytes: MAX_SIZE_BYTES,
    export: DEFAULT_EXPORT_SETTINGS
  },
  aliases_key_desc: {
    dataset: "aliases_key_desc",
    expectedHeaders: ["key_desc", "simple_desc", "alias_desc"],
    strictHeaderOrder: true,
    delimiter: ";",
    maxSizeBytes: MAX_SIZE_BYTES,
    export: DEFAULT_EXPORT_SETTINGS
  },
  aliases_assets: {
    dataset: "aliases_assets",
    expectedHeaders: ["Alias_Desc", "Key_words_alias", "URL_icon_internet", "Logo_local_path"],
    strictHeaderOrder: true,
    delimiter: ";",
    maxSizeBytes: MAX_SIZE_BYTES,
    export: DEFAULT_EXPORT_SETTINGS
  }
};
