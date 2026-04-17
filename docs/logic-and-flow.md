# Emotional Reset App — Product Logic and User Flow

## Experience Model
The product is built around a repeatable emotional reset loop:

1. **Check-in**
2. **Simulated Release**
3. **Reflection**
4. **Guidance**
5. **Progress Tracking**

This loop allows the user to move from emotional activation toward emotional clarity.

## Core Logic
### Session Logic
Each user interaction can create an `emotion session`.

A session may include:
- timestamp
- emotional intensity before session
- selected tool or weapon
- selected release method
- reflection answers
- recommended next step
- emotional intensity after session
- completion status

### Daily Logic
A user should not be forced into the full experience every day.

The system should support three modes:
- **Quick Check-In** — for simple mood logging
- **Full Reset Session** — for active emotional regulation
- **Progress Visit** — for viewing streaks and statistics

### Success Logic
The app should not reward rage itself.

Instead, it should reward:
- awareness
- consistent self-checking
- completed reflection
- emotional recovery
- calm days and reduced need for intense release

## Main Information Architecture
- Home
- Check-In
- Session Flow
- Reflection Summary
- Stats
- Profile / Preferences

## Main User Flows
### Flow A — Quick Check-In
Home → Select emotional level → Save → View brief summary or stats

Use case:
- user is okay
- user wants to log mood only
- user wants to maintain streak

### Flow B — Full Emotional Reset
Home → Select emotional level → Choose tool → Choose method → Interactive release → Reflection → Guidance → Completion screen → Stats updated

Use case:
- user feels irritated, frustrated, angry, or emotionally overloaded

### Flow C — Progress Visit
Home → Stats → Review streaks, trends, milestones, or history

Use case:
- user is calm but wants to monitor progress
- user wants to maintain awareness without doing a full session

## Detailed Session Flow
### Step 1 — Select Emotional Level
The user selects their current state, for example:
- Calm
- Irritated
- Frustrated
- Angry
- Explosive

Design requirement:
- must be quick
- one-tap selection preferred
- visually expressive but not childish

### Step 2 — Select Tool / Weapon
This is symbolic rather than realistic. Examples:
- pillow
- rubber hammer
- paper ball
- foam bat
- mute button for the world

Purpose:
- create playful identity
- let the user personalize their release ritual

### Step 3 — Select Release Method
Examples:
- smash
- throw
- tear
- burn
- shout visualization

Each method should create a distinct interaction pattern or animation language.

### Step 4 — Simulated Release
Possible interactions:
- repeated taps to smash
- swipe to throw
- drag to target
- press and hold to release pressure

Design requirement:
- feels satisfying
- remains brief
- should not become the entire product

### Step 5 — Reflection
After the release interaction, the tone of the experience should soften.

Possible prompts:
- How intense is your feeling now?
- What is really underneath this anger?
- What do you need right now?
- What part of this is within your control?

Answer types:
- multiple choice
- sliders
- short optional text input

### Step 6 — Guidance
Provide one or more small next-step suggestions such as:
- take a 5-minute break
- drink water
- walk before responding
- write down the issue
- revisit the conversation later

The system should feel like a calm companion, not a lecturer.

### Step 7 — Closure
The session should end with a sense of progress.

Possible content:
- emotional shift summary
- calm reminder
- streak update
- badge or milestone update
- encouragement such as “You paused before exploding. That counts.”

## Recommended MVP Scope
### In Scope
- home dashboard
- mood check-in
- tool selection
- release method selection
- 1–2 interactive release mechanics
- reflection prompts
- rule-based suggestions
- completion screen
- simple stats view
- awareness streak

### Out of Scope for MVP
- AI coaching
- deep personalization
- social features
- native mobile app
- advanced crisis intervention
- voice analysis

## Edge Cases to Consider
- user exits halfway through a session
- user logs a very high emotional level but skips reflection
- user opens app only to view stats
- user has no emotional spike but wants to preserve their streak

## Product Metrics
### User-Facing Metrics
- total sessions
- average emotional level
- most-used tool
- most-used method
- emotional recovery trend
- awareness streak
- calm days
- weekly emotional trend

### Product Metrics
- daily active users
- session completion rate
- reflection completion rate
- repeat usage
- stats page revisit rate
- ratio of check-ins to full sessions
