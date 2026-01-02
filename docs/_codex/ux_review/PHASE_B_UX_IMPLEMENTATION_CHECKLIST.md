# Phase B UX Implementation Checklist (Revised)

Scope: Convert current gaps into engineering tasks with acceptance criteria.

## Update (branch_feat)
- Done: "Why this category" in Confirm + Transactions.
- Done: Projected vs Realized styling in Calendar + detail panel.
- Done: Upload format + row-level errors UI.
- Done: Merchant bundling in Confirm.
- Done: Dashboard "Disponivel real" + remove hardcoded income (uses Goals).
- Done: Notifications backend integration + unread badge.
- Done: Goals vs Budget copy clarification.
- Done: IA Keywords integrated into Rules (tab).
- Done: Rituals history section.
- Done: Next-step CTAs on key screens.

## Global (cross-cutting)

1) Consistent Portuguese copy + accents
- Acceptance: No missing accents in primary UI labels; menu title matches page title.

2) "Why this category" affordance
- Acceptance: Rule/keyword/confidence visible in 1 click in Confirm + Transactions.

3) Projected vs Realized visual language
- Acceptance: Future values labeled "Projetado" and styled distinctly; past values labeled "Realizado".

4) API base safety
- Acceptance: No direct `/api` fetches; all requests use shared API base.

## Screen: Login

1) Demo mode clarity
- Acceptance: UI explicitly indicates demo mode and data source.

2) Error feedback
- Acceptance: Invalid login shows inline error; button disabled while loading.

3) Placeholder actions
- Acceptance: Google login and cadastro are functional or marked "Em breve".

## Screen: Dashboard

1) Disponivel real KPI
- Acceptance: KPI = renda estimada - gastos - compromissos; breakdown accessible.

2) Remove hardcoded income
- Acceptance: Income source is Goals/Budget or user setting.

3) Empty state
- Acceptance: If no data, show CTA to Uploads.

## Screen: Calendar

1) Projected vs realized styling
- Acceptance: Events vs transactions visually distinct; legend visible.

2) Weekly summary (4 weeks)
- Acceptance: Week view shows all 4 weeks with totals and capacity.

3) Contextual detail panel
- Acceptance: Title and summary adapt to day vs week.

## Screen: Uploads

1) Format detected column
- Acceptance: Upload history shows provider badge.

2) Row-level errors UI
- Acceptance: "Ver erros" opens row list from upload_errors endpoint.

3) Partial success messaging
- Acceptance: Toasts and history reflect imported vs failed rows.

## Screen: Confirm Queue

1) Merchant bundling
- Acceptance: Group by merchant; one form applies to group.

2) Explain suggestions
- Acceptance: Each suggestion shows source + confidence.

3) Empty state
- Acceptance: No pending items shows CTA to Regras/Uploads.

## Screen: Transactions

1) Status column
- Acceptance: List shows Auto/Manual/Pendente/Interno with legend.

2) Quick "why"
- Acceptance: Inline popover shows rule/keyword/confidence.

3) Pagination/virtualization
- Acceptance: Responsive at 5k+ rows.

## Screen: Rules

1) Impact preview
- Acceptance: Reapply shows "X transacoes mudariam" before applying.

2) Category hierarchy guidance
- Acceptance: UI explains N1/N2/N3 and shows full path.

3) Empty state
- Acceptance: First-time user sees education + CTA.

## Screen: Accounts

1) Balance source clarity
- Acceptance: Each balance shows origin (upload/manual) and last update.

2) Net position explanation
- Acceptance: Explains formula in tooltip.

## Screen: Goals

1) Clarify goals vs budget
- Acceptance: Copy separates "Objetivos" from "Orcamento".

2) Empty state
- Acceptance: When no goals, show CTA with example.

## Screen: Budgets

1) Copy from previous month
- Acceptance: One-click copy; confirmation toast.

2) Suggestions
- Acceptance: Button applies last-month/3-month average values.

## Screen: Rituals

1) Agreements history
- Acceptance: Past agreements visible with status.

2) Next step CTA
- Acceptance: After ritual, CTA to adjust budget/goals.

## Screen: AI Keywords

1) Impact preview
- Acceptance: "X transacoes serao atualizadas" before apply.

2) Merge into Rules
- Acceptance: Appears as tab within Rules or deep link.

## Screen: Notifications

1) Backend integration
- Acceptance: Notifications list uses API, not mock data.

2) Mark as read
- Acceptance: PATCH /read wired and reflected in UI.

## Screen: Settings

1) Functional vs placeholder
- Acceptance: Placeholders marked "Em breve" or hidden.

2) Auto-confirm explanation
- Acceptance: Explains threshold effect and shows current value.
