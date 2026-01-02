# UX/UI Master Plan — RitualFin

**Last Updated**: 2026-01-02
**Scope**: IA + Settings architecture + UX behavior for imports, classificação, aliases/logos, audit log, danger zone.

## 1. Executive Summary
RitualFin mantém o visual atual e evolui a clareza operacional. O foco desta fase foi reestruturar a navegação, consolidar Configurações como hub único e garantir previsibilidade no fluxo de importações, classificação e dados sensíveis. O objetivo é: “importar com confiança, revisar com clareza, e auditar com transparência”.

## 2. Informação Arquitetônica (IA) — Implementado
### 2.1 Sidebar (grupos + comportamento)
- **Visão Geral**: Dashboard, Calendário, Transações, Contas, Insights
- **Operações**: Upload, Lista de Confirmação, Regras, AI Keywords, Notificações
- **Planejamento**: Orçamento, Metas
- **Rituais**: Semanal, Mensal
- **Sistema (rodapé)**: Configurações, Sair

**Comportamentos obrigatórios**:
- Grupos colapsáveis com chevron.
- Grupo que contém a rota ativa expande automaticamente.
- Estado de colapso persistido em `localStorage`.
- Logo com altura fixa, `object-contain` e padding consistente, sem distorção.

### 2.2 Settings (hub único)
Configurações é o único ponto para:
- Conta
- Preferências Regionais
- Notificações
- Integrações
- Classificação & Dados
- Dicionário de Comerciantes
- Log de Auditoria
- Zona de Perigo

**Regra**: “Configurações” aparece apenas uma vez na sidebar (em Sistema).

## 3. Inventário de Rotas
- `/dashboard` (visão geral)
- `/calendar` (calendário)
- `/transactions` (transações)
- `/accounts` (contas)
- `/insights` (insights)
- `/uploads` (importações)
- `/confirm` (fila de revisão)
- `/rules` (regras)
- `/ai-keywords` (AI keywords)
- `/notifications` (notificações)
- `/budgets` (orçamento)
- `/goals` (metas)
- `/rituals?type=weekly|monthly` (rituais)
- `/settings` (configurações)
- `/merchant-dictionary` (dicionário completo)

## 4. Contratos de Tela (screen contracts)
### 4.1 Sidebar + Navegação
- **Inputs**: rota atual; estado local (colapso por grupo).
- **Outputs**: navegação sem alterar rota ao expandir/colapsar; persistência local.
- **Estados**: expandido, colapsado, item ativo.
- **Erros**: N/A.

### 4.2 Upload (Operações → Upload)
- **Objetivo**: fluxo Preview → Importar com data de importação explícita.
- **Inputs**: arquivo CSV, data de importação.
- **Outputs**: pré-visualização (colunas na ordem correta) + processamento com status.
- **Estados**: selecionado, pré-visualizando, pronto para importar, sucesso, erro.
- **Erros**: exibir motivo + log (inline/toast) e registrar no log de auditoria.
- **Regras**:
  - “Data de importação” padrão = hoje.
  - Importar mostra status e diagnóstico.

### 4.3 Integrações (Configurações → Integrações)
- **Cartões**: logo real, status (Ativo/Inativo) e selo “Integração via CSV”.
- **Mapeamento CSV** (modal):
  - delimitador, codificação esperada (UTF-8 com BOM), formato de data
  - cabeçalhos obrigatórios (contrato)
  - colunas de pré-visualização
  - campos-chave usados pelo pipeline
  - falhas comuns com mensagens acionáveis
- **Nota futura**: placeholder documentado para importação por fotos/prints (não implementado).

### 4.4 Classificação & Dados (Configurações)
- **Tabs**: Categorias, Regras KeyWords, Fila de Revisão.
- **Downloads**: CSV com BOM para preservar acentos.
- **Pré-visualização**: mostra o que será importado; colunas em ordem correta.
- **Importação**: status de sucesso/erro + log com motivos.
- **Regras de expressão**: tokens separados apenas por “;” (não dividir por espaço).

### 4.5 Fila de Revisão (Operações → Lista de Confirmação)
- **Seleção**: Nível 1, Nível 2, Nível 3 (folha).
- **Exibe**: keywords existentes e negativas para a folha selecionada.
- **Ações**:
  - adicionar expressão positiva (uma por vez)
  - adicionar expressão negativa
  - aplicar classificação
- **Regra crítica**: cada token é uma expressão completa separada por “;”.

### 4.6 Dicionário de Comerciantes (Configurações)
- **Aliases**: download + upload CSV (UTF-8 com BOM) com validação clara.
- **Logos**: download + upload com colunas `Alias_Desc`, `Key_words_alias`, `URL_icon_internet`.
- **Comportamento**:
  - baixar logo da URL, salvar localmente e persistir referência estável.
  - renderizar em tamanho consistente; fallback sem logo.
  - usar `[logo] Alias_Desc` em Transações, Fila de Revisão, Regras.

### 4.7 Log de Auditoria (Configurações)
- **Eventos críticos**: importações (sucesso/erro), regras, aliases/logos, zona de perigo.
- **Exportação**: CSV Excel-safe (UTF-8 com BOM) preservando acentos.

### 4.8 Zona de Perigo (Configurações)
- **Workflow 3 passos**:
  1) Selecionar dados
  2) Confirmar (dupla confirmação com texto)
  3) Conclusão com timestamp + itens
- **Regra**: nunca apagar com um clique.
- **Auditoria**: grava evento.

## 5. Jornadas do Usuário (Happy path + recuperação)
### 5.1 Upload → Pré-visualização → Importar → Revisão
1) Usuário faz upload com data de importação.
2) Pré-visualização mostra colunas e amostra.
3) Importar registra status + log de auditoria.
4) Pendências caem em Fila de Revisão.
5) Usuário classifica usando N1/N2/N3 e adiciona keywords.

### 5.2 Aliases + Logos (Roundtrip)
1) Exportar template CSV.
2) Editar no Excel (UTF-8 com BOM).
3) Pré-visualizar upload.
4) Confirmar importação e aplicar.
5) Logos baixados e renderizados nas telas.

### 5.3 Zona de Perigo
1) Seleciona datasets.
2) Digita confirmação (“APAGAR”).
3) Conclui com timestamp e resumo.
4) Evento auditado.

## 6. Definições de Funcionalidade + Critérios de Aceite (A–H)
### A) Sidebar & Navegação
- Logo intacta em estados colapsado/expandido.
- Grupos colapsáveis com persistência.
- IA final conforme seção 2.1.
- “Configurações” apenas em Sistema.

### B) Settings
- Configurações como hub único com tabs listadas na seção 2.2.
- Preferências Regionais unificadas (Idioma, Moeda, Região Fiscal).

### C) Integrações
- Logos reais por provedor.
- “Ver mapeamento CSV” com contrato completo.
- Placeholder documentado para importação por fotos.

### D) Classificação & Dados
- Tabs: Categorias, Regras KeyWords, Fila de Revisão.
- CSV com BOM preserva acentos.
- Pré-visualização exibe colunas na ordem certa.
- Importação com status + motivo por arquivo.

### E) Dicionário (Aliases & Logos)
- Upload valida contrato; suporta Excel com acentos.
- Download/upload de logos com contrato fixo.
- Renderização consistente e fallback sem logo.

### F) Fila de Revisão
- N1/N2/N3 + keywords existentes + negativas.
- Expressões separadas somente por “;”.

### G) Log de Auditoria
- Eventos críticos registrados.
- Exportação CSV Excel-safe (UTF-8 com BOM).

### H) Zona de Perigo
- Fluxo de 3 passos + confirmação explícita.
- Registro no log de auditoria.

## 7. Roadmap
O roadmap detalhado com fases, DoD e checklist de regressão está em `docs/IMPLEMENTATION_ROADMAP.md`.
