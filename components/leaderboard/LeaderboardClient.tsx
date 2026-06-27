"use client";

import { useState, useMemo } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { getCountryFlag, getCountryName } from "@/lib/countries";
import { getXpProgressForCurrentLevel } from "@/lib/gamification";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

interface LeaderboardUser {
  id: string;
  name: string | null;
  avatar: string | null;
  level: number;
  xp: number;
  country: string | null;
  region: string | null;
  city: string | null;
  isPremium: boolean;
  bestStreak: number;
  rank: number;
  levelTitle: string;
}

interface LeaderboardClientProps {
  users: LeaderboardUser[];
  me: LeaderboardUser & { levelTitle: string };
  availableCountries: string[];
  currentUserId: string;
}

const PAGE_SIZE = 20;

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-2xl">🥇</span>;
  if (rank === 2) return <span className="text-2xl">🥈</span>;
  if (rank === 3) return <span className="text-2xl">🥉</span>;
  return (
    <span className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 text-xs font-bold text-textLight">
      {rank}
    </span>
  );
}

const PODIUM_STEPS_CONFIG = [
  {
    order: 1,
    blockH: "h-16",
    bg: "linear-gradient(135deg, #CBD5E1 0%, #94A3B8 100%)",
    ring: "#CBD5E1",
    glow: "none",
    labelColor: "#64748B",
    avatarSize: "md" as const,
  },
  {
    order: 0,
    blockH: "h-28",
    bg: "linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)",
    ring: "#FCD34D",
    glow: "0 0 20px 4px rgba(251,191,36,0.45)",
    labelColor: "#B45309",
    avatarSize: "lg" as const,
  },
  {
    order: 2,
    blockH: "h-10",
    bg: "linear-gradient(135deg, #FCA67A 0%, #C2622A 100%)",
    ring: "#FCA67A",
    glow: "none",
    labelColor: "#9A3412",
    avatarSize: "md" as const,
  },
];

function Podium({ users, currentUserId }: { users: LeaderboardUser[]; currentUserId: string }) {
  const t = useTranslations("leaderboard");
  const locale = useLocale();
  const xpLocale = locale === "fr" ? "fr-FR" : "en-US";
  const rankLabels = [t("rank2"), t("rank1"), t("rank3")];
  const display = [users[1], users[0], users[2]];

  return (
    <div className="relative bg-gradient-to-b from-primary/5 to-white rounded-2xl shadow-soft px-4 pt-6 pb-0 mb-4 overflow-hidden">
      <span className="absolute top-3 left-5 text-yellow-300 text-lg opacity-60 select-none">✦</span>
      <span className="absolute top-5 right-8 text-yellow-200 text-sm opacity-50 select-none">✦</span>
      <span className="absolute top-2 left-1/2 text-yellow-300 text-xs opacity-40 select-none">✦</span>

      <p className="text-xs font-bold text-textLight uppercase tracking-widest text-center mb-5">{t("podiumLabel")}</p>

      <div className="flex items-end justify-center gap-3">
        {display.map((user, i) => {
          const cfg = PODIUM_STEPS_CONFIG[i];
          const rankLabel = rankLabels[i];
          const isMe = user.id === currentUserId;
          const isFirst = i === 1;

          return (
            <div key={user.id} className="flex flex-col items-center flex-1 max-w-[100px]">
              {isFirst && (
                <span className="text-2xl mb-1 animate-bounce select-none">👑</span>
              )}

              <div className="relative mb-2">
                <div
                  className="rounded-full"
                  style={{
                    padding: isFirst ? "3px" : "2px",
                    background: cfg.bg,
                    boxShadow: cfg.glow,
                  }}
                >
                  <Avatar
                    avatar={user.avatar}
                    name={user.name}
                    size={cfg.avatarSize}
                    className={isMe ? "ring-2 ring-primary" : ""}
                  />
                </div>
                <span
                  className="absolute -bottom-1 -right-1 text-[11px] font-black px-1.5 py-0.5 rounded-full leading-none"
                  style={{ background: cfg.bg, color: cfg.labelColor }}
                >
                  #{user.rank}
                </span>
              </div>

              <p className="text-xs font-bold text-textDark text-center truncate w-full px-1">
                {user.name ?? "—"}
                {isMe && <span className="text-[10px] font-normal text-primary ml-1">{t("meTag")}</span>}
              </p>
              <p className="text-[10px] font-semibold mt-0.5" style={{ color: cfg.labelColor }}>
                {user.xp.toLocaleString(xpLocale)} XP
              </p>
              {user.bestStreak > 0 && (
                <p className="text-[10px] text-warning">🔥 {user.bestStreak}{t("streakSuffix")}</p>
              )}

              <div
                className={`w-full ${cfg.blockH} rounded-t-xl mt-3`}
                style={{ background: cfg.bg }}
              >
                <p className="text-center text-[10px] font-black pt-2 opacity-70" style={{ color: cfg.labelColor }}>
                  {rankLabel}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function LeaderboardClient({ users, me, availableCountries, currentUserId }: LeaderboardClientProps) {
  const t = useTranslations("leaderboard");
  const locale = useLocale();
  const xpLocale = locale === "fr" ? "fr-FR" : "en-US";

  const [filterCountry, setFilterCountry] = useState<string>("all");
  const [filterRegion, setFilterRegion] = useState<string>("all");
  const [scope, setScope] = useState<"global" | "country" | "region">("global");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    let list = [...users];
    if (scope === "country" && me.country) {
      list = list.filter((u) => u.country === me.country);
    } else if (scope === "region" && me.region) {
      list = list.filter((u) => u.region === me.region && u.country === me.country);
    } else if (filterCountry !== "all") {
      list = list.filter((u) => u.country === filterCountry);
      if (filterRegion !== "all") {
        list = list.filter((u) => u.region === filterRegion);
      }
    }
    return list.map((u, i) => ({ ...u, rank: i + 1 }));
  }, [users, scope, filterCountry, filterRegion, me]);

  const availableRegions = useMemo(() => {
    const country = scope === "country" ? me.country : filterCountry !== "all" ? filterCountry : null;
    if (!country) return [];
    return [...new Set(users.filter((u) => u.country === country && u.region).map((u) => u.region!))];
  }, [users, filterCountry, scope, me]);

  const myRankInScope = filtered.findIndex((u) => u.id === currentUserId) + 1;
  const myIndexInScope = filtered.findIndex((u) => u.id === currentUserId);
  const playerAhead = myIndexInScope > 0 ? filtered[myIndexInScope - 1] : null;
  const xpGap = playerAhead ? playerAhead.xp - me.xp + 1 : null;
  const meProgress = getXpProgressForCurrentLevel(me.xp);

  const podium = filtered.slice(0, 3);
  const hasPodium = podium.length >= 3;

  const listStart = hasPodium ? 3 : 0;
  const listAll = filtered.slice(listStart);
  const listVisible = listAll.slice(0, Math.max(0, visibleCount - listStart));
  const hasMore = listVisible.length < listAll.length;

  function changeScope(newScope: "global" | "country" | "region") {
    setScope(newScope);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <div>
      {/* Ma carte */}
      {me.rank > 0 && (
        <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-5 mb-6 text-white">
          <div className="flex items-center gap-4">
            <Avatar avatar={me.avatar} name={me.name} size="lg" className="ring-2 ring-white/30" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg truncate">{me.name ?? t("meLabel")}</p>
              <p className="text-white/80 text-sm">{t("levelPrefix")} {me.level} · {me.levelTitle}</p>
              <div className="mt-1.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white/70 text-xs">{meProgress.current} / {meProgress.needed} XP</span>
                  <span className="text-white/70 text-xs">{t("toNextLevel", { level: me.level + 1 })}</span>
                </div>
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden w-40">
                  <div className="h-full bg-white/70 rounded-full transition-all" style={{ width: `${meProgress.percentage}%` }} />
                </div>
              </div>
              {xpGap !== null && playerAhead && (
                <p className="text-white/60 text-[11px] mt-1.5">
                  {t("xpGap", { xp: xpGap.toLocaleString(xpLocale), name: playerAhead.name ?? t("xpGapAnon") })}
                </p>
              )}
            </div>
            <div className="text-center shrink-0">
              <p className="text-3xl font-black">#{myRankInScope > 0 ? myRankInScope : me.rank}</p>
              <p className="text-white/70 text-xs">{t("rankLabel")}</p>
            </div>
          </div>
        </div>
      )}

      {/* Onglets de scope */}
      <div className="flex gap-2 mb-5">
        {([
          { key: "global",  label: t("scopeGlobal") },
          { key: "country", label: `${me.country ? getCountryFlag(me.country) : "🏳️"} ${t("scopeCountry")}` },
          { key: "region",  label: t("scopeRegion") },
        ] as const).map(({ key, label }) => (
          <button key={key} onClick={() => changeScope(key)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition ${
              scope === key ? "bg-primary text-white shadow-md" : "bg-white shadow-soft text-textLight hover:text-textDark"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Filtre pays/région (scope global) */}
      {scope === "global" && (
        <div className="flex gap-3 mb-5">
          <select value={filterCountry} onChange={(e) => { setFilterCountry(e.target.value); setFilterRegion("all"); setVisibleCount(PAGE_SIZE); }}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="all">{t("allCountries")}</option>
            {availableCountries.map((c) => (
              <option key={c} value={c}>{getCountryFlag(c)} {getCountryName(c)}</option>
            ))}
          </select>
          {availableRegions.length > 0 && (
            <select value={filterRegion} onChange={(e) => { setFilterRegion(e.target.value); setVisibleCount(PAGE_SIZE); }}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="all">{t("allRegions")}</option>
              {availableRegions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          )}
        </div>
      )}

      <p className="text-xs text-textLight mb-4 px-1">
        {filtered.length > 1
          ? t("playerCountPlural", { count: filtered.length })
          : t("playerCount", { count: filtered.length })}
      </p>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-soft p-10 text-center">
          <p className="text-3xl mb-2">🏜️</p>
          <p className="text-textLight text-sm">{t("emptyTitle")}</p>
          <p className="text-xs text-textLight mt-1">{t("emptySubtitle")}</p>
        </div>
      ) : (
        <>
          {hasPodium && (
            <Podium users={podium} currentUserId={currentUserId} />
          )}

          <div className="space-y-2">
            {listVisible.map((user, idx) => {
              const isMe = user.id === currentUserId;
              const absoluteRank = listStart + idx + 1;
              const showTop10Separator = absoluteRank === 11 && listStart + idx > 0;
              const progress = getXpProgressForCurrentLevel(user.xp);

              return (
                <div key={user.id}>
                  {showTop10Separator && (
                    <div className="flex items-center gap-3 my-3 px-1">
                      <div className="flex-1 h-px bg-gradient-to-r from-yellow-300 to-yellow-100" />
                      <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">{t("top10Label")}</span>
                      <div className="flex-1 h-px bg-gradient-to-l from-yellow-300 to-yellow-100" />
                    </div>
                  )}

                  <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                    isMe ? "bg-primary/10 border border-primary/20" : "bg-white shadow-soft"
                  }`}>
                    <div className="w-8 flex items-center justify-center shrink-0">
                      <RankBadge rank={user.rank} />
                    </div>

                    <Avatar avatar={user.avatar} name={user.name} size="md" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className={`text-sm font-semibold truncate ${isMe ? "text-primary" : "text-textDark"}`}>
                          {user.name ?? t("anonPlayer")}
                          {isMe && <span className="text-xs font-normal ml-1">{t("meTag")}</span>}
                        </p>
                        {user.isPremium && (
                          <span className="text-[10px] bg-accent/15 text-accent px-1.5 py-0.5 rounded-md font-semibold shrink-0">✨</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-textLight">{t("levelShort")} {user.level} · {user.levelTitle}</span>
                        {user.country && (
                          <span className="text-xs text-textLight">
                            · {getCountryFlag(user.country)} {user.city ?? getCountryName(user.country)}
                          </span>
                        )}
                        {user.bestStreak > 0 && (
                          <span className="text-xs text-warning font-medium">· 🔥 {user.bestStreak}{t("streakSuffix")}</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-primary">{user.xp.toLocaleString(xpLocale)}</p>
                      <p className="text-[10px] text-textLight">XP</p>
                      <div className="w-14 h-1 bg-gray-100 rounded-full overflow-hidden mt-1 ml-auto">
                        <div className="h-full bg-primary/50 rounded-full" style={{ width: `${progress.percentage}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {hasMore && (
            <button
              onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
              className="w-full mt-4 py-3 rounded-2xl bg-white shadow-soft text-sm font-semibold text-textLight hover:text-textDark transition"
            >
              {t("showMore", { count: Math.min(PAGE_SIZE, listAll.length - listVisible.length) })}
            </button>
          )}
        </>
      )}

      <p className="text-center text-xs text-textLight mt-6">
        {t("privacyNote")}{" "}
        <Link href="/settings" className="text-primary underline underline-offset-2">
          {t("privacyLink")}
        </Link>
      </p>
    </div>
  );
}
