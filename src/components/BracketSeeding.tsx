import { useState } from "react";
import type { Starch, Region } from "../types";
import RegionView from "./RegionView";

interface Props {
  starches: Starch[];
  regions: Region[];
  assignedIds: Set<string>;
  onAssign: (regionName: string, seedIndex: number, starchId: string) => void;
  onRemove: (regionName: string, seedIndex: number) => void;
  onAutoSeed: () => void;
  onClearAll: () => void;
  onShuffle: () => void;
}

export default function BracketSeeding({
  starches,
  regions,
  assignedIds,
  onAssign,
  onRemove,
  onAutoSeed,
  onClearAll,
  onShuffle,
}: Props) {
  const [selectedStarchId, setSelectedStarchId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const unassigned = starches.filter(
    (s) =>
      !assignedIds.has(s.id) &&
      s.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalSlots = regions.length * 16;
  const filledSlots = regions.reduce(
    (sum, r) => sum + r.seeds.filter((s) => s !== null).length,
    0
  );

  function handleSlotClick(regionName: string, seedIndex: number) {
    if (selectedStarchId) {
      onAssign(regionName, seedIndex, selectedStarchId);
      setSelectedStarchId(null);
    }
  }

  function handleSlotRemove(regionName: string, seedIndex: number) {
    onRemove(regionName, seedIndex);
  }

  function handleDrop(
    regionName: string,
    seedIndex: number,
    starchId: string
  ) {
    onAssign(regionName, seedIndex, starchId);
    setSelectedStarchId(null);
  }

  function handleStarchDragStart(e: React.DragEvent, starchId: string) {
    e.dataTransfer.setData("text/plain", starchId);
    e.dataTransfer.effectAllowed = "move";
  }

  return (
    <div className="seeding-layout">
      <div className="seeding-sidebar">
        <h3>
          Unassigned ({unassigned.length + (search ? 0 : assignedIds.size) - (search ? 0 : assignedIds.size)})
        </h3>
        <input
          className="sidebar-search"
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="sidebar-starch-list">
          {starches
            .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
            .map((s) => {
              const isAssigned = assignedIds.has(s.id);
              return (
                <div
                  key={s.id}
                  className={`sidebar-starch ${selectedStarchId === s.id ? "selected" : ""} ${isAssigned ? "assigned" : ""}`}
                  onClick={() => {
                    if (!isAssigned) {
                      setSelectedStarchId(
                        selectedStarchId === s.id ? null : s.id
                      );
                    }
                  }}
                  draggable={!isAssigned}
                  onDragStart={(e) =>
                    !isAssigned && handleStarchDragStart(e, s.id)
                  }
                >
                  {s.imageUrl ? (
                    <img
                      src={s.imageUrl}
                      alt={s.name}
                      className="starch-image"
                      style={{ width: 20, height: 20 }}
                    />
                  ) : (
                    <span style={{ fontSize: "1rem" }}>{s.emoji}</span>
                  )}
                  <span className="starch-name">{s.name}</span>
                </div>
              );
            })}
        </div>
      </div>

      <div className="seeding-main">
        <div className="auto-seed-bar">
          <p>
            {filledSlots}/{totalSlots} slots filled
            {selectedStarchId && (
              <> — Click an empty slot to place <strong>{starches.find(s => s.id === selectedStarchId)?.name}</strong></>
            )}
          </p>
          <button className="btn btn-sm" onClick={onAutoSeed}>
            Auto-Seed
          </button>
          <button className="btn btn-sm" onClick={onShuffle}>
            Shuffle
          </button>
          <button className="btn btn-sm btn-danger" onClick={onClearAll}>
            Clear All
          </button>
        </div>

        <div className="regions-grid">
          {regions.map((region) => (
            <RegionView
              key={region.name}
              region={region}
              starches={starches}
              selectedStarchId={selectedStarchId}
              onAssign={handleSlotClick}
              onRemove={handleSlotRemove}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
