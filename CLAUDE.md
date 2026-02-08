# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Project Nexus** is an AI-native distributed organization operating system. This project is currently in the **planning/conceptual phase** - only a comprehensive PRD exists, no implementation code yet.

The vision is to create a "managerless" organization system where AI serves as the scheduling hub, treating both human workers and AI Agents as equal "work nodes". The system decomposes strategic goals into atomic tasks and distributes them to the most suitable nodes.

## Current State

- **Status**: **Phase 1 Implementation in Progress** - Authentication, Projects, Modules, and Delivery Submission features completed
- **Documentation**: `PRD.md` contains the complete product requirements (in Chinese)
- **Architecture**: Monolithic application with:
  - Backend: Python + FastAPI + SQLAlchemy
  - Frontend: React + TypeScript + Tailwind CSS
  - Database: SQLite (development), PostgreSQL (production planned)
  - Deployment: Docker Compose (planned)
- **Implemented Features**:
  - ✅ JWT Authentication system (Commander/Node roles)
  - ✅ Project management (CRUD)
  - ✅ Module management with grab-style assignment
  - ✅ Multi-attachment delivery submission
  - ✅ Notification system
  - 🚧 Acceptance/Review flow (in progress)

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
