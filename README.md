# Real-Time Chat + Video Communication Platform (MERN + Socket.io + WebRTC)

Production-ready starter for a real-time communication platform with:

- 1-1 direct chat
- Group chat rooms
- Typing indicators
- File sharing
- WebRTC video calls
- Screen sharing
- Online/offline presence
- JWT authentication
- MongoDB message persistence
- Real-time notifications
- Scalable Socket.io architecture with optional Redis adapter
- Responsive React UI

## Architecture

### Backend (`/server`)
- Node.js + Express REST APIs
- MongoDB (Mongoose models: User, Room, Message)
- JWT auth middleware
- Socket.io for real-time messaging, typing, presence, call signaling
- Optional Redis pub/sub adapter for horizontal socket scaling
- File upload support via Multer

### Frontend (`/client`)
- React + Vite
- Axios API client with auth interceptor
- Socket.io-client for events
- WebRTC peer connection hook
- Responsive layout with chat + video panel

## Monorepo Structure

```bash
.
├── server
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── socket
│   │   └── utils
│   └── .env.example
└── client
    └── src
```

## Local Development Setup

### 1) Prerequisites
- Node.js 20+
- MongoDB 6+
- Redis (optional, for scalable socket adapter)

### 2) Install dependencies
```bash
npm install
```

### 3) Configure environment
```bash
cp server/.env.example server/.env
```

Update `server/.env` values:
- `MONGODB_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `ENABLE_REDIS_ADAPTER=true` and `REDIS_URL` when scaling sockets

Frontend env (optional):
Create `client/.env`:
```bash
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_SERVER_URL=http://localhost:5000
```

### 4) Run in development
```bash
npm run dev
```
- Client: `http://localhost:5173`
- Server: `http://localhost:5000`

## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Rooms
- `GET /api/rooms`
- `POST /api/rooms/direct`
- `POST /api/rooms/group`

### Messages
- `GET /api/messages/:roomId`
- `POST /api/messages/upload`

## Socket Events

### Chat
- `message:send` -> server stores message and emits `message:new`
- `typing:start`, `typing:stop`
- `notification:new`

### Presence
- `presence:update`

### Calls (WebRTC signaling)
- `call:offer`
- `call:answer`
- `call:ice-candidate`
- `call:end`

## Production Deployment Guide

## Backend (Render/Railway/EC2/Kubernetes)
1. Set environment variables from `.env.example`.
2. Ensure persistent MongoDB (Atlas recommended).
3. Use Redis for socket scaling across multiple instances:
   - `ENABLE_REDIS_ADAPTER=true`
   - `REDIS_URL=...`
4. Run:
   ```bash
   npm run start --workspace server
   ```
5. Attach persistent volume or object storage for file uploads.

## Frontend (Vercel/Netlify/S3+CloudFront)
1. Build:
   ```bash
   npm run build --workspace client
   ```
2. Deploy static `client/dist`.
3. Set public environment variables:
   - `VITE_API_URL`
   - `VITE_SOCKET_URL`
   - `VITE_SERVER_URL`

## Reverse proxy (Nginx) for websocket upgrade
```nginx
location /socket.io/ {
  proxy_pass http://backend_upstream;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "Upgrade";
  proxy_set_header Host $host;
}
```

## Security Hardening Checklist
- Rotate strong `JWT_SECRET`
- Enforce HTTPS/TLS everywhere
- Add file-type and file-size validation in upload middleware
- Add request validation (zod/joi)
- Add CSRF strategy if using cookies
- Enable WAF + rate-limiting tuning
- Log aggregation and alerting

## Next Production Improvements
- Delivery/read receipts
- Message pagination + indexes
- E2E encryption strategy
- TURN server for restrictive NATs
- Object storage (S3/GCS) for file uploads
- CI/CD pipeline with tests and lint checks

