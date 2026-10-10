# KindGuard AI

A student-first digital safety companion. It detects cyberbullying, scams, misinformation and signs of distress in text,
chats and images, explains why in plain language, and helps students respond with kindness.
One local server serves the website and talks to Google Gemini.

## Run it
1. Install Python 3.11 or newer.
2. Double-click `START_KINDGUARD.bat`.
3. First run: Notepad opens `backend/.env`. Paste your Gemini key after `GEMINI_API_KEY=`, save, close.
4. The browser opens `http://127.0.0.1:8000/`. Use that address, not port 5173.

The key lives only in `backend/.env` and is never sent to the browser. `.env` is git-ignored.

## Pages
| Page | What it does |
|---|---|
| Home | Landing page, live verdict examples, features, Responsible AI safeguards |
| KindGuard Chat | The one assistant: any question, message checks with a verdict, empathy coaching, "make it kinder", notes help. Add screenshots/files or share your screen. Replies in the student's language (Hindi, Hinglish, English...) |
| Safety Scanner | Robot mascot "Kai" + big upload zone (up to 3 screenshots/PDFs/text files + pasted text). Full report: verdict, findings, visible personal details, next steps, and "copy report for a trusted adult" |
| Quiz Planner | A study coach chats with you one question at a time while your quiz plan builds live on the right. The coach asks the questions and returns a day-by-day plan, pitched at your grade, learning style and energy (set in the account menu). Edit any item with the pencil icon |
| Story Mode | Interactive 3-chapter stories where each scene reacts to your last choice (2 built-in that work offline, unlimited AI-generated). Includes the Quick Decisions tab |
| Calm Corner | Mood check-in, 4-4-6 breathing, 5-4-3-2-1 grounding, daily kindness challenge, and the Kindness Studio (AI writes kind messages, turn one into a shareable PNG card) |
| My Journey | Kindness points, levels, streak, badges, verdict breakdown, mood history, and data controls |

## Student mode and General mode
Switch with the **Student / General** control in the header (or in the account menu, which is the only place on small screens). The choice is remembered on this device.
| | Student mode (default) | General mode |
|---|---|---|
| Safety tools | Chat, Scanner, Story Mode, Calm Corner, My Journey | Same |
| Study tools | **Quiz Planner**, **Focus Timer**, **Flashcards** (own "Study" group in the sidebar) | Hidden. Opening one shows a short "Student mode feature" page with a switch button |
| AI context | Grade, learning style and energy are sent to the AI | Nothing about the student is sent |
| Header | Study streak and a running-timer chip | Neither |

- **Focus Timer:** 15/25/45 minute blocks with an animated ring and automatic breaks. The suggested length follows your Energy setting. The timer keeps running while you use other pages, and a chip in the header shows the time. Finished blocks count toward the study streak (days in a row you studied), which is separate from the My Journey streak.
- **Flashcards:** type a topic (or pick the subject from your quiz plan) and the AI makes 6, 8 or 10 cards. Tap to flip, then mark *Got it* or *Again*. Missed cards come back until you know them all. Keys: Space flips, ← Again, → Got it.
- **Ephemeral Mode** also stops the study log and the saved deck from being written to the browser.

## Account menu and AI context
The avatar button (top right) opens a menu with **Edit Profile**, **Privacy & Safety** and **AI Context** (grade level and learning style). This is a local mock: there is no sign-in. Only grade level and learning style are ever sent to the AI, never your name.
**Ephemeral Mode** keeps profile, AI context and the Quiz Planner in memory only. Nothing about them is written to localStorage, and anything already saved is removed when you switch it on.

## Self-aware AI (`POST /api/ai`)
One server-side route serves both personas. The Gemini key stays in `backend/.env`; the browser never sees it.
`build_system_prompt(user_context, mode)` in `backend/main.py` assembles the prompt on every call:
1. **Identity and rules (always):** KindGuard, privacy-first, non-judgmental, calm, plain language.
2. **User context (dynamic):** "The user is in Grade 9. They learn best via Visual. Their current energy is Low." Values are allow-listed server-side; anything else is ignored.
3. **Mode:** `safety` (scams, bullying, privacy risks, explained calmly) or `planner` (Socratic Study Coach: one question at a time, then strict JSON).

| Field | Meaning |
|---|---|
| `message` | The student's text (treated as untrusted data) |
| `mode` | `"safety"`, `"planner"` or `"flashcards"` |
| `context` | `{ "grade", "style", "energy" }`, set in the account menu |
| `history` | Earlier turns `{ "role": "user" or "assistant", "content" }` |
| `finalize` | Planner only: stop asking and output the plan now |
| `count` | Flashcards only: number of cards (4 to 12) |

Flashcard replies are `{ "topic", "cards": [{ "q", "a" }] }`, validated on the server the same way.
Planner replies are either `{ "text", "label" }` (the next question) or `{ "plan": { "subject", "days", "schedule": [{ "day", "topic", "activity", "duration" }] } }`. The plan is validated and filtered on the server before the UI renders it. The input guard and output filter also run here, and distress messages get the helpline reply instead of a plan.

## Motion
All animation is plain CSS plus the Web Animations API (no dependencies) and is switched off by `prefers-reduced-motion`.
- **Quiz Planner:** a FLIP layout engine (`flip()` in `app.js`) glides items into place when the list changes, and deleted days play an exit animation first. A pulsing "thinking" core replaces typing dots. AI replies fade in word by word, plan days cascade in, and a progress bar, skeleton placeholders and a confetti finish round it off. Days can be moved up or down, edited or deleted.
- **Landing page:** staged hero entrance, shimmering headline, drifting orbs, cursor spotlight, 3D tilt on the demo card, rotating gradient border, magnetic buttons, scroll-reveal sections, cursor-following card glow and a scroll progress bar.
- **Whole app:** page transitions, a sliding sidebar indicator, animated verdict meters, button shine and press feedback, and a staggered account menu.

## Verdicts
When something is worth judging, the reply starts with **Low concern (looks safe)**, **Worth a pause (be careful)** or
**High concern (not safe)**, with categories, reasons and next steps.

## Saved chat history
Conversations are saved **in the student's own browser only** (localStorage). Nothing is stored on the server.
- Recent chats appear in the sidebar; click to reopen, x to delete.
- The switch in the sidebar turns saving off.
- Download one chat as .txt, or all chats as .json, from the chat bar and My Journey.
- My Journey can delete all chats or reset progress (with confirmation).
- Uploads and screen snapshots are sent to Gemini for analysis and never written to disk. Only a tiny thumbnail of a sent image is kept in the saved chat.

## Responsible AI safeguards
- **Input guard:** instruction-like text ("ignore previous instructions...") is flagged and treated as content, never as a command.
- **Output filter:** every rewrite and kind message is scanned locally for insults, exclusion, harassment and stereotypes before it is shown.
- **Gemini safety settings:** sexual and dangerous content blocked at medium and above; harassment and hate only at high, so hurtful messages can still be read and explained.
- **Fairness and privacy:** never identifies people from faces; never guesses religion, caste, gender, age or other traits.
- **Humans in the loop:** threats, scams and distress point to a trusted adult. Distress shows free helplines (Tele-MANAS 14416 and Childline 1098, India) and a calming exercise.
- **Honest fallback:** if Gemini is unavailable, a built-in word check can still warn, but it never says something is safe.

## How it maps to the brief
| Brief | KindGuard |
|---|---|
| Analyse text, chats or images to detect cyberbullying, misinformation, distress | Chat verdicts, Safety Scanner, screen share |
| Context-aware, uplifting, educational responses | Empathy coaching, kind rewrites, Kindness Studio |
| Responsible AI safeguards and content filters | See above |
| Awareness about digital ethics and wellbeing via text, visuals or interactive stories | Story Mode, Calm Corner, kindness cards, My Journey |

## 3-minute demo script
1. **Home:** the headline, click through the three example verdicts (hurtful, normal, scam).
2. **Chat:** paste `You're stupid and nobody wants you here.` and show the High concern verdict, then press **Make it kinder**.
3. **Chat:** type `main bahut akela feel kar raha hoon` (Hindi/Hinglish) to show the empathetic reply and support card.
4. **Safety Scanner:** drop a chat screenshot; Kai scans, then **Copy report for a trusted adult**.
5. **Story Mode:** play "The Group Chat", make the good choices, show the Upstander ending. Then make an AI story on any topic.
6. **Calm Corner:** run a breathing cycle, then write kind messages and download a kindness card.
7. **My Journey:** show points, badges and the data controls. Open the sidebar and show saved chats and the on-device switch.

## Status light
Online · Key missing · Key rejected · Model error · No Gemini (no internet) · Offline (server not running).

## Troubleshooting
- **Offline**: run `START_KINDGUARD.bat` and keep its window open.
- **Key missing / rejected**: fix `GEMINI_API_KEY` in `backend/.env`, then close the backend window and run the .bat again.
- **Model error**: set `GEMINI_MODEL` in `backend/.env` to a model your key can use.
- **Screen share**: use Chrome or Edge and allow the permission prompt.
- **`{"detail":"Not Found"}`**: you opened an API path. Open `http://127.0.0.1:8000/`.

## Security
Never commit `backend/.env`. If a key was ever pasted into a chat or shared, delete it at https://aistudio.google.com/apikey and create a new one.
