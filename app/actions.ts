"use server";

import { getMemWal } from "@/lib/memwal";

export type AnalyzeOutcome =
  | { ok: true; verb: "analyze"; facts: string[]; saved: number; failed: number }
  | { ok: false; error: string };

export type RememberOutcome =
  | { ok: true; verb: "remember"; text: string; blobId: string }
  | { ok: false; error: string };

export type SearchHit = { blobId: string; text: string; distance: number };

export type SearchResult =
  | { ok: true; results: SearchHit[] }
  | { ok: false; error: string };

/**
 * analyze() — feeds the entry to an LLM that extracts atomic facts and stores
 * each one as its own memory. Phrasing is canonicalized (e.g. "i like X" →
 * "user likes X"), which makes recall robust to paraphrasing.
 */
export async function analyzeEntry(text: string): Promise<AnalyzeOutcome> {
  if (!text.trim()) return { ok: false, error: "empty entry" };
  try {
    const memwal = getMemWal();
    const result = await memwal.analyzeAndWait(text);
    return {
      ok: true,
      verb: "analyze",
      facts: result.facts.map((f) => f.text),
      saved: result.succeeded,
      failed: result.failed,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "unknown error",
    };
  }
}

/**
 * remember() — stores the entry exactly as typed, no fact extraction, no
 * canonicalization. Useful when the wording matters or you've already
 * pre-processed the text yourself.
 */
export async function rememberEntry(text: string): Promise<RememberOutcome> {
  if (!text.trim()) return { ok: false, error: "empty entry" };
  try {
    const memwal = getMemWal();
    const result = await memwal.rememberAndWait(text);
    return {
      ok: true,
      verb: "remember",
      text,
      blobId: result.blob_id,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "unknown error",
    };
  }
}

export async function searchReadingHistory(query: string): Promise<SearchResult> {
  if (!query.trim()) return { ok: false, error: "empty query" };
  try {
    const memwal = getMemWal();
    const result = await memwal.recall(query, 10);
    return {
      ok: true,
      results: result.results.map((r) => ({
        blobId: r.blob_id,
        text: r.text,
        distance: r.distance,
      })),
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "unknown error",
    };
  }
}
