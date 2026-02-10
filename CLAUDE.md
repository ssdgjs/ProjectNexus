# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Project Nexus** is an AI-native distributed organization operating system. This project is currently in the **planning/conceptual phase** - only a comprehensive PRD exists, no implementation code yet.

The vision is to create a "managerless" organization system where AI serves as the scheduling hub, treating both human workers and AI Agents as equal "work nodes". The system decomposes strategic goals into atomic tasks and distributes them to the most suitable nodes.

## Current State

- **Status**: **Phase 1 Implementation Complete** - Core features deployed to production
- **Production URL**: http://182.254.159.223:8080
- **Documentation**: `PRD.md` contains the complete product requirements (in Chinese)
- **Architecture**: Monolithic application with:
  - Backend: Python + FastAPI + SQLAlchemy 2.0 Async
  - Frontend: React + TypeScript + Tailwind CSS + Vite
  - Database: PostgreSQL 16 (production)
  - Deployment: Docker Compose on Tencent Cloud
- **Implemented Features**:
  - ✅ JWT Authentication system (Commander/Node roles)
  - ✅ Project management (CRUD)
  - ✅ Module management with grab-style assignment
  - ✅ Multi-attachment delivery submission
  - ✅ Acceptance/Review flow
  - ✅ Notification system
  - ✅ Knowledge base (basic CRUD)

## Database Migration (Alembic)

**IMPORTANT**: This project uses **Alembic** for database migration management. All database schema changes must go through Alembic migrations.

### Why Alembic?
- Ensures local and production databases are **identical**
- Prevents field name mismatches (e.g., `allocated_score` vs `score_share`)
- Provides version control for schema changes
- Supports rollback capabilities

### Workflow
1. **Modify SQLAlchemy models** in `backend/app/models/`
2. **Generate migration**:
   ```bash
   cd backend
   alembic revision --autogenerate -m "description of changes"
   ```
3. **Review migration** in `backend/alembic/versions/`
4. **Test locally**:
   ```bash
   alembic upgrade head
   ```
5. **Deploy to production**:
   ```bash
   python3 deploy-migrations.py
   ```

### Current Status
- **Migration version**: `822d24ccec2a`
- **Description**: Initial migration with all 12 tables
- **Last updated**: 2026-02-09

### Documentation
- **Quick Reference**: `ALEMBIC_QUICKREF.md`
- **Full Guide**: `ALEMBIC_GUIDE.md`
- **Setup Summary**: `ALEMBIC_SETUP_SUMMARY.md`

**⚠️ NEVER** modify production database directly. Always use Alembic migrations!

## Planned Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Lingjing Core Brand System |
| Backend | Python + FastAPI |
| ORM | SQLAlchemy |
| Database | PostgreSQL |
| Agents (future) | LangChain ecosystem, DeepSeek V3.2 |
| Deployment | Docker Compose |

## Four Core Engines (Planned Architecture)

| Engine | Name | Responsibility |
|--------|------|----------------|
| Decomposition | The Prism | Breaks strategic goals into executable modules |
| Scheduling | The Dispatcher | Matches tasks to optimal nodes based on capability |
| Consensus | The Ledger | Records work proof, settles tokens |
| Connection | The Strand | Knowledge accumulation and reuse |

## Core Data Model (12 Tables)

The database schema is defined in `PRD.md` section 17. Key tables include:
- **Users**: User/node management with reputation scores and concurrent task limits
- **Projects**: Project management with status tracking
- **Modules**: Task/module management with deadlines and bounty
- **Module_Assignees**: Many-to-many relationship with score sharing
- **Deliveries**: Delivery submission records
- **Reviews**: Acceptance/rejection records
- **Knowledge_Items**: Knowledge repository files
- **Knowledge_Links**: Knowledge-to-task associations
- **Reputation_History**: Reputation score change history
- **Agent_Calls**: Agent invocation tracking
- **Notifications**: In-app notification system
- **Module_Abandon_Requests**: Task abandonment requests

## Key Business Rules

### Task Management
- **Task decomposition**: ~1 month per module (Vibe Coding reference)
- **Assignment mode**: Pure "grab" mode - no algorithmic matching in MVP
- **Concurrency limit**: Each node can have max 3 concurrent tasks
- **Multi-person collaboration**: Max 5 people per module, Commander allocates scores
- **Task transfer**: Not allowed
- **Task abandonment**: Requires Commander approval

### Acceptance Flow
1. Node submits delivery
2. Commander reviews with three possible outcomes:
   - **Pass**: Settlement, task complete
   - **Reject**: Feedback provided for revision
   - **Close**: Task discarded, work saved as attachment, no reputation impact

### Reputation System
- **Initial score**: 100
- **Type**: Composite score (no dimension separation)
- **Calculation**: Commander's subjective evaluation
- **MVP usage**: Leaderboard display only (not for priority or bonus)

### Knowledge Base
- **File types**: zip, md documents, images
- **File size limit**: ≤30MB
- **Permissions**:
  - Upload: All users
  - Delete: Own items + Commander can delete all
  - Download: All users can download all knowledge
- **Association**: Manual linking by nodes during task execution

### Agent/Skills (Placeholder in MVP)
- Discovery: Browse/search/recommend
- Invocation: Download code/config, run locally
- Tracking: Record caller, agent, time, call count
- Contribution: Accumulate points by call count

## User Roles

### MVP Roles
| Role | Responsibility |
|------|---------------|
| **Commander (指挥官)** | Top decision-maker, sets strategic goals, accepts tasks, adjusts reputation |
| **Node (节点)** | Task承接者 and executor |

### Future Expansion (Phase 1.5+)
- Commander-in-Chief, Strategy Officer, Technology Officer, Talent Officer, Delivery Officer

## UI/UX Requirements

- **Design System**: Lingjing Core Brand System (AI Edition) - prioritizes clean, smart, ethereal aesthetics
- **Color Scheme**: Dual color
- **Responsive**: Yes (PC + Mobile)
- **Language**: Chinese-only (no i18n in MVP)

### Core Pages (Priority)
| Page | Priority |
|------|----------|
| Dashboard/Home | P0 |
| Project Details | P0 |
| Module Details | P0 |
| Knowledge Base | P0 |
| Node Leaderboard | P1 |
| Personal Center | P1 |

## Development Plan (4-Week Sprint)

**Methodology**: TDD + Vibe Coding
**AI Assistance**: Cursor + Claude 4.6

```
Week 1: Infrastructure
├── Backend init (FastAPI + Docker)
├── Frontend init (React + Design System)
├── Database design & init
└── User system

Week 2: Core Features
├── Role system (Commander/Node)
├── Project management
├── Module management
└── Module assignment (grab mode)

Week 3: Execution Flow
├── Delivery submission
├── Acceptance flow
├── Multi-person collaboration
├── Score allocation
└── Timeout display

Week 4: Peripheral Features
├── Reputation system
├── Leaderboard
├── Knowledge base
└── Agent-related (placeholder)
```

## Important Design Decisions

### Data Transparency
- **No data isolation** between nodes - all data is visible to all users
- Commander has additional deletion permissions
- All projects, modules, deliveries, reputation scores visible to everyone

### Notification Events
Events that trigger in-app notifications:
- New module published → All nodes
- Someone grabs task → Commander
- Delivery submitted → Commander
- Acceptance result (pass/reject) → Assigned nodes
- Task closed → Assigned nodes
- Task timeout → Assigned nodes + Commander
- Abandon request → Commander
- Reputation change → Affected node
- New knowledge uploaded → All users

### Non-Functional Requirements
- **Concurrency**: Target 10 concurrent users
- **Browser**: Chrome standard versions
- **Security (MVP)**: Username + password, no password policy, no encryption
- **Monitoring**: System status, user operations, errors, API calls, log rotation

## Key Risks to Address

| Risk | Mitigation |
|------|-----------|
| Algorithmic tyranny | Introduce circuit breakers and manual appeal channels |
| Task granularity | Avoid over-granular decomposition (management cost > production cost) |
| Non-quantifiable work evaluation | Creative/aesthetic/emotional work is hard to quantify algorithmically |

## MVP Success Criteria

- **Target**: Complete 5 end-to-end tasks

## Language Note

This project is **Chinese-first**. The PRD and UI are entirely in Chinese. All user-facing text should be in Chinese.

---

# Development Log & Technical Decisions

This section documents key development experiences, technical challenges, and solutions for future reference.

## Phase 1 Implementation Progress (Feb 2025)

### Completed Features

#### 1. Authentication System ✅
- **Backend**: JWT-based auth with role-based access control (RBAC)
- **Frontend**: Login/register forms with auth state management (Zustand)
- **Roles**: Commander (指挥官) and Node (节点)
- **Files**:
  - `backend/app/api/v1/auth.py`
  - `backend/app/core/deps.py` (dependency injection for auth)
  - `frontend/src/store/authStore.ts`
  - `frontend/src/components/auth/LoginForm.tsx`

#### 2. Project Management ✅
- CRUD operations for projects
- Commander-only creation permissions
- Project status tracking (planning, in_progress, completed, archived)
- **Files**: `backend/app/api/v1/projects.py`, `frontend/src/pages/ProjectsPage.tsx`

#### 3. Module Management ✅
- Module creation with project association
- Grab-style task assignment (first-come-first-served)
- Concurrency limit enforcement (max 3 tasks per node)
- Multi-person collaboration support (max 5 per module)
- **Files**: `backend/app/api/v1/modules.py`, `frontend/src/pages/ModulesPage.tsx`

#### 4. Multi-Attachment Delivery Submission ✅
- Support for multiple named attachments (name + URL pairs)
- Dynamic add/remove attachment entries in UI
- JSON storage in database for flexibility
- **Files**:
  - `backend/app/api/v1/deliveries.py`
  - `backend/app/models/delivery.py`
  - `backend/app/schemas/delivery.py`
  - `frontend/src/components/modules/DeliverySubmissionModal.tsx`

---

## Technical Challenges & Solutions

### Challenge 1: React Hook Form + Select Element Type Mismatch

**Problem**:
```typescript
// HTML select elements return strings, but backend expects numbers
<select {...register('project_id')}>
  <option value="1">Project A</option>  // value is string "1", not number 1
</select>
```

**Solution**:
Use `valueAsNumber: true` in register options:
```typescript
<select {...register('project_id', { valueAsNumber: true })}>
```

**Location**: `frontend/src/pages/ModulesPage.tsx:54-55`

---

### Challenge 2: React Hook Form + Custom Input Component Render Prop

**Problem**:
When using Input component's `render` prop with `register`, the field object wasn't properly bound to the rendered element:
```tsx
<Input
  {...register('content')}
  render={({ field }) => <textarea {...field} />}  // field props not applied correctly
/>
```

**Solution**:
Simplify by directly using register without the render prop:
```tsx
<label>交付内容</label>
<textarea
  {...register('content', { required: '请输入交付内容' })}
  rows={6}
  className="..."
/>
{errors.content && <p className="error">{errors.content.message}</p>}
```

**Location**: `frontend/src/components/modules/DeliverySubmissionModal.tsx:94-107`

---

### Challenge 3: SQLAlchemy JSON Serialization of Pydantic Models

**Problem**:
```python
# Pydantic models can't be directly stored in SQLAlchemy JSON columns
new_delivery = Delivery(
    attachments=delivery_data.attachments  # List[AttachmentItem] - Pydantic models
)
await db.commit()  # ERROR: Object of type AttachmentItem is not JSON serializable
```

**Solution**:
Convert Pydantic models to plain dicts before database insertion:
```python
# Convert Pydantic models to dicts for JSON serialization
attachments_data = None
if delivery_data.attachments:
    attachments_data = [
        {"name": item.name, "url": item.url}
        for item in delivery_data.attachments
    ]

new_delivery = Delivery(
    attachments=attachments_data  # Plain list of dicts
)
```

**Location**: `backend/app/api/v1/deliveries.py:58-71`

---

### Challenge 4: TypeScript Type Definition Mismatch in Mutation Hooks

**Problem**:
```typescript
// useSubmitDelivery type didn't include 'attachments' field
mutationFn: (data: { module_id: number; content: string; attachment_url?: string }) =>
  deliveriesApi.submit(data)
// But component was passing: { module_id, content, attachments }
```

**Solution**:
Update type definition to match actual usage:
```typescript
mutationFn: (data: {
  module_id: number
  content: string
  attachment_url?: string
  attachments?: Array<{ name: string; url: string }>
}) => deliveriesApi.submit(data)
```

**Location**: `frontend/src/services/queries.ts:116-123`

---

## Development Best Practices

### Backend Development

1. **Database Migrations**: Always use Alembic for schema changes
   ```bash
   alembic revision --autogenerate -m "description"
   alembic upgrade head
   ```

2. **API Response Format**: Manually construct responses for complex types to avoid serialization issues
   ```python
   return DeliveryResponse(
       id=new_delivery.id,
       attachments=new_delivery.attachments or [],  # Ensure default value
       ...
   )
   ```

3. **JSON Column Handling**: Always convert Pydantic models to dicts before storing in JSON columns

### Frontend Development

1. **Form Validation**: Use React Hook Form with proper type definitions
   - Use `valueAsNumber: true` for numeric select fields
   - Avoid `render` prop when simple `register` works
   - Register fields before the component that uses them

2. **API Client Type Safety**: Keep TypeScript types in sync with backend schemas
   - Update `api.ts` when backend changes
   - Update `queries.ts` mutation types when adding new fields

3. **Debug Logging**: Add console logs for complex form submissions
   ```typescript
   console.log('📝 表单数据:', data)
   console.log('🚀 提交数据:', payload)
   ```

### Testing Workflow

1. **Backend Testing**:
   ```bash
   # Test API endpoints with curl
   curl -X POST http://localhost:8000/api/v1/deliveries/ \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d @/tmp/test_payload.json
   ```

2. **Database Verification**:
   ```bash
   sqlite3 backend/nexus.db "SELECT * FROM deliveries WHERE id=3;"
   ```

3. **Frontend Testing**:
   - Open browser console (F12)
   - Look for network errors in Network tab
   - Check console logs for form data

---

## File Structure Reference

```
Project Nexus/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # API endpoints
│   │   │   ├── auth.py      # Authentication
│   │   │   ├── projects.py  # Project CRUD
│   │   │   ├── modules.py   # Module management
│   │   │   └── deliveries.py # Delivery submission
│   │   ├── core/
│   │   │   ├── deps.py      # Dependencies (auth, DB)
│   │   │   └── security.py  # JWT, password hashing
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   └── db/session.py    # Database connection
│   ├── alembic/             # Database migrations
│   └── nexus.db            # SQLite database (dev)
│
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   │   ├── ui/         # Reusable UI components
    │   │   ├── auth/       # Auth-related components
    │   │   └── modules/    # Module-related components
    │   ├── pages/          # Page components
    │   ├── services/
    │   │   ├── api.ts      # Axios API client
    │   │   └── queries.ts  # React Query hooks
    │   └── store/
    │       └── authStore.ts # Zustand auth state
```

---

## Next Steps (Phase 1 Continuation)

1. **Acceptance/Review Flow**
   - Commander reviews deliveries
   - Three outcomes: Pass, Reject, Close
   - Score allocation for multi-person modules

2. **Delivery Display in UI**
   - Show submitted attachments in module details
   - Format attachment links with names
   - Display review decisions

3. **Abandon Request Feature**
   - Nodes can request to abandon tasks
   - Commander approval workflow
   - Task reassignment logic

4. **Reputation System UI**
   - Leaderboard page
   - Reputation history display
   - Score change notifications

---

## Phase 2 (V0.2.0) Implementation & Testing (Feb 2026)

### Version Overview

**V0.2.0** focused on completing P0/P1 user experience features, improving information presentation, and comprehensive testing.

### Completed Features in V0.2.0

#### 1. User Experience Infrastructure ✅
- **Toast Notification System**: Replaced all `alert()` calls with non-intrusive toast notifications
- **Empty State Guidance**: Added helpful empty states with CTAs for all major pages
- **Alert Component**: Four variants (info, success, warning, error) for contextual messaging
- **Tooltip Component**: Four-direction tooltips for enhanced UX

#### 2. Core Flow Optimizations ✅
- **ReviewModal Enhancements**: Added scoring guides, quick reply templates, delivery preview
- **Countdown Timer**: Task deadline countdown with color coding (green/yellow/orange/red)
- **Delivery Record Display**: Enhanced delivery cards with attachment previews
- **Automated Timeout Detection**: APScheduler-based hourly timeout checking

#### 3. Task Abandonment Feature ✅
- **Node-side**: Abandon request modal with validation
- **Commander-side**: Review cards for approval/rejection workflow
- **Full API**: `/api/v1/abandon-requests/` endpoints

#### 4. Knowledge Base ✅
- **File Upload**: Support for zip, md, pdf, images (≤30MB)
- **Knowledge Cards**: Grid layout with file type icons
- **Search & Filter**: By keyword and file type
- **Task Linking**: Associate knowledge with modules

### Technical Challenges & Solutions (V0.2.0)

#### Challenge 5: Async/Await Pattern in Knowledge API

**Problem**:
```python
# Knowledge API was using synchronous db.query() with AsyncSession
async def list_knowledge(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    query = db.query(KnowledgeItem)  # ERROR: AsyncSession has no attribute 'query'
    items = query.all()
```

**Solution**:
Convert all 8 knowledge functions to use SQLAlchemy 2.0 async pattern:
```python
from sqlalchemy import select, func

async def list_knowledge(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    query = select(KnowledgeItem).order_by(KnowledgeItem.created_at.desc())
    result = await db.execute(query)
    items = result.scalars().all()
    return items
```

**Key Changes**:
- Import `select` from `sqlalchemy` (not `sqlalchemy.orm`)
- Use `select(Model)` instead of `db.query(Model)`
- Use `.where()` instead of `.filter()`
- Use `await db.execute(query)` instead of direct execution
- Use `.scalars().all()` to get results
- Convert all `db.commit()` to `await db.commit()`

**Files Modified**:
- `backend/app/api/v1/knowledge.py` (8 functions converted)

---

#### Challenge 6: Type Annotation Conflict in FastAPI

**Problem**:
```python
# Schema name conflicts with SQLAlchemy model name
from app.models.knowledge import KnowledgeLink
from app.schemas.knowledge import KnowledgeLink

def link_knowledge_to_module(
    link_data: KnowledgeLink,  # ERROR: Ambiguous reference
    ...
):
    # FastAPI tries to use SQLAlchemy model as schema
```

**Solution**:
Rename schema to avoid conflict:
```python
# In schemas/knowledge.py
class KnowledgeLinkSchema(BaseModel):  # Add "Schema" suffix
    knowledge_id: int
    module_id: int

# In api/v1/knowledge.py
from app.schemas.knowledge import KnowledgeLinkSchema

def link_knowledge_to_module(
    link_data: KnowledgeLinkSchema,  # Clear and explicit
    ...
):
```

**Best Practice**: Always distinguish between SQLAlchemy models and Pydantic schemas with naming conventions.

---

#### Challenge 7: Playwright Browser Automation Without Chrome

**Problem**:
```javascript
// Chrome not installed, blocked by sudo requirements
const browser = await chromium.launch();  // ERROR: Chrome not found
await exec('npx playwright install chrome');  // Requires sudo
```

**Solution**:
Use system Safari (webkit) instead of Chrome:
```javascript
import { webkit } from 'playwright';

const browser = await webkit.launch({ headless: false });
const page = await browser.newPage();
await page.goto('http://localhost:5173');
```

**Installation**:
```bash
cd frontend
npx playwright install webkit  # No sudo required
```

**Advantages**:
- No installation permissions needed
- Faster download (72.6 MB vs 200+ MB for Chrome)
- Native macOS browser integration

---

#### Challenge 8: Playwright Screenshot Path Issues

**Problem**:
```javascript
// Relative paths don't work when script runs from different directories
await page.screenshot({ path: 'test.png' });  // Where is it saved?
```

**Solution**:
Always use absolute paths with Node.js `path` module:
```javascript
import path from 'path';

const screenshotDir = '/Users/yangfan/Documents/coding/Project Nexus/screenshots';
const timestamp = Date.now();

await page.screenshot({
  path: path.join(screenshotDir, `test-${timestamp}.png`),
  fullPage: true
});
```

**Best Practice**: For automated testing, always use absolute paths and timestamps for unique filenames.

---

#### Challenge 9: React Component Selectors in Playwright

**Problem**:
```javascript
// React components don't render as simple HTML elements
await page.locator('input[type="text"]').fill('commander');  // Wrong
// Input component renders custom HTML, not <input type="text">
```

**Solution**:
Use more flexible selectors based on attributes:
```javascript
// Use placeholder text
await page.fill('input[placeholder*="用户名"]', 'commander');

// Use text content in buttons
await page.click('button:has-text("登录")');

// Use aria-label or data attributes when available
await page.click('[data-testid="submit-button"]');
```

**Best Practices**:
- Prefer user-visible attributes (placeholder, text content)
- Add `data-testid` attributes to key components for testing
- Use `:has-text()` pseudo-selector for partial text matching

---

### Development Best Practices (V0.2.0)

#### Backend Development

1. **Async Session Management**:
   ```python
   # CORRECT: Always use AsyncSession with async/await
   from sqlalchemy.ext.asyncio import AsyncSession
   from sqlalchemy import select

   async def get_items(db: AsyncSession = Depends(get_db)):
       result = await db.execute(select(Model))
       return result.scalars().all()

   # WRONG: Mixing sync patterns with AsyncSession
   def get_items(db: AsyncSession = Depends(get_db)):
       items = db.query(Model).all()  # ERROR
   ```

2. **Dependency Injection for Background Tasks**:
   ```python
   # APScheduler integration with FastAPI
   from apscheduler.schedulers.asyncio import AsyncIOScheduler

   scheduler = AsyncIOScheduler()

   @app.on_event("startup")
   async def startup_event():
       scheduler.start()
       scheduler.add_job(check_timeouts, 'interval', hours=1)
   ```

3. **Schema Naming Conventions**:
   - SQLAlchemy Models: `KnowledgeLink`, `User`, `Module`
   - Pydantic Schemas: `KnowledgeLinkSchema`, `UserResponse`, `ModuleCreate`
   - Prevents name collisions and improves code clarity

#### Frontend Development

1. **Component Testing with Playwright**:
   ```javascript
   // Test from frontend directory where node_modules are located
   cd frontend && node test-script.mjs

   // Use absolute paths for screenshots
   import path from 'path';
   await page.screenshot({
     path: path.join('/absolute/path', `screenshot-${Date.now()}.png`)
   });
   ```

2. **Toast Notification Pattern**:
   ```typescript
   // Replace all alert() calls
   import { toastStore } from '@/store/toastStore';

   // Before
   alert('登录失败');

   // After
   toastStore.add({
     type: 'error',
     title: '登录失败',
     message: '请检查用户名和密码'
   });
   ```

3. **Empty State Component Pattern**:
   ```typescript
   interface EmptyStateConfig {
     type: 'no-projects' | 'no-modules' | 'no-knowledge'
     action: () => void
   }

   // Centralized empty state messages
   const emptyStateMessages = {
     'no-projects': {
       icon: '📁',
       title: '还没有项目',
       description: '项目是组织的基石，创建第一个项目吧',
       actionLabel: '创建项目'
     }
   };
   ```

#### Testing Best Practices

1. **API Testing Strategy**:
   ```bash
   # Use shell scripts for automated API testing
   #!/bin/bash
   TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"commander","password":"admin123"}' \
     | jq -r '.access_token')

   # Test endpoints with authentication
   curl -X GET http://localhost:8000/api/v1/projects/ \
     -H "Authorization: Bearer $TOKEN"
   ```

2. **Browser Automation Testing**:
   ```javascript
   // Comprehensive test script structure
   // 1. Setup (browser launch, navigation)
   // 2. Login flow
   // 3. Test each major page
   // 4. Test key interactions
   // 5. Capture screenshots
   // 6. Cleanup (browser close)
   ```

3. **Test Documentation**:
   - Always create test reports with pass/fail status
   - Include screenshots for visual verification
   - Document issues found and fixed
   - Provide next steps for manual testing

---

### File Structure Updates (V0.2.0)

```
Project Nexus/
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── abandon_requests.py  # NEW: Task abandonment API
│   │   │   └── knowledge.py         # UPDATED: Async conversion
│   │   ├── tasks/                   # NEW: Background tasks
│   │   │   └── __init__.py          # APScheduler setup
│   │   └── schemas/
│   │       └── abandon_request.py   # NEW: Abandon request schemas
│   └── requirements.txt             # UPDATED: Added apscheduler
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Toast.tsx        # NEW: Notification system
│   │   │   │   ├── EmptyState.tsx   # NEW: Empty state guidance
│   │   │   │   ├── Alert.tsx        # NEW: Contextual alerts
│   │   │   │   └── Tooltip.tsx      # NEW: Tooltips
│   │   │   ├── modules/
│   │   │   │   ├── ReviewModal.tsx           # UPDATED: Scoring guides
│   │   │   │   ├── CountdownCard.tsx         # NEW: Deadline countdown
│   │   │   │   ├── DeliveryCard.tsx          # NEW: Enhanced display
│   │   │   │   ├── AbandonRequestModal.tsx   # NEW: Abandon request
│   │   │   │   └── AbandonRequestReviewCard.tsx # NEW: Review card
│   │   │   └── knowledge/
│   │   │       ├── KnowledgeCard.tsx         # NEW: Knowledge card
│   │   │       ├── KnowledgeUploadModal.tsx  # NEW: Upload modal
│   │   │       ├── FileUpload.tsx            # NEW: File upload
│   │   │       ├── LinkKnowledgeModal.tsx    # NEW: Link to task
│   │   │       └── SelectKnowledgeModal.tsx  # NEW: Knowledge selector
│   │   └── store/
│   │       └── toastStore.ts        # NEW: Toast state management
│   │
│   ├── browser-test.mjs             # NEW: Basic browser test
│   ├── enhanced-browser-test.mjs     # NEW: Enhanced test with logging
│   └── comprehensive-test.mjs        # NEW: Full feature test
│
├── screenshots/                      # NEW: Test screenshots
│   ├── 01-login-*.png
│   ├── 02-dashboard-*.png
│   └── ...
│
├── test-guide.html                   # NEW: Interactive test guide
├── test-complete.html                # NEW: Test completion report
├── verify.sh                         # NEW: Quick verification script
├── FINAL_TEST_REPORT.md              # NEW: Final test report
├── FRONTEND_TEST_GUIDE.md            # NEW: Manual testing guide
├── TEST_COMPLETE_REPORT.md           # NEW: Completion summary
└── RALPH_LOOP_COMPLETE.md            # NEW: Ralph Loop report
```

---

### Performance Metrics (V0.2.0)

**Backend API Response Times**:
- Login: < 100ms (excellent)
- Project query: < 100ms (excellent)
- Module query: < 150ms (good)
- Knowledge query: < 100ms (excellent)

**Frontend Build**:
- Build time: < 600ms
- Bundle size: 365KB (gzip: 113KB)
- CSS size: 28.68KB (gzip: 5.86KB)

**Test Coverage**:
- API endpoints: 100% (7/7)
- Page navigation: 100% (5/5)
- UI components: 82% (18/22)
- Overall: 88%

---

### Key Learnings from V0.2.0

1. **Async/Await Consistency is Critical**
   - Mixing sync patterns with AsyncSession causes cryptic errors
   - Always use SQLAlchemy 2.0 async patterns: `select()`, `.where()`, `await db.execute()`

2. **Type Safety Prevents Runtime Errors**
   - Distinguish between SQLAlchemy models and Pydantic schemas
   - Use naming conventions to avoid conflicts (e.g., `ModelSchema`)

3. **Browser Testing Flexibility**
   - Don't rely on Chrome being available
   - Use webkit (Safari) on macOS as fallback
   - Always use absolute paths for screenshots

4. **Testing Documentation Matters**
   - Automated tests need human-readable reports
   - Screenshots provide visual verification
   - Document issues and solutions for future reference

5. **User Experience is Iterative**
   - Replace `alert()` with toast notifications
   - Add empty states with helpful guidance
   - Provide contextual help with tooltips
   - Test with real users to find pain points

---

### Deployment Checklist (V0.2.0)

**Backend**:
- ✅ All API endpoints functional
- ✅ Async/await patterns implemented
- ✅ APScheduler configured
- ✅ Error handling complete
- ✅ Database migrations tested

**Frontend**:
- ✅ All pages accessible
- ✅ Forms validated
- ✅ Toast notifications implemented
- ✅ Empty states added
- ⚠️ Manual UI testing recommended

**Testing**:
- ✅ API automation complete
- ✅ Browser automation complete
- ✅ Screenshots captured
- ⚠️ Manual E2E testing recommended

---

### Common Issues & Quick Fixes

**Issue**: Backend fails to start with "No module named 'apscheduler'"
```bash
cd backend
./venv/bin/pip install apscheduler
```

**Issue**: Knowledge API returns "Object has no attribute 'query'"
```python
# Convert to async pattern (see Challenge 5 above)
from sqlalchemy import select
result = await db.execute(select(Model))
```

**Issue**: Playwright can't find Chrome
```bash
cd frontend
npx playwright install webkit  # Use Safari instead
```

**Issue**: Port 8000 already in use
```bash
lsof -ti:8000 | xargs kill -9
```

---

### Next Steps (Post V0.2.0)

1. **Complete Manual Testing**:
   - Toast notification triggers
   - Empty state displays
   - ReviewModal templates
   - Countdown color rules
   - Task abandonment workflow
   - Knowledge upload validation

2. **Performance Optimization**:
   - Add database indexes for frequent queries
   - Implement response caching
   - Optimize bundle size

3. **E2E Test Suite**:
   - Add Playwright test to CI/CD
   - Test critical user flows
   - Visual regression testing

4. **Documentation**:
   - API documentation with examples
   - Component storybook
   - User guide
   - Admin manual

---

**V0.2.0 Status**: ✅ Production Ready (with manual testing recommended)
**Testing Completion**: 88% automated, manual testing for remaining UX details
**Ralph Loop**: ✅ Done

---

## Production Deployment (Feb 2026)

### Deployment Environment
- **Server**: Tencent Cloud (182.254.159.223)
- **OS**: Ubuntu
- **Deployment Method**: Docker Compose
- **Containers**: 3 (nginx frontend, FastAPI backend, PostgreSQL database)
- **Frontend URL**: http://182.254.159.223:8080
- **Default Credentials**: commander / admin123

---

### Challenge 10: Production Login Issue - The Root Cause Analysis

**Problem**: Login failed with multiple cascading issues that took extensive debugging to resolve.

**Symptoms**:
1. `net::ERR_CONNECTION_REFUSED` trying to connect to `localhost:8000`
2. `passlib.exc.UnknownHashError: hash could not be identified`
3. `ValueError: Invalid salt`
4. `sqlalchemy.exc.ProgrammingError: relation "users" does not exist`
5. `502 Bad Gateway` / `504 Gateway Timeout` from nginx

**Root Causes & Fixes**:

#### Issue 1: Password Hash Truncation (Shell Escaping)
**Problem**:
```bash
# Password hash truncated from 60 to 20-27 characters
$2b$12$EixZaYVK1fsbw1ZfbX3x2leB0...  # Expected (60 chars)
$2b$12$EixZaYVK1f                # Actual in DB (20 chars)
```

**Cause**: The `$` character in bcrypt hashes was being interpreted by the shell:
```bash
# Wrong: Shell interprets $ as variable expansion
UPDATE users SET hashed_password = '$2b$12$...'  # Truncated!

# Correct: Use single quotes or parameter binding
UPDATE users SET hashed_password = :hash  # Full hash preserved
```

**Fix**:
1. Generate hash locally with Python
2. Upload script to server via SFTP
3. Use SQLAlchemy parameter binding to insert
4. Verify hash length in database (must be 60 chars)

**File**: `fix-password-hash.py` (deployment script)

---

#### Issue 2: Passlib Backend Detection Failure
**Problem**:
```
ValueError: password cannot be longer than 72 bytes
passlib.exc.UnknownHashError: hash could not be identified
```

**Cause**: passlib's automatic bcrypt backend detection was failing in the container environment:
```python
# passlib trying to detect bcrypt backend
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# During initialization, it tries to verify a test hash
# But hits the 72-byte limit during backend detection
```

**Fix**: Replace passlib with direct bcrypt usage:
```python
# Before (passlib - broken)
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

# After (direct bcrypt - works)
import bcrypt
def verify_password(plain, hashed):
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))

def get_password_hash(password):
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
```

**File**: `backend/app/core/security.py:1-20`

---

#### Issue 3: Frontend Hardcoded Localhost URL
**Problem**:
```
POST http://localhost:8000/api/v1/auth/login net::ERR_CONNECTION_REFUSED
```

**Cause**: Frontend JavaScript bundled with hardcoded `localhost:8000`:
```typescript
// Code has fallback to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// When .env has empty VITE_API_URL=
// Browser uses default 'http://localhost:8000' (wrong!)
```

**Why `.env` Didn't Work**:
- Empty environment variable `VITE_API_URL=` is falsy
- Code falls back to default `'http://localhost:8000'`
- Browser tries to connect to user's localhost, not server

**Fix**: Change default to empty string for relative paths:
```typescript
// Before
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// After
const API_URL = import.meta.env.VITE_API_URL || ''
// Now requests go to /api/v1/auth/login (relative path)
// Nginx proxies to backend:8000
```

**Files**:
- `frontend/src/services/api.ts:4`
- `frontend/.env` (set to `VITE_API_URL=`)

---

#### Issue 4: Docker Network Isolation
**Problem**:
```
2026/02/08 17:41:22 [error] connect() failed (111: Connection refused)
upstream: "http://172.20.0.3:8000/api/v1/auth/login"
```

**Cause**: Frontend container couldn't resolve `backend` hostname:
```bash
# Frontend on wrong network
docker inspect nexus_frontend_prod
# Network: nexus-prod_nexus_network_prod (no "backend" alias)

# Backend on different network
docker inspect nexus_backend_prod
# Network: nexus-prod_nexus_network_prod (with "backend" alias)
```

**Fix**: Recreate all containers with docker-compose to ensure network alignment:
```bash
# Stop all containers
docker-compose -f docker-compose.prod.yml down -v

# Start all (creates shared network)
docker-compose -f docker-compose.prod.yml up -d

# Verify DNS resolution
docker exec nexus_frontend_prod ping backend
# Now works: 172.20.0.3        backend  backend
```

**Network Configuration**:
```yaml
# docker-compose.prod.yml
networks:
  nexus_network_prod:
    driver: bridge
# All services use this network
```

---

#### Issue 5: Database Table Missing After Volume Reset
**Problem**:
```
sqlalchemy.exc.ProgrammingError: relation "users" does not exist
```

**Cause**: Docker volumes were reset during `docker-compose down -v`, deleting database data:
```bash
# The -v flag removes named volumes
docker-compose down -v  # Deletes postgres_data_prod volume
# Tables gone, users gone
```

**Fix**: Recreate tables and seed default users:
```python
async def init_db():
    async with engine.begin() as conn:
        # Create users table
        await conn.execute(text('''
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                hashed_password VARCHAR(255) NOT NULL,
                role VARCHAR(20) NOT NULL,
                reputation_score FLOAT DEFAULT 100.0 NOT NULL,
                concurrent_task_count INTEGER DEFAULT 0 NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        '''))

        # Seed default users
        password = "admin123"
        hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
        await conn.execute(
            text("INSERT INTO users (username, hashed_password, role, ...) VALUES (:user1, :hash, :role1, ...), (:user2, :hash, :role2, ...)"),
            {"user1": "commander", "role1": "COMMANDER", "user2": "node1", "role2": "NODE", "hash": hashed}
        )
```

**File**: `init-database-psql.py` (deployment script)

---

### Why It Took So Long: Systemic Debugging Challenges

#### 1. **Cascading Issues Masked Root Causes**
Each fix revealed the next problem:
- Fixed network → exposed database missing → exposed password truncation → exposed passlib bug

**Lesson**: In production deployments, fix infrastructure first (networks, volumes), then data, then application logic.

---

#### 2. **Hard-to-Detect Shell Escaping**
Bcrypt hashes use `$` as delimiter, which shells interpret:
```bash
# Looks correct in logs
echo '$2b$12$...'  # Shows full hash

# But SQL executes with variable expansion
psql -c "INSERT ... VALUES ('$2b$12$...')"  # $2b interpreted as variable!
```

**Detection**: Only visible by checking actual hash length in database:
```sql
SELECT username, LENGTH(hashed_password) as len FROM users;
-- Shows 20 instead of 60
```

**Lesson**: Always verify data length in database, not just log output.

---

#### 3. **Container State Inconsistency**
Manual docker commands created containers outside docker-compose:
```bash
# Manual container
docker run --name nexus_frontend_prod nginx

# Docker-compose can't manage it
docker-compose up -d
# ERROR: Conflict. Container name already in use
```

**Fix**: Always use docker-compose for container orchestration:
```bash
# Stop and remove all containers
docker-compose down

# Start all with correct networking
docker-compose up -d
```

**Lesson**: Never mix manual `docker run` with `docker-compose`. Use one orchestration method consistently.

---

#### 4. **Build Artifacts Cached in Browser**
Even after rebuilding frontend with correct config:
- Browser served old JavaScript from cache
- Hard refresh (Ctrl+Shift+R) needed to clear
- Incognito mode confirmed fix worked

**Verification**:
```bash
# Check built file
grep -o 'localhost:8000' frontend/dist/assets/*.js
# Should return 0 after fix
```

**Lesson**: Browser caching can mask deployment issues. Always test in incognito mode after frontend changes.

---

#### 5. **Passlib Abstraction Leaked Complexity**
passlib's "simplified" API actually complicated debugging:
```python
# passlib hides bcrypt details
pwd_context.verify(password, hash)
# But fails silently with cryptic errors

# Direct bcrypt is explicit
bcrypt.checkpw(password.encode(), hash.encode())
# Clear errors: "Invalid salt", "Wrong hash length"
```

**Lesson**: Direct library calls are easier to debug than abstraction layers when things go wrong.

---

### Deployment Best Practices Learned

#### 1. **Use Relative URLs for Frontend API Calls**
```typescript
// ✅ GOOD: Works in all environments
const API_URL = import.meta.env.VITE_API_URL || ''
axios.create({ baseURL: API_URL })
// Browser resolves to current origin: http://server:8080/api/...

// ❌ BAD: Only works in local development
const API_URL = 'http://localhost:8000'
// Fails in production
```

**Why**: Nginx proxies `/api` to backend container. Relative paths work everywhere.

---

#### 2. **Never Use Shell Variables in SQL**
```python
# ❌ WRONG: Shell interprets $ characters
sql = f"UPDATE users SET hashed_password = '{hash}'"
await db.execute(sql)

# ✅ CORRECT: Parameter binding preserves special characters
await db.execute(
    text("UPDATE users SET hashed_password = :hash"),
    {"hash": hash}
)
```

**Why**: Bcrypt hashes contain `$` which shells interpret as variable expansion.

---

#### 3. **Verify Database Data, Not Just Code**
```sql
-- After insert, verify hash length
SELECT username, LENGTH(hashed_password) as len,
       SUBSTRING(hashed_password, 1, 30) as hash_start
FROM users;

-- Expected output:
-- username  | len | hash_start
-- -----------+-----+------------------------------
-- commander |  60 | $2b$12$EixZaYVK1fsbw1ZfbX3x2leB0...
```

**Why**: Silent data corruption (truncation) only visible by checking length.

---

#### 4. **Use Docker Compose for All Container Management**
```bash
# ❌ WRONG: Manual container creation
docker run --name backend python:3.11
docker run --name frontend nginx
# Network isolation issues

# ✅ CORRECT: Docker-compose manages everything
docker-compose up -d
# Shared network, correct dependencies, volume management
```

**Why**: Manual containers don't get docker-compose networking, causing 502 errors.

---

#### 5. **Generate Passwords Hashes in Same Environment**
```python
# ❌ WRONG: Generate locally, insert remotely
local_hash = bcrypt.hashpw(...)  # Python 3.12
remote_insert(local_hash)  # Python 3.11 in container
# Version mismatch possible

# ✅ CORRECT: Generate in container
container_script = '''
import bcrypt
hash = bcrypt.hashpw(...)
insert_to_db(hash)
'''
exec_in_container(container_script)
```

**Why**: bcrypt behavior can differ between Python versions/OS. Hash where you store.

---

#### 6. **Test with Multiple Browsers/Methods**
```bash
# 1. Test API directly
curl http://server:8080/api/v1/auth/login \
  -d '{"username":"commander","password":"admin123"}'

# 2. Test in incognito mode
# Open browser incognito, navigate to URL

# 3. Test with hard refresh
# Ctrl+Shift+R / Cmd+Shift+R

# 4. Check network tab in DevTools
# Verify actual request URL
```

**Why**: Browser caching, DNS caching, and service workers can all mask issues.

---

### Deployment Checklist (Future Reference)

#### Pre-Deployment
- [ ] Build frontend locally: `npm run build`
- [ ] Test API locally: `curl http://localhost:8000/api/v1/auth/login`
- [ ] Verify database migrations: `alembic upgrade head`
- [ ] Check docker-compose.yml for correct networks
- [ ] Verify environment variables (no special chars in passwords)

#### Deployment
- [ ] Use docker-compose, not manual docker run
- [ ] Set `VITE_API_URL=` (empty) in frontend/.env
- [ ] Use direct bcrypt, not passlib
- [ ] Generate password hashes in container environment
- [ ] Verify database data after insertion (check lengths)

#### Post-Deployment
- [ ] Test API from server: `curl http://localhost:8080/api/v1/auth/login`
- [ ] Test in browser incognito mode
- [ ] Check network tab for request URLs
- [ ] Hard refresh if needed: Ctrl+Shift+R
- [ ] Verify all containers on same network: `docker network inspect`

#### Troubleshooting Commands
```bash
# Check container networks
docker inspect <container> | grep -A 10 Networks

# Verify DNS resolution
docker exec <frontend> ping backend

# Check database data
docker exec <db> psql -U nexus -d nexus -c "SELECT username, LENGTH(hashed_password) FROM users;"

# View backend logs
docker logs nexus_backend_prod | tail -50

# Check nginx config
docker exec nexus_frontend_prod cat /etc/nginx/conf.d/default.conf

# Rebuild frontend
cd frontend && npm run build && docker restart nexus_frontend_prod

# Restart all services
docker-compose restart
```

---

### Files Modified for Production Deployment

**Backend**:
- `backend/app/core/security.py` - Replaced passlib with direct bcrypt
- `backend/docker/Dockerfile` - (if using separate Dockerfile)

**Frontend**:
- `frontend/src/services/api.ts` - Changed default API_URL from 'http://localhost:8000' to ''
- `frontend/.env` - Set `VITE_API_URL=` (empty string)

**Infrastructure**:
- `docker-compose.prod.yml` - Verified network configuration
- `nginx.conf` - Verified proxy configuration for /api → backend:8000

**Deployment Scripts** (temporary, can be deleted):
- `fix-password-hash.py`
- `init-database-psql.py`
- `upload-and-rebuild.py`
- `fix-frontend-env.py`

---

### Production Status (Feb 9, 2026)

**✅ Working**:
- Frontend serving on port 8080
- Backend API responding correctly
- Database with 2 default users (commander, node1)
- Login authentication working
- All containers on shared Docker network
- Nginx proxying /api to backend

**🔧 Configuration**:
- API URL: Relative paths (/api/v1/...)
- Nginx: Proxy /api → backend:8000
- Database: PostgreSQL 16 with bcrypt password hashes
- Backend: Direct bcrypt (no passlib)
- Frontend: No hardcoded localhost URLs

**📊 Metrics**:
- Login response time: < 200ms
- Frontend bundle: 365KB (gzip: 113KB)
- Database queries: < 100ms
- Container startup: ~10 seconds

**🎯 Success Criteria**:
- User can login at http://182.254.159.223:8080
- API calls work from browser (no ERR_CONNECTION_REFUSED)
- Password hashes stored correctly (60 characters)
- All containers healthy and communicating

---

**Deployment Timeline**: 6 hours of debugging (should have been 30 minutes with better checklist)
**Root Cause**: Cascading infrastructure + configuration + data issues
**Key Learning**: Fix infrastructure first, verify data lengths, use relative URLs
**Status**: ✅ RESOLVED - Production deployment successful
