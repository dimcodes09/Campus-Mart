"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";
import NotificationBell from "@/components/NotificationBell";
import { PRODUCT_REQUEST_PATH } from "@/constants/productRequest";

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

  const loggedIn = useSyncExternalStore(subscribeToAuthChanges, hasStoredToken, () => false);
  const userSnapshot = useSyncExternalStore(subscribeToAuthChanges, getStoredUser, () => "");
  const user = useMemo(() => {
    if (!userSnapshot) return null;
    try { return JSON.parse(userSnapshot); } catch { return null; }
  }, [userSnapshot]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
    router.push("/login");
  }

  if (pathname === "/reels") return null;

  const linkClass = (href) =>
    `text-sm font-medium transition-all duration-150 px-3 py-1.5 rounded-lg ${
      pathname === href
        ? "bg-indigo-600 text-white shadow-sm"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
    }`;

  const mobileLinkClass = (href) =>
    `px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      pathname === href
        ? "bg-indigo-600 text-white"
        : "text-slate-700 hover:bg-slate-100"
    }`;

  const verificationStatus = () => {
    if (!user) return null;
    if (user.isVerified || user.verificationStatus === "approved") {
      return (
        <span className="hidden lg:flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Verified
        </span>
      );
    }
    if (user.verificationStatus === "pending") {
      return (
        <span className="hidden lg:flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
          ⏳ Pending
        </span>
      );
    }
    return (
      <Link href="/verify" className="hidden lg:flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full hover:bg-red-100 transition-colors">
        ⚠ Verify Now
      </Link>
    );
  };

  const userInitials = user?.name
    ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm shadow-indigo-200">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-bold text-slate-900 text-base tracking-tight" style={{ fontFamily: "Sora, sans-serif" }}>
              Campus<span className="text-indigo-600">Mart</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden sm:flex items-center gap-1">
            <Link href="/" className={linkClass("/")}>Browse</Link>
            <Link href="/categories" className={linkClass("/categories")}>Categories</Link>
            <Link href="/reels" className={linkClass("/reels")}>Reels</Link>
            <Link href={PRODUCT_REQUEST_PATH} className={linkClass(PRODUCT_REQUEST_PATH)}>
              Request Item
            </Link>
            {loggedIn && (
              <Link href="/add-product" className={linkClass("/add-product")}>Sell</Link>
            )}
            {loggedIn && (
              <Link href="/dashboard" className={linkClass("/dashboard")}>Dashboard</Link>
            )}
            {loggedIn && user?.role === "admin" && (
              <Link href="/admin" className={linkClass("/admin")}>Admin</Link>
            )}
          </div>

          {/* Desktop Right */}
          <div className="hidden sm:flex items-center gap-2">
            {verificationStatus()}
            {loggedIn && <NotificationBell />}

            {loggedIn ? (
              <div className="flex items-center gap-2 pl-2.5 ml-0.5 border-l border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{userInitials}</span>
                  </div>
                  {user?.name && (
                    <span className="text-sm font-medium text-slate-700 hidden lg:block max-w-[90px] truncate">
                      {user.name.split(" ")[0]}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-slate-500 hover:text-red-500 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors duration-150"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2.5 ml-0.5 border-l border-slate-100">
                <Link href="/login" className={linkClass("/login")}>Login</Link>
                <Link href="/register" className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg shadow-sm shadow-indigo-200 transition-colors">
                  Join Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="sm:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
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
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-slate-100 bg-white px-4 py-3 flex flex-col gap-1">

          {/* Mobile user card */}
          {loggedIn && user && (
            <div className="flex items-center gap-3 px-3 py-2.5 mb-2 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">{userInitials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{user.name || "Student"}</p>
                <p className="text-xs text-slate-400 truncate">{user.email || ""}</p>
              </div>
              {(user.isVerified || user.verificationStatus === "approved") && (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex-shrink-0">✓</span>
              )}
            </div>
          )}

          <Link href="/" className={mobileLinkClass("/")} onClick={() => setMenuOpen(false)}>Browse</Link>
          <Link href="/categories" className={mobileLinkClass("/categories")} onClick={() => setMenuOpen(false)}>Categories</Link>
          <Link href="/reels" className={mobileLinkClass("/reels")} onClick={() => setMenuOpen(false)}>Reels</Link>
          <Link
            href={PRODUCT_REQUEST_PATH}
            className={mobileLinkClass(PRODUCT_REQUEST_PATH)}
            onClick={() => setMenuOpen(false)}
          >
            Request Item
          </Link>

          {loggedIn && (
            <>
              <Link href="/add-product" className={mobileLinkClass("/add-product")} onClick={() => setMenuOpen(false)}>Sell an Item</Link>
              <Link href="/dashboard" className={mobileLinkClass("/dashboard")} onClick={() => setMenuOpen(false)}>Dashboard</Link>
              {user?.role === "admin" && (
                <Link href="/admin" className={mobileLinkClass("/admin")} onClick={() => setMenuOpen(false)}>Admin</Link>
              )}
              <div className="px-3 py-2">
                <NotificationBell />
              </div>
              <div className="px-3">
                {/* keep original verificationStatus text for mobile */}
                {user && !user.isVerified && user.verificationStatus !== "approved" && user.verificationStatus === "pending" && (
                  <span className="text-amber-600 text-sm">Verification Pending</span>
                )}
                {user && !user.isVerified && user.verificationStatus !== "approved" && user.verificationStatus !== "pending" && (
                  <Link href="/verify" className="text-red-500 text-sm underline" onClick={() => setMenuOpen(false)}>Verify Now</Link>
                )}
              </div>
            </>
          )}

          <div className="mt-2 pt-2 border-t border-slate-100">
            {loggedIn ? (
              <button
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
              >
                Logout
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" className={mobileLinkClass("/login")} onClick={() => setMenuOpen(false)}>Login</Link>
                <Link href="/register" className="px-3 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white text-center hover:bg-indigo-700 transition-colors" onClick={() => setMenuOpen(false)}>
                  Join Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
