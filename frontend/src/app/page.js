"use client";
import { useEffect, useState } from "react";
import api from "@/services/api";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await api.get("/products");
        const list = Array.isArray(res.data) ? res.data : res.data.data || res.data.products || [];
        setProducts(list);
      } catch {
        setError("Failed to load products. Make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filtered = products.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 rounded-3xl p-8 md:p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-64 h-64 rounded-full bg-white"></div>
          <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-amber-400"></div>
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-wide">
            🎓 Campus Marketplace
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-3" style={{ fontFamily: "Sora, sans-serif" }}>
            Buy, Sell & Rent<br />on Campus
          </h1>
          <p className="text-indigo-200 text-base md:text-lg mb-6">
            The smartest way for students to trade everything from textbooks to tech.
          </p>
          <Link
            href="/add-product"
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-semibold px-6 py-3 rounded-xl text-sm transition-colors duration-150"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            List Your Item
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: "Sora, sans-serif" }}>All Listings</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {loading ? "Loading..." : `${filtered.length} item${filtered.length !== 1 ? "s" : ""} available`}
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
              <div className="h-36 bg-slate-100"></div>
              <div className="p-5 space-y-3">
                <div className="h-4 bg-slate-100 rounded-lg w-3/4"></div>
                <div className="h-4 bg-slate-100 rounded-lg w-1/2"></div>
                <div className="h-10 bg-slate-100 rounded-xl mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-slate-700 font-semibold text-lg">No products found</p>
          <p className="text-slate-400 text-sm mt-1">Be the first to list an item!</p>
          <Link href="/add-product" className="inline-block mt-4 bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors">
            Add Product
          </Link>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}