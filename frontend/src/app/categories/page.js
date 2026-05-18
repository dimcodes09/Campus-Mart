"use client";
import Link from "next/link";
import CATEGORIES from "@/constants/categories";

export default function CategoriesPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: "Sora, sans-serif" }}>
          Browse Categories
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Find exactly what you need by category.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className={`group flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 ${cat.color} hover:scale-105 hover:shadow-md transition-all duration-200`}
          >
            <span className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl ${cat.dot}`}>
              {cat.imageUrl ? (
                <img src={cat.imageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-white">{cat.name.charAt(0)}</span>
              )}
            </span>
            <span className="font-semibold text-sm">{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
