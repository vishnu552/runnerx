import Link from "next/link";

export default function Footer({ eventInfo }) {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-[1280px] px-4 pb-8 pt-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center">
              <img
                src="/images/logo.png"
                alt="Kota"
                className="h-20 w-auto rounded sm:h-24"
              />
            </div>
            <p className="max-w-sm text-sm leading-7 text-slate-300">
              {eventInfo.tagline}. Join {eventInfo.expectedParticipants} runners
              in the {eventInfo.edition} of Kota&apos;s biggest marathon event.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href={eventInfo.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-slate-200 transition hover:border-[#1a8ab4] hover:text-[#1a8ab4]"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c.796 0 1.441.645 1.441 1.44s-.645 1.44-1.441 1.44c-.795 0-1.439-.645-1.439-1.44s.644-1.44 1.439-1.44z" />
                </svg>
              </a>
              <a
                href={eventInfo.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-slate-200 transition hover:border-[#1a8ab4] hover:text-[#1a8ab4]"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </a>
              <a
                href={eventInfo.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-slate-200 transition hover:border-[#1a8ab4] hover:text-[#1a8ab4]"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-[0.12em] text-[#1a8ab4]">
              About
            </h4>
            <div className="flex flex-col gap-3 text-sm text-slate-300">
              <Link href="/about" className="transition hover:text-[#1a8ab4]">
                About the Event
              </Link>
              <Link
                href="/categories"
                className="transition hover:text-[#1a8ab4]"
              >
                Race Categories
              </Link>
              <Link href="/route" className="transition hover:text-[#1a8ab4]">
                Route & Venue
              </Link>
              <Link href="/gallery" className="transition hover:text-[#1a8ab4]">
                Gallery
              </Link>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-[0.12em] text-[#1a8ab4]">
              Resources
            </h4>
            <div className="flex flex-col gap-3 text-sm text-slate-300">
              <Link href="/faq" className="transition hover:text-[#1a8ab4]">
                FAQ
              </Link>
              <Link href="/contact" className="transition hover:text-[#1a8ab4]">
                Contact Us
              </Link>
              <Link
                href="/privacy-policy"
                className="transition hover:text-[#1a8ab4]"
              >
                Privacy Policy
              </Link>
              <Link href="/terms" className="transition hover:text-[#1a8ab4]">
                Terms & Conditions
              </Link>
              <Link
                href="/medical-advisory"
                className="transition hover:text-[#1a8ab4]"
              >
                Medical Advisory
              </Link>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-[0.12em] text-[#1a8ab4]">
              Contact
            </h4>
            <div className="flex flex-col gap-4 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-800 text-sky-400">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <span>{eventInfo.email}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-800 text-sky-400">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <span>{eventInfo.phone}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-800 text-sky-400">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <span>{eventInfo.location}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-slate-800 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 {eventInfo.name}. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/privacy-policy"
              className="transition hover:text-[#00a0ff]"
            >
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition hover:text-[#00a0ff]">
              Terms & Conditions
            </Link>
            <Link
              href="/medical-advisory"
              className="transition hover:text-[#00a0ff]"
            >
              Medical Advisory
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
