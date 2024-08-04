# lumina.rocks

A social media for images and pictures 📸

## Docker
### Quickstart
```
docker run --rm -it -p 3000:3000 ghcr.io/lumina-rocks/lumina:main
```
or with Docker Compose
```
docker compose up -d
```

## Umami
Umami is disabled by default.

To enable Umami edit the `.env` file in the `lumina` directory.

Then build the Docker Image again and restart the container.
```
docker compose up -d --build
```