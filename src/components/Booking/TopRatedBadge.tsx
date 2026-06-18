import { FaStar } from "react-icons/fa6";

export default function TopRatedBadge({
  className = "",
}: {
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-[#FFF7E6] px-2 py-0.5 text-[11px] font-semibold text-[#B7791F] ${className}`}
      title="Top rated vehicle"
    >
      <FaStar className="h-3 w-3 text-[#F5A623]" />
      Top rated
    </span>
  );
}
