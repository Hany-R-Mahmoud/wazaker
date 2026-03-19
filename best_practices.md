# best_practices.md
# Code review rules for Qodo
# Sources: goldbergyoni/nodebestpractices + React Native / TypeScript standards
# Stack: React Native (Expo) · TypeScript · Supabase · Node.js backend
# Last updated: 2026

---

## 1. Project Architecture

### 1.1 Structure by feature, not by file type
Group files by what they do, not what they are.

Before:
```
/components/RecitationCard.tsx
/hooks/useRecitation.ts
/services/recitationService.ts
/types/recitation.ts
```

After:
```
/features/recitation/
  RecitationCard.tsx
  useRecitation.ts
  recitationService.ts
  types.ts
```

### 1.2 Layer your code — never mix concerns
- UI components must not call Supabase or APIs directly
- Business logic lives in hooks or services, never in components
- Data fetching lives in a service layer, never inline in a screen

Before:
```ts
// RecitationScreen.tsx
const { data } = await supabase.from('recitations').select('*');
```

After:
```ts
// recitationService.ts
export async function getRecitations() {
  const { data, error } = await supabase.from('recitations').select('*');
  if (error) throw error;
  return data;
}

// RecitationScreen.tsx
const data = await getRecitations();
```

### 1.3 No secrets in config files
All secrets and environment variables must be loaded from `.env`, never hardcoded.

Before:
```ts
const API_KEY = 'sk-abc123xyz';
const SUPABASE_URL = 'https://xxxx.supabase.co';
```

After:
```ts
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
```

---

## 2. Error Handling

### 2.1 Use async/await with try/catch — never callbacks
Never use raw callback-style async patterns. Always use async/await.

Before:
```ts
getRecitation(id, function(err, data) {
  if (err) { ... }
});
```

After:
```ts
try {
  const data = await getRecitation(id);
} catch (err) {
  logger.error('[getRecitation] failed', { id, err });
  throw err;
}
```

### 2.2 Never swallow errors silently
Every catch block must log and/or rethrow. Empty catch blocks are forbidden.

Before:
```ts
try {
  await transcribeAudio(file);
} catch (e) {}
```

After:
```ts
try {
  await transcribeAudio(file);
} catch (e) {
  console.error('[transcribeAudio] failed:', e);
  throw e;
}
```

### 2.3 Always await promises before returning
Returning a promise without await loses the stack trace on errors.

Before:
```ts
function getUser(id: string) {
  return supabase.from('users').select().eq('id', id);
}
```

After:
```ts
async function getUser(id: string) {
  return await supabase.from('users').select().eq('id', id);
}
```

### 2.4 Validate inputs early — fail fast
Validate all inputs at the boundary before executing logic.

Before:
```ts
async function scoreRecitation(audioBlob, surahId) {
  const result = await model.transcribe(audioBlob);
  // surahId might be undefined — crashes deep in the stack
}
```

After:
```ts
async function scoreRecitation(audioBlob: Blob, surahId: number) {
  if (!audioBlob) throw new Error('audioBlob is required');
  if (!surahId || surahId < 1) throw new Error('surahId must be a positive integer');
  const result = await model.transcribe(audioBlob);
}
```

### 2.5 Catch unhandled promise rejections globally
Always register a global handler for unhandled rejections.

```ts
// app entry point
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
```

---

## 3. Code Style

### 3.1 Use ESLint — enforced, not optional
Every repo must have `.eslintrc` configured and passing before any PR merges.

### 3.2 Prefer `const` over `let`. Never use `var`

Before:
```ts
var userId = getUserId();
let config = loadConfig();
```

After:
```ts
const userId = getUserId();
const config = loadConfig();
```

### 3.3 Use `===` not `==`

Before:
```ts
if (status == 'active') { ... }
```

After:
```ts
if (status === 'active') { ... }
```

### 3.4 Name all functions — no anonymous functions in critical paths

Before:
```ts
setTimeout(function() {
  syncData();
}, 1000);
```

After:
```ts
setTimeout(async function syncDataAfterDelay() {
  await syncData();
}, 1000);
```

### 3.5 Use naming conventions consistently
- **Booleans**: `isLoading`, `hasError`, `canSubmit`, `isVisible`
- **Event handlers**: `handlePress`, `handleSubmit`, `handleChange`
- **Constants**: `SCREAMING_SNAKE_CASE`
- **Types/Interfaces**: `PascalCase` — `RecitationResult`, `UserProfile`
- **Hooks**: always start with `use` — `useRecitation`, `useAuth`
- **Components**: `PascalCase` — `RecitationCard`, `SurahList`
- **Services**: camelCase with noun — `recitationService`, `authService`

### 3.6 Use arrow functions for callbacks

Before:
```ts
array.map(function(item) { return item.id; });
```

After:
```ts
array.map((item) => item.id);
```

### 3.7 No side effects outside of functions
Never execute logic at module level outside of functions.

Before:
```ts
// top of file — runs on import
const user = await getCurrentUser();
```

After:
```ts
// inside a function or hook
async function init() {
  const user = await getCurrentUser();
}
```

### 3.8 Import modules at the top — never inside functions

Before:
```ts
async function processAudio() {
  const { Whisper } = require('whisper');
  ...
}
```

After:
```ts
import { Whisper } from 'whisper';

async function processAudio() { ... }
```

---

## 4. Testing

### 4.1 Structure tests with the AAA pattern
Every test must have exactly three sections: Arrange, Act, Assert.

```ts
test('scoreRecitation returns a score between 0 and 100', async () => {
  // Arrange
  const audioBlob = loadFixture('fatiha-sample.wav');
  const surahId = 1;

  // Act
  const result = await scoreRecitation(audioBlob, surahId);

  // Assert
  expect(result.score).toBeGreaterThanOrEqual(0);
  expect(result.score).toBeLessThanOrEqual(100);
});
```

### 4.2 Name tests with 3 parts: unit · scenario · expected outcome

Before:
```ts
test('test score function');
```

After:
```ts
test('scoreRecitation — when audio is silent — returns score of 0');
test('getUser — when user does not exist — throws NotFoundError');
```

### 4.3 No global test fixtures — add data per test
Each test must set up and tear down its own data. Never rely on shared state.

### 4.4 Test error flows, not just happy paths
For every function that can throw, write at least one test that validates the error case.

```ts
test('transcribeAudio — when file is corrupt — throws TranscriptionError', async () => {
  const corruptFile = Buffer.from('not-audio');
  await expect(transcribeAudio(corruptFile)).rejects.toThrow('TranscriptionError');
});
```

### 4.5 Functions touching audio, scoring, or database writes must have tests
No exceptions. These are the highest-risk areas of your app.

---

## 5. Security

### 5.1 No secrets in code, logs, or comments
Never log tokens, passwords, or user audio data. Never hardcode credentials.

Before:
```ts
console.log('Supabase response:', JSON.stringify(user));
const SECRET = 'my-jwt-secret';
```

After:
```ts
console.log('Supabase response: [redacted]');
const SECRET = process.env.JWT_SECRET;
```

### 5.2 Use parameterized queries — never string concatenation
Never build database queries from user input directly.

Before:
```ts
const query = `SELECT * FROM recitations WHERE user_id = '${userId}'`;
```

After:
```ts
const { data } = await supabase
  .from('recitations')
  .select('*')
  .eq('user_id', userId);
```

### 5.3 Validate all incoming data at boundaries
Every API call or user input must be validated before use. Use Zod or similar.

```ts
import { z } from 'zod';

const RecitationInput = z.object({
  surahId: z.number().int().min(1).max(114),
  ayahId: z.number().int().min(1),
  audioUrl: z.string().url(),
});

const parsed = RecitationInput.parse(rawInput);
```

### 5.4 Lock dependency versions
Always use exact versions or lockfiles. Never use `*` or `latest` in production dependencies.

```json
// package.json
"dependencies": {
  "expo": "51.0.0",   // exact, not "^51.0.0"
}
```

### 5.5 Regularly audit dependencies for vulnerabilities
Run before every release:
```bash
npm audit
```

---

## 6. React Native / Component Rules

### 6.1 One component per file. Filename matches component name exactly.

### 6.2 Keep components under 150 lines
If a component exceeds 150 lines, split it into smaller components or extract logic into a hook.

### 6.3 Every async operation must handle three states

Before:
```tsx
const [data, setData] = useState(null);
```

After:
```tsx
const [data, setData] = useState<RecitationResult | null>(null);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);
```

### 6.4 No inline styles — use StyleSheet
React Native's `StyleSheet.create()` is required for all styles.

Before:
```tsx
<View style={{ padding: 16, backgroundColor: '#fff' }}>
```

After:
```tsx
<View style={styles.container}>

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
});
```

### 6.5 Never mutate state directly

Before:
```ts
user.name = 'Hany';
setUser(user);
```

After:
```ts
setUser({ ...user, name: 'Hany' });
```

### 6.6 Use TypeScript types for all props — no implicit `any`

Before:
```tsx
function RecitationCard({ surah, score }) { ... }
```

After:
```tsx
type RecitationCardProps = {
  surah: Surah;
  score: number;
};

function RecitationCard({ surah, score }: RecitationCardProps) { ... }
```

---

## 7. Quran App Domain Rules

### 7.1 Surah and Ayah indices are always 1-based
When used in 0-based arrays, add a comment explaining the offset.

```ts
// Surah IDs are 1-based (1–114). Subtract 1 for array index.
const surahData = SURAH_LIST[surahId - 1];
```

### 7.2 Never hardcode Arabic text
All Arabic content must reference constants, never inline strings.

Before:
```tsx
<Text>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
```

After:
```tsx
import { BASMALA } from '@/constants/quran';
<Text>{BASMALA}</Text>
```

### 7.3 Audio paths must use AUDIO_PATHS constants

Before:
```ts
const audioUrl = `/audio/001_Al-Fatiha/001.mp3`;
```

After:
```ts
import { AUDIO_PATHS } from '@/constants/audio';
const audioUrl = AUDIO_PATHS.getSurahUrl(1);
```

### 7.4 Never display raw model output
All recitation scoring results must be validated and mapped before displaying to users.

Before:
```tsx
<Text>Score: {modelOutput.raw_score}</Text>
```

After:
```tsx
const displayScore = validateAndNormalizeScore(modelOutput);
<Text>Score: {displayScore}</Text>
```

---

## 8. Git & PR Rules

- Never commit directly to `main`. All changes go through a PR on a feature branch.
- Every PR must reference a Plane task ID in the title or description.
- No PR merges with failing lint or tests.
- Keep PRs small — under 400 lines of change where possible.
- Every PR description must include: what changed, why, and how to test it.
