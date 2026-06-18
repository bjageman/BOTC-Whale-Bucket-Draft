# 🐋 Whale Bucket — Blood on the Clocktower Draft Tool

A web app for **Blood on the Clocktower** (BotC) storytellers to manage **"whale bucket"** style games — where players submit role preferences and the grimoire is randomly assembled based on those preferences.

## What It Does

Whale Bucket replaces the traditional storyteller-curated grimoire with a semi-randomized draft system:

1. **Setup Phase** — Add players and let each one pick a preferred role for every team (Townsfolk, Outsider, Minion, Demon).
2. **Draft Phase** — The app randomly assigns roles, weighting toward player preferences when possible. It respects the official BotC team distribution for the player count (5–15 players) and handles special-case characters:
   - **Legion** — ~60% of players become Legion, the rest get Townsfolk roles.
   - **Riot** — Demon + Minion count players become Riot, the rest Townsfolk.
   - **Atheist** — All-Townsfolk/Outsider grimoire with no evil team.
   - **Baron / Fang Gu / Balloonist / Godfather** — Outsider count adjustments are applied automatically.
   - **Choirboy ↔ King / Huntsman ↔ Damsel** — Linked-role jinxes are enforced.
3. **Game Phase** — Track the game in progress: mark players as dead or drunk, view assigned roles, and manage the grimoire.

All state is persisted to `localStorage`, so refreshing the page won't lose your game.

## Included Roles

The app ships with the full catalogue of official BotC roles across all editions:

| Team | Count |
|------|-------|
| Townsfolk | 60+ |
| Outsider | 20+ |
| Minion | 25+ |
| Demon | 15+ |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- npm

### Development

```bash
npm install
npm run dev
```

The dev server starts at **http://localhost:5173** with hot module replacement.

### Production Build

```bash
npm run build
npm run preview
```

## Docker

### Docker Compose (recommended)

```bash
docker compose up --build
```

The app will be available at **http://localhost:8080**.

```bash
# Run detached
docker compose up --build -d

# Stop
docker compose down
```

### Docker (manual)

```bash
docker build -t whalebucket .
docker run -p 8080:80 whalebucket
```

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** — build tooling and dev server
- **Tailwind CSS** — styling
- **Lucide React** — icons
- **Nginx** — production static file serving (in Docker)

## License

This project is not affiliated with or endorsed by The Pandemonium Institute.
Blood on the Clocktower is a trademark of Steven Medway and The Pandemonium Institute.
