import { getDB } from "../config/db.js";
export const Team = () => getDB().collection("teams");
