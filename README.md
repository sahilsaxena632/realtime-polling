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

## Testing APIs
- A file is added with the name of "Real-Time Polling API.postman_collection" , just import in postman to test the APIs.
- For testing with cURL requests another word doc is added with the name of "cURL testing".

## WebSocket - Testing
- Connect to Socket.IO, then `socket.emit("joinPoll", <pollId>)`
- Listen for `poll:results` to get live counts.
- For testing , just paste this in browser console:

You can test the live update feature directly in your browser console:

(async () => {
  const s = document.createElement('script');
  s.src = "https://cdn.socket.io/4.7.5/socket.io.min.js";
  document.head.appendChild(s);
  await new Promise(r => s.onload = r);

  const socket = io("http://localhost:3000");
  socket.on("connect", () => console.log("Connected:", socket.id));

  // Join a poll room
  socket.emit("joinPoll", 1);

  // Listen for results broadcast
  socket.on("poll:results", (payload) => {
    console.log("LIVE RESULTS:", payload);
  });
})();

- Each poll has its own room (e.g., poll:1).
- After joining, when any user votes, the latest results are broadcast instantly to everyone in that room.

