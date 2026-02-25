import { useState } from "react";
import type { Starch } from "../types";
import AddStarchModal from "./AddStarchModal";

interface Props {
  starches: Starch[];
  onAdd: (starch: Omit<Starch, "id">) => void;
  onEdit: (starch: Starch) => void;
  onDelete: (id: string) => void;
}

export default function StarchPool({ starches, onAdd, onEdit, onDelete }: Props) {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Starch | null>(null);

  const filtered = starches.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleSave(data: Omit<Starch, "id"> & { id?: string }) {
    if (data.id) {
      onEdit(data as Starch);
    } else {
      onAdd(data);
    }
    setShowModal(false);
    setEditing(null);
  }

  return (
    <div>
      <div className="pool-header">
        <div>
          <h2>Starch Pool</h2>
          <span className="pool-stats">{starches.length} starches</span>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setShowModal(true);
          }}
        >
          + Add Starch
        </button>
      </div>

      <input
        className="pool-search"
        type="text"
        placeholder="Search starches..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="starch-grid">
        {filtered.map((starch) => (
          <div key={starch.id} className="starch-card">
            {starch.imageUrl ? (
              <img
                src={starch.imageUrl}
                alt={starch.name}
                className="starch-image"
              />
            ) : (
              <span className="starch-emoji">{starch.emoji}</span>
            )}
            <span className="starch-name">{starch.name}</span>
            <div className="starch-actions">
              <button
                className="starch-action-btn"
                onClick={() => {
                  setEditing(starch);
                  setShowModal(true);
                }}
                title="Edit"
              >
                ✏️
              </button>
              <button
                className="starch-action-btn"
                onClick={() => {
                  if (confirm(`Delete "${starch.name}"?`)) {
                    onDelete(starch.id);
                  }
                }}
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem" }}>
          {search ? "No starches match your search." : "No starches yet. Add some!"}
        </p>
      )}

      {showModal && (
        <AddStarchModal
          editing={editing}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
