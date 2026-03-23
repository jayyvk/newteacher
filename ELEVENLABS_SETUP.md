# ElevenLabs + Firecrawl Setup

This app is already wired for an ElevenLabs voice agent plus a Firecrawl-backed webhook.

What you still need to do is:

1. create one ElevenLabs agent
2. add one webhook tool named `search_web`
3. point that tool to this app's `/api/search` endpoint
4. set the agent ID and API keys in `.env.local`

## Environment Variables

Create `.env.local` from [.env.example](/Users/jaykilaparthi/Desktop/newteacher/.env.example) and fill in:

```bash
NEXT_PUBLIC_ELEVENLABS_AGENT_ID_NEW_TEACHER=agent_xxx
FIRECRAWL_API_KEY=fc_xxx
ELEVENLABS_API_KEY=sk_xxx
NEXT_PUBLIC_APP_URL=https://your-deployed-url.com
```

Notes:

- `NEXT_PUBLIC_ELEVENLABS_AGENT_ID_NEW_TEACHER` is the voice agent this app connects to.
- `FIRECRAWL_API_KEY` is used by the webhook route.
- `ELEVENLABS_API_KEY` is reserved for any future server-side ElevenLabs routes.
- `NEXT_PUBLIC_APP_URL` should be your public app URL once deployed.

## ElevenLabs Agent

Create one conversational agent in ElevenLabs.

Suggested agent name:

- `New Teacher`

Suggested system prompt:

```text
You are New Teacher, a calm, adaptive voice teacher for students.

Your job is to teach clearly, patiently, and conversationally.

Rules:
- Explain things in simple language first.
- Teach step by step.
- Ask occasional check-for-understanding questions.
- Stay focused on the student's class topic.
- Prefer grounded lesson explanations over broad speculation.
- Use the search_web tool only when current events, recent discoveries, or up-to-date context would improve the lesson.
- When using live context, summarize it safely and clearly for a student audience.
- Do not mention internal tools unless necessary.
```

## ElevenLabs Tool

Add a webhook tool to that agent with:

- Tool name: `search_web`
- Method: `POST`
- URL: `https://your-deployed-url.com/api/search`

Suggested tool description:

```text
Search the live web for recent facts, current events, or up-to-date context that helps explain a lesson.
Use this only when the student's question needs current information or a modern real-world connection.
```

Suggested request body:

```json
{
  "query": "{{query}}",
  "conversation_id": "{{conversation_id}}"
}
```

Expected response:

- the webhook returns a JSON object with a `result` string
- that string contains structured Firecrawl results for the agent to use

## Firecrawl Webhook

The app already exposes:

- `/api/search`
- `/api/live-context`
- `/api/materials/session`

These routes are split by purpose:

- `/api/search`: calls Firecrawl for live/current information
- `/api/live-context`: alias of the Firecrawl route
- `/api/materials/session`: extracts text from uploaded PDFs and builds a lesson brief used at class start

## Local Testing

If you want to test locally, ElevenLabs still needs a public URL for the webhook.

Use one of:

- Vercel preview deployment
- `ngrok http 3000`
- Cloudflare Tunnel

Then set the webhook URL to:

- `https://your-public-url/api/search`

You can verify the app config quickly with:

- `GET /api/health`

## What Is Already Plugged In

Frontend:

- the live classroom uses `useConversation` from `@elevenlabs/react`
- the client connects using `NEXT_PUBLIC_ELEVENLABS_AGENT_ID_NEW_TEACHER`
- the session sends contextual updates when the class starts
- uploaded PDFs are processed into a one-time lesson brief before the class begins

Backend:

- Firecrawl webhook route is implemented in [route.ts](/Users/jaykilaparthi/Desktop/newteacher/src/app/api/live-context/route.ts)
- ElevenLabs-friendly alias route is implemented in [route.ts](/Users/jaykilaparthi/Desktop/newteacher/src/app/api/search/route.ts)
- uploaded PDFs are parsed and condensed into a lesson brief in [route.ts](/Users/jaykilaparthi/Desktop/newteacher/src/app/api/materials/session/route.ts)
- source tracking for the summary page is implemented in [session-store.ts](/Users/jaykilaparthi/Desktop/newteacher/src/lib/session-store.ts)

## PDF Context Flow

This setup now works like this:

1. the student uploads PDFs for the current session
2. the app extracts text locally
3. the app creates a compact lesson brief from those PDFs
4. that lesson brief is injected into the agent context at class start
5. `search_web` is used to enrich the lesson with current information, real-world examples, and fun facts
