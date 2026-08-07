"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LayoutDashboard } from "lucide-react";
import LogoIcon from "@/components/LogoIcon";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const supabase = createClient();
  const { locale, setLocale, t } = useLanguage();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <LogoIcon size={32} />
              <span className="font-display text-xl font-bold tracking-tight text-primary">
                Stage<span className="text-accent">Lumen</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-accent ${
                    isActive ? "text-accent font-semibold" : "text-slate-600"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => setLocale(locale === "en" ? "fr" : "en")}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-accent hover:text-accent transition-all"
              aria-label="Switch language"
            >
              {locale === "en" ? "🇫🇷 FR" : "🇬🇧 EN"}
            </button>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-accent px-3 py-2 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {t("nav.dashboard")}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="rounded-full border border-slate-200 text-slate-600 hover:text-red-500 hover:border-red-200 text-sm font-semibold px-5 py-2.5 transition-all"
                >
                  {t("nav.signOut")}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-700 hover:text-accent px-3 py-2 transition-colors"
                >
                  {t("nav.signIn")}
                </Link>
                <Link
                  href="/login?signUp=true"
                  className="rounded-full bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-5 py-2.5 shadow-lg shadow-orange-500/15 transition-all hover:shadow-orange-500/25 active:scale-[0.98]"
                >
                  {t("nav.getStarted")}
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-100 bg-white px-4 py-4 space-y-3 shadow-lg transition-all">

          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block rounded-lg px-3 py-2.5 text-base font-medium transition-colors hover:bg-slate-50 hover:text-accent ${
                    isActive ? "text-accent bg-slate-50/50 font-semibold" : "text-slate-600"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
          <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
            <button
              onClick={() => setLocale(locale === "en" ? "fr" : "en")}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-accent hover:text-accent transition-all"
              aria-label="Switch language"
            >
              {locale === "en" ? "🇫🇷 FR" : "🇬🇧 EN"}
            </button>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex justify-center rounded-lg border border-slate-200 py-2.5 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {t("nav.signIn")}
            </Link>
            <Link
              href="/login?signUp=true"
              onClick={() => setMobileMenuOpen(false)}
              className="flex justify-center rounded-lg bg-accent py-2.5 text-base font-semibold text-white shadow-md hover:bg-accent-hover transition-colors"
            >
              {t("nav.getStarted")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
