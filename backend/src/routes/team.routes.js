import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";

const router = Router();

/**
 * GET /api/teams/:id
 * Fetch team by Mongo ObjectId
 */
router.get("/:id", async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid team ID" });
    }

    const team = await db.collection("teams").findOne({
      _id: new ObjectId(id),
    });

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    res.json(team);
  } catch (err) {
    console.error("Fetch team error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
