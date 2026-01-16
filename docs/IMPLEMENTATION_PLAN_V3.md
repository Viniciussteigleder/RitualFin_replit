# RitualFin V3 - Implementation Plan
**Date:** 2026-01-14
**Based on:** UX/UI Expert Panel Report

## Current Status

### ✅ Already Fixed
- `SAMPLE_QUESTIONS` export issue resolved (moved to `/src/lib/constants/ai-questions.ts`)
- Build passes locally
- Core functionality working

### ❌ Current Issues
1. CI checks failing on PR #71
2. Vercel deployment issues
3. Lint temporarily disabled
4. Branch protection blocking merge

## Implementation Priority

### Phase 1: Stabilization (IMMEDIATE)
**Goal:** Get PR #71 merged and deployment stable

1. **Re-enable proper linting**
   - Update `package.json` lint script
   - Fix any lint errors
   - Ensure CI passes

2. **Fix Vercel deployment**
   - Verify environment variables
   - Check build configuration
   - Test deployment preview

3. **Merge PR #71**
   - Get review approval
   - Merge to main
   - Verify production deployment

### Phase 2: Architecture Refactoring (HIGH PRIORITY)
**Goal:** Implement Brad Frost's Atomic Design recommendations

1. **Break down TransactionList monolith** (548 lines → modular components)
   ```
   src/components/transactions/
   ├── TransactionRow.tsx          (Pure component for single transaction)
   ├── TransactionFilters.tsx      (Search + filter UI)
   ├── TransactionGroup.tsx        (Date header + grouped rows)
   └── TransactionList.tsx         (Orchestrator component)
   ```

2. **Separate concerns**
   - Move filtering logic to custom hooks
   - Extract data fetching to server components
   - Create reusable UI atoms

### Phase 3: UX Enhancements (MEDIUM PRIORITY)
**Goal:** Implement expert panel recommendations

1. **Smart Categorization Feed** (Steve Krug + Don Norman)
   - Create `QuickReviewCard.tsx` component
   - Implement Tinder-style card interface
   - Add to Dashboard for quick categorization
   - Gamify the review process

2. **Filter Chips** (Luke Wroblewski)
   - Replace hidden filter dropdown
   - Add horizontal scrollable chips
   - Improve mobile experience

3. **Visual Polish** (Jony Ive)
   - Increase avatar sizes (48px)
   - Remove vertical borders, use whitespace
   - Add subtle hover elevations
   - Improve typography hierarchy

### Phase 4: AI Features (FUTURE)
**Goal:** Make AI more proactive and accessible

1. **The Daily Brief**
   - Story-style financial summary
   - Automatic insights
   - Gamified consumption

2. **Natural Language Rules**
   - Plain English rule creation
   - AI translation to database rules
   - Simplified user experience

## Success Criteria

### Phase 1 (This Session)
- [ ] PR #71 merged successfully
- [ ] Production deployment stable
- [ ] All CI checks passing
- [ ] Lint re-enabled and passing

### Phase 2 (Next Session)
- [ ] TransactionList refactored into 4+ components
- [ ] Code coverage maintained
- [ ] Performance improved (lighthouse score)

### Phase 3 (Future)
- [ ] QuickReviewCard implemented
- [ ] Filter chips working on mobile
- [ ] Visual polish complete
- [ ] User testing positive feedback

## Technical Debt to Address

1. **Linting:** Currently disabled - needs re-enabling
2. **Component size:** TransactionList too large (548 lines)
3. **Mixed concerns:** UI and logic in same components
4. **Mobile UX:** Dense layouts, hidden filters
5. **AI integration:** Too passive, needs proactive features

## Next Steps

1. Fix immediate CI/deployment issues
2. Get PR #71 merged
3. Create new branch for Phase 2 refactoring
4. Implement atomic design pattern
5. Add QuickReviewCard feature
6. Polish and deploy

---

*This plan prioritizes stability first, then architecture, then features - ensuring we don't break what's working while improving the foundation.*
