# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Setup:** `npm run setup` (installs deps, generates Prisma client, runs migrations)
- **Dev server:** `npm run dev` (Next.js with Turbopack on port 3000)
- **Dev daemon:** `npm run dev:daemon` (background dev server, logs to logs.txt)
- **Build:** `npm run build`
- **Lint:** `npm run lint`
- **Tests:** `npm run test` (vitest, runs in watch mode)
- **Single test:** `npx vitest run path/to/test` (e.g., `npx vitest run src/components/chat/__tests__/MessageList.test.tsx`)
- **DB reset:** `npm run db:reset`
- **Prisma generate:** `npx prisma generate` (after schema changes)
- **Prisma migrate:** `npx prisma migrate dev` (after schema changes)

All dev/build/start commands require `NODE_OPTIONS='--require ./node-compat.cjs'` (already configured in package.json scripts).

## Architecture

UIGen is an AI-powered React component generator. Users describe components via chat, Claude generates code using tool calls, and the result renders in a sandboxed iframe preview.

### Tech Stack

Next.js 15 (App Router) + React 19, TypeScript, Tailwind CSS v4, Prisma + SQLite, Vercel AI SDK (`ai` + `@ai-sdk/anthropic`), Shadcn/ui (new-york style), Monaco Editor, Babel standalone for JSX transformation.

### Path Alias

`@/*` maps to `./src/*` — all imports use this alias.

### Source Layout

- `src/app/` — Next.js App Router pages and API routes
- `src/actions/` — Server actions for auth (signUp, signIn, signOut, getUser) and projects (create, get, list)
- `src/components/` — UI organized by feature: `chat/`, `editor/`, `preview/`, `auth/`, `ui/` (shadcn)
- `src/lib/` — Core logic: file system, auth, AI provider, contexts, tools, prompts, transforms
- `src/hooks/` — Custom hooks (`use-auth.ts`)
- `src/middleware.ts` — JWT validation on protected API routes

### Key Data Flow

1. **Chat → AI → File System → Preview**: User sends a message via `ChatContext` (uses `useChat` from `@ai-sdk/react`). `POST /api/chat` sends messages + serialized virtual file system to Claude Haiku 4.5. Claude responds with tool calls (`str_replace_editor` for file CRUD, `file_manager` for rename/delete). Tool calls update the `VirtualFileSystem` instance via `FileSystemContext`. `PreviewFrame` transforms files with Babel and renders in a sandboxed iframe.

2. **Persistence**: On AI response completion, the API route's `onFinish` callback saves messages and serialized file system as JSON strings to the Prisma `Project` model (authenticated users only).

3. **Auth flow**: JWT-based with `jose`. Tokens stored in httpOnly cookies (7-day expiry). Middleware validates tokens on `/api/*` routes. Anonymous users can generate components; work is saved to sessionStorage via `anon-work-tracker.ts` and migrated to a project on sign-up.

### Virtual File System (`src/lib/file-system.ts`)

In-memory `VirtualFileSystem` class — Map-based, supports create/read/update/delete, rename, string replacement operations, and JSON serialize/deserialize. Used both server-side (in API route tool execution) and client-side (via `FileSystemContext`).

### Preview System (`src/components/preview/PreviewFrame.tsx` + `src/lib/transform/jsx-transformer.ts`)

Transforms JSX files using Babel standalone → creates blob URLs → builds ESM import map (maps `@/` paths to blobs, third-party packages to esm.sh). Entry point is `/App.jsx` or `/App.tsx`. CSS imports are stripped and collected into a style tag. Rendered in iframe with `sandbox="allow-scripts allow-same-origin allow-forms"`.

### AI Provider (`src/lib/provider.ts`)

Uses Claude Haiku 4.5 via `@ai-sdk/anthropic`. Falls back to `MockLanguageModel` returning demo components when `ANTHROPIC_API_KEY` is not set.

### AI Tools (`src/lib/tools/`)

- `str-replace.ts` — File creation, viewing, and string-based editing (create, view, str_replace, insert commands)
- `file-manager.ts` — File/directory rename and delete operations

### Database (Prisma + SQLite)

Two models: `User` (email, hashed password) and `Project` (name, messages as JSON string, data as serialized file system JSON, optional userId). Schema at `prisma/schema.prisma`, SQLite DB at `prisma/dev.db`.

### UI Layout

Horizontal resizable panels: left panel is chat (MessageList + MessageInput), right panel has Preview/Code tabs. Code tab shows FileTree + Monaco CodeEditor side by side.

## Testing

Tests use Vitest with jsdom environment, `@testing-library/react`, and `@vitejs/plugin-react`. Test files live alongside components in `__tests__/` directories. The vitest config uses `vite-tsconfig-paths` so `@/` aliases work in tests.

## Code Style

- Use comments sparingly, only for complex code.

## Environment

`ANTHROPIC_API_KEY` in `.env` — optional, app works without it using mock AI responses.

## Context Control Shortcuts

For bigger or complex tasks, remind the user about these shortcuts:

- **Escape** — Interrupt Claude to redirect or correct it. Also useful to fix issues with memories.
- **Double-tap Escape** — Rewind the conversation to an earlier point in time. Maintains valuable context.
- **/compact** — Summarize the conversation and continue. Helps Claude stay focused but remember what it has learned in the current session.
- **/clear** — Dumps current conversation history. Useful when switching between different tasks.
- **# (comment)** — Add a memory/instruction that gets saved to CLAUDE.md. Use this to teach Claude preferences, patterns, or corrections that persist across sessions.
