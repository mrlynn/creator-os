---
phase: sprint8
plan: 05
type: execute
wave: 3
depends_on: []
files_modified:
  - src/app/app/ideas/new/page.tsx
  - src/components/ideas/VoiceInputButton.tsx (new)
autonomous: true
requirements:
  - VOICE-01
---

<objective>
Voice-to-text on idea capture using Web Speech API.
Purpose: Capture ideas in under 10 seconds; mobile-friendly.
</objective>

<context>
- Web Speech API: SpeechRecognition (Chrome, Edge, Safari); not in Firefox
- Ideas new page has title, description TextFields
- Feature: microphone button that fills description (or title) from voice
- Check for window.SpeechRecognition || window.webkitSpeechRecognition
</context>

<tasks>

<task type="auto">
  <name>Task 1: VoiceInputButton component</name>
  <files>src/components/ideas/VoiceInputButton.tsx</files>
  <action>
1. Create VoiceInputButton: icon button with mic icon
2. On click: start SpeechRecognition, on result append to callback(value)
3. Show recording state (pulsing mic or "Listening...")
4. Graceful fallback: if SpeechRecognition unavailable, show disabled with tooltip "Not supported in this browser"
5. Stop on second click or after 30s timeout
  </action>
  <verify>VoiceInputButton starts/stops recognition, calls onResult</verify>
</task>

<task type="auto">
  <name>Task 2: Integrate into idea form</name>
  <files>src/app/app/ideas/new/page.tsx</files>
  <action>
1. Add VoiceInputButton next to description TextField (or as InputAdornment)
2. On voice result: append to description (or replace if empty)
3. Focus description field after voice input
  </action>
  <verify>Voice input fills description field</verify>
</task>

</tasks>

<verification>
- Mic button appears on idea form
- Voice input populates description (Chrome/Safari/Edge)
- Unsupported browsers see disabled state
</verification>
