# Emotional Reset App — Implementation Plan

## Goal of the First Release
Build a responsive web app MVP that validates whether users find value in a short emotional reset flow combining:
- emotional check-in
- symbolic release interaction
- reflection
- guidance
- progress tracking

## Product Strategy
### Platform Strategy
Start with a responsive web app first.

Reasons:
- faster to build
- easier to test with users
- easier to share
- lower initial complexity than native mobile
- can be designed with mobile behavior in mind from the start

### Future Expansion
Possible future directions:
- Progressive Web App (PWA)
- React Native app
- Flutter app
- deeper mobile interactions later

## Recommended MVP Stack
### Frontend
- Next.js

### Styling
- Tailwind CSS

### Component Layer
- shadcn/ui or custom components

### Motion / Interaction
- Framer Motion
- CSS animations
- optional Lottie for selected moments

### Backend / Database
- Supabase

### Authentication
Choose one of these options:
- lightweight account system
- anonymous session first, account later

### Analytics
- PostHog or similar event analytics tool

### Deployment
- Vercel

## Technical Architecture Direction
Split the app into three major layers:

### 1. Experience Layer
Responsible for:
- pages
- UI states
- interactions
- animations
- user-facing flows

### 2. Session Logic Layer
Responsible for:
- emotional session creation
- tool and method selection logic
- reflection handling
- suggestion rules
- completion logic

### 3. Progress Layer
Responsible for:
- streak calculations
- calm day calculation
- recovery metrics
- dashboard summaries
- analytics events

This separation helps future expansion into mobile or AI-driven features.

## Core MVP Features
### Required
- home dashboard
- emotional level check-in
- symbolic tool selection
- release method selection
- one or two interactive release mechanics
- reflection prompts
- rule-based next-step suggestions
- completion screen
- stats page
- awareness streak logic

### Optional but Useful
- profile preferences
- sound on/off toggle
- theme or visual scene toggle

## Not Required for MVP
- AI therapy-style chat
- social sharing
- voice emotion detection
- therapist integration
- community features
- native mobile app

## Suggested Delivery Phases
### Phase 0 — Product Definition
Objective:
- finalize concept
- define MVP scope
- define emotional success criteria
- draft data model

Deliverables:
- concept document
- feature list
- flow map
- logic notes

### Phase 1 — UX Structure
Objective:
- define the core screens
- validate flow structure before polishing visuals

Deliverables:
- screen map
- low-fidelity wireframes
- user flow documentation
- content draft

### Phase 2 — Visual Direction
Objective:
- establish a consistent style direction
- generate or define visual assets

Deliverables:
- moodboard
- color direction
- motion direction
- AI prompt pack
- asset list

### Phase 3 — MVP Development
Objective:
- implement the core product flow
- persist sessions and stats
- make the app responsive

Deliverables:
- functional web app
- database schema
- session tracking
- dashboard and stats
- deployment environment

### Phase 4 — Testing and Iteration
Objective:
- observe user behavior
- identify drop-off points
- refine interaction, pacing, and retention mechanisms

Deliverables:
- analytics review
- usability notes
- version 2 priorities

## Suggested Database Model
### Tables
#### users
- id
- created_at
- display_name
- preferences
- current_awareness_streak
- total_calm_days

#### emotion_sessions
- id
- user_id
- created_at
- mood_level_before
- mood_level_after
- tool_id
- method_id
- session_type
- completed
- suggestion_id

#### tools
- id
- name
- icon_key
- active

#### release_methods
- id
- name
- interaction_type
- active

#### reflections
- id
- session_id
- prompt_type
- answer_type
- answer_value
- created_at

#### suggestions
- id
- category
- title
- description
- active

#### daily_stats
- id
- user_id
- date
- checked_in
- full_session_count
- highest_mood_level
- calm_day_flag

## MVP Decision Recommendations
- Start with web app only
- Design mobile-first and responsive from day one
- Use awareness streak as the main visible streak
- Keep reflection mostly structured with optional text
- Use rule-based suggestions before adding AI
- Keep the visual system cohesive rather than asset-heavy

## Analytics Events to Track
Examples:
- opened_app
- started_check_in
- completed_check_in
- selected_tool
- selected_method
- completed_release_interaction
- completed_reflection
- viewed_stats
- completed_session

## Key Risks
### Risk 1 — Overbuilding the Visual Layer Too Early
Mitigation:
- validate the emotional flow first
- use lightweight assets during early testing

### Risk 2 — Gamification Feels Judgmental
Mitigation:
- reward awareness, not perfection
- use warm recovery-oriented language

### Risk 3 — Release Interaction Becomes the Whole Product
Mitigation:
- keep it satisfying but short
- ensure reflection and progress remain central

### Risk 4 — Product Feels Too Serious or Too Silly
Mitigation:
- test tone early with real users
- align copy, visuals, and motion consistently

## What to Design Next
Recommended next deliverables after this implementation plan:
1. screen-by-screen wireframe brief
2. database schema in SQL
3. content and microcopy set
4. Midjourney prompt pack for scenes and assets
5. event tracking plan
