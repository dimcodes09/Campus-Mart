import Link from "next/link";

const links = {
  product: [
    { label: "Browse Items", href: "/" },
    { label: "Rent", href: "/categories" },
    { label: "Sell", href: "/add-product" },
    { label: "Categories", href: "/categories" },
    { label: "Reels", href: "/reels" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "How it Works", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Privacy Policy", href: "#" },
  ],
  features: [
    { label: "Verified Students", icon: "✓" },
    { label: "Secure Chat", icon: "🔒" },
    { label: "Return Tracking", icon: "📦" },
    { label: "Campus-only Access", icon: "🎓" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Main Row ── */}
        <div className="py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm shadow-indigo-200 flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="font-bold text-slate-900 text-sm tracking-tight" style={{ fontFamily: "Sora, sans-serif" }}>
                Campus<span className="text-indigo-600">Mart</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Smart marketplace for students to buy, sell, and rent essentials safely on campus.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Campus Verified
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-full">
                🎓 Students Only
              </span>
            </div>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">Product</p>
            <ul className="space-y-2">
              {links.product.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-xs text-slate-500 hover:text-indigo-600 hover:underline underline-offset-2 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">Company</p>
            <ul className="space-y-2">
              {links.company.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-xs text-slate-500 hover:text-indigo-600 hover:underline underline-offset-2 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Why CampusMart */}
          <div>
            <p className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">Why CampusMart</p>
            <ul className="space-y-2">
              {links.features.map((f) => (
                <li key={f.label} className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="text-sm leading-none w-4 flex-shrink-0">{f.icon}</span>
                  {f.label}
                </li>
              ))}
            </ul>

            {/* Mini stats */}
            <div className="mt-5 grid grid-cols-2 gap-2">
              {[
                { val: "2k+", label: "Students" },
                { val: "500+", label: "Listings" },
                { val: "98%", label: "Safe deals" },
                { val: "4.9★", label: "Rating" },
              ].map((s) => (
                <div key={s.label} className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-center">
                  <p className="text-sm font-bold text-indigo-600">{s.val}</p>
                  <p className="text-xs text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <p className="text-xs text-slate-400">© 2026 CampusMart. All rights reserved.</p>
            <span className="hidden sm:block text-slate-200">|</span>
            <Link href="#" className="hidden sm:block text-xs text-slate-400 hover:text-indigo-600 transition-colors">Terms</Link>
            <Link href="#" className="hidden sm:block text-xs text-slate-400 hover:text-indigo-600 transition-colors">Privacy</Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 mr-1">Built for students</span>
            {[
              {
                label: "GitHub",
                path: "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z",
              },
              {
                label: "LinkedIn",
                path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
              },
              {
                label: "Twitter",
                path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z",
              },
            ].map((s) => (
              <a key={s.label} href="#" aria-label={s.label}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 transition-colors duration-150">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}