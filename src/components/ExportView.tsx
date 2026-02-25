import type { Starch, Region, TournamentConfig } from "../types";
import { MATCHUP_ORDER } from "../types";

interface Props {
  tournamentName: string;
  starches: Starch[];
  regions: Region[];
}

export default function ExportView({
  tournamentName,
  starches,
  regions,
}: Props) {
  const totalSlots = regions.length * 16;
  const filledSlots = regions.reduce(
    (sum, r) => sum + r.seeds.filter((s) => s !== null).length,
    0
  );
  const totalStarches = starches.length;

  function buildExportData(): TournamentConfig {
    return {
      name: tournamentName,
      createdAt: new Date().toISOString(),
      starches: starches.map(({ id, name, emoji, imageUrl }) => ({
        id,
        name,
        emoji,
        ...(imageUrl ? { imageUrl } : {}),
      })),
      regions: regions.map((region) => ({
        name: region.name,
        seeds: region.seeds.map((starchId) => {
          if (!starchId) return null;
          const starch = starches.find((s) => s.id === starchId);
          return starch ? starch.id : null;
        }),
      })),
    };
  }

  function buildReadableExport() {
    return {
      name: tournamentName,
      createdAt: new Date().toISOString(),
      regions: regions.map((region) => ({
        name: region.name,
        matchups: MATCHUP_ORDER.map(([seedA, seedB]) => {
          const starchA = region.seeds[seedA - 1]
            ? starches.find((s) => s.id === region.seeds[seedA - 1])
            : null;
          const starchB = region.seeds[seedB - 1]
            ? starches.find((s) => s.id === region.seeds[seedB - 1])
            : null;
          return {
            game: `#${seedA} vs #${seedB}`,
            top: starchA
              ? { seed: seedA, name: starchA.name, emoji: starchA.emoji }
              : { seed: seedA, name: "(empty)" },
            bottom: starchB
              ? { seed: seedB, name: starchB.name, emoji: starchB.emoji }
              : { seed: seedB, name: "(empty)" },
          };
        }),
      })),
    };
  }

  function handleDownloadFull() {
    const data = buildExportData();
    download(data, `${slugify(tournamentName)}-bracket.json`);
  }

  function handleDownloadReadable() {
    const data = buildReadableExport();
    download(data, `${slugify(tournamentName)}-matchups.json`);
  }

  function handleCopyToClipboard() {
    const data = buildExportData();
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  }

  const exportData = buildExportData();
  const jsonStr = JSON.stringify(exportData, null, 2);

  return (
    <div className="export-section">
      <h2>Export Bracket Configuration</h2>
      <p>
        Download the bracket configuration as a JSON file to use in the
        production app.
      </p>

      <div className="export-summary">
        <div className="summary-card">
          <div className="value">{totalStarches}</div>
          <div className="label">Total Starches</div>
        </div>
        <div className="summary-card">
          <div className="value">
            {filledSlots}/{totalSlots}
          </div>
          <div className="label">Slots Filled</div>
        </div>
        <div className="summary-card">
          <div className="value">{regions.length}</div>
          <div className="label">Regions</div>
        </div>
        <div className="summary-card">
          <div className="value">
            {filledSlots === totalSlots ? "Ready" : "Incomplete"}
          </div>
          <div className="label">Status</div>
        </div>
      </div>

      <div className="export-actions">
        <button className="btn btn-primary" onClick={handleDownloadFull}>
          Download Full Config (.json)
        </button>
        <button className="btn" onClick={handleDownloadReadable}>
          Download Matchups (.json)
        </button>
        <button className="btn" onClick={handleCopyToClipboard}>
          Copy to Clipboard
        </button>
      </div>

      <h2 style={{ marginTop: "1.5rem" }}>Preview</h2>
      <div className="export-preview">
        <pre>{jsonStr}</pre>
      </div>
    </div>
  );
}

function download(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
