# Epic 0 Human Runbook

Date: 2026-03-22  
Scope: complete all Epic 0 human-gate tasks with minimal back-and-forth  
Audience: Hany  
Outcome: once this file is completed, Codex can continue into infrastructure and implementation with much less blocking

## Purpose

This is the detailed human execution guide for Epic 0 of the master refactor plan.

It is written as a dry run:

- where to go
- what to click
- what to choose
- what to save
- how to verify each step worked
- what to provide back to Codex for the next phase

## Important Rules Before You Start

### 1. Do not store secrets in the repo

Do not put any of these in committed files:

- VPS root password
- SSH private key content
- Groq API key
- GitHub PAT
- Plane API token

Use one of these instead:

- password manager
- secure note
- ignored local file like `.env.local`

### 2. Do not paste secrets into docs files

This runbook is safe to commit.
Your secrets are not.

### 3. You may share secrets with Codex in chat only if you want Codex to wire local integration for you

If you do that, Codex should place them only in local ignored files or use them for one-time setup, not commit them.

## Time Estimate

Expected total: 45 to 90 minutes, depending on account creation and site friction.

## Before You Begin

Prepare a secure note with this exact structure:

```text
WAZAKER EPIC 0 SECURE NOTE

VPS_PROVIDER=Hostinger
VPS_REGION=
VPS_IP=
VPS_ROOT_PASSWORD=
VPS_SSH_PRIVATE_KEY_PATH=
VPS_SSH_PUBLIC_KEY_PATH=

GROQ_API_KEY=

GITHUB_AUTOMATION_PAT=

PLANE_API_KEY=
PLANE_WORKSPACE_SLUG=wazaker
PLANE_PROJECT_ID=3bddb944-c6c3-4fe1-aaec-a6b1be247789

QUL_ACCOUNT_EMAIL=
QUL_REFERENCE_QARI=
QUL_AUDIO_AVAILABLE=
QUL_TIMESTAMPS_AVAILABLE=
QUL_WORD_JSON_AVAILABLE=
QUL_SURAH_METADATA_AVAILABLE=
QUL_EN_TRANSLATIONS_AVAILABLE=
QUL_NOTES=

TARTEEL_API_STATUS=
TARTEEL_API_NOTES=
```

If you prefer local files over a password manager, create a non-committed local file such as:

```bash
touch ~/wazaker-epic0-secrets.txt
chmod 600 ~/wazaker-epic0-secrets.txt
```

## Epic 0 Checklist

- Step 0.1: Purchase and verify the VPS
- Step 0.2: Create Groq API access
- Step 0.3: Create the GitHub automation token
- Step 0.4: Create the Plane API token
- Step 0.5: Confirm QUL data availability
- Step 0.6: Confirm Tarteel API status
- Final handoff: send the integration block back to Codex

---

## Step 0.1 — Purchase Hostinger KVM 4 VPS

### Goal

Buy and access the VPS that will host the target runtime.

### Where To Go

Open:

- `https://hostinger.com/vps/openclaw-hosting`

If that exact page redirects or changes, navigate manually to:

- Hostinger VPS hosting
- OpenClaw one-click or template offerings

### What To Select

Choose:

- plan: `KVM 4`
- size target: `4 vCPU / 16GB RAM / 200GB NVMe`
- region: `Frankfurt` or `Amsterdam`
- template: `OpenClaw 1-click`

Do not add optional extras unless you clearly understand them.

Specifically:

- do not add Nexos.ai credits unless you intentionally want them

### What To Save Immediately

After checkout and provisioning, save:

- server IP
- root username, if shown
- root password
- any generated SSH key info
- panel URL if Hostinger provides one

### What To Do After Provisioning

1. Open the Hostinger panel for the VPS.
2. Verify the server status shows active or running.
3. Open Docker or containers view if available.
4. Confirm OpenClaw appears as installed or running.

### Terminal Verification On Your Mac

Run:

```bash
ssh root@YOUR_SERVER_IP
```

Expected:

- you can connect successfully
- or you are prompted for host confirmation and then password/key auth

If you use SSH key auth, save:

- private key path
- public key path

### If SSH Fails

Check:

- did the server finish provisioning
- is the IP correct
- are you using the correct auth method
- is root login enabled in Hostinger’s template

If needed, use Hostinger’s browser terminal or recovery panel first.

### Mark Step 0.1 Done Only If

- VPS is provisioned
- SSH works
- OpenClaw is visible as installed or running

### Record In Your Secure Note

Fill:

```text
VPS_REGION=Frankfurt or Amsterdam
VPS_IP=
VPS_ROOT_PASSWORD=
VPS_SSH_PRIVATE_KEY_PATH=
VPS_SSH_PUBLIC_KEY_PATH=
```

### What Codex Will Need Later

Minimum useful values:

- `VPS_IP`
- either `VPS_ROOT_PASSWORD` or working SSH key path

---

## Step 0.2 — Create Groq Free Account And API Key

### Goal

Get the API key that OpenClaw and automation workflows will use for reasoning tasks.

### Where To Go

Open:

- `https://console.groq.com`

### What To Do

1. Sign up or sign in.
2. Complete any email verification required.
3. In the dashboard, find:
   - `API Keys`
4. Create a new API key.
5. Name it:
   - `wazaker-production`

### Save Immediately

Copy the key immediately. It may only be shown once.

Store it in:

- password manager
- secure note
- or local ignored env file

### Test The Key

Run:

```bash
curl https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer YOUR_GROQ_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"llama-3.1-8b-instant","messages":[{"role":"user","content":"ping"}]}'
```

Expected:

- JSON response
- no auth error
- a valid model reply payload

### If The Test Fails

Check:

- copied key has no spaces or line breaks
- account is verified
- Groq service is reachable from your network

### Mark Step 0.2 Done Only If

- account exists
- API key is stored securely
- test curl succeeds

### Record In Your Secure Note

```text
GROQ_API_KEY=
```

### What Codex Will Need Later

- `GROQ_API_KEY`

---

## Step 0.3 — Create GitHub PAT For Automation

### Goal

Create the fine-grained GitHub token for `n8n` and repo automation.

### Where To Go

In GitHub:

1. open `Settings`
2. open `Developer settings`
3. open `Personal access tokens`
4. open `Fine-grained tokens`
5. click `Generate new token`

### What To Enter

Name:

- `wazaker-n8n-automation`

Repository access:

- only the `wazaker` repository

Required permissions:

- `Contents`: Read and write
- `Issues`: Read and write
- `Pull requests`: Read and write
- `Webhooks`: Read and write

If GitHub asks for expiration:

- choose a value you can manage, but not too short
- 90 days or longer is usually reasonable for this use

### Save Immediately

Copy the token once shown and store it securely.

### Optional Verification

Run:

```bash
curl https://api.github.com/user \
  -H "Authorization: Bearer YOUR_GITHUB_PAT" \
  -H "Accept: application/vnd.github+json"
```

Expected:

- JSON response with your GitHub user info

Optional repo-scope check:

```bash
curl https://api.github.com/repos/Hany-R-Mahmoud/wazaker \
  -H "Authorization: Bearer YOUR_GITHUB_PAT" \
  -H "Accept: application/vnd.github+json"
```

### Mark Step 0.3 Done Only If

- token exists
- token is stored securely
- repository scope is correct

### Record In Your Secure Note

```text
GITHUB_AUTOMATION_PAT=
```

### What Codex Will Need Later

- `GITHUB_AUTOMATION_PAT`

---

## Step 0.4 — Create Plane API Token

### Goal

Create the Plane token for backlog sync and workflow automation.

### Where To Go

Open Plane and navigate to:

- `Settings`
- `API Tokens`
- `Create token`

If the UI wording differs, look for:

- personal settings
- developer settings
- API tokens

### What To Enter

Token name:

- `wazaker-n8n`

### Save Immediately

Copy the token and store it securely.

Also save:

- workspace slug
- project ID

For this project, the repo currently expects:

```text
PLANE_WORKSPACE_SLUG=wazaker
PLANE_PROJECT_ID=3bddb944-c6c3-4fe1-aaec-a6b1be247789
```

If Plane shows something different, record the actual value and report it.

### Test The Token

Run:

```bash
curl "https://api.plane.so/api/v1/workspaces/wazaker/projects/3bddb944-c6c3-4fe1-aaec-a6b1be247789/states/" \
  -H "X-API-Key: YOUR_PLANE_API_KEY"
```

Expected:

- JSON response containing project states

### If The Test Fails

Check:

- workspace slug is correct
- project ID is correct
- token belongs to the right Plane workspace

### Mark Step 0.4 Done Only If

- token exists
- workspace slug is known
- project ID is known
- test request succeeds

### Record In Your Secure Note

```text
PLANE_API_KEY=
PLANE_WORKSPACE_SLUG=wazaker
PLANE_PROJECT_ID=3bddb944-c6c3-4fe1-aaec-a6b1be247789
```

### What Codex Will Need Later

- `PLANE_API_KEY`
- `PLANE_WORKSPACE_SLUG`
- `PLANE_PROJECT_ID`

---

## Step 0.5 — Confirm QUL Data Availability

### Goal

Confirm the core Quranic reference data exists before the data and scoring architecture proceeds.

### Where To Go

Open:

- `https://qul.tarteel.ai`

### What To Do

1. Sign up or sign in.
2. Go to the datasets, recitations, or downloads area.
3. Search for the following exact or nearest-equivalent assets:

- Mahmoud Khalil Al-Husary ayah-by-ayah audio
- word-by-word timestamps for Al-Husary
- Quran text word by word in JSON or exportable form
- Surah metadata
- English translations

### What You Are Trying To Confirm

You need to know whether the Phase 1 scoring architecture is still valid.

The most important question:

- is Al-Husary ayah-by-ayah reference content available together with timestamps

### Dry-Run Mental Model

As the human doing this, imagine the next step after Epic 0:

- Codex will later build import scripts
- those scripts need machine-readable text and timestamps
- the app needs audio URLs for ayah playback

So do not stop at “I saw Al-Husary.”
You need to confirm:

- downloadable or exportable audio access
- downloadable or exportable timestamps
- usable word/text data

### Record What You Find

For each asset, mark one of:

- `yes`
- `no`
- `unclear`

Specifically record:

```text
QUL_REFERENCE_QARI=Mahmoud Khalil Al-Husary or alternative
QUL_AUDIO_AVAILABLE=yes/no/unclear
QUL_TIMESTAMPS_AVAILABLE=yes/no/unclear
QUL_WORD_JSON_AVAILABLE=yes/no/unclear
QUL_SURAH_METADATA_AVAILABLE=yes/no/unclear
QUL_EN_TRANSLATIONS_AVAILABLE=yes/no/unclear
QUL_NOTES=
```

### Decision Rule

If Al-Husary audio and timestamps are both available:

- this step is complete

If audio exists but timestamps do not:

- stop and report that clearly
- this changes the scoring architecture enough that Codex should re-evaluate before Epic 3 and Epic 6

If Al-Husary is missing entirely but another strong qari with timestamps exists:

- report the alternative qari clearly

### Mark Step 0.5 Done Only If

One of these is true:

- Al-Husary audio and timestamps are confirmed available
- or a documented alternative is found and reported

### What Codex Will Need Later

At minimum:

- whether Al-Husary is confirmed
- whether timestamps are confirmed
- the exact qari name if different

---

## Step 0.6 — Final Tarteel API Availability Check

### Goal

Do one final human verification of whether Tarteel now offers a public developer API.

### Where To Go

Check:

- `https://tarteel.ai`

Then search on the site and externally for:

- `API`
- `developer`
- `integration`
- `docs`

### How To Check

Do all of these:

1. Browse the main navigation and footer for:
   - API
   - developers
   - integrations
   - platform
2. Use the site search if available.
3. Search the web with:
   - `site:tarteel.ai API`
   - `site:tarteel.ai developer`
   - `site:tarteel.ai integration`

### What Counts As “API Exists”

Count it as available only if you find something clearly public such as:

- developer documentation
- API reference
- authentication instructions
- integration docs
- public API pricing or onboarding

Marketing language alone does not count.

### Decision Rule

If you find a real public API:

- stop
- report that immediately
- do not assume the current Epic 6 architecture is still best

If you do not find a public API:

- mark this step done

### Record In Your Secure Note

```text
TARTEEL_API_STATUS=available or unavailable
TARTEEL_API_NOTES=
```

### What Codex Will Need Later

- final status: `available` or `unavailable`
- one short note or link if it is available

---

## Final Epic 0 Completion Check

Epic 0 is done only when all of these are true:

- VPS purchased and reachable
- Groq key created and tested
- GitHub PAT created
- Plane token created and tested
- QUL data availability confirmed
- Tarteel API status confirmed

If even one of those is missing, Epic 0 is not done.

## What To Send Back To Codex

When you finish all Epic 0 steps, paste this exact block into the chat and fill the values.

If you do not want to paste secrets into chat, replace secret values with:

- `stored-locally`

and tell Codex where they are stored locally.

### Preferred Full Handoff Block

```text
EPIC0_DONE=true

VPS_IP=
VPS_REGION=
VPS_ROOT_PASSWORD=
VPS_SSH_PRIVATE_KEY_PATH=
VPS_SSH_PUBLIC_KEY_PATH=

GROQ_API_KEY=

GITHUB_AUTOMATION_PAT=

PLANE_API_KEY=
PLANE_WORKSPACE_SLUG=wazaker
PLANE_PROJECT_ID=3bddb944-c6c3-4fe1-aaec-a6b1be247789

QUL_REFERENCE_QARI=
QUL_AUDIO_AVAILABLE=
QUL_TIMESTAMPS_AVAILABLE=
QUL_WORD_JSON_AVAILABLE=
QUL_SURAH_METADATA_AVAILABLE=
QUL_EN_TRANSLATIONS_AVAILABLE=
QUL_NOTES=

TARTEEL_API_STATUS=
TARTEEL_API_NOTES=
```

### Safer Reduced Handoff Block

Use this if you want to keep secrets out of chat and load them yourself into local env files:

```text
EPIC0_DONE=true

VPS_IP=
VPS_REGION=
VPS_SSH_PRIVATE_KEY_PATH=
VPS_SSH_PUBLIC_KEY_PATH=

GROQ_API_KEY=stored-locally
GITHUB_AUTOMATION_PAT=stored-locally
PLANE_API_KEY=stored-locally

PLANE_WORKSPACE_SLUG=wazaker
PLANE_PROJECT_ID=3bddb944-c6c3-4fe1-aaec-a6b1be247789

QUL_REFERENCE_QARI=
QUL_AUDIO_AVAILABLE=
QUL_TIMESTAMPS_AVAILABLE=
QUL_WORD_JSON_AVAILABLE=
QUL_SURAH_METADATA_AVAILABLE=
QUL_EN_TRANSLATIONS_AVAILABLE=
QUL_NOTES=

TARTEEL_API_STATUS=
TARTEEL_API_NOTES=
```

## Recommended Local Integration Option

If you want the cleanest next step with minimal chat friction, after finishing Epic 0 create or update a local ignored file:

```bash
code .env.local
```

Suggested contents:

```text
PLANE_API_BASE_URL=https://api.plane.so
PLANE_WORKSPACE_SLUG=wazaker
PLANE_PROJECT_ID=3bddb944-c6c3-4fe1-aaec-a6b1be247789
PLANE_API_KEY=YOUR_PLANE_API_KEY

GROQ_API_KEY=YOUR_GROQ_API_KEY
GITHUB_AUTOMATION_PAT=YOUR_GITHUB_PAT

VPS_IP=YOUR_SERVER_IP
VPS_ROOT_PASSWORD=YOUR_ROOT_PASSWORD
VPS_SSH_PRIVATE_KEY_PATH=/absolute/path/to/private/key
VPS_SSH_PUBLIC_KEY_PATH=/absolute/path/to/public/key
```

Do not commit this file.

Then come back to Codex and say:

```text
Epic 0 is done. Secrets are stored in .env.local. Continue with Epic 2.
```

## If Something Goes Wrong

If you get blocked on any step, report only this compact format back to Codex:

```text
EPIC0_BLOCKED
STEP=0.X
PROBLEM=
WHAT_I_TRIED=
ERROR_TEXT=
```

That is enough for Codex to help without re-explaining the entire flow.
