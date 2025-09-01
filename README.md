# LUMINA.rocks 📸

![LUMINA Version](https://img.shields.io/badge/version-0.1.28-blue)

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

### Image Proxy (imgproxy)

LUMINA supports image proxying via imgproxy to optimize image loading, resize images on-the-fly, and enhance privacy. To enable:

1. Edit the `.env` file in the `lumina` directory:
   ```
   NEXT_PUBLIC_ENABLE_IMGPROXY=true
   NEXT_PUBLIC_IMGPROXY_URL=https://your-imgproxy-instance.com/
   ```

2. Make sure your imgproxy instance is properly configured and accessible.

3. Restart the application to apply changes.

The imgproxy feature:
- Resizes images to appropriate dimensions for better performance
- Falls back to direct image URLs if the proxy fails
- Provides faster loading times for large images
- Can be disabled by setting `NEXT_PUBLIC_ENABLE_IMGPROXY=false`

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
- **Mobile Apps**: Capacitor for Android and iOS

## 📱 Mobile Apps with Capacitor

LUMINA can be built as native mobile applications for Android and iOS using Capacitor.

### Prerequisites

- **For Android:**
  - [Android Studio](https://developer.android.com/studio) installed
  - Android SDK installed (via Android Studio)
  - Java Development Kit (JDK) 11 or newer

- **For iOS:**
  - macOS operating system
  - [Xcode](https://apps.apple.com/us/app/xcode/id497799835) installed
  - [CocoaPods](https://cocoapods.org/) installed (`sudo gem install cocoapods`)

### Building the Mobile Apps

1. **Setup the project:**
   ```bash
   # Install dependencies
   npm install
   # or
   bun install
   ```

2. **Sync the web app with Capacitor:**
   ```bash
   npm run cap:sync
   # or 
   npx cap sync
   ```

3. **Build and run Android app:**
   ```bash
   npm run cap:build:android
   # or
   npx cap open android
   ```
   This opens Android Studio where you can build and run the app on an emulator or physical device.

4. **Build and run iOS app:**
   ```bash
   # Make sure Xcode command line tools are properly configured
   sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
   
   # Open the iOS project
   npm run cap:build:ios
   # or
   npx cap open ios
   ```
   This opens Xcode where you can build and run the app on a simulator or physical device.

### Configuration

The mobile app is configured to load the web app from https://lumina.rocks. To modify this:

1. Edit `capacitor.config.ts`:
   ```typescript
   server: {
     url: 'https://your-custom-url.com',
     cleartext: true
   }
   ```

2. Sync changes to native projects:
   ```bash
   npx cap sync
   ```

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