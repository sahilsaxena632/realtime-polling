const express = require("express");
const router = express.Router();
const { prisma } = require("../db");
const { hashPassword } = require("../utils/hash");

// Create user
router.post("/", async (req, res) => {
    try {
        const { name, email, password } = req.body || {};
        if (!name || !email || !password) {
            return res.status(400).json({ error: "name, email, password required" });
        }
        const passwordHash = await hashPassword(password);
        const user = await prisma.user.create({
            data: { name, email, passwordHash },
            select: { id: true, name: true, email: true, createdAt: true }
        });
        res.json(user);
    } catch (err) {
        if (err.code === "P2002") return res.status(409).json({ error: "email already exists" });
        console.error(err);
        res.status(500).json({ error: "internal error" });
    }
});

// Get user by id
router.get("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, name: true, email: true, createdAt: true }
    });
    if (!user) return res.status(404).json({ error: "not found" });
    res.json(user);
});

module.exports = router;
