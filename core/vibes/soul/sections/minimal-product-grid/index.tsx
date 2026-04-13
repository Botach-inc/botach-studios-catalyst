'use client';

import { clsx } from 'clsx';
import { type MouseEvent, useCallback, useEffect, useRef } from 'react';

import {
  type MinimalProduct,
  MinimalProductCard,
  MinimalProductCardSkeleton,
} from '@/vibes/soul/primitives/minimal-product-card';
import { useRouter } from '~/i18n/routing';
import { MINIMAL_GRID_IMAGE_SIZES } from '~/lib/image/responsive-sizes';

interface MinimalProductGridProps {
  products: MinimalProduct[];
  className?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  placeholderCount?: number;
}

export const MinimalProductGrid = ({
  products,
  className,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  placeholderCount = 12,
}: MinimalProductGridProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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

  const findProductFromEvent = useCallback(
    (target: EventTarget | null): MinimalProduct | undefined => {
      if (!(target instanceof HTMLElement)) return undefined;

      const card = target.closest<HTMLElement>('[data-product-id]');

      if (!card) return undefined;

      const productId = card.dataset.productId;

      return products.find((p) => p.id === productId);
    },
    [products],
  );

  const handleGridClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const product = findProductFromEvent(e.target);

      if (product) {
        router.push(product.href);
      }
    },
    [findProductFromEvent, router],
  );

  const handleGridKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;

      const product = findProductFromEvent(e.target);

      if (!product) return;

      e.preventDefault();
      router.push(product.href);
    },
    [findProductFromEvent, router],
  );

  return (
    <div className={clsx('w-full bg-white', className)}>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        className="minimal-grid relative !border-none !outline-none"
        onClick={handleGridClick}
        onKeyDown={handleGridKeyDown}
      >
        {products.map((product, index) => (
          <MinimalProductCard
            imagePriority={index < 12}
            imageSizes={MINIMAL_GRID_IMAGE_SIZES}
            key={product.id}
            product={product}
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
