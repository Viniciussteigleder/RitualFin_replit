# RitualFin CSV Roundtrip Contract

This contract defines the CSV import/export rules for Classificação & Dados
(classification taxonomy, aliases key_desc map, and alias assets/logos).

## Goals
- Determinism: identical input yields identical canonical CSV.
- Excel safety: UTF-8 with BOM, delimiter `;`, CRLF line endings, safe quoting.
- Strict validation: exact headers, delimiter, and row shape.
- Actionable diagnostics: user messages + reason codes + evidence.

## Datasets & Headers

### classification
Headers (exact order):
1. App classificação
2. Nível_1_PT
3. Nível_2_PT
4. Nível_3_PT
5. Key_words
6. Key_words_negative
7. Receita/Despesa
8. Fixo/Variável
9. Recorrente

### aliases_key_desc
Headers (exact order):
1. key_desc
2. simple_desc
3. alias_desc

### aliases_assets (logos)
Headers (exact order):
1. Alias_Desc
2. Key_words_alias
3. URL_icon_internet
4. Logo_local_path

## Encoding Strategy
1. Detect UTF-8 with BOM.
2. Attempt UTF-8 without BOM (fatal).
3. Fallback to Windows-1252, then ISO-8859-1 if needed.
4. Reject any decoded text containing the replacement character (�).

## Delimiter Strategy
- Strict delimiter: `;` for all datasets.
- Reject mixed delimiters or inconsistent delimiter counts.

## Header Rules
- Headers must match exactly (case-sensitive, exact spelling, exact order).
- Any missing, extra, or reordered header triggers `HEADER_MISMATCH`.

## Canonicalization Rules
- Normalize line endings to `\n` internally.
- Store a canonical CSV (UTF-8, BOM, CRLF) after successful validation.
- Process only from canonical CSV for confirm import.

## Parsing & Validation
- CSV parser must support quoted fields and embedded newlines.
- Hard fail on:
  - Unsupported encoding (`ENCODING_UNSUPPORTED`)
  - Decode corruption (`DECODE_CORRUPTION`)
  - Mixed delimiter (`DELIMITER_INCONSISTENT`)
  - Header mismatch (`HEADER_MISMATCH`)
  - Row shape mismatch (`ROW_SHAPE_INVALID`)
  - Quote/parse errors (`QUOTING_PARSE_ERROR`)

## Export Rules (Excel-safe)
- UTF-8 with BOM.
- Delimiter `;`.
- CRLF line endings.
- Quote fields when they contain delimiter, quotes, or newlines.
- CSV injection protection: prefix `'` when a value starts with `=`, `+`, `-`, or `@`.

## Error Taxonomy (UI + Fixes)

### FILE_NOT_CSV
Message: Formato inválido. Envie um arquivo CSV.
Fixes:
- Exporte novamente como CSV.
- Evite enviar Excel (.xlsx).

### FILE_TOO_LARGE
Message: Arquivo muito grande para importação.
Fixes:
- Divida o arquivo em partes menores.
- Remova linhas desnecessárias.

### ENCODING_UNSUPPORTED
Message: Codificação não suportada. Salve o arquivo como UTF-8.
Fixes:
- No Excel: Salvar como → CSV UTF-8.
- Evite copiar/colar de outras fontes.

### DECODE_CORRUPTION
Message: O arquivo contém caracteres corrompidos.
Fixes:
- Reexporte o CSV original.
- Evite edições em editores não confiáveis.

### DELIMITER_INCONSISTENT
Message: Delimitador inconsistente. O CSV deve usar um único separador.
Fixes:
- Use o delimitador padrão do template (;).
- Reexporte o arquivo sem misturar separadores.

### HEADER_MISMATCH
Message: Template incompatível. Os cabeçalhos não conferem.
Fixes:
- Baixe o template novamente no RitualFin.
- Não renomeie ou traduza colunas.

### ROW_SHAPE_INVALID
Message: Há linhas com número de colunas diferente do cabeçalho.
Fixes:
- Verifique separadores extras ou faltantes.
- Reexporte o CSV do template.

### QUOTING_PARSE_ERROR
Message: Falha ao ler o CSV. Aspas ou quebras de linha estão inválidas.
Fixes:
- Evite quebras de linha dentro de células.
- Reexporte o CSV do template.

## Structured Logging (Import Runs)
Each import persists:
- dataset_name, user_id, file_name
- detected_encoding, detected_delimiter
- header_diff and header_found
- row_error_samples (first N)
- reason_codes
- rows_total, rows_valid
- timestamps (created_at, confirmed_at)
