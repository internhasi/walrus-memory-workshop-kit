"use client";

import { useState, useTransition } from "react";
import {
  analyzeEntry,
  rememberEntry,
  searchReadingHistory,
  type AnalyzedFactStatus,
  type SearchHit,
} from "./actions";

type LastSave =
  | {
      verb: "analyze";
      facts: AnalyzedFactStatus[];
      succeeded: number;
      failed: number;
    }
  | { verb: "remember"; text: string; blobId: string };

// අපිට අවශ්‍ය කරන Namespace ලැයිස්තුව
const NAMESPACES = ["general", "work", "personal", "crypto"];

export default function Home() {
  const [query, setQuery] = useState("");
  const [entry, setEntry] = useState("");
  const [results, setResults] = useState<SearchHit[] | null>(null);
  const [lastSave, setLastSave] = useState<LastSave | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searching, startSearch] = useTransition();
  const [analyzing, startAnalyze] = useTransition();
  const [remembering, startRemember] = useTransition();
  
  // දැනට තෝරාගෙන ඇති Namespace එක (Default එක general)
  const [activeNamespace, setActiveNamespace] = useState("general");

  const saving = analyzing || remembering;

  function handleSearch() {
    setError(null);
    startSearch(async () => {
      // මෙතනදී අපි තෝරපු namespace එකත් එක්කමයි search කරන්නේ
      const r = await searchReadingHistory(query, activeNamespace);
      if (!r.ok) {
        setError(r.error);
        setResults(null);
        return;
      }
      setResults(r.results);
    });
  }

  function handleAnalyze() {
    setError(null);
    startAnalyze(async () => {
      // මෙතනදී අපි තෝරපු namespace එක ඇතුළට සේව් කරන්න කියලා යවනවා
      const r = await analyzeEntry(entry, activeNamespace);
      if (!r.ok) {
        setError(r.error);
        setLastSave(null);
        return;
      }
      setLastSave({
        verb: "analyze",
        facts: r.facts,
        succeeded: r.succeeded,
        failed: r.failed,
      });
      setEntry("");
    });
  }

  function handleRemember() {
    setError(null);
    startRemember(async () => {
      // මෙතනදීත් namespace එක පාස් කරනවා
      const r = await rememberEntry(entry, activeNamespace);
      if (!r.ok) {
        setError(r.error);
        setLastSave(null);
        return;
      }
      setLastSave({ verb: "remember", text: r.text, blobId: r.blobId });
      setEntry("");
    });
  }

  function handleClearRecall() {
    setResults(null);
    setQuery("");
    setError(null);
  }

  return (
    <main className="container">
      <header>
        <h1>walrus memory reading tracker</h1>
        <p className="sub">
          log what you read. recall what you read. across sessions, models, and devices.
        </p>
      </header>

      {/* 🚀 මෙන්න අපි අලුතින්ම දාපු සුපිරි Multi-Namespace Switcher Tabs ටික */}
      <section className="card" style={{ marginBottom: "1rem", padding: "1rem" }}>
        <label style={{ fontSize: "0.9rem", color: "var(--muted)", marginBottom: "0.5rem", display: "block" }}>
          Select Active Memory Namespace:
        </label>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {NAMESPACES.map((ns) => (
            <button
              key={ns}
              type="button"
              onClick={() => {
                setActiveNamespace(ns);
                handleClearRecall(); // Namespace එක මාරු කරද්දී පරණ සර්ච් රිසල්ට්ස් ක්ලියර් කරනවා
              }}
              className={activeNamespace === ns ? "" : "secondary"}
              style={{
                padding: "0.4rem 1rem",
                fontSize: "0.85rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                border: activeNamespace === ns ? "1px solid var(--brand)" : "1px solid #333"
              }}
            >
              {ns}
            </button>
          ))}
        </div>
        <p className="hint" style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}>
          Current Active Scope: <strong style={{ color: "var(--brand)" }}>{activeNamespace}</strong>
        </p>
      </section>

      <section className="card">
        <label htmlFor="q">recall() from [{activeNamespace}]</label>
        <input
          id="q"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && query && !searching) handleSearch();
          }}
          placeholder={`query memories inside ${activeNamespace}...`}
        />
        <div className="button-row">
          <button onClick={handleSearch} disabled={!query || searching}>
            {searching ? "searching…" : "recall"}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={handleClearRecall}
            disabled={searching || (!results && !query)}
          >
            clear
          </button>
        </div>

        {results && results.length > 0 && (
          <ul className="results">
            {results.map((m) => (
              <li key={m.blobId}>
                <span className="dist">d={m.distance.toFixed(2)}</span>
                <span>{m.text}</span>
              </li>
            ))}
          </ul>
        )}
        {results && results.length === 0 && (
          <p className="empty">no matching memories inside [{activeNamespace}] yet.</p>
        )}
      </section>

      <section className="card">
        <label htmlFor="e">log a reading session into [{activeNamespace}]</label>
        <textarea
          id="e"
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder={`e.g. adding some notes specific to ${activeNamespace}...`}
          rows={5}
        />
        <div className="button-row">
          <button onClick={handleAnalyze} disabled={!entry || saving}>
            {analyzing ? "extracting…" : "analyze() — extract & save facts"}
          </button>
          <button
            className="secondary"
            onClick={handleRemember}
            disabled={!entry || saving}
          >
            {remembering ? "saving…" : "remember() — save raw text"}
          </button>
        </div>

        {lastSave?.verb === "analyze" && (
          <div className="facts">
            <h3>
              analyze() → {lastSave.succeeded} saved to [{activeNamespace}]
              {lastSave.failed > 0 ? `, ${lastSave.failed} failed` : ""}
            </h3>
            {lastSave.facts.length > 0 ? (
              <ul>
                {lastSave.facts.map((f, i) => (
                  <li key={i} className={f.saved ? "saved" : "failed"}>
                    {f.saved ? "✓" : "✗"} {f.text}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty">no facts extracted — try a more concrete entry.</p>
            )}
          </div>
        )}

        {lastSave?.verb === "remember" && (
          <div className="facts">
            <h3>remember() → stored raw in [{activeNamespace}]</h3>
            <ul>
              <li>✓ {lastSave.text}</li>
            </ul>
          </div>
        )}
      </section>

      {error && <div className="error">{error}</div>}
    </main>
  );
}