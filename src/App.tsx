import { useState, useEffect, useCallback, useMemo } from "react";
import type { Starch, Region, TournamentConfig } from "./types";
import { REGION_NAMES } from "./types";
import { DEFAULT_STARCHES } from "./data/defaultStarches";
import StarchPool from "./components/StarchPool";
import BracketSeeding from "./components/BracketSeeding";
import ExportView from "./components/ExportView";
import "./App.css";

type Tab = "pool" | "seeding" | "export";

const STORAGE_KEY = "starch-madness-seeding";

function createEmptyRegions(): Region[] {
  return REGION_NAMES.map((name) => ({
    name,
    seeds: Array(16).fill(null),
  }));
}

function loadState(): {
  starches: Starch[];
  regions: Region[];
  tournamentName: string;
  tab: Tab;
} {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        starches: parsed.starches ?? DEFAULT_STARCHES,
        regions: parsed.regions ?? createEmptyRegions(),
        tournamentName: parsed.tournamentName ?? "Starch Madness 2026",
        tab: parsed.tab ?? "pool",
      };
    }
  } catch {
    // ignore
  }
  return {
    starches: DEFAULT_STARCHES,
    regions: createEmptyRegions(),
    tournamentName: "Starch Madness 2026",
    tab: "pool",
  };
}

function App() {
  const initial = loadState();
  const [tab, setTab] = useState<Tab>(initial.tab);
  const [starches, setStarches] = useState<Starch[]>(initial.starches);
  const [regions, setRegions] = useState<Region[]>(initial.regions);
  const [tournamentName, setTournamentName] = useState(initial.tournamentName);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ starches, regions, tournamentName, tab })
    );
  }, [starches, regions, tournamentName, tab]);

  // Compute assigned starch IDs
  const assignedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const region of regions) {
      for (const id of region.seeds) {
        if (id) ids.add(id);
      }
    }
    return ids;
  }, [regions]);

  // Next ID
  const nextId = useCallback(() => {
    const maxId = starches.reduce(
      (max, s) => Math.max(max, parseInt(s.id) || 0),
      0
    );
    return String(maxId + 1);
  }, [starches]);

  // Starch CRUD
  function addStarch(data: Omit<Starch, "id">) {
    setStarches((prev) => [...prev, { ...data, id: nextId() }]);
  }

  function editStarch(starch: Starch) {
    setStarches((prev) => prev.map((s) => (s.id === starch.id ? starch : s)));
  }

  function deleteStarch(id: string) {
    // Also remove from any seed slots
    setRegions((prev) =>
      prev.map((r) => ({
        ...r,
        seeds: r.seeds.map((s) => (s === id ? null : s)),
      }))
    );
    setStarches((prev) => prev.filter((s) => s.id !== id));
  }

  // Bracket operations
  function assignStarch(
    regionName: string,
    seedIndex: number,
    starchId: string
  ) {
    // Remove from any existing slot first
    setRegions((prev) =>
      prev.map((r) => ({
        ...r,
        seeds: r.seeds.map((s, i) => {
          // Remove from old position
          if (s === starchId) return null;
          // Place in new position
          if (r.name === regionName && i === seedIndex) return starchId;
          return s;
        }),
      }))
    );
  }

  function removeFromSlot(regionName: string, seedIndex: number) {
    setRegions((prev) =>
      prev.map((r) =>
        r.name === regionName
          ? {
              ...r,
              seeds: r.seeds.map((s, i) => (i === seedIndex ? null : s)),
            }
          : r
      )
    );
  }

  function autoSeed() {
    const unassigned = starches.filter((s) => !assignedIds.has(s.id));
    const toAssign = [...unassigned];
    const newRegions = regions.map((r) => ({ ...r, seeds: [...r.seeds] }));

    for (const region of newRegions) {
      for (let i = 0; i < 16; i++) {
        if (region.seeds[i] === null && toAssign.length > 0) {
          region.seeds[i] = toAssign.shift()!.id;
        }
      }
    }

    setRegions(newRegions);
  }

  function shuffleSeed() {
    // Collect all currently assigned starch IDs
    const allAssigned: string[] = [];
    for (const region of regions) {
      for (const id of region.seeds) {
        if (id) allAssigned.push(id);
      }
    }

    // Add unassigned starches up to 64
    const unassigned = starches.filter((s) => !assignedIds.has(s.id));
    const all = [...allAssigned, ...unassigned.map((s) => s.id)].slice(0, 64);

    // Shuffle
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }

    // Distribute across regions
    const newRegions = regions.map((r, ri) => ({
      ...r,
      seeds: Array.from({ length: 16 }, (_, i) => all[ri * 16 + i] ?? null),
    }));

    setRegions(newRegions);
  }

  function clearAllSeeds() {
    if (!confirm("Clear all seed assignments?")) return;
    setRegions(createEmptyRegions());
  }

  // Import
  function handleImport() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data: TournamentConfig = JSON.parse(text);
        if (data.starches && data.regions) {
          setStarches(data.starches);
          setRegions(data.regions);
          if (data.name) setTournamentName(data.name);
          alert("Imported successfully!");
        } else {
          alert("Invalid file format");
        }
      } catch {
        alert("Failed to parse file");
      }
    };
    input.click();
  }

  // Reset to defaults
  function handleReset() {
    if (
      !confirm(
        "Reset everything to defaults? This will clear all your changes."
      )
    )
      return;
    setStarches(DEFAULT_STARCHES);
    setRegions(createEmptyRegions());
    setTournamentName("Starch Madness 2026");
  }

  return (
    <div className="app">
      <header className="header">
        <h1>
          <span role="img" aria-label="potato">🥔</span>
          <input
            className="tournament-name-input"
            value={tournamentName}
            onChange={(e) => setTournamentName(e.target.value)}
            title="Click to edit tournament name"
          />
        </h1>
        <div className="header-actions">
          <button className="btn" onClick={handleImport}>
            Import
          </button>
          <button className="btn" onClick={handleReset}>
            Reset
          </button>
        </div>
      </header>

      <nav className="tabs">
        <button
          className={`tab ${tab === "pool" ? "active" : ""}`}
          onClick={() => setTab("pool")}
        >
          Starch Pool ({starches.length})
        </button>
        <button
          className={`tab ${tab === "seeding" ? "active" : ""}`}
          onClick={() => setTab("seeding")}
        >
          Bracket Seeding ({assignedIds.size}/64)
        </button>
        <button
          className={`tab ${tab === "export" ? "active" : ""}`}
          onClick={() => setTab("export")}
        >
          Export
        </button>
      </nav>

      <main className="main-content">
        {tab === "pool" && (
          <StarchPool
            starches={starches}
            onAdd={addStarch}
            onEdit={editStarch}
            onDelete={deleteStarch}
          />
        )}
        {tab === "seeding" && (
          <BracketSeeding
            starches={starches}
            regions={regions}
            assignedIds={assignedIds}
            onAssign={assignStarch}
            onRemove={removeFromSlot}
            onAutoSeed={autoSeed}
            onClearAll={clearAllSeeds}
            onShuffle={shuffleSeed}
          />
        )}
        {tab === "export" && (
          <ExportView
            tournamentName={tournamentName}
            starches={starches}
            regions={regions}
          />
        )}
      </main>
    </div>
  );
}

export default App;
