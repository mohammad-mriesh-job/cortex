# 🧠 Cortex

A complete, self-hostable **tech-interview prep platform — beginner to senior** — built as a React + TypeScript + MUI app. 7 tracks — Java, DSA, OOP, concurrency, design patterns, system design, databases — with 350+ deeply-researched topics with diagrams, runnable code examples, senior insights, and **800+ interview questions** with self-test reveal.

Designed so **you can add your own notes** by just dropping Markdown files in — no coding required.

## Getting started

```bash
npm install      # first time only
npm run dev      # start the dev server → http://localhost:5173
npm run build    # production build into dist/
npm run preview  # preview the production build
```

## Features

- **15-module curriculum** from "What is Java?" through the JVM, concurrency, modern Java, design patterns, and system design.
- **Searchable** — full-text search across every topic and interview question (press `/`).
- **Interview prep** — 150+ questions filterable by topic & difficulty, with hide/reveal answers.
- **Progress tracking** — mark topics complete; progress is saved in your browser (localStorage).
- **Learning roadmap** — a visual, ordered path through the modules.
- **Diagrams** via Mermaid, syntax-highlighted code, callouts, and light/dark themes.

## ✍️ Adding your own notes

This is the whole point — make it yours.

### Add a topic

1. Pick a track and create a Markdown file under `src/modules/<track>/content/<module-folder>/`,
   e.g. `src/modules/java/content/03-oop/10-my-notes.md`.
2. Add the frontmatter block (see **`CONTENT_GUIDE.md`** for the full spec):

   ```markdown
   ---
   title: My Notes on Inheritance
   category: Object-Oriented Programming
   categoryOrder: 3
   order: 10
   level: Intermediate
   summary: My own gotchas and reminders.
   tags: oop, notes
   ---

   ## Something I want to remember

   :::tip
   Use :::tip, :::gotcha, :::senior, :::key, :::note, :::warning callouts.
   :::
   ```

3. Save — the sidebar, search, and roadmap pick it up automatically.

To start a **new module**, just make a new folder (e.g. `16-my-module/`) and give its files a new `categoryOrder`.

### Add interview questions

Drop a file in `src/modules/<track>/questions/` that default-exports an `InterviewQuestion[]` — see `CONTENT_GUIDE.md`.

## Tracks (subjects)

The site is multi-subject. Each **track** is an isolated module sharing the same UI shell, and
you switch between them via the **topic switcher** in the header. `java` is fully populated;
`dsa`, `oop`, `design-patterns`, `system-design`, `database`, and `multithreading` are scaffolded
and show a "Coming soon" state until content is added. Adding a new track is documented in
`CONTENT_GUIDE.md`.

## Project structure

```
src/
  modules/                 ← isolated subject modules (one folder per track)
    registry.ts            ← lists all tracks
    buildTrack.ts          ← shared loader (frontmatter → curriculum)
    java/
      index.ts             ← track metadata + globs its own content/questions
      content/<NN-module>/<NN-topic>.md   ← tutorial content (edit freely!)
      questions/*.ts       ← interview question banks
    dsa/ oop/ ...          ← coming-soon tracks (same shape)
  components/              ← shared, global UI (markdown renderer, layout, switcher)
  pages/                  ← shared, track-aware pages (Home, Topic, Interview, …)
  hooks/ utils/ theme.tsx ← shared building blocks
```

Full authoring reference: [`CONTENT_GUIDE.md`](./CONTENT_GUIDE.md).

---

_Built with Vite, React 19, TypeScript, MUI, react-markdown, and Mermaid._
