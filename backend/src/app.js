import express from "express";
import cors from "cors";

import adminAuthRoutes from "./routes/adminAuth.routes.js";
import teamAuthRoutes from "./routes/teamAuth.routes.js";
import teamRoutes from "./routes/team.routes.js";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth/admin", adminAuthRoutes);
app.use("/auth/team", teamAuthRoutes);
app.use("/api/teams", teamRoutes);

export default app;
