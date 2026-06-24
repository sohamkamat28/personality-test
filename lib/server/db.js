import { promises as fs } from "fs";
import path from "path";
import { MongoClient } from "mongodb";

const dbPath = process.env.DB_FILE_PATH || path.join(process.cwd(), "data", "assessment-db.json");
const mongoUri = process.env.MONGODB_URI;
const mongoDbName = process.env.MONGODB_DB || "personality_test";
const mongoCollectionName = process.env.MONGODB_COLLECTION || "assessment_state";
const mongoDocumentId = "main";
let writeQueue = Promise.resolve();
let mongoClientPromise;

function emptyDb() {
  return { students: [], submissions: [], progress: [], activeSessions: [] };
}

function normalizeDb(parsed = {}) {
  return {
    students: Array.isArray(parsed.students) ? parsed.students : [],
    submissions: Array.isArray(parsed.submissions) ? parsed.submissions : [],
    progress: Array.isArray(parsed.progress) ? parsed.progress : [],
    activeSessions: Array.isArray(parsed.activeSessions) ? parsed.activeSessions : []
  };
}

async function mongoCollection() {
  if (!mongoClientPromise) {
    const client = new MongoClient(mongoUri);
    mongoClientPromise = client.connect();
  }

  const client = await mongoClientPromise;
  return client.db(mongoDbName).collection(mongoCollectionName);
}

async function readMongoDb() {
  const collection = await mongoCollection();
  const document = await collection.findOne({ _id: mongoDocumentId });
  return normalizeDb(document);
}

async function writeMongoDb(db) {
  const collection = await mongoCollection();
  await collection.updateOne(
    { _id: mongoDocumentId },
    {
      $set: {
        ...normalizeDb(db),
        updatedAt: new Date().toISOString()
      },
      $setOnInsert: {
        createdAt: new Date().toISOString()
      }
    },
    { upsert: true }
  );
}

async function readRawDb() {
  if (mongoUri) return readMongoDb();

  try {
    const file = await fs.readFile(dbPath, "utf8");
    const parsed = JSON.parse(file);
    return normalizeDb(parsed);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return emptyDb();
  }
}

async function writeRawDb(db) {
  if (mongoUri) {
    await writeMongoDb(db);
    return;
  }

  await fs.mkdir(path.dirname(dbPath), { recursive: true });
  const tempPath = `${dbPath}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tempPath, `${JSON.stringify(normalizeDb(db), null, 2)}\n`, "utf8");
  await fs.rename(tempPath, dbPath);
}

export async function getDb() {
  return readRawDb();
}

export async function updateDb(mutator) {
  const operation = writeQueue.then(async () => {
    const db = await readRawDb();
    const result = await mutator(db);
    await writeRawDb(db);
    return result;
  });
  writeQueue = operation.catch(() => {});
  return operation;
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
