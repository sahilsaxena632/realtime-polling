require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { prisma } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// HTTP + Socket.IO server
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { cors: { origin: "*" } });

const attachSocket = require("./socket");
const { broadcastPollResults } = require("./socket");
attachSocket(io);

// Routes
app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/users", require("./routes/users"));
app.use("/api/polls", require("./routes/polls"));
app.use("/api", require("./routes/votes")(io, broadcastPollResults));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
