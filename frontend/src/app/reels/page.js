"use client";
import { useEffect, useState, useRef } from "react";
import api from "@/services/api";
import ReelCard from "@/components/ReelCard";
import Link from "next/link";

export default function ReelsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await api.get("/products");
        const list = Array.isArray(res.data) ? res.data : res.data.data || res.data.products || [];
        setProducts(list);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    function onScroll() {
      const index = Math.round(container.scrollTop / window.innerHeight);
      setCurrent(index);
    }
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-white/50 text-sm">Loading reels...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white font-semibold mb-3">No products yet</p>
          <Link href="/" className="text-indigo-400 text-sm hover:underline">← Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900">
      {/* Back button */}
      <div className="absolute top-4 left-4 z-50">
        <Link
          href="/"
          className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-white/20 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Home
        </Link>
      </div>

      {/* Counter */}
      <div className="absolute top-4 right-4 z-50 bg-white/10 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
        {current + 1} / {products.length}
      </div>

      {/* Scrollable reels */}
      <div
        ref={containerRef}
        className="h-full overflow-y-scroll"
        style={{ scrollSnapType: "y mandatory", scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product) => (
          <ReelCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}