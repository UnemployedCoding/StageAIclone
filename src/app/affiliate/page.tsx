"use client";

import React, { useState } from "react";
import { Percent, DollarSign, Award, Users, Send } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function AffiliatePage() {
  const { t } = useLanguage();
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [sent, setSent] = useState(false);

  const benefits = [
    {
      icon: <Percent className="h-6 w-6 text-accent" />,
      title: t("affiliate.b1Title"),
      description: t("affiliate.b1Desc"),
    },
    {
      icon: <DollarSign className="h-6 w-6 text-accent" />,
      title: t("affiliate.b2Title"),
      description: t("affiliate.b2Desc"),
    },
    {
      icon: <Award className="h-6 w-6 text-accent" />,
      title: t("affiliate.b3Title"),
      description: t("affiliate.b3Desc"),
    },
    {
      icon: <Users className="h-6 w-6 text-accent" />,
      title: t("affiliate.b4Title"),
      description: t("affiliate.b4Desc"),
    },
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent("Contact from Affiliate Page");
    const body = encodeURIComponent(
      `Name: ${contactName}\nEmail: ${contactEmail}\n\nMessage:\n${contactMessage}`
    );
    window.location.href = `mailto:contact@stagelumen.com?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <div className="bg-slate-50 py-20 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-primary tracking-tight">
            {t("affiliate.title")}
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed">
            {t("affiliate.subtitle")}
          </p>
          <div className="pt-4">
            <a
              href="mailto:affiliates@stagelumen.com?subject=StageLumen%20Affiliate%20Partner%20Application"
              className="inline-block rounded-full bg-accent hover:bg-accent-hover text-white font-bold px-8 py-4 shadow-lg shadow-orange-500/20 transition-all text-base"
            >
              {t("affiliate.cta")}
            </a>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-8 space-y-4 shadow-sm">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50">
                {benefit.icon}
              </span>
              <h3 className="text-lg font-bold text-primary">{benefit.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* Staging details */}
        <div className="bg-primary text-white rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(255,101,0,0.1),transparent_50%)]" />
          <div className="max-w-2xl space-y-6 relative">
            <h2 className="font-display text-3xl font-bold tracking-tight">{t("affiliate.howTitle")}</h2>
            <div className="space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p>{t("affiliate.s1")}</p>
              <p>{t("affiliate.s2")}</p>
              <p>{t("affiliate.s3")}</p>
            </div>
          </div>
        </div>

        {/* Contact Us */}
        <div className="max-w-2xl mx-auto">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm space-y-8">
            <div className="text-center space-y-2">
              <h2 className="font-display text-3xl font-bold text-primary tracking-tight">
                {t("affiliate.contactTitle")}
              </h2>
            </div>

            {sent ? (
              <div className="rounded-2xl bg-green-50 border border-green-200 p-6 text-center">
                <p className="text-green-700 font-medium">{t("affiliate.contactSuccess")}</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-semibold text-primary mb-1.5">
                    {t("affiliate.contactName")}
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-primary placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-semibold text-primary mb-1.5">
                    {t("affiliate.contactEmail")}
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-primary placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="contact-message" className="block text-sm font-semibold text-primary mb-1.5">
                    {t("affiliate.contactMessage")}
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={5}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-primary placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-accent hover:bg-accent-hover text-white font-bold px-8 py-4 shadow-lg shadow-orange-500/20 transition-all text-base"
                >
                  <Send className="h-4 w-4" />
                  {t("affiliate.contactSend")}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

