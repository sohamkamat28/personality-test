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
    const timeoutMs = Number(process.env.MONGODB_TIMEOUT_MS || 5000);
    if (!mongoUri.startsWith("mongodb+srv://") && !mongoUri.startsWith("mongodb://")) {
      throw new Error("MONGODB_URI must start with mongodb+srv:// or mongodb://.");
    }

    const client = new MongoClient(mongoUri, {
      connectTimeoutMS: timeoutMs,
      serverSelectionTimeoutMS: timeoutMs,
      socketTimeoutMS: 10000,
      maxPoolSize: 5
    });
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

export function databaseErrorMessage(error) {
  const message = String(error?.message || "");
  const name = String(error?.name || "");

  if (!mongoUri) {
    return "MONGODB_URI is not set in your hosting environment variables.";
  }

  if (message.includes("mongodb+srv://") || message.includes("mongodb://")) {
    return message;
  }

  if (message.includes("bad auth") || message.includes("Authentication failed") || message.includes("auth failed")) {
    return "MongoDB authentication failed. Check the database username and password inside MONGODB_URI.";
  }

  if (message.includes("querySrv") || message.includes("ENOTFOUND") || message.includes("Invalid scheme")) {
    return "MongoDB cluster URL is invalid. Copy the full Drivers connection string from MongoDB Atlas again.";
  }

  if (name === "MongoServerSelectionError" || message.includes("Server selection timed out")) {
    return "MongoDB connection timed out. In Atlas, add 0.0.0.0/0 under Network Access, then redeploy.";
  }

  return "Database connection failed. Check MONGODB_URI, database user permissions, and MongoDB Atlas Network Access.";
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
