"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { AvatarPicker } from "@/components/ui/AvatarPicker";
import { LocationPicker } from "@/components/ui/LocationPicker";
import { COUNTRIES } from "@/lib/countries";

interface ProfileEditorProps {
  name: string | null;
  avatar: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  showInLeaderboard: boolean;
}

export function ProfileEditor({ name: initialName, avatar: initialAvatar, country: initialCountry, region: initialRegion, city: initialCity, showInLeaderboard: initialShow }: ProfileEditorProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName ?? "");
  const [avatar, setAvatar] = useState(initialAvatar ?? "preset:1");
  const [country, setCountry] = useState(initialCountry ?? "");
  const [region, setRegion] = useState(initialRegion ?? "");
  const [city, setCity] = useState(initialCity ?? "");
  const [showInLeaderboard, setShowInLeaderboard] = useState(initialShow);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setLoading(true);
    await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name || null, avatar, country: country || null, region: region || null, city: city || null, showInLeaderboard }),
    });
    setLoading(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  return (
    <div>
      {/* Avatar + summary */}
      <div className="flex items-center gap-4 mb-4">
        <Avatar avatar={avatar} name={initialName} size="lg" />
        <div className="flex-1">
          <p className="font-semibold text-textDark">{initialName ?? "Utilisateur"}</p>
          {initialCountry && (
            <p className="text-sm text-textLight">
              {COUNTRIES.find((c) => c.code === initialCountry)?.flag} {initialCity ?? initialRegion ?? initialCountry}
            </p>
          )}
          <p className="text-xs text-textLight mt-0.5">
            {showInLeaderboard ? "✅ Visible dans le classement" : "🔒 Masqué du classement"}
          </p>
        </div>
        <button onClick={() => setEditing((v) => !v)}
          className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-textLight hover:bg-gray-50 transition">
          {editing ? "Annuler" : "Modifier"}
        </button>
      </div>

      {saved && (
        <p className="text-sm text-success bg-green-50 px-4 py-2 rounded-xl mb-3">✅ Profil mis à jour</p>
      )}

      {editing && (
        <div className="space-y-4 pt-2 border-t border-gray-100">
          {/* Nom */}
          <div>
            <p className="text-sm font-medium text-textDark mb-2">Nom affiché</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ton prénom ou pseudo"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Avatar */}
          <div>
            <p className="text-sm font-medium text-textDark mb-2">Avatar</p>
            <AvatarPicker value={avatar} onChange={setAvatar} />
          </div>

          {/* Localisation */}
          <div>
            <p className="text-sm font-medium text-textDark mb-2">Localisation</p>
            <LocationPicker
              country={country} setCountry={setCountry}
              region={region} setRegion={setRegion}
              city={city} setCity={setCity}
            />
          </div>

          {/* Leaderboard toggle */}
          <button type="button" onClick={() => setShowInLeaderboard((v) => !v)}
            className="w-full flex items-center justify-between bg-gray-50 rounded-xl p-4 transition hover:bg-gray-100">
            <div className="text-left">
              <p className="text-sm font-medium text-textDark">Apparaître dans le classement</p>
              <p className="text-xs text-textLight mt-0.5">Visible par les autres joueurs</p>
            </div>
            <div className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${showInLeaderboard ? "bg-primary" : "bg-gray-300"}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${showInLeaderboard ? "translate-x-5" : "translate-x-0"}`} />
            </div>
          </button>

          <button onClick={handleSave} disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-semibold rounded-xl transition text-sm">
            {loading ? "Enregistrement..." : "Sauvegarder"}
          </button>
        </div>
      )}
    </div>
  );
}
