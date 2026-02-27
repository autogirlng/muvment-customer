export default function PostCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="aspect-[16/9] bg-gray-100" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-gray-100 rounded-full w-1/4" />
        <div className="h-5 bg-gray-100 rounded-full w-full" />
        <div className="h-5 bg-gray-100 rounded-full w-3/4" />
        <div className="space-y-2 mt-2">
          <div className="h-3 bg-gray-100 rounded-full w-full" />
          <div className="h-3 bg-gray-100 rounded-full w-5/6" />
        </div>
        <div className="flex items-center gap-2 pt-3">
          <div className="w-7 h-7 rounded-full bg-gray-100" />
          <div className="h-3 bg-gray-100 rounded-full w-24" />
        </div>
      </div>
    </div>
  );
}