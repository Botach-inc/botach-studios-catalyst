'use client';

import { useCallback } from 'react';
import { useInfiniteHits } from 'react-instantsearch';

import type { MinimalProduct } from '@/vibes/soul/primitives/minimal-product-card';
import { QuickAddButton } from '@/vibes/soul/primitives/quick-add-button';
import { MinimalProductGrid } from '@/vibes/soul/sections/minimal-product-grid';
import { getQuickAddOptions } from '~/components/header/_actions/get-quick-add-options';
import { quickAddToCart } from '~/components/header/_actions/quick-add-to-cart';

interface AlgoliaProductImage {
  description: string;
  is_thumbnail: boolean;
  url_thumbnail: string;
}

export interface AlgoliaHit {
  [key: string]: unknown;
  objectID: string;
  name?: string;
  sku?: string;
  url?: string;
  image_url?: string;
  product_images?: AlgoliaProductImage[];
  default_price?: number;
  prices?: Record<string, number>;
  sales_prices?: Record<string, number>;
  description?: string;
}

// eslint-disable-next-line valid-jsdoc
/** Replaces the 200x200 thumbnail size in BC CDN URLs with a higher resolution. */
const upscaleBcImageUrl = (url: string, size = 1280): string => {
  return url.replace(/\.(\d+)\.(\d+)\.(jpg|png|gif|webp)/i, `.${size}.${size}.$3`);
};

const getImageUrl = (hit: AlgoliaHit): string | undefined => {
  const raw = hit.image_url ?? hit.product_images?.find((img) => img.is_thumbnail)?.url_thumbnail;

  if (!raw) return undefined;

  return upscaleBcImageUrl(raw);
};

const getHoverImageUrl = (hit: AlgoliaHit): string | undefined => {
  if (!hit.product_images || hit.product_images.length < 2) return undefined;

  const nonThumbnail = hit.product_images.find((img) => !img.is_thumbnail);

  if (!nonThumbnail) return undefined;

  return upscaleBcImageUrl(nonThumbnail.url_thumbnail);
};

export const getPrice = (hit: AlgoliaHit): string | undefined => {
  const salePrice = hit.sales_prices
    ? Object.values(hit.sales_prices).find((p) => p > 0)
    : undefined;

  const price =
    salePrice ?? hit.default_price ?? (hit.prices ? Object.values(hit.prices)[0] : undefined);

  if (price == null) return undefined;

  return `$${Number(price).toFixed(0)}`;
};

export const mapHitToProduct = (hit: AlgoliaHit): MinimalProduct => {
  const imageUrl = getImageUrl(hit);
  const hoverImageUrl = getHoverImageUrl(hit);
  const alt = hit.name ?? '';

  return {
    id: hit.objectID,
    title: hit.name ?? hit.objectID,
    href: hit.url ?? `/product/${hit.objectID}`,
    image: imageUrl ? { src: imageUrl, alt } : undefined,
    hoverImage: hoverImageUrl ? { src: hoverImageUrl, alt } : undefined,
    price: getPrice(hit),
  };
};

export const ProductHits = () => {
  const { items, showMore, isLastPage } = useInfiniteHits<AlgoliaHit>();

  const products = items.map(mapHitToProduct);

  const renderQuickAdd = useCallback(
    (product: MinimalProduct) => (
      <QuickAddButton
        getQuickAddOptions={getQuickAddOptions}
        productHref={product.href}
        productTitle={product.title}
        quickAddToCart={quickAddToCart}
      />
    ),
    [],
  );

  return (
    <MinimalProductGrid
      hasMore={!isLastPage}
      onLoadMore={showMore}
      products={products}
      renderQuickAdd={renderQuickAdd}
    />
  );
};
