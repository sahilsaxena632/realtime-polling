const express = require("express");
const router = express.Router();
const { prisma } = require("../db");

// Tiny "auth": read user id from header `x-user-id`
function requireUser(req, res, next) {
    const userId = Number(req.header("x-user-id"));
    if (!userId) return res.status(401).json({ error: "x-user-id header required" });
    req.userId = userId;
    next();
}

// Create poll with options
router.post("/", requireUser, async (req, res) => {
    try {
        const { question, isPublished = false, options } = req.body || {};
        if (!question || !Array.isArray(options) || options.length < 2) {
            return res.status(400).json({ error: "question and >=2 options required" });
        }
        const created = await prisma.poll.create({
            data: {
                question,
                isPublished,
                creatorId: req.userId,
                options: { create: options.map((text) => ({ text })) }
            },
            include: { options: true }
        });
        res.json(created);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "internal error" });
    }
});

// Get all polls (with options & counts)
router.get("/", async (_req, res) => {
    const polls = await prisma.poll.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            options: {
                include: { _count: { select: { votes: true } } }
            }
        }
    });
    res.json(polls);
});

// Get a single poll (with options & counts)
router.get("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const poll = await prisma.poll.findUnique({
        where: { id },
        include: {
            options: {
                include: { _count: { select: { votes: true } } }
            },
            creator: { select: { id: true, name: true } }
        }
    });
    if (!poll) return res.status(404).json({ error: "not found" });
    res.json(poll);
});

// Publish/unpublish (optional convenience)
router.patch("/:id/publish", requireUser, async (req, res) => {
    const id = Number(req.params.id);
    const { isPublished } = req.body || {};
    const updated = await prisma.poll.update({
        where: { id },
        data: { isPublished: Boolean(isPublished) },
        include: { options: true }
    });
    res.json(updated);
});

module.exports = router;
