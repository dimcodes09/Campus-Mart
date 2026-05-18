"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/services/api";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import CATEGORIES from "@/constants/categories";
import { PRODUCT_REQUEST_PATH } from "@/constants/productRequest";

/* ─── animations ─── */
const heroCSS = `
@keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
.au1{animation:fadeUp .5s ease both}
.au2{animation:fadeUp .5s .1s ease both}
.au3{animation:fadeUp .5s .2s ease both}
.au4{animation:fadeUp .5s .3s ease both}
.float-anim{animation:floatY 3.5s ease-in-out infinite}
.shimmer{background:linear-gradient(90deg,#f1f5f9 25%,#e8edf5 50%,#f1f5f9 75%);background-size:600px 100%;animation:shimmer 1.3s infinite}
.cat-card{position:relative;flex-shrink:0;width:200px;height:260px;border-radius:24px;overflow:hidden;cursor:pointer;transition:transform .35s cubic-bezier(.34,1.56,.64,1),box-shadow .35s ease;box-shadow:0 4px 20px rgba(0,0,0,.18)}
.cat-card:hover{transform:translateY(-6px) scale(1.03);box-shadow:0 16px 40px rgba(0,0,0,.28)}
.cat-card-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
.cat-card:hover .cat-card-img{transform:scale(1.08)}
.cat-card-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.82) 0%,rgba(0,0,0,.3) 55%,rgba(0,0,0,.05) 100%)}
.cat-card-body{position:absolute;bottom:0;left:0;right:0;padding:18px 16px 20px}
.cat-explore{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.15);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.3);color:#fff;font-size:11px;font-weight:700;letter-spacing:.06em;padding:5px 12px;border-radius:50px;margin-top:8px;opacity:0;transform:translateY(6px);transition:opacity .25s ease,transform .25s ease}
.cat-card:hover .cat-explore{opacity:1;transform:translateY(0)}
.cat-placeholder{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:56px}
`;

/* ─── static data ─── */
const trustPills = [
  { d:"M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", label:"Verified IDs" },
  { d:"M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", label:"Secure chat" },
  { d:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", label:"Return tracking" },
  { d:"M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z", label:"Campus-only" },
];

const features = [
  { icon:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", bg:"bg-indigo-50", tc:"text-indigo-600", title:"Rent for a few days", desc:"Flexible rentals that fit your needs." },
  { icon:"M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", bg:"bg-violet-50", tc:"text-violet-600", title:"Chat with verified students", desc:"Connect safely within your campus." },
  { icon:"M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", bg:"bg-emerald-50", tc:"text-emerald-600", title:"Track returns & deposits", desc:"Real-time tracking for peace of mind." },
];

/* ─── App Mockup ─── */
function AppMockup() {
  return (
    <div className="float-anim relative items-start justify-center hidden lg:flex" style={{width:340,height:480}}>
      {/* Trust card */}
      <div className="absolute left-0 top-20 z-20 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 w-44"
        style={{animation:"fadeUp .6s .5s ease both"}}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Trust Score</p>
            <p className="text-xl font-extrabold text-slate-900 leading-none">4.9 <span className="text-xs font-normal text-slate-400">/ 5</span></p>
          </div>
        </div>
        <p className="text-xs text-slate-500 font-semibold mb-2">Verified Student</p>
        <div className="flex -space-x-1.5 mb-1">
          {["#6366f1","#f59e0b","#10b981"].map((c,i)=>(
            <div key={i} className="w-6 h-6 rounded-full border-2 border-white" style={{background:c}}/>
          ))}
        </div>
        <p className="text-xs text-slate-400">230+ reviews</p>
      </div>

      {/* Phone */}
      <div className="relative z-10 mx-auto bg-white rounded-[28px] shadow-2xl border border-slate-200 overflow-hidden"
        style={{width:230,minHeight:460}}>
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <span className="text-xs font-bold text-slate-700">9:41</span>
          <div className="flex gap-1"><div className="w-3 h-1.5 bg-slate-700 rounded-sm"/><div className="w-1 h-1.5 bg-slate-300 rounded-sm"/></div>
        </div>
        <div className="px-4 pb-2 flex items-start justify-between">
          <div>
            <p className="text-sm font-bold text-slate-900">Hello, Ankit 👋</p>
            <p className="text-xs text-slate-500">📍 SS Hostel, Room 203</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-xs font-bold text-indigo-700">AK</span>
          </div>
        </div>
        <div className="px-3 mb-3">
          <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2">
            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span className="text-xs text-slate-400">Search items or category...</span>
          </div>
        </div>
        <div className="px-3 mb-2 flex justify-between">
          <p className="text-xs font-bold text-slate-900">Trending Near You</p>
          <span className="text-xs text-indigo-600 font-medium">View all</span>
        </div>
        <div className="px-3 flex gap-2 mb-3">
          {[{name:"Cooler",price:"₹120/day"},{name:"Lab Coat",price:"₹80/day"}].map((item,i)=>(
            <div key={i} className="flex-1 bg-slate-50 rounded-xl p-2 border border-slate-100">
              <div className="h-12 bg-slate-200 rounded-lg mb-1.5 flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
              </div>
              <p className="text-xs font-semibold text-slate-800">{item.name}</p>
              <span className="text-xs text-emerald-600 font-medium">✓ Verified</span>
              <p className="text-xs font-bold text-indigo-700">{item.price}</p>
            </div>
          ))}
        </div>
        <div className="px-3">
          <p className="text-xs font-bold text-slate-900 mb-1.5">Active Rental</p>
          <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-xl p-2.5 shadow-sm">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">Casio fx-991</p>
              <span className="text-xs text-amber-600 font-medium">Due in 3 days</span>
            </div>
            <div className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-lg">2 days</div>
          </div>
        </div>
      </div>

      {/* Chat card */}
      <div className="absolute right-0 top-10 z-20 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 w-44"
        style={{animation:"fadeUp .6s .7s ease both"}}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-xs font-bold text-indigo-700">RS</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Rahul Sharma</p>
            <p className="text-xs text-emerald-500 font-medium">Online</p>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="bg-slate-100 rounded-xl rounded-tl-none p-2"><p className="text-xs text-slate-700">Is the cooler still available?</p></div>
          <div className="bg-indigo-600 rounded-xl rounded-tr-none p-2 ml-3"><p className="text-xs text-white">Yes! You can rent it.</p></div>
          <div className="bg-slate-100 rounded-xl rounded-tl-none p-2"><p className="text-xs text-slate-700">Can I come see it today?</p></div>
        </div>
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-400 flex-1">Type a message...</span>
          <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ─── */
function HomePageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const syncSearchId = window.setTimeout(() => {
      setSearch(searchParams.get("search") || "");
    }, 0);

    return () => window.clearTimeout(syncSearchId);
  }, [searchParams]);

  useEffect(() => {
    api.get("/products", { params: { status: "available" } })
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : res.data.data || res.data.products || [];
        setProducts(list);
      })
      .catch(() => setError("Failed to load products. Make sure the backend is running."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()));

  function scrollToListings(e) {
    e.preventDefault();
    document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <style>{heroCSS}</style>

      {/* ══ HERO ══ */}
      <section className="rounded-3xl bg-gradient-to-br from-slate-50 via-white to-indigo-50/60 border border-slate-100 mb-8 flex flex-col lg:flex-row items-center gap-10 lg:gap-4 relative overflow-hidden px-8 md:px-12 pt-12 pb-14">
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-indigo-100/50 blur-3xl"/>
        <div className="pointer-events-none absolute -bottom-20 -left-10 w-64 h-64 rounded-full bg-violet-100/40 blur-3xl"/>

        {/* Copy */}
        <div className="flex-1 max-w-xl relative z-10">
          <span className="au1 inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 border border-indigo-100">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
            Verified student marketplace for hostels
          </span>
          <h1 className="au2 text-4xl md:text-5xl font-extrabold text-slate-900 leading-[1.15] mb-4">
            Rent, Buy, and Sell<br/>
            <span className="text-indigo-600">Student Essentials</span><br/>
            Safely
          </h1>
          <p className="au3 text-slate-500 text-base md:text-lg mb-8 leading-relaxed">
            From coolers and lab coats to books and calculators —<br className="hidden sm:block"/>
            find trusted items from verified students near your hostel.
          </p>
          <div className="au4 flex flex-wrap gap-3 mb-8">
            <a href="#listings" onClick={scrollToListings}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-7 py-3 rounded-xl text-sm shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all duration-200">
              Explore Items
            </a>
            <Link href="/add-product"
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-semibold px-7 py-3 rounded-xl text-sm border border-slate-200 hover:border-indigo-300 hover:-translate-y-0.5 transition-all duration-200">
              Post an Item
            </Link>
            <Link
              href={PRODUCT_REQUEST_PATH}
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-semibold px-7 py-3 rounded-xl text-sm border border-slate-200 hover:border-indigo-300 hover:-translate-y-0.5 transition-all duration-200"
            >
              Request an Item
            </Link>
            {/* ── NEW: Browse Categories button ── */}
            <Link href="/categories"
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-semibold px-7 py-3 rounded-xl text-sm border border-slate-200 hover:border-indigo-300 hover:-translate-y-0.5 transition-all duration-200">
              Browse Categories →
            </Link>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {trustPills.map((t,i) => (
              <div key={i} className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                <svg className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={t.d}/>
                </svg>
                {t.label}
              </div>
            ))}
          </div>
        </div>

        {/* Mockup */}
        <div className="flex-shrink-0 flex justify-center items-center w-full lg:w-auto" style={{minWidth:340}}>
          <AppMockup/>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {features.map((f,i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-start gap-4 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${f.bg}`}>
              <svg className={`w-5 h-5 ${f.tc}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={f.icon}/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 mb-0.5">{f.title}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ══ CATEGORY CARDS ══ */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Shop by Category</h2>
            <p className="text-sm text-slate-400 mt-0.5">Browse what students near you are offering</p>
          </div>
          <Link href="/categories" className="text-sm text-indigo-600 font-semibold hover:underline flex items-center gap-1">
            View all →
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {CATEGORIES.map((cat) => (
            <Link key={cat.slug} href={`/category/${cat.slug}`} className="cat-card" style={{ textDecoration: "none" }}>
              {/* background */}
              {cat.imageUrl ? (
                <img src={cat.imageUrl} alt={cat.name} className="cat-card-img" />
              ) : (
                <div className="cat-placeholder" style={{ background: cat.gradientBg || "linear-gradient(135deg,#667eea,#764ba2)" }}>
                  {cat.emoji || cat.name.charAt(0)}
                </div>
              )}
              {/* dark gradient overlay */}
              <div className="cat-card-overlay" />
              {/* text body */}
              <div className="cat-card-body">
                <p className="text-white text-lg font-extrabold leading-tight" style={{ textShadow: "0 1px 6px rgba(0,0,0,.5)" }}>{cat.name}</p>
                <p className="text-white/70 text-xs font-medium mt-0.5 uppercase tracking-widest">{cat.count ? `${cat.count} ITEMS` : "EXPLORE"}</p>
                <span className="cat-explore">EXPLORE →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══ LISTINGS ══ */}
      <section id="listings">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">All Listings</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {loading ? "Loading..." : `${filtered.length} item${filtered.length !== 1 ? "s" : ""} available`}
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" placeholder="Search products..." value={search}
              onChange={e => {
                const val = e.target.value; setSearch(val);
                const p = new URLSearchParams(searchParams.toString());
                val ? p.set("search", val) : p.delete("search");
                router.replace(`/?${p.toString()}`, { scroll: false });
              }}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-shadow"
            />
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm mb-6">{error}</div>}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_,i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="h-44 shimmer"/>
                <div className="p-4 space-y-3">
                  <div className="h-4 shimmer rounded-lg w-3/4"/>
                  <div className="h-4 shimmer rounded-lg w-1/2"/>
                  <div className="h-10 shimmer rounded-xl"/>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-24 bg-white rounded-2xl border border-slate-100">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <p className="text-slate-700 font-bold text-lg">No products found</p>
            <p className="text-slate-400 text-sm mt-1">Be the first to list an item!</p>
            <Link href="/add-product" className="inline-block mt-5 bg-indigo-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200">
              Add Product
            </Link>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-10">
            {filtered.map(product => (
              <ProductCard
                key={product._id}
                product={product}
                onDeleted={(deletedId) =>
                  setProducts((prev) => prev.filter((p) => p._id !== deletedId))
                }
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default function HomePage() {
  return <Suspense fallback={null}><HomePageInner/></Suspense>;
}
