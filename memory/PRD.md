# Dashboard Hub PRD

## Original Problem Statement
Create a minimal full-stack app with React + Tailwind dashboard featuring 4 tabs: Routes, Compare, Banking, Pooling. FastAPI backend with in-memory data storage.

## User Personas
- Operations Manager: Monitors route configurations and compliance
- Finance User: Manages CB banking operations
- Pool Administrator: Creates and manages route pools

## Core Requirements
- 4-tab dashboard navigation
- Routes management with baseline functionality
- Cost comparison with compliance indicators
- Banking operations (bank/apply funds)
- Pool creation and management

## What's Been Implemented (Jan 2026)
- FastAPI backend with 10 API endpoints (in-memory data)
- React frontend with 4 functional tabs
- Dark professional theme (Swiss high-contrast design)
- All CRUD operations working
- Mock data fallback for frontend resilience

## Architecture
- Backend: FastAPI (Python) on port 8001
- Frontend: React + Tailwind on port 3000
- No database (in-memory storage)
- REST API with /api prefix

## API Endpoints
- GET/POST /api/routes, POST /api/routes/:id/baseline
- GET /api/routes/comparison
- GET /api/compliance/cb
- GET /api/banking, POST /api/banking/bank, POST /api/banking/apply
- GET/POST /api/pools

## Prioritized Backlog
- P0: Complete ✓
- P1: Data persistence (MongoDB integration)
- P2: Authentication, Real-time updates
