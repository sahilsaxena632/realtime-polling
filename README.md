# Real-Time Polling API

## Tech
- Node.js + Express
- PostgreSQL + Prisma
- Socket.IO for live updates

## Run
1. Set `.env` (DATABASE_URL, PORT).
2. `npm i`
3. `npx prisma generate`
4. `npx prisma migrate dev --name init`
5. `npm run dev`

## Endpoints
- `POST /api/users` { name, email, password }
- `GET /api/users/:id`
- `POST /api/polls` (header `x-user-id`) { question, isPublished, options: [ "A", "B", ... ] }
- `GET /api/polls`
- `GET /api/polls/:id`
- `PATCH /api/polls/:id/publish` (header `x-user-id`) { isPublished: true|false }
- `POST /api/polls/:id/votes` (header `x-user-id`) { optionId }

## WebSocket
- Connect to Socket.IO, then `socket.emit("joinPoll", <pollId>)`
- Listen for `poll:results` to get live counts.
