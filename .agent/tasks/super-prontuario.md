# Super Prontuário Implementation Plan

## Overview
Implementar melhorias significativas na experiência do médico no prontuário, focando em automação, fluxo unificado e facilidade de uso.

## Tasks

### Phase 1: Unified Timeline (Opção A)
- [ ] Create `Timeline.tsx` component that aggregates:
    - Evolutions
    - Prescriptions
    - Documents/Exams
- [ ] Update `app/patients/[id]/page.tsx` to use the new Unified Timeline in the left column.
- [ ] Ensure the timeline is filterable (e.g., "Show only Prescriptions").

### Phase 2: Macros & Automation (Opção B)
- [ ] **RichEditor Macros:**
    - Add "Insert Template" dropdown to `RichEditor`.
    - Create a mock list of templates (e.g., "Normal Exam", "Flu Protocol").
    - Implement insertion logic.
- [ ] **Prescription Cloning:**
    - Add "Repeat" button to prescription items in the Timeline.
    - Action should pre-fill the prescription modal/form.

### Phase 3: Voice Dictation (Opção C - MVP)
- [ ] Implement `useSpeechRecognition` hook using Web Speech API.
- [ ] Add Microphone button to `RichEditor` toolbar.
- [ ] Handle listening state and append text to editor content.

## Architecture Notes
- All state management for forms should remain simple (React State/Hook Form).
- Avoid complex backend changes for now; mock aggregated data if necessary for the Timeline MVP.
