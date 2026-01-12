import xlsx from "xlsx";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import { generateUsername } from "../src/utils/username.js";
import { generatePassword } from "../src/utils/password.js";
import { transporter } from "../src/config/mailer.js";

dotenv.config();

// 🔍 Debug env (remove later if you want)
console.log("MAIL_USER =", process.env.MAIL_USER);
console.log("MAIL_PASS =", process.env.MAIL_PASS ? "LOADED" : "MISSING");

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db(process.env.DB_NAME);
const teamsCol = db.collection("teams");

// 📄 Read Excel
const wb = xlsx.readFile("./seed/teams.xlsx");
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sheet);

// 🔍 Show actual Excel structure (VERY IMPORTANT)
console.log("ROW SAMPLE:", rows[0]);

const grouped = {};

// ⚠️ NOTE:
// Your Excel is MISALIGNED.
// From debugging, real mapping is:
// - Team Name              → "Team Name"
// - Member Name            → " write your College/University name"
// - Email                  → "GitHub/Linkedln"

rows.forEach((r) => {
  const teamName = r["Team Name"];
  if (!teamName) return;

  if (!grouped[teamName]) {
    grouped[teamName] = { teamName, members: [] };
  }

  grouped[teamName].members.push({
    name: r[" write your College/University name"]?.trim() || "Unknown",
    email: r["GitHub/Linkedln"]?.trim() || null
  });
});

// 🚀 Insert + Send Mail
for (const team of Object.values(grouped)) {
  const username = generateUsername(team.teamName);
  const password = generatePassword();
  const passwordHash = await bcrypt.hash(password, 10);

  await teamsCol.insertOne({
    teamName: team.teamName,
    login: { username, passwordHash },
    members: team.members,
    createdAt: new Date()
  });

  for (const m of team.members) {
    console.log("📧 Member email value:", m.email);

    if (!m.email) {
      console.error("❌ Email missing for member:", m.name);
      continue;
    }

    try {
      console.log("📨 Sending mail to:", m.email);

      const info = await transporter.sendMail({
        from: `"AI Battle Arena" <${process.env.MAIL_USER}>`,
        to: m.email,
        subject: "Team Login Credentials",
        text: `
Hello ${m.name},

Your team has been registered successfully.

Team Name: ${team.teamName}
Username: ${username}
Password: ${password}

Login URL: http://localhost:3000/login

Regards,
AI Battle Arena Team
        `
      });

      console.log("✅ Mail sent:", info.response);
    } catch (err) {
      console.error("❌ Mail failed:", err.message);
    }
  }

  console.log("Seeded:", team.teamName);
}

process.exit();
