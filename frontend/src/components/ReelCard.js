import Link from "next/link";

const categoryColors = {
  books: "bg-emerald-400",
  electronics: "bg-blue-400",
  furniture: "bg-amber-400",
  clothing: "bg-pink-400",
  sports: "bg-orange-400",
  default: "bg-indigo-400",
};

export default function ReelCard({ product }) {
  const bg = categoryColors[product.category?.toLowerCase()] || categoryColors.default;

  return (
    <div className="relative w-full h-screen flex-shrink-0 snap-start flex items-center justify-center bg-slate-900 overflow-hidden">
      {/* Background gradient */}
      <div className={`absolute inset-0 opacity-20 ${bg}`}></div>
      {product.reelVideoUrl ? (
        <video
          src={product.reelVideoUrl}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          controls
        />
      ) : product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.title || "Product image"}
          className="absolute inset-0 h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

      {/* Center icon */}
      <div className={`absolute inset-0 flex items-center justify-center ${product.reelVideoUrl || product.imageUrl ? "opacity-0" : ""}`}>
        <div className={`w-40 h-40 ${bg} rounded-full opacity-10 blur-3xl`}></div>
        <svg className="w-32 h-32 text-white/10 absolute" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 px-8 pb-24 pt-8 w-full max-w-sm mx-auto flex flex-col justify-end h-full">
        {product.category && (
          <span className={`self-start text-xs font-semibold px-3 py-1 rounded-full text-white mb-4 ${bg}`}>
            {product.category}
          </span>
        )}

        <h2 className="text-2xl font-bold text-white mb-2 leading-snug" style={{ fontFamily: "Sora, sans-serif" }}>
          {product.title}
        </h2>

        {product.description && (
          <p className="text-white/60 text-sm mb-4 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        <div className="flex items-center gap-4 mb-6">
          <div>
            <p className="text-white/50 text-xs">Buy Price</p>
            <p className="text-white font-bold text-xl">₹{product.price}</p>
          </div>
          {product.rentPrice > 0 && (
            <div className="border-l border-white/20 pl-4">
              <p className="text-white/50 text-xs">Rent/day</p>
              <p className="text-amber-400 font-bold text-xl">₹{product.rentPrice}</p>
            </div>
          )}
        </div>

        <Link
          href={`/product/${product._id}`}
          className="w-full text-center bg-white text-slate-900 font-bold py-3.5 rounded-2xl text-sm hover:bg-slate-100 transition-colors"
        >
          View Details →
        </Link>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
        <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
