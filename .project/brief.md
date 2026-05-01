# Fircle — Project Brief

## Overview

**Fircle** is a family-focused social network — a private, intimate space built specifically for families to connect, share, and preserve memories together.

## Problem & Goal

General social networks are built for the public, not for families. Fircle addresses this by providing a tailored social experience where family members can share moments without the noise, privacy concerns, or distractions of mainstream platforms.

**Goal:** Build an MVP of a family social network with core sharing and memory features, designed for self-hosted family instances.

## Target Audience

Families — parents, siblings, extended relatives — who want a private, dedicated space to stay connected and document their lives together.

## Core Features (MVP)

- **Multi-tenancy** — Families can host their own isolated instances of Fircle, keeping their data private and under their control.
- **Posts with photos and videos** — Members can create posts with media attachments to share and preserve family memories.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| API | tRPC |
| Database ORM | Prisma |
| Auth | NextAuth.js |
| Styling | Tailwind CSS + shadcn/ui |
| Package Manager | pnpm |

## Scope

This is an **open-source MVP**. The focus is on shipping the core multi-tenant architecture and memory-sharing features before expanding functionality.

## Status

- [x] Project scaffolded
- [ ] Multi-tenancy setup
- [ ] Post creation with media uploads
- [ ] Family member auth & onboarding

## Roadmap

### Phase 1 — MVP
- Multi-tenant architecture (isolated family instances)
- Post creation with photo and video support
- Basic family member auth & onboarding

### Phase 2 — Identity & Access
- **Invite-only registration** — New members can only join a family instance via an invite link or code issued by an existing member. No open sign-ups.
- **Unclaimed member profiles** — A member can be added to the family tree/circle without requiring their presence. The profile exists (name, relation, avatar) and can be tagged in posts, but has no login access until the real person claims it.
- **Account claiming** — An unclaimed profile can be claimed by the real person via an invite or claim link, merging the profile history with their new account.

### Phase 3 — Tagging & Memories
- **Member tagging in media** — Users can tag family members (including unclaimed profiles) in photos and videos within posts.
- Tag notifications sent to claimed members when they are tagged.
- Browsable per-member media archive (all photos/videos a member is tagged in).
