"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { PUBLIC_API_URL } from "@/lib/api";

const navLinks = [
  { href: "/about", label: "About Us" },
  { href: "#", label: "Race Categories", isDropdown: true },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export default function Header({
  eventInfo,
  categories = [],
  sponsors = [],
  user,
}) {
  const pathname = usePathname();
  const titleSponsor = sponsors?.find(
    (s) => s.title?.toLowerCase() === "title sponsor",
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [countdown, setCountdown] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [expandedNav, setExpandedNav] = useState(null);
  const [clientUser, setClientUser] = useState(user);

  useEffect(() => {
    setClientUser(user);
  }, [user]);

  // On every route change, validate the token against the /me API.
  useEffect(() => {
    if (!clientUser) return;

    async function validateToken() {
      try {
        const COOKIE_NAME = 'runnerx-user-token';
        const match = document.cookie.match(new RegExp('(?:^|; )' + COOKIE_NAME + '=([^;]*)'));
        const token = match ? decodeURIComponent(match[1]) : null;

        if (!token) {
          setClientUser(null);
          return;
        }

        // Use the centralized API URL
        const apiUrl = PUBLIC_API_URL;
        
        // If the API URL is local (127.0.0.1) but we're on a different host, 
        // skip validation to avoid cross-origin network errors on remote devices.
        if (apiUrl.includes('127.0.0.1') && !window.location.hostname.includes('127.0.0.1') && !window.location.hostname.includes('localhost')) {
          return;
        }

        const res = await fetch(`${apiUrl}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });

        if (!res.ok) {
          // Token expired or invalid — clear the cookie and reset state
          document.cookie = `${COOKIE_NAME}=; max-age=0; path=/`;
          setClientUser(null);
        }
      } catch (error) {
        // Silently fail network errors (e.g. backend down or unreachable)
        console.warn('Auth validation failed:', error.message);
      }
    }

    validateToken();
  }, [pathname]); // re-validate on every navigation

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const targetDateStr = eventInfo?.dateIso || "2026-11-15T05:30:00+05:30";
    const target = new Date(targetDateStr).getTime();

    const update = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setCountdown("Race Day!");
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${d} days ${h} hours ${m} minutes ${s} seconds`);
    };

    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [eventInfo?.dateIso]);

  return (
    <>
      <div
        className={`fixed inset-x-0 top-0 z-[1001] bg-sky-500 text-white transition-transform duration-300 ${scrolled ? "-translate-y-full" : "translate-y-0"}`}
        >
        <div className="mx-auto flex min-h-[var(--countdown-height)] max-w-[1280px] flex-wrap items-center justify-center gap-x-3 gap-y-1 px-3 py-2.5 text-sm font-semibold uppercase tracking-[0.08em] sm:px-6">
          
        {eventInfo?.headerHighlight ? (
            <div className="flex items-center gap-2">
              {/* <span className="bg-yellow-400 text-sky-900 px-2 py-0.5 rounded text-[10px] font-black">NEW</span> */}
              <span className="font-bold tracking-wider">{eventInfo.headerHighlight}</span>
            </div>
      ) : null}
        </div>
      </div>

      <header
        className="fixed inset-x-0 z-[1000] border-b border-slate-200/70 bg-white/95 shadow-sm backdrop-blur-md transition-all duration-300"
        style={{ top: scrolled ? "0px" : "var(--countdown-height)" }}
      >
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="relative z-[1002] flex items-center"
            aria-label="RunnerX Kota home"
          >
            <img
              src="/images/logo.png"
              alt="Kota"
              className="h-20 w-auto rounded sm:h-22 md:h-24"
            />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => {
              if (link.isDropdown) {
                const isOpen = expandedNav === link.label;
                return (
                  <div key={link.label} className="relative">
                    <button
                      type="button"
                      onClick={() => setExpandedNav(isOpen ? null : link.label)}
                      className={`inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.08em] transition ${pathname.startsWith("/categories") ? "text-[#00a0ff]" : "text-slate-600 hover:text-[#00a0ff]"}`}
                    >
                      {link.label}
                      <span className="text-xs">{isOpen ? "▲" : "▼"}</span>
                    </button>
                    {isOpen && (
                      <div className="absolute left-1/2 top-full mt-2 flex min-w-[240px] -translate-x-1/2 flex-col rounded-b-md border border-slate-200 border-t-2 border-t-[#00a0ff] bg-white py-1 shadow-xl">
                        {categories.map((cat) => (
                          <Link
                            key={cat.slug}
                            href={`/categories/${cat.slug}`}
                            className="border-b border-slate-100 px-5 py-3 text-sm font-semibold uppercase tracking-[0.07em] text-slate-700 transition hover:bg-slate-50 hover:text-[#00a0ff] last:border-b-0"
                          >
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.08em] transition ${pathname === link.href ? "text-[#00a0ff]" : "text-slate-600 hover:text-[#00a0ff]"}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {titleSponsor && (
              <img
                src={
                  titleSponsor.image?.startsWith("/")
                    ? `${PUBLIC_API_URL}${titleSponsor.image}`
                    : titleSponsor.image
                }
                alt={titleSponsor.title || "Sponsor"}
                className="hidden h-16 w-auto rounded bg-white object-contain p-1 sm:block md:h-20"
              />
            )}

            {clientUser ? (
              <>
                <Link
                  href={(process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3002') + "/dashboard"}
                  className="hidden rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold uppercase tracking-[0.08em] text-slate-700 transition hover:bg-slate-200 sm:inline-flex"
                >
                  Hey,{" "}
                  <span className="ml-1 text-sky-600">
                    {clientUser.name.split(" ")[0]}
                  </span>
                </Link>
                <Link
                  href={(process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3002') + "/dashboard"}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#00a0ff] text-sm font-bold text-white shadow sm:hidden"
                  aria-label="Open dashboard"
                >
                  {clientUser.name.charAt(0).toUpperCase()}
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="hidden rounded-full btn-yellow px-5 py-2 text-sm font-semibold uppercase tracking-[0.08em] transition sm:inline-flex"
              >
                Sign In
              </Link>
            )}

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 text-slate-700 lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[1005] bg-slate-900/60 transition-opacity duration-300 lg:hidden ${menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setMenuOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-[1006] w-[82vw] max-w-sm overflow-y-auto bg-white px-5 py-6 shadow-2xl transition-transform duration-300 lg:hidden ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-6 flex items-center justify-between">
          <img
            src="/images/logo.png"
            alt="Kota"
            className="h-20 w-auto rounded"
          />
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 6l12 12M18 6l-12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col">
          {navLinks.map((link) => {
            if (link.isDropdown) {
              const isExpanded = expandedNav === link.label;
              return (
                <div
                  key={link.label}
                  className="border-b border-slate-100 py-1"
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between py-3 text-left text-sm font-semibold uppercase tracking-[0.08em] text-slate-800"
                    onClick={() =>
                      setExpandedNav(isExpanded ? null : link.label)
                    }
                  >
                    {link.label}
                    <span
                      className={`text-xs text-slate-500 transition-transform ${isExpanded ? "rotate-180 text-[#00a0ff]" : ""}`}
                    >
                      ▼
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ${isExpanded ? "grid-rows-[1fr] pb-3" : "grid-rows-[0fr]"}`}
                  >
                    <div className="overflow-hidden pl-2">
                      <div className="flex flex-col gap-2">
                        {categories.map((cat) => (
                          <Link
                            key={cat.slug}
                            href={`/categories/${cat.slug}`}
                            className="py-1 text-sm font-medium text-slate-600 transition hover:text-[#00a0ff]"
                            onClick={() => setMenuOpen(false)}
                          >
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`border-b border-slate-100 py-4 text-sm font-semibold uppercase tracking-[0.08em] ${pathname === link.href ? "text-[#00a0ff]" : "text-slate-800"}`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 border-t border-slate-200 pt-4">
          {clientUser ? (
            <Link
              href={(process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3002') + "/dashboard"}
              className="inline-flex w-full items-center justify-center rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-800 transition hover:bg-slate-200"
              onClick={() => setMenuOpen(false)}
            >
              Open Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-full btn-yellow px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition hover:bg-[#fff29b]"
              onClick={() => setMenuOpen(false)}
            >
              Sign In
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
