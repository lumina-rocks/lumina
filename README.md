# LUMINA.rocks 📸

![LUMINA Version](https://img.shields.io/badge/version-0.1.23-blue)

A modern, decentralized social media platform for images and pictures built on the Nostr protocol.

## ✨ Features

- **Image-centric social experience** - Share and discover beautiful images
- **Decentralized architecture** - Powered by Nostr protocol
- **User profiles** - Customize your presence on the platform
- **Feeds** - Global, personalized, and tag-based image discovery
- **React and engage** - Like, comment, and interact with content
- **Lightning Network integration** - For tipping and monetization
- **Responsive design** - Optimized for mobile and desktop experiences

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- [Docker](https://www.docker.com/) (optional, for containerized deployment)

### Local Development

```bash
# Clone the repository
git clone https://github.com/lumina-rocks/lumina.git
cd lumina

# Install dependencies
npm install
# or
bun install

# Start the development server
npm run dev
# or
bun dev
```

Your application will be available at http://localhost:3000.

## 🐳 Docker Deployment

### Quickstart

```bash
docker run --rm -it -p 3000:3000 ghcr.io/lumina-rocks/lumina:main
```

### Using Docker Compose

```bash
docker compose up -d
```

### Build from Source

```bash
# Build the Docker image
docker build -t lumina .

# Run the container
docker run -p 3000:3000 lumina
```

## ⚙️ Configuration

### Umami Analytics

Umami analytics is disabled by default. To enable:

1. Edit the `.env` file in the `lumina` directory:
   ```
   NEXT_PUBLIC_UMAMI_SCRIPT_URL=your-umami-script-url
   NEXT_PUBLIC_UMAMI_WEBSITE_ID=your-website-id
   ```

2. Rebuild and restart the container:
   ```bash
   docker compose up -d --build
   ```

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, Lucide icons, shadcn/ui
- **Protocols**: Nostr, Lightning Network

## ⚡ Support LUMINA

LUMINA is an independent, community-focused project kickstarted and currently mostly developed by a single passionate developer. Your support helps keep this decentralized platform alive and growing!

### How to support:
- **Geyser Fund**: Donate at [geyser.fund/project/lumina](https://geyser.fund/project/lumina)
- **Lightning Address**: Send sats directly to `lumina@geyser.fund`
- **Code Contributions**: PRs are welcome!

Every contribution helps build a better, more open social media landscape.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check [issues page](https://github.com/lumina-rocks/lumina/issues).

## 🔗 Links

- [Website](https://lumina.rocks)
- [GitHub Repository](https://github.com/lumina-rocks/lumina)
- [Support Us](https://geyser.fund/project/lumina)