# IMPLEMENTATION ROADMAP — RitualFin

**Last Updated**: 2026-01-02
**Scope**: IA + Settings architecture + imports, classificação, aliases/logos, auditoria, zona de perigo.

## Overview
Este roadmap organiza a entrega dos requisitos A–H em fases dependentes e testáveis. Ele assume o visual atual, focando em consistência, previsibilidade e rastreabilidade.

## Phase 0 — IA + Navegação Base
**Objetivo**: aplicar a nova estrutura de navegação e comportamento de sidebar.

**Deliverables**:
- Sidebar com grupos colapsáveis e persistência.
- IA final aplicada (Visão Geral, Operações, Planejamento, Rituais, Sistema).
- Logo sem distorção.

**Definition of Done**:
- Navegação cobre todas as rotas da IA.
- Estado de colapso persistido e auto-expansão por rota ativa.
- QA: NAV-01, NAV-02, NAV-03.
- Docs atualizados (IA + navegação).

## Phase 1 — Settings Hub + Classificação
**Objetivo**: consolidar Configurações e fluxos de classificação/dados.

**Deliverables**:
- Tabs finais em Configurações (Conta, Preferências Regionais, Notificações, Integrações, Classificação & Dados, Dicionário, Log de Auditoria, Zona de Perigo).
- Classificação & Dados com tabs: Categorias, Regras KeyWords, Fila de Revisão.
- Regra de expressões por “;” aplicada.

**Definition of Done**:
- Preferências Regionais unificadas.
- Fila de Revisão com N1/N2/N3 + keywords negativas.
- Importação de categorias com pré-visualização e confirmação.
- QA: SET-01 a SET-07, REV-01 a REV-05.
- Docs atualizados (screen contracts + jornadas).

## Phase 2 — Integrações + Imports + Dicionário
**Objetivo**: reforçar contratos CSV, pre-visualização e aliases/logos.

**Deliverables**:
- Integrações com logos reais e modal “Ver mapeamento CSV”.
- Upload com pré-visualização e data de importação.
- Dicionário com download/upload de aliases + logos.

**Definition of Done**:
- Pré-visualização mostra colunas corretas.
- Importação registra status e motivo.
- Logos baixados e renderizados com fallback.
- QA: IMP-01 a IMP-06, ALIAS-01 a ALIAS-05.
- Docs atualizados (contratos CSV, dicionário).

## Phase 3 — Auditoria + Zona de Perigo + Hardening
**Objetivo**: observabilidade e segurança de dados.

**Deliverables**:
- Log de Auditoria com export CSV (UTF-8 BOM).
- Zona de Perigo com fluxo 3 passos + confirmação textual.

**Definition of Done**:
- Eventos críticos auditados.
- Zona de Perigo nunca executa com 1 clique.
- QA: AUD-01 a AUD-04, DANGER-01 a DANGER-04.
- Docs e checklist de regressão atualizados.

## Regression Checklist (Obrigatório)
- sidebar navigation
- settings pages
- import preview/import result visibility
- Excel-safe download/upload
- alias/logo rendering across key surfaces
- review queue classification and keyword editing
- danger zone confirmations and logging

## Rollout Notes
- Validar em ambiente local + staging antes de merge.
- Capturar evidências (screenshots ou notas de comportamento).
- Atualizar docs e QA checklist como parte do merge.
