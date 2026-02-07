# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Project Nexus** is an AI-native distributed organization operating system. This project is currently in the **planning/conceptual phase** - only a comprehensive PRD exists, no implementation code yet.

The vision is to create a "managerless" organization system where AI serves as the scheduling hub, treating both human workers and AI Agents as equal "work nodes". The system decomposes strategic goals into atomic tasks and distributes them to the most suitable nodes.

## Current State

- **Status**: Planning phase (no code written yet)
- **Documentation**: `PRD.md` contains the complete product requirements (in Chinese)
- **Architecture**: Planned to be a monolithic application with:
  - Backend: Python + FastAPI + SQLAlchemy
  - Frontend: React + Lingjing Core Brand System
  - Database: PostgreSQL
  - Deployment: Docker + Tencent Cloud

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
