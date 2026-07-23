import cn from "classnames";

type Props = {
  /** Vertical padding around the spinner. Use "page" for a full section. */
  size?: "page" | "inline";
  className?: string;
};

/**
 * The single loading indicator for dashboard pages. Every list on the dashboard
 * used to draw its own spinner, so favourites looked different from bookings,
 * trips and notifications. Use this instead of a local spinner so they match.
 */
export default function DashboardLoader({
  size = "page",
  className,
}: Props) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "text-center",
        size === "page" ? "py-12" : "py-4",
        className,
      )}
    >
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0673ff] mx-auto" />
    </div>
  );
}
