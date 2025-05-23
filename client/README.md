# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Story Expedition Frontend

## Development

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the dev server:
   ```sh
   npm run dev
   ```

## Deployment to GitHub Pages

1. Build and deploy:
   ```sh
   npm run deploy
   ```
   This will build the app and push the `dist` folder to the `gh-pages` branch for GitHub Pages hosting.

2. Make sure your repository is set to deploy from the `gh-pages` branch in your GitHub Pages settings.

## Backend Configuration

- The frontend expects a backend Socket.IO server. You must deploy the backend (see `/server/README.md`) and update the backend URL in the frontend code if needed.

## Tech Stack

- React (Vite)
- Chakra UI
- React Router
- Socket.IO-client
- Comic fonts (Luckiest Guy, Bangers)

## Contributing

Contributions are welcome! Please open an issue or pull request. For major changes, open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request

---

## Privacy Policy

This frontend does not collect or store any personal data. All sessions are in-memory and not persisted. For questions, contact [hello@point-less.work](mailto:hello@point-less.work).

## Terms of Use

- This project is licensed under the MIT License. See the [LICENSE](../LICENSE) file for details.
