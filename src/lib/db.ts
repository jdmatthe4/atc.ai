import fs from "node:fs";
import path from "node:path";
import type { Db } from "./types";
import { seedAssets, seedOutcomes } from "./seed";

// JSON-file store. This layer is deliberately thin: in production these reads/writes
// become API calls into POCDOC (plans/verdicts), TestRunner (runs), and AMS (assets).

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

const g = globalThis as unknown as { __atcDb?: Db };

function load(): Db {
  if (fs.existsSync(DB_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DB_FILE, "utf8")) as Db;
    } catch {
      // fall through to reseed on corrupt file
    }
  }
  const db: Db = {
    engagements: [],
    assets: seedAssets(),
    outcomes: seedOutcomes(),
    intelligenceUnlocked: false,
  };
  persist(db);
  return db;
}

export function getDb(): Db {
  if (!g.__atcDb) g.__atcDb = load();
  return g.__atcDb;
}

export function persist(db?: Db) {
  const d = db ?? getDb();
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(d));
}
