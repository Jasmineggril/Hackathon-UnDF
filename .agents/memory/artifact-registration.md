---
name: Artifact registration for imported projects
description: How to register artifacts that were imported from GitHub without Replit registration
---

## Problem
When a project is imported from GitHub, artifact.toml files exist in the filesystem but artifacts are NOT registered in Replit's system (listArtifacts() returns []).

## Solution
Call verifyAndReplaceArtifactToml() with the existing artifact.toml content (write to .edit.toml temp file first, then call the callback). This registers the artifact even though it already exists on disk.

## Side effect: duplicate workflow
After registering artifacts/api-server via verifyAndReplaceArtifactToml, the system created a new managed workflow `artifacts/api-server: web` (from the service name in artifact.toml). The original imported workflow `artifacts/api-server: API Server` continued running. Both target port 8080 — only one can run at a time.

**Why:** The artifact.toml service is named "web" but the imported workflow was named "API Server". Registration creates the managed workflow; the old one persists until manually removed.
