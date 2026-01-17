# RitualFin V3 Design System — Quick Reference

## 🎨 Icon Button Spec

```
┌─────────────────────────┐
│                         │
│         ┌───┐          │  Size: 56×56px
│         │ ⚡ │          │  Radius: 10px
│         └───┘          │  Border: None
│                         │  Icon: White, 24px
│                         │  Fill: Solid or Gradient
└─────────────────────────┘

States:
• Default:  base color + shadow-sm
• Hover:    +10% brightness + shadow-md
• Pressed:  -5% brightness + scale(0.98)
• Selected: 2px ring (primary)
```

## 🎴 Card System

```
┌──────────────────────────────────────┐
│  ritual-card                         │
│  • Radius: 15px                      │
│  • Border: 1px (--border)            │
│  • Shadow: premium-sm                │
│                                      │
│  ritual-card-hover                   │
│  • Hover: -4px lift + shadow-md      │
└──────────────────────────────────────┘

Accent Border (Category/Status):
┃ ← 3px colored stripe
┃  Card content...
```

## 🌈 Category Colors (Canonical Palette)

```
Alimentação  ████  #F59E0B  (Amber)
Mercados     ████  #10B981  (Emerald) 
Moradia      ████  #3B82F6  (Blue)
Transporte   ████  #6366F1  (Indigo)
Lazer        ████  #8B5CF6  (Violet)
Compras      ████  #EC4899  (Pink)
Saúde        ████  #F43F5E  (Rose)
Trabalho     ████  #14B8A6  (Teal)
Educação     ████  #EAB308  (Yellow)
Finanças     ████  #F59E0B  (Amber)
Outros       ████  #94A3B8  (Slate)
```

### Intensity Levels

```
Strong:  ████████  100% opacity (charts, icons)
Medium:  ████░░░░   80% mix white (badges)
Soft:    ██░░░░░░   12% opacity (backgrounds)
```

## 📏 Spacing Scale

```
gap-1   →   4px   ▪
gap-2   →   8px   ▪▪
gap-3   →  12px   ▪▪▪
gap-4   →  16px   ▪▪▪▪
gap-6   →  24px   ▪▪▪▪▪▪
gap-8   →  32px   ▪▪▪▪▪▪▪▪
gap-12  →  48px   ▪▪▪▪▪▪▪▪▪▪▪▪
```

## 🎭 Component Usage Examples

### AppIcon
```tsx
<AppIcon 
  icon={Wallet} 
  color="#10b981"
  variant="gradient"
  selected={false}
/>
```

### CategoryBadge
```tsx
<CategoryBadge 
  categoryName="Mercados"
  variant="default"  // soft bg
  size="md"
  showIcon={true}
/>
```

### Card
```tsx
<Card className="ritual-card ritual-card-hover border-l-[3px] border-l-[#10b981]">
  <CardContent className="p-8">
    {/* Content */}
  </CardContent>
</Card>
```

## 🎯 Color Usage Rules

### ✅ DO
- Use category colors for small accents (badges, chart segments, icons)
- Use 3-level intensity model (strong/medium/soft)
- Keep category mapping consistent across all screens
- Use white text on strong backgrounds

### ❌ DON'T
- Flood large cards with saturated category colors
- Mix category colors with status colors (success/warning/error)
- Use red/green alone without labels or icons
- Add new categories without updating the canonical palette

## 📱 Responsive Breakpoints

```
Mobile:   < 640px   (sm)
Tablet:   640-1024px (md)
Desktop:  > 1024px  (lg, xl)
```

## ⚡ Animation Timing

```
Fast:     150ms  (micro-interactions)
Default:  300ms  (most transitions)
Slow:     500ms  (page transitions)

Easing: cubic-bezier(0.4, 0, 0.2, 1)
```

## 🔍 Accessibility Checklist

- [ ] Focus rings visible (2px, 2px offset)
- [ ] Contrast ratio ≥ 4.5:1 for text
- [ ] White text on strong category backgrounds
- [ ] Keyboard navigation works
- [ ] Reduced motion respected

## 📦 Key Files

```
Design System:
  docs/DESIGN_SYSTEM_V3.md
  docs/UI_REDESIGN_IMPLEMENTATION_REPORT.md

Styles:
  src/app/globals.css

Components:
  src/components/ui/app-icon.tsx
  src/components/ui/category-badge.tsx
  src/components/ui/ritual-icon-button.tsx

Utils:
  src/lib/constants/categories.ts
  src/lib/utils/category-colors.ts

Pages:
  src/app/page.tsx (Dashboard - ✅ Updated)
```

## 🚀 Quick Start

1. **Use AppIcon for all icon buttons**
   ```tsx
   <AppIcon icon={IconName} color="#hexcolor" />
   ```

2. **Use CategoryBadge for category indicators**
   ```tsx
   <CategoryBadge categoryName="Mercados" />
   ```

3. **Use ritual-card for all cards**
   ```tsx
   <Card className="ritual-card">...</Card>
   ```

4. **Get category colors programmatically**
   ```tsx
   import { getCategoryColor } from '@/lib/utils/category-colors';
   const color = getCategoryColor("Mercados"); // "#10B981"
   ```

---

**Remember**: One system, not a collection of screens. Keep it calm, premium, and consistent! 🎨✨
