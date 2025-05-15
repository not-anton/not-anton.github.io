# Point-Less

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

# Point-Less

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

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

© 2025 Iuma Estabrooks.