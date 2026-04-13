'use client';

import { clsx } from 'clsx';
import { ReactNode, useCallback, useEffect, useRef } from 'react';

import {
  type MinimalProduct,
  MinimalProductCard,
  MinimalProductCardSkeleton,
} from '@/vibes/soul/primitives/minimal-product-card';
import { MINIMAL_GRID_IMAGE_SIZES } from '~/lib/image/responsive-sizes';

interface MinimalProductGridProps {
  products: MinimalProduct[];
  className?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  placeholderCount?: number;
  renderQuickAdd?: (product: MinimalProduct) => ReactNode;
}

export const MinimalProductGrid = ({
  products,
  className,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  placeholderCount = 12,
  renderQuickAdd,
}: MinimalProductGridProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;

      if (entry?.isIntersecting && hasMore && !isLoading && onLoadMore) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore],
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: '800px',
    });

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [handleIntersect]);

  return (
    <div className={clsx('w-full bg-white', className)}>
      <div className="minimal-grid relative !border-none !outline-none">
        {products.map((product, index) => (
          <MinimalProductCard
            imagePriority={index < 12}
            imageSizes={MINIMAL_GRID_IMAGE_SIZES}
            key={product.id}
            product={product}
            quickAddButton={renderQuickAdd?.(product)}
          />
        ))}

        {isLoading &&
          Array.from({ length: placeholderCount }, (_, i) => (
            <MinimalProductCardSkeleton key={`skeleton-${i}`} />
          ))}
      </div>

      {hasMore && <div aria-hidden="true" className="h-px w-full" ref={sentinelRef} />}

      <noscript>
        <nav aria-label="Product pages" className="flex justify-center gap-2 py-8">
          <a className="text-sm underline" href="/products?page=1">
            Page 1
          </a>
          <a className="text-sm underline" href="/products?page=2">
            Page 2
          </a>
          <a className="text-sm underline" href="/products?page=3">
            Page 3
          </a>
        </nav>
      </noscript>
    </div>
  );
};
