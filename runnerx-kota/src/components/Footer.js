import Link from "next/link";

export default function Footer({ eventInfo }) {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-[1280px] px-4 pb-8 pt-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 xl:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center">
              <img
                src="/images/logo-footer.png"
                alt="Kota"
                className="h-28 w-auto sm:h-36"
                style={{ mixBlendMode: 'screen' }}
              />
            </div>
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
            <div className="flex flex-col gap-3 text-sm font-bold uppercase text-white">
              <Link href="/about" className="transition hover:text-[#1a8ab4]">
                About the Event
              </Link>
              {/* <Link
                href="/categories"
                className="transition hover:text-[#1a8ab4]"
              >
                Race Categories
              </Link> */}
              {/* <Link href="/route" className="transition hover:text-[#1a8ab4]">
                Route & Venue
              </Link> */}
              <Link href="/gallery" className="transition hover:text-[#1a8ab4]">
                Gallery
              </Link>
              <Link href="/event-rules" className="transition hover:text-[#1a8ab4]">
                Event Rules
              </Link>
              <Link href="/philanthropy" className="transition hover:text-[#1a8ab4]">
                Philanthropy
              </Link>
            </div>
          </div>

          <div>
            <div className="flex flex-col gap-3 text-sm font-bold uppercase text-white">
              <Link href="/contact" className="transition hover:text-[#1a8ab4]">
                Contact Us
              </Link>
              <Link href="/refund" className="transition hover:text-[#1a8ab4]">
                Refund Policy
              </Link>
              <Link href="/waiver" className="transition hover:text-[#1a8ab4]">
                Waiver
              </Link>
              <Link
                href="/medical-advisory"
                className="transition hover:text-[#1a8ab4]"
              >
                Medical Advisory
              </Link>
            </div>
          </div>

        </div>

        <div className="uppercase mt-10 flex flex-col gap-4 border-t border-slate-800 pt-6 text-sm font-bold text-white sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Kota Half Marathon. All Rights Reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/privacy-policy"
              className="transition hover:text-[#00a0ff]"
            >
              Privacy Policy
            </Link>
            <span className="text-slate-700">|</span>
            <Link href="/terms" className="transition hover:text-[#00a0ff]">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
