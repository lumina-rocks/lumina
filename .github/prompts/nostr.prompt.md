# Nostr
## Overview

Nostr (Notes and Other Stuff Transmitted by Relays) is an open protocol for creating decentralized, censorship-resistant social networks. It is designed to be simple, robust, and easy to implement, enabling anyone to publish and receive messages without relying on a central authority.

## Core Concepts

- **Events:** The basic unit of data in Nostr. Events are signed messages containing content (such as text notes), metadata, or other information.
- **Public Key Cryptography:** Every user has a public/private key pair. Events are signed with the user's private key, and followers use the public key to verify authenticity.
- **Relays:** Servers that receive, store, and forward events. Anyone can run a relay, and users can publish to or read from any relay.
- **Clients:** Applications that allow users to create, sign, and read events. Clients connect to one or more relays.

## How It Works

1. **User Identity:** Users are identified by their public key. There is no central user directory.
2. **Publishing:** Users sign events with their private key and send them to one or more relays.
3. **Receiving:** Clients subscribe to relays for events from specific public keys or matching certain filters.
4. **Verification:** Clients verify event signatures to ensure authenticity and integrity.
5. **Decentralization:** There is no single point of failure. Users can switch relays or use multiple relays for redundancy.

## Protocol Specification

- The protocol is defined in a series of documents called [NIPs (Nostr Implementation Possibilities)](https://github.com/nostr-protocol/nips).
- [NIP-01](https://github.com/nostr-protocol/nips/blob/master/01.md) describes the core event structure and relay protocol.
- Additional NIPs define extensions for features like direct messages, reactions, lists, and more.

## Getting Started

- Explore the [Nostr protocol repository](https://github.com/nostr-protocol/nostr) for an introduction and links to resources.
- See [NIPs](https://github.com/nostr-protocol/nips) for protocol details and extensions.
- Try out Nostr clients or run your own relay. A list of apps is available at [nostrapps.com](https://nostrapps.com/) and [nostr.net](https://nostr.net/).

## Key Benefits

- **Censorship Resistance:** No central authority can block users or delete content globally.
- **Interoperability:** Any client can connect to any relay, and all use the same protocol.
- **Simplicity:** The protocol is intentionally minimal, making it easy to implement in any language.

## Further Reading

- [Animated protocol flow](https://how-nostr-works.pages.dev/#/outbox)
- [NIP-01: Basic protocol spec](https://github.com/nostr-protocol/nips/blob/master/01.md)
- [Nostr protocol GitHub](https://github.com/nostr-protocol/nostr)
- [NIPs repository](https://github.com/nostr-protocol/nips)
