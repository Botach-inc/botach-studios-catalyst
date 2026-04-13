'use client';

import { XIcon } from 'lucide-react';
import { useInfiniteHits, useInstantSearch } from 'react-instantsearch';

import { MinimalProductCardSkeleton } from '@/vibes/soul/primitives/minimal-product-card';
import { MinimalProductGrid } from '@/vibes/soul/sections/minimal-product-grid';
import { Link } from '~/components/link';

import { AlgoliaProvider } from './algolia-provider';
import { type AlgoliaHit, mapHitToProduct } from './product-hits';

export interface PreFilter {
  attribute: string;
  value: string;
}

interface HomepageSearchProps {
  preFilter?: PreFilter;
  filterLabel?: string;
}

const buildFilters = (preFilter?: PreFilter): string => {
  const base = 'is_visible:true';

  if (!preFilter) return base;

  const escapedValue = preFilter.value.replace(/"/g, '\\"');

  return `${base} AND ${preFilter.attribute}:"${escapedValue}"`;
};

const SKELETON_COUNT = 18;

const LoadingSkeleton = () => {
  return (
    <div className="minimal-grid w-full animate-pulse bg-white">
      {Array.from({ length: SKELETON_COUNT }, (_, i) => (
        <MinimalProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

const NoResults = () => {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center bg-white">
      <p className="text-xs uppercase tracking-[0.15em] text-neutral-400">No products found</p>
    </div>
  );
};

const ActiveFilterBanner = ({ label }: { label: string }) => {
  return (
    <div className="flex items-center justify-between bg-white px-4 py-3 sm:px-6">
      <h1 className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-950">
        {label}
      </h1>
      <Link
        aria-label="Clear filter, view all products"
        className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-400 transition-colors hover:text-neutral-950"
        href="/"
      >
        Clear
        <XIcon className="h-3 w-3" strokeWidth={1.5} />
      </Link>
    </div>
  );
};

const HomepageContent = () => {
  const { items, showMore, isLastPage } = useInfiniteHits<AlgoliaHit>();
  const { status } = useInstantSearch();

  const isSearching = status === 'loading' || status === 'stalled';
  const products = items.map(mapHitToProduct);

  if (isSearching && items.length === 0) {
    return (
      <div className="minimal-homepage min-h-screen w-full bg-white">
        <LoadingSkeleton />
      </div>
    );
  }

  if (!isSearching && products.length === 0) {
    return (
      <div className="minimal-homepage min-h-screen w-full bg-white">
        <NoResults />
      </div>
    );
  }

  return (
    <div className="minimal-homepage min-h-screen w-full bg-white">
      <div className="duration-300 animate-in fade-in">
        <MinimalProductGrid
          hasMore={!isLastPage}
          onLoadMore={showMore}
          products={products}
        />
      </div>
    </div>
  );
};

export const HomepageSearch = ({ preFilter, filterLabel }: HomepageSearchProps) => {
  const filters = buildFilters(preFilter);

  return (
    <AlgoliaProvider filters={filters} hitsPerPage={60}>
      {filterLabel && <ActiveFilterBanner label={filterLabel} />}
      <HomepageContent />
    </AlgoliaProvider>
  );
};
