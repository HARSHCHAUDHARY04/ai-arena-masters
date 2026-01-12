import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getDB } from "../config/db.js";

export const teamLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const db = getDB();

    // 🔍 Find team by username
    const team = await db.collection("teams").findOne({
      "login.username": username
    });

    if (!team) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 🔐 Compare password
    const isValid = await bcrypt.compare(password, team.login.passwordHash);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 🎟️ Create JWT
    const token = jwt.sign(
      {
        sub: team._id.toString(),
        role: "participant",
        username: team.login.username
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Success response (frontend expects this shape)
    res.json({
      token,
      user: {
        id: team._id.toString(),
        username: team.login.username,
        role: "participant"
      }
    });
  } catch (err) {
    console.error("Team login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
