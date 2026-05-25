"use server";

import { getMemWal } from "@/lib/memwal";

/**
 * Maximum cosine distance for a recall hit to count as "relevant."
 */
const MAX_RECALL_DISTANCE = 0.7;

export type AnalyzedFactStatus = {
  text: string;
  saved: boolean;
  error?: string;
};

export type AnalyzeOutcome =
  | {
      ok: true;
      verb: "analyze";
      facts: AnalyzedFactStatus[];
      total: number;
      succeeded: number;
      failed: number;
    }
  | { ok: false; error: string };

export type RememberOutcome =
  | { ok: true; verb: "remember"; text: string; blobId: string }
  | { ok: false; error: string };

export type SearchHit = { blobId: string; text: string; distance: number };

export type SearchResult =
  | { ok: true; results: SearchHit[] }
  | { ok: false; error: string };

/**
 * analyzeEntry - Extracts facts and stores them inside the selected namespace
 */
export async function analyzeEntry(text: string, namespace: string = "general"): Promise<AnalyzeOutcome> {
  if (!text.trim()) return { ok: false, error: "empty entry" };
  try {
    const memwal = getMemWal();
    // Passing the namespace as an option to the Walrus Memory SDK
    const result = await memwal.analyzeAndWait(text, { namespace });

    const facts: AnalyzedFactStatus[] = result.facts.map((f) => {
      const status = result.results.find((r) => r.id === f.id);
      const ok = status?.status === "done";
      return {
        text: f.text,
        saved: ok,
        error: ok
          ? undefined
          : status?.error ?? status?.status ?? "no status returned",
      };
    });

    console.log(
      `[analyze] [Namespace: ${namespace}] "${text.slice(0, 60)}…" → extracted ${result.facts.length}`,
    );

    return {
      ok: true,
      verb: "analyze",
      facts,
      total: result.total,
      succeeded: result.succeeded,
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
 * rememberEntry - Stores the raw text exactly as typed inside the selected namespace
 */
export async function rememberEntry(text: string, namespace: string = "general"): Promise<RememberOutcome> {
  if (!text.trim()) return { ok: false, error: "empty entry" };
  try {
    const memwal = getMemWal();
    // Passing the namespace as an option to the Walrus Memory SDK
    const result = await memwal.rememberAndWait(text, { namespace });
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

/**
 * searchReadingHistory - Recalls memories only from the selected namespace
 */
export async function searchReadingHistory(query: string, namespace: string = "general"): Promise<SearchResult> {
  if (!query.trim()) return { ok: false, error: "empty query" };
  try {
    const memwal = getMemWal();
    // Fetching memories filtered by the specific namespace
    const result = await memwal.recall(query, 10, { namespace });
    return {
      ok: true,
      results: result.results
        .filter((r) => r.distance < MAX_RECALL_DISTANCE)
        .map((r) => ({
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