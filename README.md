# LUMINA

**An Image-First Nostr Client**

LUMINA is a beautiful, Instagram-inspired Nostr client built with React 18.x, TailwindCSS 3.x, Vite, shadcn/ui, and Nostrify. Experience the decentralized web through stunning visuals - share, discover, and interact with kind-20 image-first notes on the Nostr protocol.

## 🌟 About LUMINA

LUMINA brings the visual social experience to Nostr with a focus on kind-20 events - notes where images take center stage. Built for creators and visual storytellers, LUMINA combines the familiar Instagram-like interface with the power of decentralized, censorship-resistant social networking.

**Visit**: [LUMINA.rocks](https://lumina.rocks)

## ✨ Features

- **📸 Image-First Experience**: Built specifically for kind-20 notes with beautiful image galleries
- **🎨 Instagram-Like Interface**: Familiar, intuitive design for visual content
- **⚡ Lightning Fast**: Optimized performance with Vite and React 18
- **🔐 Decentralized & Private**: Your keys, your data, on the Nostr protocol
- **💰 Lightning Zaps**: Support creators with instant Bitcoin payments
- **🎨 Beautiful UI**: 48+ shadcn/ui components with light/dark theme support
- **📱 Fully Responsive**: Perfect experience on mobile, tablet, and desktop

## 🛠 Technology Stack

- **React 18.x**: Modern UI with hooks and concurrent rendering
- **TailwindCSS 3.x**: Utility-first CSS for beautiful, responsive design
- **Vite**: Lightning-fast build tool and development server
- **shadcn/ui**: 48+ accessible UI components built with Radix UI
- **Nostrify**: Comprehensive Nostr protocol implementation
- **React Router**: Smooth client-side navigation
- **TanStack Query**: Efficient data fetching and caching
- **TypeScript**: Type-safe development

## 🎯 What are Kind-20 Notes?

Kind-20 events are image-first notes on Nostr where the visual content is the primary focus. Unlike traditional text posts with optional images, kind-20 notes are designed to showcase photography, art, and visual storytelling - perfect for creators who want to share their work on a decentralized platform.

### Why Kind-20?

- **Image-Centric**: Built specifically for visual content
- **Creator-Friendly**: Perfect for photographers, artists, and visual creators
- **Decentralized**: Your content lives on Nostr relays, not centralized servers
- **Censorship-Resistant**: No platform can take down your work
- **Monetization**: Direct support through Lightning zaps

## 🔧 Core Features

### Image Gallery & Feed
- Beautiful image-first feed for kind-20 notes
- Instagram-like grid and list views
- Infinite scroll for seamless browsing
- Optimized image loading and caching
- Full-screen image viewer

### Social Interactions
- Like/react to images (NIP-25)
- Comment on posts with threaded discussions
- Share and repost visual content
- Follow your favorite creators
- User profiles with image galleries

### Content Creation
- Upload and publish kind-20 image notes
- Edit captions and metadata
- Add hashtags for discoverability
- Multiple image support
- File upload via Blossom servers (NIP-94)

### Authentication & Users
- Nostr login with browser extensions (NIP-07)
- Multi-account support with account switching
- Edit profile with avatar and bio
- Secure key management

### Payments & Zaps
- Lightning zaps to support creators (NIP-57)
- Wallet Connect integration (NIP-47)
- WebLN support for instant payments
- View zap receipts and amounts

### Technical Features
- Efficient relay management (NIP-65)
- Real-time event subscriptions
- Event validation and filtering
- Light/dark theme support
- Fully responsive mobile design
- TypeScript for type safety

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A Nostr browser extension like [Alby](https://getalby.com/) or [nos2x](https://github.com/fiatjaf/nos2x)

### Installation

```bash
# Clone the repository
git clone https://github.com/lumina-rocks/lumina.git
cd lumina

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/           # UI components
│   ├── ui/              # shadcn/ui components (48+ available)
│   ├── auth/            # Login, signup, account switching
│   ├── comments/        # Comment system for posts
│   └── dm/              # Direct messaging components
├── hooks/               # Custom React hooks
│   ├── useNostr         # Core Nostr protocol integration
│   ├── useAuthor        # Fetch user profiles
│   ├── useCurrentUser   # Authentication state
│   ├── useNostrPublish  # Publish kind-20 and other events
│   ├── useUploadFile    # Upload images via Blossom
│   └── useZaps          # Lightning payments
├── pages/               # Page components (feed, profile, etc.)
├── lib/                 # Utility functions
├── contexts/            # React context providers
└── docs/                # Documentation for features and NIPs
```

## 🎨 Design Philosophy

LUMINA combines the familiar Instagram experience with Nostr's decentralized principles:

- **Visual First**: Images are the hero, with clean layouts that showcase content
- **Intuitive Navigation**: Familiar patterns for browsing, posting, and interacting
- **Beautiful Themes**: Carefully crafted light and dark modes
- **Responsive Design**: Perfect experience on any device
- **Accessible**: Built with Radix UI primitives for WCAG 2.1 AA compliance

### UI Components

Powered by 48+ shadcn/ui components for a polished, professional interface:

**Layout**: Card, Separator, Sheet, Sidebar, ScrollArea, Resizable  
**Navigation**: Breadcrumb, NavigationMenu, Menubar, Tabs, Pagination  
**Forms**: Button, Input, Textarea, Select, Checkbox, RadioGroup, Switch, Slider  
**Feedback**: Alert, AlertDialog, Toast, Progress, Skeleton  
**Overlay**: Dialog, Popover, HoverCard, Tooltip, ContextMenu, DropdownMenu  
**Data Display**: Table, Avatar, Badge, Calendar, Chart, Carousel

## 🔐 Privacy & Security

- **Your Keys, Your Data**: Keys never leave your device
- **NIP-07 Security**: Browser extension signing keeps keys safe
- **End-to-End Encryption**: Private messages use NIP-44 encryption
- **No Tracking**: No analytics, no cookies, no surveillance
- **Decentralized Storage**: Content lives on Nostr relays, not our servers

## 🌐 Nostr Protocol

LUMINA is built on the Nostr protocol - a simple, open protocol for decentralized social networking:

- **Censorship-Resistant**: No single point of control
- **Portable Identity**: Your identity works across all Nostr apps
- **Lightning-Native**: Built-in Bitcoin payments via Lightning Network
- **Open Source**: Transparent, auditable code
- **Interoperable**: Content visible in other Nostr clients

Learn more: [nostr.com](https://nostr.com)

## 🧪 Development

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

Built with Vitest, React Testing Library, and comprehensive test coverage.

### Code Quality

```bash
# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

## 🤝 Contributing

LUMINA is open source and welcomes contributions! Whether you're fixing bugs, adding features, or improving documentation, we'd love your help.

### Ways to Contribute

- **Report Bugs**: Open an issue with details and steps to reproduce
- **Suggest Features**: Share your ideas for making LUMINA better
- **Submit Pull Requests**: Fix bugs, add features, or improve code
- **Improve Documentation**: Help others understand and use LUMINA
- **Share Feedback**: Tell us what you love and what could be better

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Follow existing code patterns
- Keep commits focused and descriptive

## 📚 Resources

- **Nostr Protocol**: [nostr.com](https://nostr.com)
- **NIP Repository**: [github.com/nostr-protocol/nips](https://github.com/nostr-protocol/nips)
- **shadcn/ui**: [ui.shadcn.com](https://ui.shadcn.com)
- **Nostrify**: [nostrify.dev](https://nostrify.dev)

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

Built with [MKStack](https://soapbox.pub/mkstack) - the complete framework for building Nostr clients with AI.

Special thanks to the Nostr community for building an open, decentralized future for social networking.

---

**Experience visual storytelling on the decentralized web.**

Visit [LUMINA.rocks](https://lumina.rocks) | Follow updates on Nostr