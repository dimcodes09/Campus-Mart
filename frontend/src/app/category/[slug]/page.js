"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import ProductCard from "@/components/ProductCard";
import CATEGORIES from "@/constants/categories";

export default function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const category = CATEGORIES.find((c) => c.slug === slug);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await api.get("/products", { params: { category: slug, status: "available" } });
        const all = Array.isArray(res.data) ? res.data : res.data.data || res.data.products || [];
        setProducts(all);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [slug]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{category?.icon || "📦"}</span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Sora, sans-serif" }}>
              {category?.name || slug}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {loading ? "Loading..." : `${products.length} item${products.length !== 1 ? "s" : ""} found`}
            </p>
          </div>
        </div>
        <Link
          href="/categories"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors"
        >
          ← All Categories
        </Link>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/categories" className="hover:text-indigo-600 transition-colors">Categories</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium capitalize">{category?.name || slug}</span>
      </div>

      {/* Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
              <div className="h-36 bg-slate-100"></div>
              <div className="p-5 space-y-3">
                <div className="h-4 bg-slate-100 rounded-lg w-3/4"></div>
                <div className="h-4 bg-slate-100 rounded-lg w-1/2"></div>
                <div className="h-10 bg-slate-100 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && products.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">{category?.icon || "📦"}</div>
          <p className="text-slate-700 font-semibold text-lg">No products found in this category</p>
          <p className="text-slate-400 text-sm mt-1">Be the first to list a {category?.name?.toLowerCase()} item!</p>
          <div className="flex items-center justify-center gap-3 mt-5">
            <Link href="/add-product" className="bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors">
              Add Product
            </Link>
            <Link href="/categories" className="border border-slate-200 text-slate-600 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
              Browse Other Categories
            </Link>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((product) => (
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
    </div>
  );
}