# Story Expedition Backend

## Development

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the server:
   ```sh
   node index.js
   ```
   The server will run in-memory and all data will be lost on restart.

## Deployment

- Deploy to a free Node.js host (e.g., Render, Fly.io, Railway, Glitch, etc.).
- Make sure to allow CORS for your GitHub Pages frontend domain.

## Configuration

- The frontend will need the backend URL to connect via Socket.IO. 

## Tech Stack

- Node.js
- Express
- Socket.IO
- CORS
- rate-limiter-flexible

## Contributing

Contributions are welcome! Please open an issue or pull request. For major changes, open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request

---

## Privacy Policy

This backend does not collect or store any personal data. All sessions are in-memory and not persisted. For questions, contact [hello@point-less.work](mailto:hello@point-less.work).

## Terms of Use

- This project is licensed under the MIT License. See the [LICENSE](../LICENSE) file for details. 