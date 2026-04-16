const express = require("express");
const mongoose = require("mongoose");

const asyncHandler = require("../utils/asyncHandler");
const requireAuth = require("../middleware/authMiddleware");
const Idea = require("../models/Idea");

const router = express.Router();

function normalizeTags(tags) {
  const list = Array.isArray(tags)
    ? tags
    : typeof tags === "string"
      ? tags.split(",")
      : [];

  return list
    .map((t) => String(t).trim())
    .filter(Boolean)
    .map((t) => t.toLowerCase());
}

function normalizeStatus(status) {
  if (status === "published") return "published";
  return "draft";
}

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { status, search, tags, limit, page } = req.query || {};

    const filter = { userId: req.user.id };

    if (status === "draft" || status === "published") {
      filter.status = status;
    }

    const tagList = tags ? normalizeTags(tags) : [];
    if (tagList.length > 0) {
      filter.tags = { $all: tagList };
    }

    if (search) {
      const q = String(search).trim();
      if (q) {
        filter.$or = [
          { title: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
        ];
      }
    }

    const safeLimit = limit ? Math.min(Number(limit), 50) : 50;
    const safePage = page ? Math.max(Number(page), 1) : 1;
    const skip = safePage > 1 ? (safePage - 1) * safeLimit : 0;

    const ideas = await Idea.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit);

    return res.json(ideas);
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { title, description, tags, status } = req.body || {};

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const idea = await Idea.create({
      userId: req.user.id,
      title: String(title).trim(),
      description: String(description).trim(),
      tags: normalizeTags(tags),
      status: status === "published" ? "published" : "draft",
    });

    return res.status(201).json(idea);
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid idea id" });
    }

    const idea = await Idea.findOne({ _id: id, userId: req.user.id });
    if (!idea) {
      return res.status(404).json({ message: "Idea not found" });
    }

    const { title, description, tags, status } = req.body || {};

    if (title !== undefined) idea.title = String(title).trim();
    if (description !== undefined) idea.description = String(description).trim();
    if (tags !== undefined) idea.tags = normalizeTags(tags);
    if (status !== undefined) idea.status = normalizeStatus(status);

    await idea.save();
    return res.json(idea);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid idea id" });
    }

    const deleted = await Idea.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!deleted) {
      return res.status(404).json({ message: "Idea not found" });
    }

    return res.json({ message: "Idea deleted" });
  })
);

module.exports = router;

