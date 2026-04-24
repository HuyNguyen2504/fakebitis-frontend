export default function SkeletonCard() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="aspect-square w-full skeleton rounded-lg"></div>
      <div className="space-y-2">
        <div className="h-4 w-3/4 skeleton rounded"></div>
        <div className="h-4 w-1/2 skeleton rounded"></div>
      </div>
      <div className="h-6 w-1/3 skeleton rounded mt-2"></div>
    </div>
  );
}
