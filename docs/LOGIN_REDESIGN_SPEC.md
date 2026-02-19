# Login Redesign Specification & Implementation Plan

## 1. Information Architecture (IA) Hierarchy

The page follows a strictly prioritized vertical flow for accessibility and conversion.

*   **Header**
    *   Logo (Clickable -> Home)
    *   Headline ("Sign in")
    *   Subtext ("Use your work email.")
*   **Primary Auth Action (SSO)**
    *   "Continue with Google" Button
    *   *Rationale: Lowest friction path first.*
*   **Divider**
    *   "Or" separator
*   **Secondary Auth Action (Credentials)**
    *   Email Input
    *   Password Input + Show/Hide Toggle + Forgot Password Link
    *   "Sign in" Button (Primary CTA)
*   **Acquisition Path**
    *   "Create account" Link
*   **Footer**
    *   Terms of Service • Privacy Policy

## 2. Wireframe Description

### Mobile (≤ 480px)
*   **Layout**: Single column, full width content within safe area.
*   **Padding**: 20–24px horizontal padding (`p-5` or `p-6`).
*   **Styling**: Elements appear directly on the background (or on a full-width flat card) to maximize usable width. No card borders/shadows to reduce visual noise on small screens.
*   **Touch Targets**: All interactive elements ≥ 44px. Inputs are 48px high.

### Tablet (481–1024px)
*   **Layout**: Centered Card on a neutral background.
*   **Card Dimensions**: Max width 440px.
*   **Padding**: 32px internal card padding.
*   **Visuals**: Soft shadow (`shadow-lg`), subtle border (`border-border/50`).

### Desktop (≥ 1025px)
*   **Variant A (Selected)**: Centered Card.
    *   Consistent with Tablet layout.
    *   Focus remains entirely on the form.
    *   Best for distraction-free authentication.

## 3. Final UI Specifications

### Typography
*   **Headline**: 24px (text-2xl), Semibold/Bold (`font-semibold`).
*   **Body/Subtext**: 14px (text-sm), Muted (`text-muted-foreground`).
*   **Labels**: 14px (text-sm), Medium (`font-medium`).
*   **Inputs**: 16px (mobile) / 14px (desktop) to prevent zoom.
*   **Buttons**: 14-16px, Medium (`font-medium`).

### Spacing Tokens (Tailwind)
*   **Card Padding**: `p-6` (Mobile), `p-8` (Tablet/Desktop).
*   **Vertical Gap**: `space-y-6` between major sections (Header / SSO / Form).
*   **Input Gap**: `space-y-4` between inputs.
*   **Internal Input Gap**: `space-y-2` (Label to Input).

### Colors (Theme Tokens)
*   **Background**: `bg-muted/40` (Light Gray surface).
*   **Card**: `bg-card` (White/Dark Gray).
*   **Primary Action**: `bg-primary`, `text-primary-foreground`.
*   **Text**: `text-foreground` (Main), `text-muted-foreground` (Secondary).
*   **Error**: `text-destructive`, `bg-destructive/10`.

## 4. State Matrix

| Component | State | Visual | Behavior |
| :--- | :--- | :--- | :--- |
| **Email Input** | Default | Border: `border-input` | |
| | Focus | Ring: `ring-2 ring-ring` | Blue/Brand focus ring |
| | Error | Border: `border-destructive` | Error message slides up below |
| **Password Input** | Default | Masked characters | Eye icon visible |
| | Active | Text visible | Eye-off icon visible |
| **Sign In Button** | Default | `bg-primary` | Standard state |
| | Hover | `bg-primary/90` | Subtle opacity shift |
| | Loading | Opacity 50% + Spinner | Disabled, non-clickable |
| | Disabled | Opacity 50% | When form is submitting |
| **Global Error** | Visible | Red text, Red bg tint | Appears above SSO button |

## 5. Copy Deck

| Element | Copy Text | Notes |
| :--- | :--- | :--- |
| **Headline** | "Sign in" | |
| **Subtext** | "Use your work email." | Optional |
| **SSO Button** | "Continue with Google" | |
| **Divider** | "OR" | Uppercase, small |
| **Email Label** | "Email" | |
| **Email Placeholder** | "name@example.com" | |
| **Password Label** | "Password" | |
| **Forgot Password** | "Forgot password?" | |
| **Primary CTA** | "Sign in" | |
| **Secondary CTA** | "Don't have an account? Create account" | "Create account" is the link |
| **Footer** | "Terms" • "Privacy" | |
| **Auth Error** | "Sign-in failed. Check your details and try again." | Generic for security |
| **Network Error** | "Something went wrong. Please try again." | |
| **Validation: Email** | "Invalid email address" | |
| **Validation: Required** | "Password is required" | |

## 6. Implementation Plan & Accessibility Checkout

### Implementation Status
- [x] **Page Structure**: Implemented `src/app/(auth)/login/page.tsx` with Responsive Design.
- [x] **Components**: Used `ui/card`, `ui/button`, `ui/input`, `ui/label`.
- [x] **Icons**: Integrated `lucide-react` icons (Google SVG manually inserted).
- [x] **Features**:
    - [x] Show/Hide Password.
    - [x] Client-side Validation (Zod + React Hook Form).
    - [x] Loading States (`useTransition`).
    - [x] Error Handling (Global + Inline).
- [x] **Analytics**: Created `src/lib/analytics-tracker.ts` and instrumented the page.

### Accessibility (A11y) Checklist
- [x] **Keyboard Navigation**: Logical tab order verified (SSO -> Inputs -> Actions).
- [x] **Labels**: All inputs have associated `Label` or `aria-label`.
- [x] **Focus Indicators**: Standard Tailwind `focus-visible` ring is maintained.
- [x] **Screen Readers**:
    - [x] Global errors use `role="alert"` and `aria-live="polite"`.
    - [x] Field errors use `aria-describedby` linking input to error message.
    - [x] Password toggle uses `aria-label` that updates state ("Show password" / "Hide password").
- [x] **Contrast**: Uses standard high-contrast theme tokens (`foreground` on `background`).
- [x] **Touch Targets**: Buttons adhere to min-height 44px (actually 48px/`h-12` for primary inputs).

### Next Steps for Engineering
1.  **Backend Integration**: Ensure `signIn('credentials')` in `next-auth` is configured to specific backend logic.
2.  **Routes**: Verify `/forgot-password`, `/signup`, `/terms`, `/privacy` routes exist or create placeholders.
3.  **Analytics**: Replace `console.log` in `src/lib/analytics-tracker.ts` with real provider (e.g., PostHog, Segment).
