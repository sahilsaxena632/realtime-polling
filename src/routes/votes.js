const express = require("express");
const router = express.Router();
const { prisma } = require("../db");

// export a function so we can access io for broadcasting
module.exports = (io, broadcastPollResults) => {
    // require user via x-user-id header
    function requireUser(req, res, next) {
        const userId = Number(req.header("x-user-id"));
        if (!userId) return res.status(401).json({ error: "x-user-id header required" });
        req.userId = userId;
        next();
    }

    // Cast a vote for a poll option
    router.post("/polls/:pollId/votes", requireUser, async (req, res) => {
        try {
            const pollId = Number(req.params.pollId);
            const { optionId } = req.body || {};

            if (!optionId) return res.status(400).json({ error: "optionId required" });

            // Ensure option belongs to this poll
            const option = await prisma.pollOption.findUnique({ where: { id: Number(optionId) } });
            if (!option || option.pollId !== pollId) {
                return res.status(400).json({ error: "option does not belong to this poll" });
            }

            // Ensure poll is published
            const poll = await prisma.poll.findUnique({ where: { id: pollId } });
            if (!poll || !poll.isPublished) {
                return res.status(400).json({ error: "poll not published or not found" });
            }

            // Create vote (schema enforces one vote per user per poll)
            await prisma.vote.create({
                data: {
                    userId: req.userId,
                    optionId: Number(optionId),
                    pollId
                }
            });

            // Prepare updated results for broadcast
            const options = await prisma.pollOption.findMany({
                where: { pollId },
                select: {
                    id: true,
                    text: true,
                    _count: { select: { votes: true } }
                }
            });

            const results = options.map(o => ({
                optionId: o.id,
                text: o.text,
                votes: o._count.votes
            }));

            // Broadcast to "poll:<id>" room
            broadcastPollResults(io, pollId, results);

            res.json({ ok: true, pollId, results });
        } catch (err) {
            // Unique constraint means user already voted in this poll
            if (err.code === "P2002") {
                return res.status(409).json({ error: "user already voted in this poll" });
            }
            console.error(err);
            res.status(500).json({ error: "internal error" });
        }
    });

    return router;
};
