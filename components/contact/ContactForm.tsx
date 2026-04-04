"use client";

import { useState } from "react";

const SUBJECTS = [
  "Question générale",
  "Problème technique",
  "Signaler un bug",
  "Suggestion d'amélioration",
  "Facturation / abonnement",
  "Autre",
];

interface ContactFormProps {
  userName?: string | null;
  userEmail?: string | null;
}

export function ContactForm({ userName, userEmail }: ContactFormProps) {
  const [name, setName] = useState(userName ?? "");
  const [email, setEmail] = useState(userEmail ?? "");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (res.ok) {
        setStatus("success");
        setMessage("");
      } else {
        throw new Error();
      }
    } catch {
      setStatus("error");
      setError("Une erreur est survenue. Réessaie dans quelques instants.");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4">✅</div>
        <p className="font-bold text-textDark text-lg">Message envoyé !</p>
        <p className="text-sm text-textLight mt-2">On te répondra dans les plus brefs délais.</p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-5 text-sm text-primary underline underline-offset-2"
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-textLight block mb-1.5">Nom *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={!!userName}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50 disabled:text-textLight"
            placeholder="Ton prénom"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-textLight block mb-1.5">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={!!userEmail}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50 disabled:text-textLight"
            placeholder="ton@email.com"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-textLight block mb-1.5">Sujet *</label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
        >
          {SUBJECTS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold text-textLight block mb-1.5">Message *</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          minLength={10}
          rows={6}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          placeholder="Décris ta demande en détail..."
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
      >
        {status === "loading" ? "Envoi en cours..." : "Envoyer le message"}
      </button>
    </form>
  );
}
