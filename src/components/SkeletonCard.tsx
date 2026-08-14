export default function SkeletonCard() {
  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 animate-pulse h-full flex flex-col">
      <div className="aspect-[2/3] w-full bg-white/10"></div>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="h-6 bg-white/20 rounded-md w-3/4 mb-3"></div>
          <div className="flex items-center justify-between">
            <div className="h-6 bg-white/20 rounded-full w-16"></div>
            <div className="h-6 bg-white/20 rounded-full w-12"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
