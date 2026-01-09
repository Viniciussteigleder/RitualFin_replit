# RitualFin — Plano de Implementação (V1)

Este plano detalha as etapas para implementar a V1 do RitualFin, seguindo as novas especificações e o redesenho do banco de dados.

## Fase 1: Infraestrutura e Database (Concluído/Em andamento)
- [x] Definição do Schema (Drizzle)
- [x] Migração para o novo modelo de dados
- [x] Preparação dos scripts de seed com dados reais/dummy do usuário

## Fase 2: Ingestão e Processamento (Motor Principal)
- [ ] **Módulo OCR (Prints):**
    - Implementar pipeline de extração (Upload -> OCR -> Detecção de Conta -> Line Items).
    - Criar tela de revisão de Batch de Capturas (Três painéis: Lista, Tabela, Inspector).
- [ ] **Módulo CSV:**
    - Implementar detecção de formato (Sparkasse, M&M, Amex).
    - Implementar criação automática de contas.
    - Implementar importação estruturada (Staging -> Enriched Canonical).
- [ ] **Motor de Reconciliação:**
    - Implementar lógica de scoring (Texto/Data/Valor).
    - Implementar auto-accept e fila de revisão.

## Fase 3: Interface de Usuário (UI/UX) - Estilo Premium
- [ ] **Dashboard:**
    - Atualizar cards de resumo (Saldo, Projetado, Previsão).
    - Implementar grid de contas dinâmico.
- [ ] **Calendário e Eventos:**
    - Implementar visão de calendário financeiro.
    - Criar tela de **Detalhes do Evento** (conforme imagem de referência).
- [ ] **Rituais:**
    - Implementar Wizard do Ritual Diário e Semanal.
- [ ] **Componentes Globais:**
    - Implementar Undo Toast.
    - Implementar Busca Global (Ctrl+K).
    - Implementar Pop-ups de edição de reconciliados.

## Fase 4: Inteligência e Automação
- [ ] **Import/Export Excel:**
    - Implementar fluxo de Regras e Aliases via Excel.
    - Implementar funcionalidade de "Re-apply rules".
- [ ] **Insights:**
    - Implementar lógica de gastos acima da média nos detalhes do evento.
    - Implementar saldo projetado (Calendário + Ledger).

## Fase 5: Polimento e Lançamento
- [ ] Revisão de Microcopy.
- [ ] Testes de ponta a ponta (E2E) para as jornadas principais.
- [ ] Deployment final.

---

## Próximos Passos Imediatos:
1.  **Refinar o Dashboard** com o novo visual e dados simulados.
2.  **Implementar a tela de Detalhes do Evento**, pois é um pilar central da nova UI.
3.  **Configurar o fluxo de upload de CSV/Prints** com a detecção automática.
