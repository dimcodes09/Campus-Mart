"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";
import NotificationBell from "@/components/NotificationBell";

const AUTH_CHANGE_EVENT = "auth-change";

function hasStoredToken() {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("token");
}

function getStoredUser() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("user") || "";
}

function subscribeToAuthChanges(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener(AUTH_CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(AUTH_CHANGE_EVENT, callback);
  };
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const loggedIn = useSyncExternalStore(
    subscribeToAuthChanges,
    hasStoredToken,
    () => false
  );
  const userSnapshot = useSyncExternalStore(
    subscribeToAuthChanges,
    getStoredUser,
    () => ""
  );
  const user = useMemo(() => {
    if (!userSnapshot) return null;

    try {
      return JSON.parse(userSnapshot);
    } catch {
      return null;
    }
  }, [userSnapshot]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
    router.push("/login");
  }

  if (pathname === "/reels") return null;

  const linkClass = (href) =>
    `text-sm font-medium transition-colors duration-150 px-3 py-1.5 rounded-lg ${
      pathname === href
        ? "bg-indigo-600 text-white"
        : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
    }`;

  const verificationStatus = () => {
    if (!user) return null;
    if (user.isVerified || user.verificationStatus === "approved") {
      return <span className="text-green-500 text-sm">Verified Student</span>;
    }
    if (user.verificationStatus === "pending") {
      return <span className="text-amber-600 text-sm">Verification Pending</span>;
    }

    return <Link href="/verify" className="text-red-500 text-sm underline">Verify Now</Link>;
  };

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
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

          <div className="hidden sm:flex items-center gap-2">
            <Link href="/" className={linkClass("/")}>Browse</Link>
            <Link href="/reels" className={linkClass("/reels")}>Reels</Link>

            {loggedIn && (
              <Link href="/add-product" className={linkClass("/add-product")}>
                Sell
              </Link>
            )}

            {loggedIn && user?.role === "admin" && (
              <Link href="/admin" className={linkClass("/admin")}>
                Admin
              </Link>
            )}

            {loggedIn && <NotificationBell />}
            {verificationStatus()}

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

          <button
            className="sm:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

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

                {user?.role === "admin" && (
                  <Link href="/admin" className={linkClass("/admin")} onClick={() => setMenuOpen(false)}>
                    Admin
                  </Link>
                )}

                <div className="px-3 py-2">
                  <NotificationBell />
                </div>

                <div className="px-3">
                  {verificationStatus()}
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
