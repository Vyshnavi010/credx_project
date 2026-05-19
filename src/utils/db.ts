import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

import { ToolAuditResult } from "./auditEngine";

// Types matching database schema
export interface AuditRecord {
  id: string;
  created_at: string;
  team_size: number;
  primary_use_case: string;
  tools_data: Record<string, { selectedPlan: string; seats: number; monthlySpend: number }>;
  total_current_spend: number;
  total_optimized_spend: number;
  total_savings: number;
  audit_results: ToolAuditResult[];
  ai_summary?: string;
  email?: string;
  company_name?: string;
  role?: string;
}

// Check environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);
const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;

// Fallback JSON DB path
const getFallbackDbPath = () => {
  // If in Vercel or similar serverless, use /tmp. Otherwise use project root.
  const baseDir = process.env.VERCEL ? "/tmp" : process.cwd();
  return path.join(baseDir, "db_fallback.json");
};

// Initialize JSON database file if it doesn't exist
function initFallbackDb() {
  const dbPath = getFallbackDbPath();
  if (!fs.existsSync(dbPath)) {
    try {
      fs.writeFileSync(dbPath, JSON.stringify({}, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to initialize fallback database:", e);
    }
  }
}

// Read JSON database
function readFallbackDb(): Record<string, AuditRecord> {
  const dbPath = getFallbackDbPath();
  initFallbackDb();
  try {
    if (fs.existsSync(dbPath)) {
      const content = fs.readFileSync(dbPath, "utf-8");
      return JSON.parse(content || "{}");
    }
  } catch (e) {
    console.error("Failed to read fallback database:", e);
  }
  return {};
}

// Write to JSON database
function writeFallbackDb(data: Record<string, AuditRecord>) {
  const dbPath = getFallbackDbPath();
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write to fallback database:", e);
  }
}

export async function saveAudit(record: Omit<AuditRecord, "id" | "created_at">): Promise<AuditRecord> {
  const id = crypto.randomUUID();
  const created_at = new Date().toISOString();
  const fullRecord: AuditRecord = { id, created_at, ...record };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("audits")
        .insert([fullRecord])
        .select()
        .single();
      
      if (error) throw error;
      return data as AuditRecord;
    } catch (err) {
      console.warn("Supabase save failed, falling back to local storage:", err);
      // Fallback
    }
  }

  // Fallback storage
  const db = readFallbackDb();
  db[id] = fullRecord;
  writeFallbackDb(db);
  return fullRecord;
}

export async function getAudit(id: string): Promise<AuditRecord | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("audits")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) {
        if (error.code === "PGRST116") return null; // Row not found
        throw error;
      }
      return data as AuditRecord;
    } catch (err) {
      console.warn("Supabase fetch failed, trying local storage:", err);
      // Fallback
    }
  }

  // Fallback retrieval
  const db = readFallbackDb();
  return db[id] || null;
}
