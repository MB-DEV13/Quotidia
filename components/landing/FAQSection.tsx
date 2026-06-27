"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { config } from "@/lib/config";

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  const t = useTranslations("landing.faq");
  const FAQS = (t.raw("items") as Array<{ q: string; a: string }>).map((item) => ({
    q: item.q,
    a: item.a.replace("{appName}", config.app.name),
  }));

  return (
    <section className="px-4 py-20 bg-background">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-[#5B5EA6] uppercase tracking-widest mb-3">
            {t("badge")}
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            {t("title")}
          </h2>
          <p className="text-gray-500">
            {t("subtitle")}
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden transition-all"
            >
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-sm font-semibold text-gray-800 pr-4">
                  {faq.q}
                </span>
                <span
                  className={`text-[#5B5EA6] text-lg font-bold flex-shrink-0 transition-transform duration-200 ${open === i ? "rotate-45" : ""}`}
                >
                  +
                </span>
              </button>
              {open === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
