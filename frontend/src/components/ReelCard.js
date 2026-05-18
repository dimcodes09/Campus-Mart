import Link from "next/link";

const INR = "\u20b9";

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
    <div className="relative flex h-screen w-full flex-shrink-0 snap-start items-center justify-center overflow-hidden bg-[#0f0f0f] px-4 py-14 sm:py-16">
      <div
        className="relative aspect-[9/16] h-[min(82vh,760px)] max-h-[calc(100vh-112px)] w-auto max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl bg-black shadow-2xl"
      >
        {product.reelVideoUrl ? (
          <video
            src={product.reelVideoUrl}
            className="h-full w-full object-cover"
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
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-950">
            <div className={`h-32 w-32 rounded-full ${bg} opacity-20 blur-3xl`}></div>
            <svg className="absolute h-28 w-28 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/20"></div>

        <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-5 pt-16">
          {product.category && (
            <span className={`mb-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold text-white ${bg}`}>
              {product.category}
            </span>
          )}

          <h2 className="mb-2 text-2xl font-bold leading-snug text-white" style={{ fontFamily: "Sora, sans-serif" }}>
            {product.title}
          </h2>

          {product.description && (
            <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-white/70">
              {product.description}
            </p>
          )}

          <div className="mb-4 flex items-center gap-4">
            <div>
              <p className="text-xs text-white/50">Buy Price</p>
              <p className="text-xl font-bold text-white">
                {INR}
                {product.price}
              </p>
            </div>
            {product.rentPrice > 0 && (
              <div className="border-l border-white/20 pl-4">
                <p className="text-xs text-white/50">Rent/day</p>
                <p className="text-xl font-bold text-amber-400">
                  {INR}
                  {product.rentPrice}
                </p>
              </div>
            )}
          </div>

          <Link
            href={`/product/${product._id}`}
            className="block w-full rounded-xl bg-white py-3 text-center text-sm font-bold text-slate-950 transition-colors hover:bg-slate-100"
          >
            View Details -&gt;
          </Link>
        </div>
      </div>
    </div>
  );
}
