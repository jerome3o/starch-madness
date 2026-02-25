import { useState, useRef } from "react";
import type { Starch } from "../types";

const COMMON_EMOJIS = [
  "🍞", "🥖", "🥯", "🥐", "🫓", "🍕", "🌮", "🌯", "🥟", "🫔",
  "🍝", "🍜", "🍚", "🍣", "🥘", "🍟", "🥔", "🌽", "🥞", "🧇",
  "🍩", "🧁", "🍰", "🍿", "🍘", "🥣", "🧀", "🧈", "🥙", "🍥",
  "🥧", "🍤", "🥡", "🥪", "🫕", "🍲", "🍛", "🥗", "🧆", "🥮",
];

interface Props {
  onSave: (starch: Omit<Starch, "id"> & { id?: string }) => void;
  onClose: () => void;
  editing?: Starch | null;
}

export default function AddStarchModal({ onSave, onClose, editing }: Props) {
  const [name, setName] = useState(editing?.name ?? "");
  const [emoji, setEmoji] = useState(editing?.emoji ?? "🍞");
  const [imageUrl, setImageUrl] = useState(editing?.imageUrl ?? "");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500_000) {
      alert("Image must be under 500KB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      ...(editing ? { id: editing.id } : {}),
      name: name.trim(),
      emoji,
      ...(imageUrl ? { imageUrl } : {}),
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{editing ? "Edit Starch" : "Add New Starch"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sourdough"
              autoFocus
            />
          </div>

          <div className="form-field">
            <label>Emoji</label>
            <div className="emoji-picker">
              {COMMON_EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  className={`emoji-option ${emoji === em ? "selected" : ""}`}
                  onClick={() => setEmoji(em)}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div className="form-field">
            <label>Custom Emoji (type any emoji)</label>
            <input
              type="text"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              style={{ width: "80px" }}
            />
          </div>

          <div className="form-field">
            <label>Image (optional, replaces emoji)</label>
            <div className="image-upload-area">
              {imageUrl && (
                <img src={imageUrl} alt="preview" className="image-preview" />
              )}
              <input
                type="file"
                ref={fileRef}
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => fileRef.current?.click()}
              >
                Upload Image
              </button>
              {imageUrl && (
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => setImageUrl("")}
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editing ? "Save Changes" : "Add Starch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
