# Point-Less

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC--BY--NC%204.0-lightgrey.svg)](LICENSE)

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

## License

This project is open source for non-commercial use only, under the [Creative Commons Attribution-NonCommercial 4.0 International License](LICENSE).

For commercial licensing, contact [hello@point-less.work](mailto:hello@point-less.work).