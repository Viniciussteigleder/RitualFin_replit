# Rules Parity Report

**Generated**: 2026-01-17T20:28:47.008Z
**Verdict**: FAIL

## Summary

| Issue Type | Count |
|------------|-------|
| Missing in DB | 0 |
| Extra in DB | 98 |
| Field Mismatches | 0 |
| Enum Mismatches | 11 |
| **Total** | **109** |

## Issues

### category1_enum

| Type | Key | Details |
|------|-----|---------|
| enum_mismatch | ASSINATURAS | Excel Level 1 "ASSINATURAS" has no matching value in DB category1 enum |
| enum_mismatch | DOACOES | Excel Level 1 "DOACOES" has no matching value in DB category1 enum |
| enum_mismatch | EDUCACAO | Excel Level 1 "EDUCACAO" has no matching value in DB category1 enum |
| enum_mismatch | ESPORTES | Excel Level 1 "ESPORTES" has no matching value in DB category1 enum |
| enum_mismatch | FERIAS | Excel Level 1 "FERIAS" has no matching value in DB category1 enum |
| enum_mismatch | FINANCAS | Excel Level 1 "FINANCAS" has no matching value in DB category1 enum |
| enum_mismatch | MOBILIDADE | Excel Level 1 "MOBILIDADE" has no matching value in DB category1 enum |
| enum_mismatch | PETS | Excel Level 1 "PETS" has no matching value in DB category1 enum |
| enum_mismatch | TELEFONE | Excel Level 1 "TELEFONE" has no matching value in DB category1 enum |
| enum_mismatch | TRANSFERENCIAS | Excel Level 1 "TRANSFERENCIAS" has no matching value in DB category1 enum |
| enum_mismatch | VENDAS | Excel Level 1 "VENDAS" has no matching value in DB category1 enum |

### taxonomy_level_1

| Type | Key | Details |
|------|-----|---------|
| extra_in_db | OPEN | DB Level 1 "OPEN" not found in Excel Oracle |
| extra_in_db | OPEN | DB Level 1 "OPEN" not found in Excel Oracle |
| extra_in_db | OPEN | DB Level 1 "OPEN" not found in Excel Oracle |
| extra_in_db | OPEN | DB Level 1 "OPEN" not found in Excel Oracle |
| extra_in_db | OPEN | DB Level 1 "OPEN" not found in Excel Oracle |
| extra_in_db | OPEN | DB Level 1 "OPEN" not found in Excel Oracle |
| extra_in_db | OPEN | DB Level 1 "OPEN" not found in Excel Oracle |
| extra_in_db | OPEN | DB Level 1 "OPEN" not found in Excel Oracle |
| extra_in_db | OPEN | DB Level 1 "OPEN" not found in Excel Oracle |
| extra_in_db | OPEN | DB Level 1 "OPEN" not found in Excel Oracle |
| extra_in_db | OPEN | DB Level 1 "OPEN" not found in Excel Oracle |
| extra_in_db | OPEN | DB Level 1 "OPEN" not found in Excel Oracle |
| extra_in_db | OPEN | DB Level 1 "OPEN" not found in Excel Oracle |
| extra_in_db | OPEN | DB Level 1 "OPEN" not found in Excel Oracle |
| extra_in_db | OPEN | DB Level 1 "OPEN" not found in Excel Oracle |
| extra_in_db | OPEN | DB Level 1 "OPEN" not found in Excel Oracle |
| extra_in_db | OPEN | DB Level 1 "OPEN" not found in Excel Oracle |
| extra_in_db | OPEN | DB Level 1 "OPEN" not found in Excel Oracle |
| extra_in_db | OPEN | DB Level 1 "OPEN" not found in Excel Oracle |
| extra_in_db | OPEN | DB Level 1 "OPEN" not found in Excel Oracle |
| ... | ... | 78 more issues |

## Resolution Steps

1. Run `npx tsx scripts/parse-rules-xlsx.ts` to regenerate Oracle
2. Run seed scripts to populate missing DB records
3. Run this verification again until PASS
