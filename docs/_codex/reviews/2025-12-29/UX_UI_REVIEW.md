# UX/UI Review (Revised After Repo Update)

Information Architecture / Navigation
- Sidebar now clusters by journey (Visão Geral, Planejamento, Ações, Automação, Operações, Colaboração), which aligns better with the PRD.
- Naming still inconsistent: "Confirmar" vs "Fila de Confirmação"; "IA Keywords" still feels isolated from Regras.
- Notificações entry now integrated with unread badge.
- Settings route now exposed in the footer area of the sidebar.

Screen-by-screen Assessment

Login (`client/src/pages/login.tsx`)
- Clarity: Clear hierarchy and CTA.
- Friction: Google login, cadastro, e esqueci senha são placeholders.
- Errors: Still no visible error feedback.

Dashboard (`client/src/pages/dashboard.tsx`)
- Clarity: KPIs and insights are strong.
- Improvement: Merchant icon integration exists for recent transactions.
- Improvement: Estimated income now sourced from Goals.
- Improvement: "Disponível real" reflects commitments.

Calendar (`client/src/pages/calendar.tsx` + `client/src/components/calendar/detail-panel.tsx`)
- Improvement: Contextual detail panel now exists (day/week summary + badges).
- Improvement: Projected vs realized is now visually distinct + legend.
- Improvement: Toggle filters added for projected vs realized.
- Missing: Week overview for all 4 weeks (per PRD).

Uploads (`client/src/pages/uploads.tsx`)
- Clarity: Dropzone and provider badges are excellent.
- Improvement: Row-level error drilldown now available.
- Improvement: Format detected shown in history.
- Improvement: Top errors preview visible in upload cards.

Confirm Queue (`client/src/pages/confirm.tsx`)
- Clarity: Confidence buckets and totals are strong.
- Improvement: Merchant bundling for batch categorization.
- Improvement: "why this category" inline (rule/keyword/confidence).

Transactions (`client/src/pages/transactions.tsx`)
- Improvement: Merchant icons in list.
- Improvement: "why this category" inline.
- Performance: Pagination added (50 per page).

Rules (`client/src/pages/rules.tsx`)
- Improvement: N1/N2/N3 guidance in form.
- Partial: Impact preview (pending count) before reapply.
- Improvement: AI Keywords now lives as a tab inside Rules.

Accounts (`client/src/pages/accounts.tsx`)
- Improvement: Balance now computed from `/api/accounts/:id/balance`.
- Improvement: Balance now shows last updated time.

Goals (`client/src/pages/goals.tsx`)
- Copy now clarifies goals vs budget; empty state still needs CTA.

Budgets (`client/src/pages/budgets.tsx`)
- Still lacks copy/replicate from previous month and suggestions.

Rituals (`client/src/pages/rituals.tsx`)
- Structure solid; agreements history now visible, still missing linkage to budget/goals changes.

AI Keywords (`client/src/pages/ai-keywords.tsx`)
- Strong bulk analysis UI.
- Missing: Impact preview before apply; now integrated into Rules.

Notifications (`client/src/pages/notifications.tsx`)
- Backend integration done with mark-as-read + delete.
- Missing: auto-triggered notifications from system events.

Settings (`client/src/pages/settings.tsx`)
- Auto-confirm settings are functional.
- Still includes placeholder controls (integrations/export/dark mode).

Consistency / Accessibility
- Copy normalization largely complete; remaining inconsistencies são pontuais.
- Icon-only buttons now have aria-labels in core flows.
- Local icon/color maps are duplicated across pages.

Concrete Improvement Proposals (specific, no implementation)
1) Add impact preview before reapply in Rules (real counts, not just pending).
2) Add upload image flow (per PRD).
3) Add AI chat backend + persistent history.
4) Add system-triggered notifications (uploads, goals, rituals).
5) Unify icon/color maps into shared constants.
