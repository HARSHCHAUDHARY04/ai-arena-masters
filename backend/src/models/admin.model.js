import { getDB } from "../config/db.js";
export const Admin = () => getDB().collection("admins");
