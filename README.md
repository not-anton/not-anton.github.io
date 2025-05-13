# Story Expedition

A real-time, in-memory story-pointing app for agile teams.

## Structure

- `/client` — React (Vite) frontend, deployable to GitHub Pages
- `/server` — Node.js + Express + Socket.IO backend (in-memory, no persistence)

## Deployment

- **Frontend:** Deploy to your `github.io` page via GitHub Pages.
- **Backend:** Deploy to a free Node.js host (e.g., Render, Fly.io, Glitch, Railway, etc.).

## Features
- Join with name and room code
- Host can paste a Jira story, start/stop pointing
- Fibonacci pointing (1/2/3/5/8)
- Points hidden until all have voted

---

See `/client/README.md` and `/server/README.md` for setup instructions.