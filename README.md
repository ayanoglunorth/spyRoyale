# SpyRoyale

SpyRoyale is a Turkish social-deduction game that can be played on one device or in Socket.IO-powered multiplayer rooms. Players give clues based on hidden roles while agents attempt to identify the spies.

## Features

- Local and online game flows
- Room-code multiplayer lobbies, role assignment, and voting
- Customizable category and word lists
- Versioned category-sharing codes
- Android, iOS, and web targets through Expo

## Architecture

The Expo/React Native client lives under `src/`. Real-time game state is held in memory by a separate Express and Socket.IO server under `server/`. The server does not use a persistent database, user accounts, or a payment system.

## Requirements

- Node.js 22 LTS or later
- npm 10 or later
- Expo Go or an appropriate native development environment for mobile development

## Local setup

```bash
git clone https://github.com/ayanoglunorth/spyRoyale.git
cd spyRoyale
npm ci
npm --prefix server ci
Copy-Item .env.example .env
```

Run the real-time server in one terminal and the Expo client in another:

```bash
npm run server
npm start
```

Use `npm run web` for the web target and `npm run build:web` for a production web export.

## Configuration

`.env.example` contains example values only. Values beginning with `EXPO_PUBLIC_` are embedded in the client build; never put secrets in them.

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_SERVER_URL` | Socket.IO server URL; defaults to `http://localhost:3001` |
| `EXPO_PUBLIC_SUPPORT_EMAIL` | Optional support email; leaving it empty hides the contact form |
| `SERVER_ALLOWED_ORIGINS` | Comma-separated list of allowed browser origins in production |
| `NODE_ENV` | Set to `production` in production; an origin allowlist is required |

Set server environment variables in your hosting provider or `server/.env`. Do not use the local example values in production.

## Security notes

- The server validates event payloads and game limits; wildcard CORS is not used in production.
- Room data is in memory and is removed when the server restarts.
- Category sharing codes are for portability only. They are not encrypted and must not contain sensitive data.
- Secrets, certificates, `.env` files, logs, and build outputs are excluded from version control.

See [SECURITY.md](SECURITY.md) to report a vulnerability.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run test:server
npm run audit:prod
npm --prefix server audit --omit=dev --audit-level=high
```

GitHub Actions runs linting, type checks, server tests, dependency audits, and secret scanning on every push and pull request.

## Deployment boundaries

`npm run deploy` deploys only the static web export to Firebase Hosting. The Socket.IO server must be deployed to a separate Node.js hosting environment with HTTPS, `NODE_ENV=production`, and an explicit `SERVER_ALLOWED_ORIGINS` list.

## Contributing and license

See [CONTRIBUTING.md](CONTRIBUTING.md) for the contribution workflow. This project is licensed under the [MIT License](LICENSE).
