"use client";

import { useRef, useState } from "react";
import { EMOJI_GROUPS } from "@/lib/avatars";

interface AvatarPickerProps {
  value: string;
  onChange: (value: string) => void;
}

function resizeImageToBase64(file: File, maxSize = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas non supporté")); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  const [tab, setTab] = useState<"emoji" | "upload">("emoji");
  const [openGroup, setOpenGroup] = useState<string | null>("boys");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const isCustom = value.startsWith("data:");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Format non supporté. Utilise JPG, PNG ou WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image trop lourde (max 5 Mo).");
      return;
    }
    setUploadError("");
    setUploading(true);
    try {
      const base64 = await resizeImageToBase64(file, 256);
      onChange(base64);
    } catch {
      setUploadError("Erreur lors du chargement de l'image.");
    } finally {
      setUploading(false);
    }
  }

  function toggleGroup(id: string) {
    setOpenGroup((prev) => (prev === id ? null : id));
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setTab("emoji")}
          className={`flex-1 py-2 rounded-xl text-xs font-medium transition ${
            tab === "emoji" ? "bg-primary text-white" : "bg-gray-50 text-textDark hover:bg-gray-100"
          }`}
        >
          😊 Choisir un emoji
        </button>
        <button
          type="button"
          onClick={() => setTab("upload")}
          className={`flex-1 py-2 rounded-xl text-xs font-medium transition ${
            tab === "upload" ? "bg-primary text-white" : "bg-gray-50 text-textDark hover:bg-gray-100"
          }`}
        >
          📷 Ma photo
        </button>
      </div>

      {tab === "emoji" ? (
        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-0.5">
          {EMOJI_GROUPS.map((group) => {
            const isOpen = openGroup === group.id;
            const selectedInGroup = group.emojis.some((e) => value === `emoji:${e}`);

            return (
              <div key={group.id} className="rounded-xl border border-gray-100 overflow-hidden">
                {/* En-tête du groupe */}
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition ${
                    isOpen ? "bg-primary/5" : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{group.icon}</span>
                    <span className="text-xs font-semibold text-textDark">{group.label}</span>
                    {selectedInGroup && (
                      <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                        ✓ sélectionné
                      </span>
                    )}
                  </div>
                  <span className={`text-textLight text-sm font-bold transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}>
                    +
                  </span>
                </button>

                {/* Grille d'emojis */}
                {isOpen && (
                  <div className="grid grid-cols-8 gap-1 p-2 bg-white">
                    {group.emojis.map((emoji) => {
                      const id = `emoji:${emoji}`;
                      const isSelected = value === id;
                      return (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => onChange(id)}
                          className={`aspect-square rounded-xl flex items-center justify-center text-xl transition-all ${
                            isSelected
                              ? "bg-primary/10 ring-2 ring-primary scale-110"
                              : "hover:bg-gray-100"
                          }`}
                          title={emoji}
                        >
                          {emoji}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

          {isCustom ? (
            <div className="flex items-center gap-3">
              <img src={value} alt="avatar" className="w-16 h-16 rounded-2xl object-cover border-2 border-primary" />
              <div>
                <p className="text-sm font-medium text-success">✅ Photo importée</p>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="text-xs text-primary hover:underline mt-1"
                >
                  Changer la photo
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-8 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5 transition disabled:opacity-50"
            >
              {uploading ? (
                <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="text-3xl">📷</span>
                  <span className="text-sm font-medium text-textDark">Sélectionner une photo</span>
                  <span className="text-xs text-textLight">JPG, PNG, WebP · max 5 Mo</span>
                </>
              )}
            </button>
          )}

          {uploadError && <p className="text-xs text-danger mt-2">{uploadError}</p>}
        </div>
      )}
    </div>
  );
}
