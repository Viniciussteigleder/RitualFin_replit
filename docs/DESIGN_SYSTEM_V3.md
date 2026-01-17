# RitualFin Design System V3
## Premium Fintech UI — Calm, Cohesive, Consistent

---

## 1. DESIGN PRINCIPLES

### Tone
- **Premium Fintech**: Calm confidence, minimal but not sterile
- **Readable**: Strong contrast, clear hierarchy, generous whitespace
- **Consistent**: One system, not a collection of screens

### Visual Language
- **Rounded-square aesthetic**: 10–18px radii throughout
- **Soft elevation**: Subtle shadows, no harsh edges
- **Purposeful motion**: Hover brighten, pressed scale 0.98, smooth 200–300ms transitions

---

## 2. GLOBAL TOKENS

### Spacing Scale
```
4px   → gap-1
8px   → gap-2
12px  → gap-3
16px  → gap-4
24px  → gap-6
32px  → gap-8
48px  → gap-12
```

### Radii System
```
--radius-button: 10px   (icon buttons)
--radius-card:   15px   (cards, containers)
--radius-sheet:  18px   (modals, sheets)
```

### Elevation (Shadows)
```css
--shadow-premium-sm: 0 2px 4px rgba(0,0,0,0.02), 0 1px 0 rgba(0,0,0,0.02)
--shadow-premium-md: 0 12px 24px -8px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.02)
--shadow-premium-lg: 0 24px 48px -12px rgba(0,0,0,0.12), 0 8px 16px -4px rgba(0,0,0,0.04)
```

### Typography
- **Font**: Inter (system fallback: system-ui, -apple-system, sans-serif)
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Scale**:
  - Display: 3.5rem (56px) / 4rem (64px)
  - H1: 2.25rem (36px)
  - H2: 1.5rem (24px)
  - Body: 0.875rem (14px)
  - Small: 0.75rem (12px)
  - Micro: 0.625rem (10px)

---

## 3. COLOR SYSTEM

### Brand Colors
```
--primary: hsl(142 76% 36%)     /* Ritual Green (deeper, premium) */
--primary-foreground: #FFFFFF
```

### Neutrals (Light Mode)
```
--background: hsl(142 12% 98.5%)  /* Ultra-calm off-white */
--foreground: hsl(142 40% 5%)     /* Deep charcoal */
--card: hsl(0 0% 100%)
--border: hsl(142 12% 92%)
--muted: hsl(142 8% 94%)
--muted-foreground: hsl(142 10% 45%)
```

### Neutrals (Dark Mode)
```
--background: hsl(160 30% 2.5%)   /* Deep obsidian */
--foreground: hsl(142 15% 95%)
--card: hsl(160 30% 4.5%)
--border: hsl(160 30% 12%)
--muted: hsl(160 30% 8%)
--muted-foreground: hsl(142 10% 65%)
```

### Status Colors (System Feedback)
```
Success:  #10b981
Warning:  #f59e0b
Error:    #ef4444
Info:     #3b82f6
```

### Category Accent Palette (Canonical)
**Rule**: Each category has ONE canonical hex color. Use intensity levels (strong/medium/soft) for variations.

| Category    | Hex       | Slug       | Icon          |
|-------------|-----------|------------|---------------|
| Alimentação | `#F59E0B` | food       | Utensils      |
| Mercados    | `#10B981` | market     | ShoppingBag   |
| Moradia     | `#3B82F6` | housing    | Home          |
| Transporte  | `#6366F1` | transport  | Car           |
| Lazer       | `#8B5CF6` | leisure    | Dumbbell      |
| Compras     | `#EC4899` | shopping   | ShoppingBag   |
| Saúde       | `#F43F5E` | health     | Heart         |
| Trabalho    | `#14B8A6` | work       | Briefcase     |
| Educação    | `#EAB308` | education  | GraduationCap |
| Finanças    | `#F59E0B` | finance    | Building2     |
| Outros      | `#94A3B8` | others     | HelpCircle    |

**Intensity Model**:
- **Strong**: Full opacity (charts, active states)
- **Medium**: 80% mix with white (badges, small bars)
- **Soft**: 12% opacity (subtle backgrounds, row highlights)

**CSS Usage**:
```css
[data-category="market"] { --cat-color: #10b981; }
.bg-cat-strong { background-color: var(--cat-color); }
.text-cat-strong { color: var(--cat-color); }
.bg-cat-medium { background-color: color-mix(in srgb, var(--cat-color) 80%, white); }
.bg-cat-soft { background-color: color-mix(in srgb, var(--cat-color) 12%, transparent); }
```

---

## 4. ICON BUTTON COMPONENT

### Spec
- **Size**: 56×56px
- **Radius**: 10px
- **Border**: None
- **Icon**: White, 24px (stroke-width: 2)
- **Fill**: Solid color or 135° gradient

### States
```
Default:  base fill + shadow-premium-sm
Hover:    +10% brightness + shadow-premium-md
Pressed:  -5% brightness + scale(0.98)
Focus:    2px ring, 2px offset
Selected: 2px outer ring (primary color)
```

### Component API
```tsx
<AppIcon 
  icon={Wallet} 
  color="#10b981"
  variant="solid" | "gradient"
  selected={false}
/>
```

---

## 5. CARD SYSTEM

### Base Card
```tsx
<Card className="ritual-card">
  {/* 15px radius, border, shadow-premium-sm */}
</Card>
```

### Hover Card
```tsx
<Card className="ritual-card ritual-card-hover">
  {/* Lifts -4px, shadow-premium-md on hover */}
</Card>
```

### Accent Border (Category/Status)
```tsx
<Card className="ritual-card border-l-[3px] border-l-[#10b981]">
  {/* Left accent stripe */}
</Card>
```

---

## 6. CATEGORY COLOR POLICY

### Rules
1. **Semantic accents, not background paint**: Use category colors for small badges, chart segments, icons—not large card fills.
2. **One canonical palette**: Fixed mapping, never changes across screens.
3. **3-level intensity**: strong (opaque), medium (80% mix), soft (12% opacity).
4. **Accessibility**: Text on strong backgrounds = white. Text on soft backgrounds = neutral foreground.
5. **Charts**: Limit simultaneous colors (Top 5 default, group long tail as "Others").

### Anti-patterns
- ❌ Flooding large cards with saturated category color
- ❌ Using category colors for system status (use status colors instead)
- ❌ Red/green-only meaning without labels or icons

---

## 7. ANIMATION STANDARDS

### Transitions
```css
.transition-premium { 
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1); 
}
```

### Keyframes
- **Slide Up**: `translateY(10px) → 0` over 400ms
- **Fade In**: `opacity 0 → 1` over 400ms
- **Scale Press**: `scale(1) → 0.98` over 100ms

### Stagger Delays
```
Item 1: 0ms
Item 2: 50ms
Item 3: 100ms
...
```

---

## 8. ACCESSIBILITY

### Focus States
- **Visible ring**: 2px solid, 2px offset, primary color
- **Keyboard navigation**: All interactive elements must show focus ring

### Contrast
- **Text on light**: Minimum 4.5:1 (WCAG AA)
- **Text on dark**: Minimum 4.5:1
- **Category colors**: Use white text on strong backgrounds

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 9. COMPONENT INVENTORY

### Global
- `AppIcon` (ritual-icon-button)
- `Card` (ritual-card, ritual-card-hover)
- `Button` (primary, secondary, ghost)
- `Badge` (status, category)

### Dashboard
- KPI Cards (Budget, Spent, Projected)
- Category Chart (donut + legend)
- Account Cards
- Predictive Insights

### Transactions
- Transaction List (filters, search, bulk actions)
- Transaction Detail (split, edit, delete)
- Category Drill-down

### Forms
- Input (text, number, date)
- Select (dropdown, multi-select)
- Checkbox, Radio
- Validation states

---

## 10. LOGO & BRAND USAGE

### Logo Mark
- **Preserve**: Green emblem + white "R" (existing identity)
- **Usage**: Header/sidebar anchor, onboarding
- **App Icon**: Rounded-square container (10px radius), mark centered

### Brand Green
- **Primary actions**: Buttons, links, active states
- **Do not overuse**: Keep green meaningful and brand-consistent
- **Separate from category green**: `--primary` vs `cat.market`

---

## 11. IMPLEMENTATION CHECKLIST

### Phase 1: Foundation ✅
- [x] Update `globals.css` with new tokens
- [x] Create `AppIcon` component
- [x] Update `CATEGORY_CONFIGS` with canonical palette
- [x] Apply to Dashboard page

### Phase 2: Components (Next)
- [ ] Update all category badges/chips
- [ ] Standardize all cards (Transactions, Analytics, etc.)
- [ ] Update navigation (sidebar, mobile nav)
- [ ] Standardize form inputs

### Phase 3: Screens
- [ ] Transactions list + detail
- [ ] Categories drill-down
- [ ] Budgets & Forecast
- [ ] Ritual Review
- [ ] Goals / Savings
- [ ] Settings

### Phase 4: Polish
- [ ] Dark mode refinement
- [ ] Animation timing
- [ ] Accessibility audit
- [ ] Performance optimization

---

## 12. QUALITY BAR

**"Done" means:**
- ✅ One cohesive system, not a collection of screens
- ✅ Categories instantly recognizable and consistent everywhere
- ✅ Active/hover/focus/pressed states uniform across components
- ✅ Calm, readable, premium with strong hierarchy and minimal clutter
- ✅ Brand logo intact and integrated, not pasted on

---

**Version**: 3.0  
**Last Updated**: 2026-01-17  
**Status**: Foundation Complete, Components In Progress
