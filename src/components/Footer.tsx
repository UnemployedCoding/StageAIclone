"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Send } from "lucide-react";
import LogoIcon from "@/components/LogoIcon";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { t } = useLanguage();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Column 1: Brand Info */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <LogoIcon size={32} />
              <span className="font-display text-xl font-bold tracking-tight text-white">
                Stage<span className="text-accent">Lumen</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              {t("footer.desc")}
            </p>
          </div>

          {/* Column 2: Product links */}
          <div className="col-span-1 md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">{t("footer.product")}</h4>
            <ul className="space-y-2 text-sm font-medium">
              <li>
                <Link href="/" className="hover:text-white transition-colors">{t("nav.home")}</Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-white transition-colors">{t("nav.gallery")}</Link>
              </li>
              <li>
                <Link href="/prices" className="hover:text-white transition-colors">{t("nav.pricing")}</Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-white transition-colors">{t("nav.faq")}</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">{t("footer.contact")}</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Business links */}
          <div className="col-span-1 md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">{t("footer.business")}</h4>
            <ul className="space-y-2 text-sm font-medium">
              <li>
                <Link href="/affiliate" className="hover:text-white transition-colors">{t("footer.affiliates")}</Link>
              </li>
              <li>
                <Link href="/whitelabel" className="hover:text-white transition-colors">{t("footer.whiteLabel")}</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">{t("footer.stayUpdated")}</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t("footer.newsletter")}
            </p>
            {subscribed ? (
              <div className="rounded-xl bg-slate-900 border border-emerald-950 px-4 py-3 text-emerald-400 text-sm font-medium">
                {t("footer.subscribed")}
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder={t("footer.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-grow rounded-xl bg-slate-900 border border-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent transition-colors"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-accent hover:bg-accent-hover px-4 py-2.5 text-white shadow-lg transition-colors flex items-center justify-center"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom footer bar */}
        <div className="mt-16 pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} StageLumen. {t("footer.copyright")}</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">{t("footer.privacy")}</Link>
            <Link href="/terms" className="hover:text-slate-400 transition-colors">{t("footer.terms")}</Link>

          </div>
        </div>
      </div>
    </footer>
  );
}
