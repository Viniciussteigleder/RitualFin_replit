# Docs Restructure Plan

**Goal**: reduce docs sprawl, clarify ownership, keep immutable contracts stable, and enable fast onboarding.

## Proposed Folder Taxonomy

- `docs/architecture/`: system diagrams, boundaries, data flow
- `docs/contracts/`: behavior/data contracts (incl. immutable `LOGIC_CONTRACT.md`)
- `docs/process/`: QA, testing, release process, governance
- `docs/runbooks/`: deploy + ops runbooks
- `docs/security/`: security posture, audits, incident notes
- `docs/reference/`: stable reference docs that aren't contracts
- `docs/archive/`: dated snapshots, historical reports (read-only)

## Current Markdown Inventory

| Path | Purpose | Keep/Merge/Delete | Target Location |
|---|---|---|---|
| `CLAUDE.md` | Root-level doc (historical/unclear ownership) | ARCHIVE | `docs/archive/root/CLAUDE.md` |
| `COMPLETE_REPORT.md` | Historical report / snapshot | ARCHIVE | `docs/archive/COMPLETE_REPORT.md` |
| `DEBUG_COMPLETE.md` | Historical report / snapshot | ARCHIVE | `docs/archive/DEBUG_COMPLETE.md` |
| `DEBUG_SUMMARY.md` | Historical report / snapshot | ARCHIVE | `docs/archive/DEBUG_SUMMARY.md` |
| `DEPLOYMENT_STATUS.md` | Deploy guide | KEEP | `docs/runbooks/DEPLOYMENT_STATUS.md` |
| `IMPLEMENTATION_PLAN.md` | Root-level doc (historical/unclear ownership) | ARCHIVE | `docs/archive/root/IMPLEMENTATION_PLAN.md` |
| `IMPLEMENTATION_PRIORITIES.md` | Root-level doc (historical/unclear ownership) | ARCHIVE | `docs/archive/root/IMPLEMENTATION_PRIORITIES.md` |
| `IMPLEMENTATION_PROGRESS.md` | Root-level doc (historical/unclear ownership) | ARCHIVE | `docs/archive/root/IMPLEMENTATION_PROGRESS.md` |
| `IMPLEMENTATION_SUMMARY.md` | Historical report / snapshot | ARCHIVE | `docs/archive/IMPLEMENTATION_SUMMARY.md` |
| `PRINCIPAL_ENGINEER_ASSESSMENT.md` | Root-level doc (historical/unclear ownership) | ARCHIVE | `docs/archive/root/PRINCIPAL_ENGINEER_ASSESSMENT.md` |
| `QA_TESTING_PLAN.md` | QA/testing docs | KEEP | `docs/process/QA_TESTING_PLAN.md` |
| `QUICK_REFERENCE.md` | Root-level doc (historical/unclear ownership) | ARCHIVE | `docs/archive/root/QUICK_REFERENCE.md` |
| `README.md` | Root-level doc (historical/unclear ownership) | ARCHIVE | `docs/archive/root/README.md` |
| `RitualFin_NEON_DB_Migration_Plan.md` | Root-level doc (historical/unclear ownership) | ARCHIVE | `docs/archive/root/RitualFin_NEON_DB_Migration_Plan.md` |
| `RitualFin_NEON_DB_Redesign.md` | Root-level doc (historical/unclear ownership) | ARCHIVE | `docs/archive/root/RitualFin_NEON_DB_Redesign.md` |
| `SESSION_SUMMARY.md` | Historical report / snapshot | ARCHIVE | `docs/archive/SESSION_SUMMARY.md` |
| `SPECIFICATIONS.md` | Root-level doc (historical/unclear ownership) | ARCHIVE | `docs/archive/root/SPECIFICATIONS.md` |
| `TESTING_DEBUG_REPORT.md` | QA/testing docs | KEEP | `docs/process/TESTING_DEBUG_REPORT.md` |
| `UI_UX_UPDATE_REPORT.md` | Historical report / snapshot | ARCHIVE | `docs/archive/UI_UX_UPDATE_REPORT.md` |
| `db/README.md` | Root-level doc (historical/unclear ownership) | ARCHIVE | `docs/archive/root/README.md` |
| `docs/AI_DESIGN.md` | Project documentation | REVIEW | `docs/reference/AI_DESIGN.md` |
| `docs/ANALYTICS_FIX_2026-01-11.md` | Project documentation | REVIEW | `docs/reference/ANALYTICS_FIX_2026-01-11.md` |
| `docs/ARCHITECTURE.md` | Architecture reference | KEEP | `docs/architecture/ARCHITECTURE.md` |
| `docs/ARCHITECTURE_AND_AI_LOGIC.md` | Architecture reference | KEEP | `docs/architecture/ARCHITECTURE_AND_AI_LOGIC.md` |
| `docs/ASSESSMENT_REPORT.md` | Historical report / snapshot | ARCHIVE | `docs/archive/ASSESSMENT_REPORT.md` |
| `docs/AUDIT_REPORT_2026-01-12.md` | Historical report / snapshot | ARCHIVE | `docs/archive/AUDIT_REPORT_2026-01-12.md` |
| `docs/BRANCH_CLEANUP_AND_DEPLOYMENT_FIX.md` | Deploy guide | KEEP | `docs/runbooks/BRANCH_CLEANUP_AND_DEPLOYMENT_FIX.md` |
| `docs/BRANCH_CLEANUP_REPORT.md` | Historical report / snapshot | ARCHIVE | `docs/archive/BRANCH_CLEANUP_REPORT.md` |
| `docs/CATEGORY_QUICK_REFERENCE.md` | Project documentation | REVIEW | `docs/reference/CATEGORY_QUICK_REFERENCE.md` |
| `docs/CLASSIFICATION_FIX_2026-01-11.md` | Project documentation | REVIEW | `docs/reference/CLASSIFICATION_FIX_2026-01-11.md` |
| `docs/CODEX_ACTIVITY_LOG.md` | Historical report / snapshot | ARCHIVE | `docs/archive/CODEX_ACTIVITY_LOG.md` |
| `docs/COMPLETE_IMPLEMENTATION_REPORT.md` | Historical report / snapshot | ARCHIVE | `docs/archive/COMPLETE_IMPLEMENTATION_REPORT.md` |
| `docs/CREDENTIAL_ROTATION_GUIDE.md` | Project documentation | REVIEW | `docs/reference/CREDENTIAL_ROTATION_GUIDE.md` |
| `docs/CSV_ROUNDTRIP_CONTRACT.md` | Behavior/data contract | KEEP | `docs/contracts/CSV_ROUNDTRIP_CONTRACT.md` |
| `docs/DATABASE_MIGRATION_FIX_2026-01-11.md` | Project documentation | REVIEW | `docs/reference/DATABASE_MIGRATION_FIX_2026-01-11.md` |
| `docs/DEPLOYMENT_REPORTS/2026-01-01_2255_full_deploy.md` | Deploy guide | KEEP | `docs/runbooks/2026-01-01_2255_full_deploy.md` |
| `docs/DEPLOYMENT_REPORTS/2026-01-02_0604_full_deploy.md` | Deploy guide | KEEP | `docs/runbooks/2026-01-02_0604_full_deploy.md` |
| `docs/DEPLOYMENT_REPORTS/2026-01-02_0605_full_deploy.md` | Deploy guide | KEEP | `docs/runbooks/2026-01-02_0605_full_deploy.md` |
| `docs/DEPLOYMENT_REPORTS/2026-01-02_1733_full_deploy.md` | Deploy guide | KEEP | `docs/runbooks/2026-01-02_1733_full_deploy.md` |
| `docs/DEPLOYMENT_REPORTS/2026-01-08_1432_full_deploy.md` | Deploy guide | KEEP | `docs/runbooks/2026-01-08_1432_full_deploy.md` |
| `docs/DEPLOYMENT_REPORTS/2026-01-08_1522_full_deploy.md` | Deploy guide | KEEP | `docs/runbooks/2026-01-08_1522_full_deploy.md` |
| `docs/DEPLOYMENT_REPORTS/commit_sync_template.md` | Project documentation | REVIEW | `docs/reference/commit_sync_template.md` |
| `docs/DOCS_CHANGELOG.md` | Historical report / snapshot | ARCHIVE | `docs/archive/DOCS_CHANGELOG.md` |
| `docs/E2E_TESTING_AND_VALIDATION_PLAN.md` | QA/testing docs | KEEP | `docs/process/E2E_TESTING_AND_VALIDATION_PLAN.md` |
| `docs/ERROR_HANDLING_TEST_SIMULATION.md` | QA/testing docs | KEEP | `docs/process/ERROR_HANDLING_TEST_SIMULATION.md` |
| `docs/EXECUTIVE_SUMMARY_BRANCH_CLEANUP.md` | Historical report / snapshot | ARCHIVE | `docs/archive/EXECUTIVE_SUMMARY_BRANCH_CLEANUP.md` |
| `docs/FIGURES_CONSISTENCY_FIX_2026-01-11.md` | Project documentation | REVIEW | `docs/reference/FIGURES_CONSISTENCY_FIX_2026-01-11.md` |
| `docs/FINAL_DEBUG_REPORT.md` | Historical report / snapshot | ARCHIVE | `docs/archive/FINAL_DEBUG_REPORT.md` |
| `docs/FINAL_DELIVERY_REPORT.md` | Historical report / snapshot | ARCHIVE | `docs/archive/FINAL_DELIVERY_REPORT.md` |
| `docs/FULL_DEPLOY_PROTOCOL.md` | Deploy guide | KEEP | `docs/runbooks/FULL_DEPLOY_PROTOCOL.md` |
| `docs/GITHUB_GOVERNANCE_REPORT.md` | Historical report / snapshot | ARCHIVE | `docs/archive/GITHUB_GOVERNANCE_REPORT.md` |
| `docs/IMPLEMENTATION_LOG.md` | Historical report / snapshot | ARCHIVE | `docs/archive/IMPLEMENTATION_LOG.md` |
| `docs/IMPLEMENTATION_PLAN_V3.md` | Project documentation | REVIEW | `docs/reference/IMPLEMENTATION_PLAN_V3.md` |
| `docs/IMPLEMENTATION_SUMMARY.md` | Historical report / snapshot | ARCHIVE | `docs/archive/IMPLEMENTATION_SUMMARY.md` |
| `docs/IMPLEMENTATION_USER_FEEDBACK_2026-01-03.md` | Project documentation | REVIEW | `docs/reference/IMPLEMENTATION_USER_FEEDBACK_2026-01-03.md` |
| `docs/IMPORT_CONTRACT.md` | Behavior/data contract | KEEP | `docs/contracts/IMPORT_CONTRACT.md` |
| `docs/IMPORT_LOGIC.md` | Historical report / snapshot | ARCHIVE | `docs/archive/IMPORT_LOGIC.md` |
| `docs/LOGIC_CONTRACT.md` | Business logic contract (immutable) | KEEP | `docs/contracts/LOGIC_CONTRACT.md` |
| `docs/MERCHANT_DICTIONARY_IMPLEMENTATION.md` | Project documentation | REVIEW | `docs/reference/MERCHANT_DICTIONARY_IMPLEMENTATION.md` |
| `docs/MERCHANT_DICTIONARY_PHASE_3_4_SPEC.md` | Project documentation | REVIEW | `docs/reference/MERCHANT_DICTIONARY_PHASE_3_4_SPEC.md` |
| `docs/NEXT_STEPS_CODEX_HANDOFF.md` | Project documentation | REVIEW | `docs/reference/NEXT_STEPS_CODEX_HANDOFF.md` |
| `docs/PHASE_4-6_REPORT.md` | Historical report / snapshot | ARCHIVE | `docs/archive/PHASE_4-6_REPORT.md` |
| `docs/PR_AUTH_FIX.md` | Project documentation | REVIEW | `docs/reference/PR_AUTH_FIX.md` |
| `docs/QA/BASELINE_ENV_AND_RUNBOOK.md` | QA/testing docs | KEEP | `docs/process/BASELINE_ENV_AND_RUNBOOK.md` |
| `docs/QA/DOCS_REALITY_SUMMARY.md` | QA/testing docs | KEEP | `docs/process/DOCS_REALITY_SUMMARY.md` |
| `docs/QA/E2E_TEST_MATRIX.md` | QA/testing docs | KEEP | `docs/process/E2E_TEST_MATRIX.md` |
| `docs/QA/E2E_VALIDATION_PLAN.md` | QA/testing docs | KEEP | `docs/process/E2E_VALIDATION_PLAN.md` |
| `docs/QA/FIX_PLAN.md` | QA/testing docs | KEEP | `docs/process/FIX_PLAN.md` |
| `docs/QA/FULL_APP_FIX_PLAN.md` | QA/testing docs | KEEP | `docs/process/FULL_APP_FIX_PLAN.md` |
| `docs/QA/FULL_APP_QA_MATRIX.md` | QA/testing docs | KEEP | `docs/process/FULL_APP_QA_MATRIX.md` |
| `docs/QA/FULL_APP_QA_REPORT.md` | QA/testing docs | KEEP | `docs/process/FULL_APP_QA_REPORT.md` |
| `docs/QA/ISSUE_LEDGER.md` | QA/testing docs | KEEP | `docs/process/ISSUE_LEDGER.md` |
| `docs/QA/QA_REPORT.md` | QA/testing docs | KEEP | `docs/process/QA_REPORT.md` |
| `docs/QUALITY_ASSURANCE_AND_DEBUG.md` | Historical report / snapshot | ARCHIVE | `docs/archive/QUALITY_ASSURANCE_AND_DEBUG.md` |
| `docs/RELEASE_NOTES_PACKAGE_1.md` | Project documentation | REVIEW | `docs/reference/RELEASE_NOTES_PACKAGE_1.md` |
| `docs/RELEASE_REPORT.md` | Historical report / snapshot | ARCHIVE | `docs/archive/RELEASE_REPORT.md` |
| `docs/REQUIREMENTS_TRACKING.md` | Project documentation | REVIEW | `docs/reference/REQUIREMENTS_TRACKING.md` |
| `docs/RULES_ENGINE_SPEC.md` | Project documentation | REVIEW | `docs/reference/RULES_ENGINE_SPEC.md` |
| `docs/RUNBOOK.md` | Operational runbook | KEEP | `docs/runbooks/RUNBOOK.md` |
| `docs/SCHEMA_DIFF.md` | Project documentation | REVIEW | `docs/reference/SCHEMA_DIFF.md` |
| `docs/SECURITY.md` | Security policy/audit | KEEP | `docs/security/SECURITY.md` |
| `docs/SECURITY/SECURITY_AUDIT_REPORT.md` | Security policy/audit | KEEP | `docs/security/SECURITY_AUDIT_REPORT.md` |
| `docs/SECURITY/SECURITY_BASELINE.md` | Security policy/audit | KEEP | `docs/security/SECURITY_BASELINE.md` |
| `docs/SECURITY_AUDIT_2025-12-29.md` | Security policy/audit | KEEP | `docs/security/SECURITY_AUDIT_2025-12-29.md` |
| `docs/TESTING.md` | QA/testing docs | KEEP | `docs/process/TESTING.md` |
| `docs/UI_IMPLEMENTATION_SUMMARY.md` | Historical report / snapshot | ARCHIVE | `docs/archive/UI_IMPLEMENTATION_SUMMARY.md` |
| `docs/UI_IMPROVEMENTS_PHASE_1.md` | Project documentation | REVIEW | `docs/reference/UI_IMPROVEMENTS_PHASE_1.md` |
| `docs/UI_IMPROVEMENTS_PHASE_2.md` | Project documentation | REVIEW | `docs/reference/UI_IMPROVEMENTS_PHASE_2.md` |
| `docs/UI_IMPROVEMENTS_PHASE_3.md` | Project documentation | REVIEW | `docs/reference/UI_IMPROVEMENTS_PHASE_3.md` |
| `docs/UI_IMPROVEMENTS_SUMMARY.md` | Historical report / snapshot | ARCHIVE | `docs/archive/UI_IMPROVEMENTS_SUMMARY.md` |
| `docs/ULTIMATE_FINAL_REPORT.md` | Historical report / snapshot | ARCHIVE | `docs/archive/ULTIMATE_FINAL_REPORT.md` |
| `docs/UPLOAD_FIXES_SUMMARY.md` | Historical report / snapshot | ARCHIVE | `docs/archive/UPLOAD_FIXES_SUMMARY.md` |
| `docs/UPLOAD_SCREEN_FIXES.md` | Project documentation | REVIEW | `docs/reference/UPLOAD_SCREEN_FIXES.md` |
| `docs/USER_FEEDBACK_PHASE_2_STATUS.md` | Project documentation | REVIEW | `docs/reference/USER_FEEDBACK_PHASE_2_STATUS.md` |
| `docs/UX_CRITIQUE.md` | Project documentation | REVIEW | `docs/reference/UX_CRITIQUE.md` |
| `docs/UX_UI_ASSESSMENT_FULL.md` | Project documentation | REVIEW | `docs/reference/UX_UI_ASSESSMENT_FULL.md` |
| `docs/UX_UI_EXPERT_PANEL_REPORT.md` | Historical report / snapshot | ARCHIVE | `docs/archive/UX_UI_EXPERT_PANEL_REPORT.md` |
| `docs/UX_UI_MASTER_PLAN.md` | Project documentation | REVIEW | `docs/reference/UX_UI_MASTER_PLAN.md` |
| `docs/_codex/AI_FEATURES_NOTES.md` | Project documentation | REVIEW | `docs/reference/AI_FEATURES_NOTES.md` |
| `docs/_codex/BATCH_EXECUTION_INSTRUCTIONS.md` | Project documentation | REVIEW | `docs/reference/BATCH_EXECUTION_INSTRUCTIONS.md` |
| `docs/_codex/CATEGORY_CLASSIFICATION_PROPOSAL.md` | Project documentation | REVIEW | `docs/reference/CATEGORY_CLASSIFICATION_PROPOSAL.md` |
| `docs/_codex/CODEX_ACTIVITY_LOG.md` | Historical report / snapshot | ARCHIVE | `docs/archive/CODEX_ACTIVITY_LOG.md` |
| `docs/_codex/CODEX_HANDOFF_TO_CLAUDE.md` | Project documentation | REVIEW | `docs/reference/CODEX_HANDOFF_TO_CLAUDE.md` |
| `docs/_codex/DATA_PIPELINE_NOTES.md` | Project documentation | REVIEW | `docs/reference/DATA_PIPELINE_NOTES.md` |
| `docs/_codex/DB_RESET_AND_SEED_EXECUTION_SUMMARY.md` | Historical report / snapshot | ARCHIVE | `docs/archive/DB_RESET_AND_SEED_EXECUTION_SUMMARY.md` |
| `docs/_codex/DECISION_LOG.md` | Historical report / snapshot | ARCHIVE | `docs/archive/DECISION_LOG.md` |
| `docs/_codex/DEPLOYMENT_CONNECTIVITY_QA_COMPLETE_SUMMARY.md` | Deploy guide | KEEP | `docs/runbooks/DEPLOYMENT_CONNECTIVITY_QA_COMPLETE_SUMMARY.md` |
| `docs/_codex/DEPLOYMENT_NOTES.md` | Deploy guide | KEEP | `docs/runbooks/DEPLOYMENT_NOTES.md` |
| `docs/_codex/DIFF_SUMMARY.md` | Historical report / snapshot | ARCHIVE | `docs/archive/DIFF_SUMMARY.md` |
| `docs/_codex/ENVIRONMENT_DRIFT_NOTES.md` | Project documentation | REVIEW | `docs/reference/ENVIRONMENT_DRIFT_NOTES.md` |
| `docs/_codex/FEATURE_IMPLEMENTATION_PLAN.md` | Project documentation | REVIEW | `docs/reference/FEATURE_IMPLEMENTATION_PLAN.md` |
| `docs/_codex/ISSUES_REGISTER.md` | Project documentation | REVIEW | `docs/reference/ISSUES_REGISTER.md` |
| `docs/_codex/NEXT_10_WORKPACKAGES.md` | Project documentation | REVIEW | `docs/reference/NEXT_10_WORKPACKAGES.md` |
| `docs/_codex/PHASES_1_TO_4_COMPLETE_SUMMARY.md` | Historical report / snapshot | ARCHIVE | `docs/archive/PHASES_1_TO_4_COMPLETE_SUMMARY.md` |
| `docs/_codex/PHASES_1_TO_4_QA_COMPLETE_SUMMARY.md` | Historical report / snapshot | ARCHIVE | `docs/archive/PHASES_1_TO_4_QA_COMPLETE_SUMMARY.md` |
| `docs/_codex/PHASE_3_4_IMPLEMENTATION_SPEC.md` | Project documentation | REVIEW | `docs/reference/PHASE_3_4_IMPLEMENTATION_SPEC.md` |
| `docs/_codex/PLAN_LOG.md` | Historical report / snapshot | ARCHIVE | `docs/archive/PLAN_LOG.md` |
| `docs/_codex/PLAN_STRUCTURE_CONTRACT.md` | Behavior/data contract | KEEP | `docs/contracts/PLAN_STRUCTURE_CONTRACT.md` |
| `docs/_codex/PRD_FROM_USER_FEEDBACK.md` | Project documentation | REVIEW | `docs/reference/PRD_FROM_USER_FEEDBACK.md` |
| `docs/_codex/QA_NOTES.md` | Project documentation | REVIEW | `docs/reference/QA_NOTES.md` |
| `docs/_codex/README.md` | Project documentation | REVIEW | `docs/reference/README.md` |
| `docs/_codex/RESOLVED_DECISIONS.md` | Project documentation | REVIEW | `docs/reference/RESOLVED_DECISIONS.md` |
| `docs/_codex/USER_FEEDBACK_VERBATIM.md` | Project documentation | REVIEW | `docs/reference/USER_FEEDBACK_VERBATIM.md` |
| `docs/_codex/codex_instructions.md` | Project documentation | REVIEW | `docs/reference/codex_instructions.md` |
| `docs/_codex/reviews/2025-12-29/EXECUTIVE_SUMMARY.md` | Historical report / snapshot | ARCHIVE | `docs/archive/EXECUTIVE_SUMMARY.md` |
| `docs/_codex/reviews/2025-12-29/FEATURE_VERIFICATION_MATRIX.md` | Project documentation | REVIEW | `docs/reference/FEATURE_VERIFICATION_MATRIX.md` |
| `docs/_codex/reviews/2025-12-29/IMPROVEMENT_ROADMAP.md` | Project documentation | REVIEW | `docs/reference/IMPROVEMENT_ROADMAP.md` |
| `docs/_codex/reviews/2025-12-29/QA_RUNBOOK.md` | Operational runbook | KEEP | `docs/runbooks/QA_RUNBOOK.md` |
| `docs/_codex/reviews/2025-12-29/TECHNICAL_ASSESSMENT.md` | Project documentation | REVIEW | `docs/reference/TECHNICAL_ASSESSMENT.md` |
| `docs/_codex/reviews/2025-12-29/UX_UI_REVIEW.md` | Project documentation | REVIEW | `docs/reference/UX_UI_REVIEW.md` |
| `docs/_codex/ux_review/MICROCOPY_AND_LANGUAGE_REVIEW.md` | Project documentation | REVIEW | `docs/reference/MICROCOPY_AND_LANGUAGE_REVIEW.md` |
| `docs/_codex/ux_review/MISSING_FEATURES_AND_OPPORTUNITIES.md` | Project documentation | REVIEW | `docs/reference/MISSING_FEATURES_AND_OPPORTUNITIES.md` |
| `docs/_codex/ux_review/MISSING_FEATURES_PLAN.md` | Project documentation | REVIEW | `docs/reference/MISSING_FEATURES_PLAN.md` |
| `docs/_codex/ux_review/NAVIGATION_AND_INFORMATION_ARCHITECTURE.md` | Architecture reference | KEEP | `docs/architecture/NAVIGATION_AND_INFORMATION_ARCHITECTURE.md` |
| `docs/_codex/ux_review/PHASE_B_UX_IMPLEMENTATION_CHECKLIST.md` | Project documentation | REVIEW | `docs/reference/PHASE_B_UX_IMPLEMENTATION_CHECKLIST.md` |
| `docs/_codex/ux_review/PRODUCT_EXPERIENCE_OVERVIEW.md` | Project documentation | REVIEW | `docs/reference/PRODUCT_EXPERIENCE_OVERVIEW.md` |
| `docs/_codex/ux_review/SCREEN_BY_SCREEN_REVIEW.md` | Project documentation | REVIEW | `docs/reference/SCREEN_BY_SCREEN_REVIEW.md` |
| `docs/_codex/ux_review/UX_CONTRACTS_AND_RULES.md` | Behavior/data contract | KEEP | `docs/contracts/UX_CONTRACTS_AND_RULES.md` |
| `docs/_codex/ux_review/UX_IMPROVEMENT_ROADMAP.md` | Project documentation | REVIEW | `docs/reference/UX_IMPROVEMENT_ROADMAP.md` |
| `docs/adr/001-nextjs-app-router.md` | Project documentation | REVIEW | `docs/reference/001-nextjs-app-router.md` |
| `docs/adr/002-authjs-replacement.md` | Project documentation | REVIEW | `docs/reference/002-authjs-replacement.md` |
| `docs/adr/003-evidence-ingestion.md` | Project documentation | REVIEW | `docs/reference/003-evidence-ingestion.md` |
| `docs/adr/004-deterministic-migrations.md` | Project documentation | REVIEW | `docs/reference/004-deterministic-migrations.md` |
| `docs/archive/implementation/FEATURE_IMPLEMENTATION_REPORT_OLD.md` | Historical report / snapshot | ARCHIVE | `docs/archive/FEATURE_IMPLEMENTATION_REPORT_OLD.md` |
| `docs/archive/implementation/IMPLEMENTATION_MASTER_PLAN_OLD.md` | Project documentation | REVIEW | `docs/reference/IMPLEMENTATION_MASTER_PLAN_OLD.md` |
| `docs/archive/implementation/IMPLEMENTATION_PLAN_FINAL_OLD.md` | Historical report / snapshot | ARCHIVE | `docs/archive/IMPLEMENTATION_PLAN_FINAL_OLD.md` |
| `docs/archive/implementation/IMPLEMENTATION_ROADMAP_OLD.md` | Project documentation | REVIEW | `docs/reference/IMPLEMENTATION_ROADMAP_OLD.md` |
| `docs/archive/ui_ux/UI_OVERHAUL_PROGRESS_OLD.md` | Project documentation | REVIEW | `docs/reference/UI_OVERHAUL_PROGRESS_OLD.md` |
| `docs/archive/ui_ux/UX_UPGRADE_PHASE_A_PLAN_OLD.md` | Project documentation | REVIEW | `docs/reference/UX_UPGRADE_PHASE_A_PLAN_OLD.md` |
| `docs/branch-archive/branch_feat__notes.md` | Project documentation | REVIEW | `docs/reference/branch_feat__notes.md` |
| `docs/branch-archive/codex_impl-phases-1-4__notes.md` | Project documentation | REVIEW | `docs/reference/codex_impl-phases-1-4__notes.md` |
| `docs/branch-archive/fix_classificacao-dados-ui-enhancements-2026-01-02__notes.md` | Project documentation | REVIEW | `docs/reference/fix_classificacao-dados-ui-enhancements-2026-01-02__notes.md` |
| `docs/branch-archive/fix_deployment-connectivity__notes.md` | Deploy guide | KEEP | `docs/runbooks/fix_deployment-connectivity__notes.md` |
| `docs/branch-archive/fix_sparkasse-import-diagnostics-20260101__notes.md` | Project documentation | REVIEW | `docs/reference/fix_sparkasse-import-diagnostics-20260101__notes.md` |
| `docs/deploy.md` | Deploy guide | KEEP | `docs/runbooks/deploy.md` |
| `docs/performance.md` | Project documentation | REVIEW | `docs/reference/performance.md` |
| `docs/prompts/CODEX_FULL_APP_E2E_QA_SECURITY.md` | Security policy/audit | KEEP | `docs/security/CODEX_FULL_APP_E2E_QA_SECURITY.md` |
| `docs/prompts/README.md` | Project documentation | REVIEW | `docs/reference/README.md` |
| `docs/prompts/UX_UI_MASTER_PLAN_PROMPT.md` | Project documentation | REVIEW | `docs/reference/UX_UI_MASTER_PLAN_PROMPT.md` |
| `docs/prompts/critique_to_code_workflow.md` | Project documentation | REVIEW | `docs/reference/critique_to_code_workflow.md` |
| `docs/prompts/documentation_and_handoff_specialist.md` | Project documentation | REVIEW | `docs/reference/documentation_and_handoff_specialist.md` |
| `docs/prompts/react_auto_save_refactor.md` | Project documentation | REVIEW | `docs/reference/react_auto_save_refactor.md` |
| `docs/prompts/ui_ux_expert_critique.md` | Project documentation | REVIEW | `docs/reference/ui_ux_expert_critique.md` |
| `docs/prompts/ui_ux_modernization_expert.md` | Project documentation | REVIEW | `docs/reference/ui_ux_modernization_expert.md` |
| `docs/quality-assessment.md` | Project documentation | REVIEW | `docs/reference/quality-assessment.md` |
| `docs/repo-map.md` | Project documentation | REVIEW | `docs/reference/repo-map.md` |
| `docs/rule-engine.md` | Project documentation | REVIEW | `docs/reference/rule-engine.md` |
| `docs/rules-parity-report.md` | Historical report / snapshot | ARCHIVE | `docs/archive/rules-parity-report.md` |
| `docs/rules-source-contract.md` | Behavior/data contract | KEEP | `docs/contracts/rules-source-contract.md` |
| `docs/screen-feature-audit.md` | Historical report / snapshot | ARCHIVE | `docs/archive/screen-feature-audit.md` |
| `docs/vercel-cli-troubleshooting.md` | Project documentation | REVIEW | `docs/reference/vercel-cli-troubleshooting.md` |
| `playwright-report/data/d9e10b147c5d9209caf6e280473f0b9200cc83ea.md` | Root-level doc (historical/unclear ownership) | ARCHIVE | `docs/archive/root/d9e10b147c5d9209caf6e280473f0b9200cc83ea.md` |
| `replit.md` | Root-level doc (historical/unclear ownership) | ARCHIVE | `docs/archive/root/replit.md` |
| `test-results/e2e-features-RitualFin-Fea-12ce0--should-display-ritual-tabs-chromium/error-context.md` | Root-level doc (historical/unclear ownership) | ARCHIVE | `docs/archive/root/error-context.md` |
| `test-results/e2e-features-RitualFin-Fea-3b383-show-budget-comparison-data-chromium/error-context.md` | Root-level doc (historical/unclear ownership) | ARCHIVE | `docs/archive/root/error-context.md` |
| `test-results/e2e-features-RitualFin-Fea-428d6-ld-display-budget-proposals-chromium/error-context.md` | Root-level doc (historical/unclear ownership) | ARCHIVE | `docs/archive/root/error-context.md` |
| `test-results/e2e-features-RitualFin-Fea-4bfef--working-sidebar-navigation-chromium/error-context.md` | Root-level doc (historical/unclear ownership) | ARCHIVE | `docs/archive/root/error-context.md` |
| `test-results/e2e-features-RitualFin-Fea-742aa-es-should-show-ritual-tasks-chromium/error-context.md` | Root-level doc (historical/unclear ownership) | ARCHIVE | `docs/archive/root/error-context.md` |
| `test-results/e2e-features-RitualFin-Fea-7a558-year-navigation-prominently-chromium/error-context.md` | Root-level doc (historical/unclear ownership) | ARCHIVE | `docs/archive/root/error-context.md` |
| `test-results/e2e-features-RitualFin-Fea-7e9fc-uld-navigate-between-months-chromium/error-context.md` | Root-level doc (historical/unclear ownership) | ARCHIVE | `docs/archive/root/error-context.md` |
| `test-results/e2e-features-RitualFin-Fea-95c39--should-display-budget-tabs-chromium/error-context.md` | Root-level doc (historical/unclear ownership) | ARCHIVE | `docs/archive/root/error-context.md` |
| `test-results/e2e-features-RitualFin-Fea-ce34e-h-navigation-without-errors-chromium/error-context.md` | Root-level doc (historical/unclear ownership) | ARCHIVE | `docs/archive/root/error-context.md` |

## Consolidation Steps

1. Add index docs (no moves) linking to canonical docs under the taxonomy above.
2. Move *archive* candidates first into `docs/archive/` and update internal links with a repo-wide search/replace.
3. Move *keep* candidates into their target folders, updating relative links.
4. Add `docs/README.md` as the canonical entrypoint.

## Acceptance Criteria

- `rg -n "\(docs/[^)]*\.md\)"` finds no broken intra-repo markdown links.
- Build/test/lint scripts do not depend on moved markdown paths.
- `docs/LOGIC_CONTRACT.md` remains identical (content + path or a redirect file if moved).
