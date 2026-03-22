# User Stories

## Epic: Access And Navigation

### Story 1

As a Quran learner, I want to sign in and return to my own practice data so that my sessions and progress belong to me.

Acceptance criteria:

- the app supports sign up and sign in
- authenticated users land on the dashboard
- unauthenticated users are routed to auth screens

### Story 2

As a Quran learner, I want a simple home dashboard so that I can resume practice quickly.

Acceptance criteria:

- the dashboard shows a clear start-recitation path
- the dashboard shows the latest session when available
- the empty state is encouraging and Arabic-first

## Epic: Quran Reading And Reference Audio

### Story 3

As a Quran learner, I want to browse Surahs so that I can choose what to practice easily.

Acceptance criteria:

- all 114 Surahs are browsable
- the list is searchable
- Arabic names are displayed correctly in RTL layout

### Story 4

As a Quran learner, I want to open a Mushaf screen and read ayahs word by word so that I can practice from a clear Quran view.

Acceptance criteria:

- the selected Surah opens in a readable Mushaf layout
- each ayah is clearly separated and numbered
- Arabic text remains primary in the reading experience

### Story 5

As a Quran learner, I want to hear Al-Husary’s reference recitation per ayah so that I can compare my recitation to a trusted reference.

Acceptance criteria:

- each ayah can play reference audio
- playback uses the stored reference audio URLs
- word highlighting stays aligned to the ayah timing data

## Epic: Recitation And Feedback

### Story 6

As a Quran learner, I want to record a specific ayah so that the system scores my recitation against the right target.

Acceptance criteria:

- the recording screen knows the selected Surah and ayah
- the app requests microphone permission clearly
- the user can record, stop, replay, and submit an attempt

### Story 7

As a Quran learner, I want the app to score my recitation so that I know which words were likely correct, wrong, or uncertain.

Acceptance criteria:

- the scoring pipeline ties the recording to the selected ayah
- results contain a word-level status and confidence data
- uncertain words never appear as definitively wrong

### Story 8

As a Quran learner, I want a result screen that explains my score clearly so that I know what to retry next.

Acceptance criteria:

- the result screen shows an overall score
- the result screen highlights correct, incorrect, and uncertain words distinctly
- the user can try again or move to the next ayah

## Epic: History And Progress

### Story 9

As a Quran learner, I want my recitation sessions saved so that I can review previous attempts.

Acceptance criteria:

- session history is stored per authenticated user
- each session shows Surah, ayah, score, and date
- the user can reopen a past result

### Story 10

As a Quran learner, I want progress features after launch so that I can stay consistent and identify recurring mistakes.

Acceptance criteria:

- goals and streaks are planned for Phase 2
- mistake history and progress trends are planned for Phase 2
- memorization mode is planned as a Phase 2 extension on top of the same scoring pipeline
