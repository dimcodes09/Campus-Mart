import Link from "next/link";

const categoryColors = {
  books: "bg-emerald-100 text-emerald-700",
  electronics: "bg-blue-100 text-blue-700",
  furniture: "bg-amber-100 text-amber-700",
  clothing: "bg-pink-100 text-pink-700",
  sports: "bg-orange-100 text-orange-700",
  default: "bg-slate-100 text-slate-600",
};

export default function ProductCard({ product }) {
  const colorClass =
    categoryColors[product.category?.toLowerCase()] || categoryColors.default;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50 transition-all duration-200 group overflow-hidden flex flex-col">
      <div className="bg-gradient-to-br from-indigo-50 to-slate-100 h-36 flex items-center justify-center relative">
        <svg className="w-14 h-14 text-indigo-200 group-hover:text-indigo-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        {product.imageUrl && (
          <img
            src={product.imageUrl}
            alt={product.title || "Product image"}
            className="absolute inset-0 h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        )}
        {product.category && (
          <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${colorClass}`}>
            {product.category}
          </span>
        )}
        {product.status === "rented" && (
          <span className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-600">
            Rented
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <h3 className="font-semibold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-indigo-700 transition-colors" style={{ fontFamily: "Sora, sans-serif" }}>
          {product.title}
        </h3>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium">Buy</span>
            <span className="text-lg font-bold text-slate-900">₹{product.price}</span>
          </div>
          {product.rentPrice && (
            <div className="flex flex-col items-end">
              <span className="text-xs text-slate-400 font-medium">Rent/day</span>
              <span className="text-base font-semibold text-indigo-600">₹{product.rentPrice}</span>
            </div>
          )}
        </div>

        <Link
          href={`/product/${product._id}`}
          className="w-full text-center text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl transition-colors duration-150 mt-1"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
