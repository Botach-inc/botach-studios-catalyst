import { MinimalProductCardSkeleton } from '@/vibes/soul/primitives/minimal-product-card';

const SKELETON_COUNT = 18;

export default function Loading() {
  return (
    <div className="minimal-homepage min-h-screen w-full bg-white">
      <div className="minimal-grid w-full animate-pulse bg-white">
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <MinimalProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
