# Implementation Log

**Project**: Goals & Category Goals API Implementation
**Started**: 2025-12-27
**Status**: In Progress

---

## Purpose

This file serves as a chronological implementation log for the Goals & Category Goals API feature. It tracks:
- What is being implemented and why
- Files being modified
- API contracts (requests/responses)
- Key decisions and their rationale
- Debugging artifacts and intermediate results

---

## Decision Log

### Decision 1: Goals Data Model - One Goal Per Month vs Flexible Goals

**Decision Made**: One goal record per user per month

**Option A (Chosen)**: Single goal per month with embedded category targets
- Schema: `goals` table has `month` field (text, format: YYYY-MM)
- Each goal has multiple `categoryGoals` children
- One-to-many relationship: goal → category goals

**Option B (Rejected)**: Flexible goal system with arbitrary date ranges
- Would allow weekly goals, quarterly goals, custom ranges
- More complex to query and aggregate
- Doesn't match existing budget/dashboard monthly cycle

**Rationale**:
- App already operates on monthly cycles (dashboard, budgets, CSV imports)
- Users think in monthly terms for budgeting
- Simplifies queries: `WHERE month = '2025-12'`
- Aligns with existing `budgets` table structure

**Trade-offs Accepted**:
- Cannot set goals for periods other than calendar months
- Users who want Q1 goals must create 3 separate monthly goals

**Revisit Trigger**:
- If users request quarterly or annual goal tracking
- If dashboard moves away from monthly view

---

### Decision 2: API Design - Nested vs Flat Category Goals Endpoints

**Decision Made**: Nested routes under parent goal

**Option A (Chosen)**: Nest category goals under goal ID
- `POST /api/goals/:goalId/categories`
- `GET /api/goals/:goalId/categories`
- Category goals cannot exist without a parent goal

**Option B (Rejected)**: Flat, independent category goals routes
- `POST /api/category-goals` (with `goalId` in body)
- `GET /api/category-goals?goalId=xyz`
- Category goals are first-class resources

**Rationale**:
- Category goals have no meaning without a parent goal
- Nested routes make the relationship explicit
- Matches existing schema: `categoryGoals.goalId` references `goals.id`
- Prevents orphaned category goals

**Trade-offs Accepted**:
- More verbose URLs
- Cannot bulk-fetch category goals across multiple goals in one request

**Revisit Trigger**:
- If we need cross-month category goal analysis
- If category goals gain independent lifecycle

---

### Decision 3: Progress Calculation - Computed vs Stored

**Decision Made**: Compute progress on-demand, do not store

**Option A (Chosen)**: Calculate actual spending on each request
- `GET /api/goals/:id/progress` queries transactions in real-time
- Joins `goals` + `categoryGoals` + `transactions` tables
- Returns fresh, accurate data

**Option B (Rejected)**: Pre-calculate and store progress fields
- Add `actualSpent` columns to `categoryGoals` table
- Update via background job or triggers on transaction changes
- Faster reads, but stale data risk

**Rationale**:
- Transaction data changes frequently (new imports, confirmations, edits)
- Keeping stored values in sync adds complexity
- Goals are queried less frequently than transactions change
- PostgreSQL can efficiently aggregate monthly transactions

**Trade-offs Accepted**:
- Slightly slower response times for progress endpoint
- More complex SQL query with aggregations

**Revisit Trigger**:
- If progress queries become performance bottleneck (>500ms)
- If we add caching layer (Redis)
- If users request historical progress snapshots

---

### Decision 4: Historical Data - Previous Month Spending

**Decision Made**: Fetch previous month on-demand, store as optional metadata

**Option A (Chosen)**: Store `previousMonthSpent` and `averageSpent` in categoryGoals
- Calculated once when creating category goal
- Used as guidance for setting targets
- Does not update if past data changes

**Option B (Rejected)**: Always compute historical data on-demand
- Query last 3-6 months of transactions each request
- More accurate but much slower
- No need for extra columns

**Rationale**:
- Historical data is for reference when *setting* goals, not tracking progress
- Users set goals based on "what I spent last month"
- Doesn't need to be live-updated
- Schema already includes these fields

**Trade-offs Accepted**:
- Historical data is snapshot at goal creation time
- If user edits past transactions, historical values don't update

**Revisit Trigger**:
- If users expect historical data to update automatically
- If we add "recalculate history" feature

---

## Implementation Timeline

### Phase 1: Documentation & Design (COMPLETE)
- [x] Create IMPLEMENTATION_LOG.md
- [x] Create ARCHITECTURE_AND_AI_LOGIC.md
- [x] Document logging strategy
- [x] Design all API endpoints (8 endpoints)
- [x] Define request/response schemas

### Phase 2: Backend Implementation
- [ ] Add storage layer methods
- [ ] Implement API routes
- [ ] Add validation middleware
- [ ] Add structured logging

### Phase 3: Testing & Validation
- [ ] Manual API testing
- [ ] Error case validation
- [ ] Data integrity checks

### Phase 4: Frontend Integration
- [ ] Wire up Goals page
- [ ] Add loading states
- [ ] Handle error cases

---

## Files to Modify

### Backend
- `server/storage.ts` - Add goals CRUD methods
- `server/routes.ts` - Add API endpoints
- `shared/schema.ts` - Review, possibly add indexes (read-only review)

### Frontend (Phase 4 only)
- `client/src/pages/goals.tsx` - Connect to API
- `client/src/lib/api.ts` - Add API client methods

### Documentation
- `docs/IMPLEMENTATION_LOG.md` - This file
- `docs/ARCHITECTURE_AND_AI_LOGIC.md` - System overview

---

## API Endpoint Design

### Overview

**Total Endpoints**: 8

**Goals Management** (4 endpoints):
- `GET /api/goals` - Fetch goals for a month
- `POST /api/goals` - Create new goal
- `PATCH /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

**Category Goals Management** (3 endpoints):
- `GET /api/goals/:goalId/categories` - Fetch category targets
- `POST /api/goals/:goalId/categories` - Create/update category target
- `DELETE /api/category-goals/:id` - Delete category target

**Progress Tracking** (1 endpoint):
- `GET /api/goals/:id/progress` - Get actual vs planned spending

---

### Endpoint 1: GET /api/goals

**Purpose**: Fetch goal(s) for a specific month or all goals for the user

**Query Parameters**:
```typescript
{
  month?: string  // Optional. Format: YYYY-MM. If omitted, returns all goals.
}
```

**Request Example**:
```
GET /api/goals?month=2025-12
```

**Response Schema** (200 OK):
```typescript
{
  goals: [
    {
      id: string,
      userId: string,
      month: string,              // "2025-12"
      estimatedIncome: number,    // 3500.00
      totalPlanned: number,       // 2800.00
      createdAt: string           // ISO 8601
    }
  ]
}
```

**Response Example**:
```json
{
  "goals": [
    {
      "id": "goal-uuid-123",
      "userId": "user-uuid-456",
      "month": "2025-12",
      "estimatedIncome": 3500.00,
      "totalPlanned": 2800.00,
      "createdAt": "2025-12-01T10:00:00.000Z"
    }
  ]
}
```

**Error Cases**:
- 400: Invalid month format (not YYYY-MM)
- 500: Database error

**Error Response Example**:
```json
{
  "error": "Invalid month format. Expected YYYY-MM, got '12-2025'"
}
```

---

### Endpoint 2: POST /api/goals

**Purpose**: Create a new monthly goal

**Request Schema**:
```typescript
{
  month: string,              // Required. Format: YYYY-MM
  estimatedIncome: number,    // Required. Must be >= 0
  totalPlanned: number        // Required. Must be >= 0
}
```

**Validation Rules**:
- `month`: Must match regex `/^\d{4}-\d{2}$/`
- `estimatedIncome`: Must be non-negative number
- `totalPlanned`: Must be non-negative number
- Duplicate check: Cannot create two goals for same userId + month

**Request Example**:
```json
{
  "month": "2025-12",
  "estimatedIncome": 3500.00,
  "totalPlanned": 2800.00
}
```

**Response Schema** (201 Created):
```typescript
{
  id: string,
  userId: string,
  month: string,
  estimatedIncome: number,
  totalPlanned: number,
  createdAt: string
}
```

**Response Example**:
```json
{
  "id": "goal-uuid-789",
  "userId": "user-uuid-456",
  "month": "2025-12",
  "estimatedIncome": 3500.00,
  "totalPlanned": 2800.00,
  "createdAt": "2025-12-27T14:30:00.000Z"
}
```

**Error Cases**:
- 400: Validation error (invalid month format, negative numbers)
- 409: Conflict (goal already exists for this month)
- 500: Database error

**Error Response Examples**:
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "month",
      "message": "Invalid month format. Expected YYYY-MM"
    }
  ]
}
```

```json
{
  "error": "Goal already exists for month 2025-12"
}
```

---

### Endpoint 3: PATCH /api/goals/:id

**Purpose**: Update an existing goal's estimated income or total planned

**URL Parameters**:
- `id`: Goal UUID

**Request Schema** (all fields optional):
```typescript
{
  estimatedIncome?: number,  // Must be >= 0
  totalPlanned?: number      // Must be >= 0
}
```

**Request Example**:
```json
{
  "estimatedIncome": 3800.00,
  "totalPlanned": 3000.00
}
```

**Response Schema** (200 OK):
```typescript
{
  id: string,
  userId: string,
  month: string,
  estimatedIncome: number,
  totalPlanned: number,
  createdAt: string
}
```

**Error Cases**:
- 400: Validation error (negative numbers)
- 404: Goal not found
- 500: Database error

---

### Endpoint 4: DELETE /api/goals/:id

**Purpose**: Delete a goal and all its associated category goals

**URL Parameters**:
- `id`: Goal UUID

**Request Example**:
```
DELETE /api/goals/goal-uuid-789
```

**Response Schema** (200 OK):
```typescript
{
  success: boolean,
  deletedGoalId: string,
  deletedCategoryGoalsCount: number
}
```

**Response Example**:
```json
{
  "success": true,
  "deletedGoalId": "goal-uuid-789",
  "deletedCategoryGoalsCount": 5
}
```

**Error Cases**:
- 404: Goal not found
- 500: Database error

**Implementation Note**:
- Must delete all categoryGoals with goalId = :id first (cascade delete)
- Then delete the goal itself
- Wrap in transaction to ensure atomicity

---

### Endpoint 5: GET /api/goals/:goalId/categories

**Purpose**: Fetch all category targets for a specific goal

**URL Parameters**:
- `goalId`: Goal UUID

**Request Example**:
```
GET /api/goals/goal-uuid-789/categories
```

**Response Schema** (200 OK):
```typescript
{
  categoryGoals: [
    {
      id: string,
      goalId: string,
      category1: string,           // e.g., "Moradia", "Mercado"
      targetAmount: number,
      previousMonthSpent: number | null,
      averageSpent: number | null
    }
  ]
}
```

**Response Example**:
```json
{
  "categoryGoals": [
    {
      "id": "catgoal-uuid-111",
      "goalId": "goal-uuid-789",
      "category1": "Moradia",
      "targetAmount": 800.00,
      "previousMonthSpent": 780.50,
      "averageSpent": 795.25
    },
    {
      "id": "catgoal-uuid-222",
      "goalId": "goal-uuid-789",
      "category1": "Mercado",
      "targetAmount": 400.00,
      "previousMonthSpent": 385.20,
      "averageSpent": 410.00
    }
  ]
}
```

**Error Cases**:
- 404: Goal not found
- 500: Database error

---

### Endpoint 6: POST /api/goals/:goalId/categories

**Purpose**: Create or update a category target for a goal

**Design Decision**: Upsert logic
- If category already exists for this goal → update targetAmount
- If category doesn't exist → create new

**URL Parameters**:
- `goalId`: Goal UUID

**Request Schema**:
```typescript
{
  category1: string,              // Required. Must be valid category from enum
  targetAmount: number,           // Required. Must be >= 0
  previousMonthSpent?: number,    // Optional. Auto-calculated if omitted
  averageSpent?: number           // Optional. Auto-calculated if omitted
}
```

**Validation Rules**:
- `category1`: Must be one of: "Receitas", "Moradia", "Mercado", "Compras Online", "Transporte", "Saúde", "Lazer", "Outros", "Interno"
- `targetAmount`: Must be non-negative number

**Request Example**:
```json
{
  "category1": "Moradia",
  "targetAmount": 800.00
}
```

**Response Schema** (201 Created or 200 OK):
```typescript
{
  id: string,
  goalId: string,
  category1: string,
  targetAmount: number,
  previousMonthSpent: number | null,
  averageSpent: number | null
}
```

**Response Example**:
```json
{
  "id": "catgoal-uuid-333",
  "goalId": "goal-uuid-789",
  "category1": "Moradia",
  "targetAmount": 800.00,
  "previousMonthSpent": 780.50,
  "averageSpent": 795.25
}
```

**Error Cases**:
- 400: Validation error (invalid category, negative amount)
- 404: Parent goal not found
- 500: Database error

**Implementation Note**:
If `previousMonthSpent` and `averageSpent` are omitted:
1. Get goal's month (e.g., "2025-12")
2. Calculate previous month: "2025-11"
3. Query transactions for that month with matching category1
4. Sum amounts where `excludeFromBudget = false` and `internalTransfer = false`
5. Calculate average from last 3 months

---

### Endpoint 7: DELETE /api/category-goals/:id

**Purpose**: Delete a specific category target

**URL Parameters**:
- `id`: CategoryGoal UUID

**Request Example**:
```
DELETE /api/category-goals/catgoal-uuid-333
```

**Response Schema** (200 OK):
```typescript
{
  success: boolean,
  deletedCategoryGoalId: string
}
```

**Response Example**:
```json
{
  "success": true,
  "deletedCategoryGoalId": "catgoal-uuid-333"
}
```

**Error Cases**:
- 404: Category goal not found
- 500: Database error

---

### Endpoint 8: GET /api/goals/:id/progress

**Purpose**: Get actual vs planned spending for a goal, broken down by category

**URL Parameters**:
- `id`: Goal UUID

**Request Example**:
```
GET /api/goals/goal-uuid-789/progress
```

**Response Schema** (200 OK):
```typescript
{
  goal: {
    id: string,
    month: string,
    estimatedIncome: number,
    totalPlanned: number
  },
  progress: {
    totalActualSpent: number,          // Sum of all actual spending
    totalTarget: number,               // Sum of all category targets
    remainingBudget: number,           // totalTarget - totalActualSpent
    percentSpent: number,              // (totalActualSpent / totalTarget) * 100
    categories: [
      {
        category1: string,
        targetAmount: number,
        actualSpent: number,
        remaining: number,
        percentSpent: number,
        status: "under" | "over" | "on-track"  // under budget, over budget, within 10%
      }
    ]
  }
}
```

**Response Example**:
```json
{
  "goal": {
    "id": "goal-uuid-789",
    "month": "2025-12",
    "estimatedIncome": 3500.00,
    "totalPlanned": 2800.00
  },
  "progress": {
    "totalActualSpent": 1876.43,
    "totalTarget": 2800.00,
    "remainingBudget": 923.57,
    "percentSpent": 67.01,
    "categories": [
      {
        "category1": "Moradia",
        "targetAmount": 800.00,
        "actualSpent": 780.50,
        "remaining": 19.50,
        "percentSpent": 97.56,
        "status": "on-track"
      },
      {
        "category1": "Mercado",
        "targetAmount": 400.00,
        "actualSpent": 385.20,
        "remaining": 14.80,
        "percentSpent": 96.30,
        "status": "on-track"
      },
      {
        "category1": "Lazer",
        "targetAmount": 200.00,
        "actualSpent": 245.80,
        "remaining": -45.80,
        "percentSpent": 122.90,
        "status": "over"
      }
    ]
  }
}
```

**Error Cases**:
- 404: Goal not found
- 500: Database error

**Implementation Note**:
Query to calculate actual spending:
```sql
SELECT
  category1,
  SUM(amount) as actualSpent
FROM transactions
WHERE
  userId = ?
  AND DATE_TRUNC('month', paymentDate) = ?
  AND excludeFromBudget = false
  AND internalTransfer = false
GROUP BY category1
```

**Status Calculation**:
- `under`: percentSpent < 90%
- `on-track`: 90% <= percentSpent <= 110%
- `over`: percentSpent > 110%

---

## Request/Response Summary Table

| Endpoint | Method | Request Body | Response Code | Response Body |
|----------|--------|--------------|---------------|---------------|
| `/api/goals?month=YYYY-MM` | GET | - | 200 | `{ goals: Goal[] }` |
| `/api/goals` | POST | `{ month, estimatedIncome, totalPlanned }` | 201 | `Goal` |
| `/api/goals/:id` | PATCH | `{ estimatedIncome?, totalPlanned? }` | 200 | `Goal` |
| `/api/goals/:id` | DELETE | - | 200 | `{ success, deletedGoalId, deletedCategoryGoalsCount }` |
| `/api/goals/:goalId/categories` | GET | - | 200 | `{ categoryGoals: CategoryGoal[] }` |
| `/api/goals/:goalId/categories` | POST | `{ category1, targetAmount, previousMonthSpent?, averageSpent? }` | 201 | `CategoryGoal` |
| `/api/category-goals/:id` | DELETE | - | 200 | `{ success, deletedCategoryGoalId }` |
| `/api/goals/:id/progress` | GET | - | 200 | `{ goal, progress }` |

---

## Validation Schemas (Zod)

Using existing schemas from `shared/schema.ts`:
- `insertGoalSchema` - for POST /api/goals
- `insertCategoryGoalSchema` - for POST /api/goals/:goalId/categories

Custom validation needed:
- Month format: `/^\d{4}-\d{2}$/`
- Category enum validation (already in schema)
- Non-negative number checks

---

## Logging Strategy

### Principles

**Structured Logging Format**:
```typescript
{
  timestamp: string,        // ISO 8601
  level: "INFO" | "WARN" | "ERROR",
  endpoint: string,         // e.g., "POST /api/goals"
  userId: string,           // Always log which user
  action: string,           // e.g., "create_goal", "fetch_progress"
  metadata: object,         // Context-specific data
  duration?: number,        // Response time in ms
  error?: string            // Error message (no stack traces in prod)
}
```

### What to Log

**Request Entry** (INFO):
```typescript
{
  level: "INFO",
  endpoint: "POST /api/goals",
  userId: user.id,
  action: "create_goal",
  metadata: { month: "2025-12" }
}
```

**Validation Failures** (WARN):
```typescript
{
  level: "WARN",
  endpoint: "POST /api/goals",
  userId: user.id,
  action: "validation_failed",
  metadata: {
    errors: ["month must be in YYYY-MM format"],
    invalidInput: { month: "December 2025" }  // Safe to log, no PII
  }
}
```

**Successful Responses** (INFO):
```typescript
{
  level: "INFO",
  endpoint: "GET /api/goals/:id/progress",
  userId: user.id,
  action: "fetch_progress_success",
  metadata: {
    goalId: "goal123",
    categoriesCount: 5,
    totalTarget: 2500.00,
    totalActual: 1876.43
  },
  duration: 127  // ms
}
```

**Database Errors** (ERROR):
```typescript
{
  level: "ERROR",
  endpoint: "POST /api/goals",
  userId: user.id,
  action: "database_error",
  error: "duplicate key violation on goals.month",
  metadata: {
    operation: "insert",
    table: "goals"
  }
}
```

### What NOT to Log

**Never log**:
- Raw transaction descriptions (may contain merchant names, personal info)
- Full CSV content
- API keys or tokens
- Password hashes
- Personal financial data (amounts, balances, account numbers)

**Safe to log**:
- Transaction IDs (UUIDs)
- Category names (generic: "Moradia", "Mercado")
- Counts and aggregates
- Month identifiers
- Validation error messages
- HTTP status codes

### Implementation Approach

**Simple console logging for now**:
```typescript
// At start of each endpoint
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: "INFO",
  endpoint: `${req.method} ${req.path}`,
  userId: user.id,
  action: "create_goal",
  metadata: { month: req.body.month }
}));

// At end of request
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: "INFO",
  endpoint: `${req.method} ${req.path}`,
  userId: user.id,
  action: "create_goal_success",
  metadata: { goalId: goal.id },
  duration: Date.now() - startTime
}));
```

**Future**: Replace with proper logging library (Winston, Pino) when moving to production

### Log Retention

- Development: Console only (ephemeral)
- Production: Stream to log aggregator (Datadog, CloudWatch, etc.)
- Retention: 30 days for INFO, 90 days for ERROR

### Privacy Compliance

All logging follows these rules:
- No PII without explicit user consent
- Financial amounts logged only as aggregates (sums, counts)
- Transaction descriptions never logged in full
- All logs are for debugging/observability, not analytics

---

## Testing Notes

*(To be completed during testing)*

---

## Issues & Blockers

*(None yet)*

---

## Debugging Artifacts

*(To be added as implementation progresses)*
