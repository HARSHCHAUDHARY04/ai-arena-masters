import jwt from "jsonwebtoken";

export const requireAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const payload = jwt.verify(token, process.env.JWT_SECRET);
  if (payload.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  req.admin = payload;
  next();
};
