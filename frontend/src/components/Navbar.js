"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import NotificationBell from "@/components/NotificationBell";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [loggedIn, setLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("token"));
  }, [pathname]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setLoggedIn(false);
    router.push("/login");
  }

  // Hide navbar on reels page
  if (pathname === "/reels") return null;

  const linkClass = (href) =>
    `text-sm font-medium transition-colors duration-150 px-3 py-1.5 rounded-lg ${
      pathname === href
        ? "bg-indigo-600 text-white"
        : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
    }`;

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Bar */}
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-bold text-slate-900 text-base tracking-tight" style={{ fontFamily: "Sora, sans-serif" }}>
              Campus<span className="text-indigo-600">Mart</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden sm:flex items-center gap-2">

            <Link href="/" className={linkClass("/")}>Browse</Link>

            <Link href="/reels" className={linkClass("/reels")}>
              <span className="flex items-center gap-1.5">
                🎬 Reels
              </span>
            </Link>

            {loggedIn && (
              <Link href="/add-product" className={linkClass("/add-product")}>
                Sell
              </Link>
            )}

            {/* 🔔 Notification Bell */}
            {loggedIn && <NotificationBell />}

            {loggedIn ? (
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-slate-600 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors duration-150"
              >
                Logout
              </button>
            ) : (
              <>
                <Link href="/login" className={linkClass("/login")}>Login</Link>
                <Link href="/register" className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700">
                  Join Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="sm:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="sm:hidden pb-4 flex flex-col gap-1">

            <Link href="/" className={linkClass("/")} onClick={() => setMenuOpen(false)}>
              Browse
            </Link>

            <Link href="/reels" className={linkClass("/reels")} onClick={() => setMenuOpen(false)}>
              Reels
            </Link>

            {loggedIn && (
              <>
                <Link href="/add-product" className={linkClass("/add-product")} onClick={() => setMenuOpen(false)}>
                  Sell
                </Link>

                <div className="px-3 py-2">
                  <NotificationBell />
                </div>
              </>
            )}

            {loggedIn ? (
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="text-sm font-medium text-red-500 px-3 py-1.5 text-left rounded-lg hover:bg-red-50"
              >
                Logout
              </button>
            ) : (
              <>
                <Link href="/login" className={linkClass("/login")} onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <Link href="/register" className="mx-3 mt-2 bg-indigo-600 text-white text-center py-2 rounded-lg text-sm font-medium">
                  Join Free
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
