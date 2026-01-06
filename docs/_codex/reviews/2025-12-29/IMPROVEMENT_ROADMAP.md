# Improvement Roadmap

Status Update (branch_feat)
- Done: Upload error drilldown UI + format detected in Uploads.
- Done: Upload cards now preview top errors.
- Done: Dashboard income sourced from Goals + "Disponivel real".
- Done: Calendar projected vs realized legend + badges + filters.
- Done: Confirm merchant bundling + "Por que?" explanations.
- Done: Notifications backend integration + unread badge.
- Done: Merchant metadata CRUD UI + applied overrides in lists.
- Done: Accounts balance now sourced from `/api/accounts/:id/balance`.
- Done: Balance cards show last updated time.
- Done: IA Keywords integrated into Rules tab.
- Done: Transactions pagination (50 per page).
- Done: Copy normalization + aria-labels in core icon buttons.

Prioritized Backlog

P0 (Release Blockers)
| Item | Effort | Dependencies | Notes |
| --- | --- | --- | --- |
| Replace demo auth with real auth/session middleware and per-user scoping | L | DB + session store | Requires storage changes and route guards across endpoints. |
| Remove or label non-functional login options (Google) until implemented | S | None | Avoid misleading users. |

P1 (High Value)
| Item | Effort | Dependencies | Notes |
| --- | --- | --- | --- |
| Implement AI assistant backend (`/api/ai/chat`) or hide UI | L | OpenAI key + C.4 usage tracking | PRD expectation. |
| Implement screenshot/image import pipeline (OCR + balance extraction) | L | OCR service + schema changes | PRD requirement. |
| Add impact preview before reapply in Rules (real counts) | S | None | Currently pending count only. |
| Add system-triggered notifications (uploads, goals, rituals) | M | None | In-app triggers only. |

P2 (Polish)
| Item | Effort | Dependencies | Notes |
| --- | --- | --- | --- |
| Consolidate category icon/color maps into shared constants | S | None | Maintainability. |
| Add build chunking/route-based code split | M | None | Performance. |

Suggested Batch Packages (for Codex execution)
1) Batch A (P0): API base fix + Google button gating
2) Batch B (P0): Auth + user scoping + session store
3) Batch C (P1): Upload error UI + account balance UI
4) Batch D (P1): AI assistant backend + usage logging integration
5) Batch E (P1): Screenshot import pipeline (OCR)
6) Batch F (P2): Copy polish + accessibility + shared constants
