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

## Tech Stack

- Frontend: React (Vite), Chakra UI, React Router, Socket.IO-client
- Backend: Node.js, Express, Socket.IO, CORS, rate-limiter-flexible
- Styling: Comic fonts (Luckiest Guy, Bangers), custom comic effects
- Deployment: Render, GitHub Pages, Cloudflare (custom domain)

---

See `/client/README.md` and `/server/README.md` for setup instructions.

## Contributing

Contributions are welcome! Please open an issue or pull request. For major changes, open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request

---

## Privacy Policy

Point-Less does not collect or store any personal data. All story-pointing sessions are in-memory and are not persisted. For questions, contact [hello@point-less.work](mailto:hello@point-less.work).

## Terms of Use

Point-Less is provided as-is for non-commercial use only. By using this app, you agree not to use it for commercial purposes without a commercial license. See LICENSE for details.

---

© 2024 Iuma Estabrooks. All non-commercial use permitted under CC BY-NC 4.0. For commercial licensing, contact hello@point-less.work.