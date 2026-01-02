# RitualFin Full-App QA Matrix

This matrix inventories every screen/route/action and records expected behavior, pass/fail, and evidence. It mirrors the IDs in `docs/QA/E2E_VALIDATION_PLAN.md` and is the primary QA tracking surface.

## Status legend
- Status: Pending | Pass | Fail | Deferred (Shell) | Blocked

## Global shell (sidebar, layout, AI, shortcuts)
| Test ID | Route | Action/UI element | Expected (UI / API / DB) | Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| NAV-01 | Global | Sidebar navigation routes | Pages load, correct headers, no console errors, API calls succeed | Pass | Playwright (mocked) `tests/e2e/navigation.spec.ts`; manual evidence pending |
| NAV-02 | Global | Mobile menu open/close | Sidebar toggles, overlay toggles, focus usable | Pending | TBD |
| NAV-03 | Global | Sidebar collapse/expand | State persists, active group expands, layout stable | Pending | TBD |
| NAV-04 | Global | Month selector | Month label changes; data refetches | Pending | TBD |
| NAV-05 | Global | Keyboard shortcuts overlay | Opens with '?', closes with ESC, focus restored | Pending | TBD |
| AI-UI-01 | Global | AI assistant button/modal | Modal opens, simulated responses, no API errors | Pass | Playwright (mocked) `tests/e2e/ai-ui.spec.ts` |
| AI-UI-02 | Global | AI assistant missing key | Graceful messaging, no crash | Pending | TBD |
| AI-UI-03 | Global | AI assistant error handling | Clear error UI, no unhandled exceptions | Pending | TBD |

## Login
| Test ID | Route | Action/UI element | Expected (UI / API / DB) | Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| LOGIN-01 | /login | Demo login button | Redirect to /dashboard; demo session created | Pass | Playwright (mocked) `tests/e2e/auth.spec.ts`; manual evidence pending |
| LOGIN-02 | /login | Email/password login | /auth/login success; redirect to /dashboard | Pending | TBD |
| LOGIN-03 | /login | Show/hide password | Field toggles, no errors | Pending | TBD |
| LOGIN-04 | /login | Forgot password | No crash; stable UI | Pending | TBD |

## Dashboard
| Test ID | Route | Action/UI element | Expected (UI / API / DB) | Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| DASH-01 | /dashboard | Load summary | Summary renders; /api/dashboard returns data | Pending | Manual evidence pending |
| DASH-02 | /dashboard | Account filter | List and totals update | Pending | TBD |
| DASH-03 | /dashboard | Confirm queue CTA | Redirect to /settings; queue visible | Pending | TBD |
| DASH-04 | /dashboard | Calendar CTA | /calendar loads | Pending | TBD |
| DASH-05 | /dashboard | "Mais opcoes" | No crash; menu clickable | Pending | TBD |

## Uploads
| Test ID | Route | Action/UI element | Expected (UI / API / DB) | Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| UP-01 | /uploads | File selection validation | CSV accepted; non-CSV rejected | Pass | Playwright (mocked) `tests/e2e/uploads.spec.ts`; manual evidence pending |
| UP-02 | /uploads | Drag and drop | Upload completes; progress updates | Pass | Playwright (mocked) `tests/e2e/uploads.spec.ts`; manual evidence pending |
| UP-03 | /uploads | Upload success + history | History entry shows status ready, rowsImported > 0 | Pending | Manual evidence pending |
| UP-04 | /uploads | Re-upload dedupe | rowsImported = 0; duplicates > 0 | Pending | Manual evidence pending |
| UP-05 | /uploads | History card menu | No crash; menu clickable | Pending | TBD |

## Transactions
| Test ID | Route | Action/UI element | Expected (UI / API / DB) | Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| TX-01 | /transactions | List load | Rows render; /api/transactions returns data | Pending | Manual evidence pending |
| TX-02 | /transactions | Search filter | List filters to match | Pending | TBD |
| TX-03 | /transactions | Advanced filters | List updates; chips reflect selection | Pending | TBD |
| TX-04 | /transactions | Clear filters | Filters reset; list returns | Pending | TBD |
| TX-05 | /transactions | Detail modal | Modal opens/closes; data matches row | Pending | TBD |
| TX-06 | /transactions | Edit transaction | manualOverride set; changes persist | Pass | Playwright (mocked) `tests/e2e/transactions.spec.ts`; manual evidence pending |
| TX-07 | /transactions | Exclude/internal toggles | Flags saved; dashboard adjusts | Pending | TBD |
| TX-08 | /transactions | Export CSV | Download applies current filters | Pending | TBD |

## Accounts
| Test ID | Route | Action/UI element | Expected (UI / API / DB) | Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| ACC-01 | /accounts | Create account | Account persists; POST succeeds | Pending | Manual evidence pending |
| ACC-02 | /accounts | Edit account | Changes persist; PUT succeeds | Pending | TBD |
| ACC-03 | /accounts | Archive account | Removed from list; tx unaffected | Pending | TBD |

## Budgets
| Test ID | Route | Action/UI element | Expected (UI / API / DB) | Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| BUD-01 | /budgets | Create budget | Budget persists; POST succeeds | Pending | TBD |
| BUD-02 | /budgets | Update budget | PATCH succeeds; value persists | Pending | TBD |
| BUD-03 | /budgets | Delete budget | DELETE succeeds; removed | Pending | TBD |
| BUD-04 | /budgets | Apply AI suggestions | Suggestions applied; UI stable | Pending | TBD |

## Goals
| Test ID | Route | Action/UI element | Expected (UI / API / DB) | Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| GOAL-01 | /goals | Create goal | Goal persists; POST succeeds | Pending | TBD |
| GOAL-02 | /goals | Update goal | PATCH succeeds; values persist | Pending | TBD |
| GOAL-03 | /goals | Progress accuracy | Progress matches dashboard totals | Pending | TBD |
| GOAL-04 | /goals | Copy/suggestions | UI stable; values appear | Pending | TBD |

## Rituals
| Test ID | Route | Action/UI element | Expected (UI / API / DB) | Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| RIT-01 | /rituals | Start ritual | Ritual created; stepper advances | Pending | TBD |
| RIT-02 | /rituals | Complete ritual | Status updates; notes saved | Pending | TBD |
| RIT-03 | /rituals | Switch weekly/monthly | UI changes; data refetches | Pending | TBD |
| RIT-04 | /rituals | Filters + step navigation | UI updates without errors | Pending | TBD |

## Calendar
| Test ID | Route | Action/UI element | Expected (UI / API / DB) | Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| CAL-01 | /calendar | Month view load | View renders; totals exclude internal | Pass | Playwright (mocked) `tests/e2e/calendar.spec.ts`; manual evidence pending |
| CAL-02 | /calendar | Month navigation | Month changes; data refetches | Pending | TBD |
| CAL-03 | /calendar | 4-week view | Detail panel shows week summary | Pending | TBD |
| CAL-04 | /calendar | Day selection | Detail panel shows day details | Pending | TBD |

## Event detail
| Test ID | Route | Action/UI element | Expected (UI / API / DB) | Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| EVT-01 | /calendar/:id | Open event detail | Details load; occurrences visible | Pending | TBD |
| EVT-02 | /calendar/:id | Update occurrence status | Update succeeds; UI reflects change | Pending | TBD |
| EVT-03 | /calendar/:id | Delete event | Event removed; redirect to /calendar | Pending | TBD |

## Notifications (shell)
| Test ID | Route | Action/UI element | Expected (UI / API / DB) | Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| NOTIF-01 | /notifications | List render | Mock list renders; no errors | Pending | TBD |
| NOTIF-02 | /notifications | Filter tabs | Filters adjust list | Pending | TBD |
| NOTIF-03 | /notifications | Mark as read | Unread count decreases | Pending | TBD |

## Settings
| Test ID | Route | Action/UI element | Expected (UI / API / DB) | Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| SET-01 | /settings | Tab switching | Tabs render without errors | Pending | TBD |
| SET-02 | /settings | Profile save | UI stable; no crash | Pending | TBD |
| SET-03 | /settings | Export buttons | Download or stable UI | Pending | TBD |
| SET-04 | /settings | Regional prefs selects | PATCH called; values persist | Pending | TBD |
| SET-05 | /settings | Notification toggles | PATCH called; values persist | Pending | TBD |
| SET-06 | /settings | Categories import | Preview+confirm; status visible | Pass | Playwright (mocked) `tests/e2e/settings-classification.spec.ts`; manual evidence pending |
| SET-07 | /settings | Rules links | /rules and /ai-keywords load | Pending | TBD |
| SET-08 | /settings | Review queue assign | Queue updates; rules appended | Pending | Manual evidence pending |
| SET-09 | /settings | Dictionary aliases import | Aliases applied; Alias_Desc visible | Pending | TBD |
| SET-10 | /settings | Logos import + refresh | Logos render; refresh returns total | Pending | TBD |
| SET-11 | /settings | CSV mapping modals | Modal content matches contract | Pass | Playwright (mocked) `tests/e2e/settings-classification.spec.ts`; manual evidence pending |
| SET-12 | /settings | Audit log + export | Table renders; CSV downloads | Pending | TBD |
| SET-13 | /settings | Danger zone delete | 3-step confirm; audit log | Pending | Manual evidence pending |
| SET-14 | /settings | Full dictionary link | /merchant-dictionary loads | Pending | TBD |

## Legacy routes and Not Found
| Test ID | Route | Action/UI element | Expected (UI / API / DB) | Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| LEG-01 | /confirm /rules /merchant-dictionary /ai-keywords | Load routes | Pages render without errors | Pass | Playwright (mocked) `tests/e2e/legacy-routes.spec.ts`; manual evidence pending |
| NF-01 | /unknown-path | Not found page | 404 page renders | Pending | TBD |

## Core logic, data, deployment, security, and perf suites
| Test ID | Area | Action/Check | Expected | Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| CSV-01 | CSV | Format detection | Correct format/delimiter/encoding | Pending | TBD |
| CSV-02 | CSV | Date/amount normalization | Dates parsed; signs correct | Pending | TBD |
| CSV-03 | CSV | Key and key_desc | Format matches README | Pending | TBD |
| CSV-04 | CSV | Idempotency/dedupe | No new tx on re-import | Pending | TBD |
| CSV-05 | CSV | Account attribution | accountSource/accountId correct | Pending | TBD |
| CSV-06 | CSV | Foreign currency fields | fx fields populated | Pending | TBD |
| RULE-01 | Rules | Contains match | Case-insensitive contains | Pending | TBD |
| RULE-02 | Rules | No tokenization | Expression matches without split | Pending | TBD |
| RULE-03 | Rules | Diacritics/punctuation | Normalization works | Pending | TBD |
| RULE-04 | Rules | Negative keywords | Negative blocks match | Pending | TBD |
| RULE-05 | Rules | Strict precedence | Strict wins, confidence 100 | Pending | TBD |
| RULE-06 | Rules | Priority ordering | Higher priority wins | Pending | TBD |
| RULE-07 | Rules | Interno exclusion | internalTransfer/exclude set | Pass | Playwright (mocked) `tests/e2e/transactions.spec.ts` |
| AI-LOGIC-01 | AI logic | Auto-confirm default off | High confidence stays in review | Pending | TBD |
| AI-LOGIC-02 | AI logic | Threshold boundary | 79 review; 80+ auto-confirm | Pending | TBD |
| AI-LOGIC-03 | AI logic | UI/backend consistency | Badges match DB flags | Pending | TBD |
| MANUAL-01 | Manual | Override invariance | Rules reapply does not change | Pending | TBD |
| DB-01 | DB | Dedupe per user | 0 duplicate keys | Pass | `scripts/qa/dedupe_transactions.ts --apply` removed duplicates; `scripts/qa/run_db_invariants.sh` returned 0 rows. |
| DB-02 | DB | AccountId coverage | 0 missing for modern imports | Pass | `scripts/qa/run_db_invariants.sh` returned missing_account = 0. |
| DB-03 | DB | Manual override persistence | Categories unchanged | Pass | `scripts/qa/run_db_invariants.sh` returned 0 rows (no manual overrides present). |
| DB-04 | DB | Interno exclusion | Flags set correctly | Pass | `scripts/qa/run_db_invariants.sh` returned 0 rows (no Interno rows present). |
| DB-05 | DB | Uniqueness constraints | 0 duplicate rows | Pass | `scripts/qa/run_db_invariants.sh` returned 0 rows for budgets/goals/category_goals. |
| DB-06 | DB | Referential integrity | 0 orphans | Pass | `scripts/qa/run_db_invariants.sh` returned 0 orphan rows. |
| API-01 | API | /api/health | Status ok/degraded; shape valid | Pass (Live) | `scripts/qa/run_api_smoke.sh` |
| API-02 | API | /api/version | Fields present | Pass (Live) | `scripts/qa/run_api_smoke.sh` |
| API-03 | API | /api/auth/login | success true | Pass (Live) | `scripts/qa/run_api_smoke.sh` |
| API-04 | API | /api/settings | GET/PATCH persist values | Pass (Live) | `scripts/qa/run_api_smoke.sh` |
| API-05 | API | /api/uploads/process | Upload response schema | Pass (Live) | `scripts/qa/run_api_smoke.sh` |
| API-06 | API | /api/transactions | Schema valid | Pass (Live) | `scripts/qa/run_api_smoke.sh` |
| API-07 | API | /api/classification/review-queue | Queue items valid | Pass (Live) | `scripts/qa/run_api_smoke.sh` |
| API-08 | API | /api/rules/reapply-all | success + counts valid | Pending | TBD |
| API-CON-01 | Contract | /api/health schema | Types/keys valid | Pending | TBD |
| API-CON-02 | Contract | /api/version schema | Types/keys valid | Pending | TBD |
| API-CON-03 | Contract | /api/uploads/process schema | Types/keys valid | Pending | TBD |
| API-CON-04 | Contract | /api/transactions schema | Types/keys valid | Pending | TBD |
| API-CON-05 | Contract | /api/settings schema | Types/keys valid | Pending | TBD |
| DEP-01 | Deploy | Frontend API base | Requests to Render domain | Pending | TBD |
| DEP-02 | Deploy | Bundle check | No Vercel-origin /api | Pending | TBD |
| DEP-03 | Deploy | SPA rewrites | Direct route loads | Pending | TBD |
| DEP-04 | Deploy | CORS | ACAO includes Vercel domain | Pending | TBD |
| DEP-05 | Deploy | Version/health | /api/version + /version.json | Pass | Playwright (mocked) `tests/e2e/deployment.spec.ts`; manual evidence pending |
| OBS-01 | Observability | Request logging | Method/path/status/duration | Pending | TBD |
| OBS-02 | Observability | CSV import logs | Format, rows, dupes | Pending | TBD |
| OBS-03 | Observability | AI usage logs | ai_usage_logs entry | Pending | TBD |
| CHAOS-01 | Chaos | Backend down | UI shows error states | Pending | TBD |
| CHAOS-02 | Chaos | Slow network | Loading states visible | Pending | TBD |
| CHAOS-03 | Chaos | DB unavailable | Clear errors/logs | Pending | TBD |
| SEC-01 | Security | CORS restriction | Disallowed origin blocked | Pending | TBD |
| SEC-02 | Security | Injection attempts | No SQL errors; text stored | Pending | TBD |
| SEC-03 | Security | Secrets exposure scan | No secrets in bundle | Pending | TBD |
| PERF-01 | Perf | Large CSV upload | Meets SLO | Pending | TBD |
| PERF-02 | Perf | Dashboard render | Under 2s | Pending | TBD |
| PERF-03 | Perf | Confirm queue render | Under 2s | Pending | TBD |
| PROP-01 | Fuzz | Random merchant strings | Deterministic match | Pending | TBD |
| PROP-02 | Fuzz | CSV fuzz rows | Errors handled | Pending | TBD |
| PROP-03 | Fuzz | Keyword expression fuzz | Only ';' splits | Pending | TBD |
