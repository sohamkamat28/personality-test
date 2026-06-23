import { promises as fs } from "fs";
import path from "path";

const dbPath = process.env.DB_FILE_PATH || path.join(process.cwd(), "data", "assessment-db.json");

async function readRawDb() {
  try {
    const file = await fs.readFile(dbPath, "utf8");
    const parsed = JSON.parse(file);
    return {
      students: Array.isArray(parsed.students) ? parsed.students : [],
      submissions: Array.isArray(parsed.submissions) ? parsed.submissions : [],
      progress: Array.isArray(parsed.progress) ? parsed.progress : [],
      activeSessions: Array.isArray(parsed.activeSessions) ? parsed.activeSessions : []
    };
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return { students: [], submissions: [], progress: [], activeSessions: [] };
  }
}

async function writeRawDb(db) {
  await fs.mkdir(path.dirname(dbPath), { recursive: true });
  await fs.writeFile(dbPath, `${JSON.stringify(db, null, 2)}\n`, "utf8");
}

export async function getDb() {
  return readRawDb();
}

export async function updateDb(mutator) {
  const db = await readRawDb();
  const result = await mutator(db);
  await writeRawDb(db);
  return result;
}

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function publicStudent(student, submissions = []) {
  const email = normalizeEmail(student.email);
  return {
    email,
    name: student.name || "",
    createdAt: student.createdAt,
    hasSubmitted: submissions.some((submission) => normalizeEmail(submission.email) === email)
  };
}
