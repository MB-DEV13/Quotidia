"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { COUNTRIES } from "@/lib/countries";
import { LOCATIONS } from "@/lib/locations";

interface LocationPickerProps {
  country: string;
  setCountry: (v: string) => void;
  region: string;
  setRegion: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
}

export function LocationPicker({
  country, setCountry,
  region, setRegion,
  city, setCity,
}: LocationPickerProps) {
  const t = useTranslations("ui.locationPicker");
  const locationData = country ? LOCATIONS[country] : null;
  const regions = locationData?.regions ?? [];
  const regionLabel = locationData?.regionLabel ?? t("region");

  const selectedRegion = regions.find((r) => r.name === region);
  const cities = selectedRegion?.cities ?? [];

  // Réinitialise région + ville quand le pays change
  useEffect(() => {
    setRegion("");
    setCity("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  // Réinitialise ville quand la région change
  useEffect(() => {
    setCity("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region]);

  return (
    <div className="space-y-3">
      {/* Pays */}
      <div>
        <label className="block text-xs font-medium text-textLight mb-1">{t("country")}</label>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
        >
          <option value="">{t("countrySelect")}</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Région / Département — visible seulement si pays sélectionné */}
      {country && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-textLight mb-1">{regionLabel}</label>
            {regions.length > 0 ? (
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
              >
                <option value="">{t("select")}</option>
                {regions.map((r) => (
                  <option key={r.name} value={r.name}>{r.name}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder={t("region")}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            )}
          </div>

          {/* Ville — visible seulement si région sélectionnée */}
          <div>
            <label className="block text-xs font-medium text-textLight mb-1">{t("city")}</label>
            {region && cities.length > 0 ? (
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
              >
                <option value="">{t("select")}</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={t("city")}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
