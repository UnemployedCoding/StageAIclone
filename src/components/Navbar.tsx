"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LayoutDashboard, ChevronDown, Sparkles } from "lucide-react";
import LogoIcon from "@/components/LogoIcon";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const supabase = createClient();
  const { locale, setLocale, t } = useLanguage();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
    };
    fetchUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: unknown, session: { user?: { email?: string } | null } | null) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.gallery"), href: "/gallery" },
    { name: t("nav.pricing"), href: "/prices" },
    { name: t("nav.faq"), href: "/#faq" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Left Group: Logo + Desktop Links (grouped together so they never overlap) */}
          <div className="flex items-center gap-8 xl:gap-10 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <LogoIcon size={32} />
              <span className="font-display text-xl font-bold tracking-tight text-primary whitespace-nowrap">
                Stage<span className="text-accent">Lumen</span>
              </span>
            </Link>

            {/* Desktop Navigation links (xl+) */}
            <nav className="hidden xl:flex items-center gap-6 xl:gap-8 shrink-0">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-sm font-medium transition-colors hover:text-accent whitespace-nowrap ${
                      isActive ? "text-accent font-semibold" : "text-slate-600"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Desktop Right CTA actions (xl+) */}
          <div className="hidden xl:flex items-center gap-3 xl:gap-4 shrink-0">
            <div className="relative shrink-0" ref={langMenuRef}>
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-accent hover:text-accent transition-all whitespace-nowrap cursor-pointer"
                aria-label="Switch language"
              >
                {locale === "en" ? "🇬🇧 EN" : "🇫🇷 FR"}
                <ChevronDown className={`h-3 w-3 transition-transform ${langMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 rounded-xl border border-slate-100 bg-white shadow-lg py-1 z-50">
                  <button
                    onClick={() => { setLocale("en"); setLangMenuOpen(false); }}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                      locale === "en" ? "text-accent bg-orange-50" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    🇬🇧 English
                  </button>
                  <button
                    onClick={() => { setLocale("fr"); setLangMenuOpen(false); }}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                      locale === "fr" ? "text-accent bg-orange-50" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    🇫🇷 Français
                  </button>
                </div>
              )}
            </div>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-accent px-3 py-2 transition-colors whitespace-nowrap shrink-0"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {t("nav.dashboard")}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="rounded-full border border-slate-200 text-slate-600 hover:text-red-500 hover:border-red-200 text-sm font-semibold px-4.5 py-2 transition-all whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {t("nav.signOut")}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/gallery"
                  className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 text-accent hover:bg-orange-100 hover:border-orange-300 text-sm font-bold px-3.5 py-2 shadow-sm transition-all hover:scale-105 active:scale-95 whitespace-nowrap shrink-0"
                >
                  <Sparkles className="h-3.5 w-3.5 fill-current animate-pulse text-accent" />
                  <span>{t("nav.seeDemo")}</span>
                </Link>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-accent px-3 py-2 transition-colors whitespace-nowrap shrink-0"
                >
                  {t("nav.signIn")}
                </Link>
                <Link
                  href="/prices"
                  className="rounded-full bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-4.5 py-2 shadow-lg shadow-orange-500/15 transition-all hover:shadow-orange-500/25 active:scale-[0.98] whitespace-nowrap shrink-0"
                >
                  {t("nav.subscribe")}
                </Link>
              </>
            )}
          </div>

          {/* Compact Tablet/Mobile Controls (< xl) */}
          <div className="flex xl:hidden items-center gap-2.5 shrink-0">
            <button
              onClick={() => { setLocale(locale === "en" ? "fr" : "en"); }}
              className="flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600 hover:border-accent hover:text-accent transition-all cursor-pointer"
              title="Toggle Language"
            >
              {locale === "en" ? "🇬🇧 EN" : "🇫🇷 FR"}
            </button>

            {!user && (
              <Link
                href="/prices"
                className="rounded-full bg-accent hover:bg-accent-hover text-white text-xs font-bold px-3.5 py-1.5 shadow-sm transition-all whitespace-nowrap"
              >
                {t("nav.subscribe")}
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Menu Drawer (< xl) */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-6 space-y-4 shadow-xl">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block rounded-lg px-3 py-2.5 text-base font-medium transition-colors ${
                    isActive ? "text-accent bg-orange-50 font-semibold" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
          <div className="border-t border-slate-100 pt-3 flex flex-col gap-2.5">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-orange-50 text-accent font-semibold py-2.5 text-base"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {t("nav.dashboard")}
                </Link>
                <button
                  onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                  className="flex justify-center rounded-lg border border-slate-200 py-2.5 text-base font-semibold text-slate-600 hover:text-red-500 transition-colors cursor-pointer"
                >
                  {t("nav.signOut")}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/gallery"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 py-2.5 text-base font-bold text-accent hover:bg-orange-100 transition-colors"
                >
                  <Sparkles className="h-4 w-4 fill-current animate-pulse text-accent" />
                  <span>{t("nav.seeDemo")}</span>
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-center rounded-lg border border-slate-200 py-2.5 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {t("nav.signIn")}
                </Link>
                <Link
                  href="/prices"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-center rounded-lg bg-accent py-2.5 text-base font-semibold text-white shadow-md hover:bg-accent-hover transition-colors"
                >
                  {t("nav.subscribe")}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
