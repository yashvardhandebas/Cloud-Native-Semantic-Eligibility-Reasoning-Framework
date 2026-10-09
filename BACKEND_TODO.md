# SchemeSense Backend TODO & API Specification

This document lists missing or recommended API endpoints for future extension beyond the current gateway implementation.

## Missing / Suggested Endpoints (`/api/v1`)

### 1. Scheme Management & Discovery
- `GET /api/v1/schemes`
  - **Request**: Query parameters `category`, `state`, `language`, `search`.
  - **Response**: Array of `Scheme` objects.
- `GET /api/v1/schemes/{scheme_id}`
  - **Response**: Single detailed `Scheme` object including conditions, documents, benefits, exclusions.

### 2. Rule Evolution & Versioning (`as_of`)
- `GET /api/v1/schemes/{scheme_id}/graph?as_of=2026-10-09`
  - **Response**: Cypher subgraph JSON (nodes & relationships active at `as_of` date).
- `POST /api/v1/reasoning/amend`
  - **Request**: `{ "scheme_id": "...", "amendments": [...], "effective_date": "2026-10-09" }`
  - **Response**: `{ "status": "success", "modified_nodes": 1, "superseded_version": "v2.1", "new_version": "v3.0" }`

### 3. Citizen Match Ranking Engine
- `POST /api/v1/reasoning/evaluate-all`
  - **Request**: Citizen facts dict.
  - **Response**: Array of scheme eligibility outcomes ranked by readiness score (0-100).
