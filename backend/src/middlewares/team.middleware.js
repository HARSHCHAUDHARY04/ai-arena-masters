import jwt from "jsonwebtoken";
import { getDB } from "../config/db.js";

/**
 * Team / Participant authorization middleware
 *
 * Ensures:
 * 1. User is authenticated (valid JWT)
 * 2. User has role = participant
 * 3. User belongs to a team
 *
 * Attaches:
 *   req.user = {
 *     id,
 *     team_id,
 *     team_role
 *   }
 */
export const requireTeam = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization token missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // payload.sub must contain user id
    if (!payload.sub) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    const db = getDB();

    // Check participant role
    const role = await db.collection("user_roles").findOne({
      user_id: payload.sub,
      role: "participant"
    });

    if (!role) {
      return res.status(403).json({ error: "Participant access only" });
    }

    // Check team membership
    const teamMember = await db.collection("team_members").findOne({
      user_id: payload.sub
    });

    if (!teamMember) {
      return res.status(403).json({ error: "User not assigned to any team" });
    }

    // Attach user context
    req.user = {
      id: payload.sub,
      team_id: teamMember.team_id,
      team_role: teamMember.role
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

/**
 * Captain-only middleware
 * Must be used AFTER requireTeam
 */
export const requireCaptain = (req, res, next) => {
  if (req.user.team_role !== "captain") {
    return res.status(403).json({ error: "Captain access only" });
  }
  next();
};
