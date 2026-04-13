import { ReactNode } from 'react';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { Accordion, AccordionItem } from '@/vibes/soul/primitives/accordion';
import { BackButton } from '@/vibes/soul/primitives/back-button';
import { Price, PriceLabel } from '@/vibes/soul/primitives/price-label';
import { SafeHtml } from '@/vibes/soul/primitives/safe-html';
import * as Skeleton from '@/vibes/soul/primitives/skeleton';
import {
  BackorderDisplayData,
  ProductDetailForm,
  ProductDetailFormAction,
  StockDisplayData,
} from '@/vibes/soul/sections/product-detail/product-detail-form';
import {
  ProductGallery,
  ProductGalleryLoadMoreAction,
} from '@/vibes/soul/sections/product-detail/product-gallery';
import { Field } from '@/vibes/soul/sections/product-detail/schema';

interface MinimalProductDetailProduct {
  id: string;
  title: string;
  href: string;
  images: Streamable<{
    images: Array<{ src: string; alt: string }>;
    pageInfo?: { hasNextPage: boolean; endCursor: string | null };
  }>;
  price?: Streamable<Price | null>;
  subtitle?: string;
  description?: Streamable<string | ReactNode | null>;
  accordions?: Streamable<
    Array<{
      title: string;
      content: ReactNode;
    }>
  >;
  minQuantity?: Streamable<number | null>;
  maxQuantity?: Streamable<number | null>;
  stockDisplayData?: Streamable<StockDisplayData | null>;
  backorderDisplayData?: Streamable<BackorderDisplayData | null>;
}

export interface MinimalProductDetailProps<F extends Field> {
  product: Streamable<MinimalProductDetailProduct | null>;
  action: ProductDetailFormAction<F>;
  fields: Streamable<F[]>;
  quantityLabel?: string;
  incrementLabel?: string;
  decrementLabel?: string;
  emptySelectPlaceholder?: string;
  ctaLabel?: Streamable<string | null>;
  ctaDisabled?: Streamable<boolean | null>;
  prefetch?: boolean;
  thumbnailLabel?: string;
  additionalActions?: ReactNode;
  loadMoreImagesAction?: ProductGalleryLoadMoreAction;
}

export function MinimalProductDetail<F extends Field>({
  product: streamableProduct,
  action,
  fields: streamableFields,
  quantityLabel,
  incrementLabel,
  decrementLabel,
  emptySelectPlaceholder,
  ctaLabel: streamableCtaLabel,
  ctaDisabled: streamableCtaDisabled,
  prefetch,
  thumbnailLabel,
  additionalActions,
  loadMoreImagesAction,
}: MinimalProductDetailProps<F>) {
  return (
    <section className="minimal-homepage @container">
      <div className="mx-auto w-full max-w-screen-2xl">
        <Stream fallback={<MinimalPDPSkeleton />} value={streamableProduct}>
          {(product) =>
            product && (
              <>
                {/* Back button */}
                <div style={{ padding: 'clamp(0.75rem, 2cqi, 1.25rem) clamp(1rem, 3cqi, 3rem)' }}>
                  <BackButton />
                </div>

                <div className="grid grid-cols-1 @2xl:grid-cols-2">
                  {/* Gallery */}
                  <div className="hidden @2xl:block">
                    <Stream fallback={<GallerySkeleton />} value={product.images}>
                      {(imagesData) => (
                        <ProductGallery
                          aspectRatio="1:1"
                          className="sticky top-0 [&_*]:rounded-none"
                          fit="contain"
                          images={imagesData.images}
                          loadMoreAction={loadMoreImagesAction}
                          pageInfo={imagesData.pageInfo}
                          productId={Number(product.id)}
                          thumbnailLabel={thumbnailLabel}
                        />
                      )}
                    </Stream>
                  </div>

                  {/* Info panel */}
                  <div className="flex flex-col" style={{ padding: 'clamp(1rem, 2cqi, 2rem) clamp(1rem, 3cqi, 3rem)' }}>
                    {Boolean(product.subtitle) && (
                      <p className="font-medium uppercase tracking-[0.2em] text-contrast-400" style={{ fontSize: 'clamp(9px, 0.6vw + 4px, 12px)' }}>
                        {product.subtitle}
                      </p>
                    )}
                    <h1 className="mb-2 mt-1 font-medium uppercase tracking-tight" style={{ fontSize: 'clamp(1.1rem, 2cqi + 0.5rem, 1.5rem)' }}>
                      {product.title}
                    </h1>

                    <Stream fallback={<PriceSkeleton />} value={product.price}>
                      {(price) => (
                        <PriceLabel className="text-sm font-normal" price={price ?? ''} />
                      )}
                    </Stream>

                    {/* Mobile gallery */}
                    <div className="my-6 @2xl:hidden">
                      <Stream fallback={<GallerySkeleton />} value={product.images}>
                        {(imagesData) => (
                          <ProductGallery
                            aspectRatio="1:1"
                            className="[&_*]:rounded-none"
                            fit="contain"
                            images={imagesData.images}
                            loadMoreAction={loadMoreImagesAction}
                            pageInfo={imagesData.pageInfo}
                            productId={Number(product.id)}
                            thumbnailLabel={thumbnailLabel}
                          />
                        )}
                      </Stream>
                    </div>

                    {/* Form */}
                    <div className="mt-4">
                      <Stream
                        fallback={<FormSkeleton />}
                        value={Streamable.all([
                          streamableFields,
                          streamableCtaLabel,
                          streamableCtaDisabled,
                          product.minQuantity,
                          product.maxQuantity,
                          product.stockDisplayData,
                          product.backorderDisplayData,
                        ])}
                      >
                        {([
                          fields,
                          ctaLabel,
                          ctaDisabled,
                          minQuantity,
                          maxQuantity,
                          stockDisplayData,
                          backorderDisplayData,
                        ]) => (
                          <ProductDetailForm
                            action={action}
                            additionalActions={additionalActions}
                            backorderDisplayData={backorderDisplayData ?? undefined}
                            ctaDisabled={ctaDisabled ?? undefined}
                            ctaLabel={ctaLabel ?? undefined}
                            decrementLabel={decrementLabel}
                            emptySelectPlaceholder={emptySelectPlaceholder}
                            fields={fields}
                            incrementLabel={incrementLabel}
                            maxQuantity={maxQuantity ?? undefined}
                            minQuantity={minQuantity ?? undefined}
                            prefetch={prefetch}
                            productId={product.id}
                            quantityLabel={quantityLabel}
                            stockDisplayData={stockDisplayData ?? undefined}
                          />
                        )}
                      </Stream>
                    </div>

                    {/* Description */}
                    <Stream fallback={null} value={product.description}>
                      {(description) =>
                        Boolean(description) && (
                          <div className="mt-6 border-t border-contrast-100 pt-6">
                            {typeof description === 'string' ? (
                              <SafeHtml
                                className="prose prose-sm max-w-none text-xs leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                                html={description}
                              />
                            ) : (
                              <div className="prose prose-sm max-w-none text-xs leading-relaxed [&>div>*:first-child]:mt-0 [&>div>*:last-child]:mb-0">
                                {description}
                              </div>
                            )}
                          </div>
                        )
                      }
                    </Stream>

                    {/* Accordions */}
                    <Stream fallback={null} value={product.accordions}>
                      {(accordions) =>
                        accordions &&
                        accordions.length > 0 && (
                          <Accordion
                            className="mt-3 border-t border-contrast-100 pt-1"
                            type="multiple"
                          >
                            {accordions.map((accordion, index) => (
                              <AccordionItem
                                key={index}
                                title={accordion.title}
                                value={index.toString()}
                              >
                                {accordion.content}
                              </AccordionItem>
                            ))}
                          </Accordion>
                        )
                      }
                    </Stream>
                  </div>
                </div>
              </>
            )
          }
        </Stream>
      </div>
    </section>
  );
}

function GallerySkeleton() {
  return (
    <Skeleton.Root pending>
      <Skeleton.Box className="aspect-square w-full" />
      <div className="mt-2 flex gap-2">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Skeleton.Box className="h-14 w-14 shrink-0" key={idx} />
        ))}
      </div>
    </Skeleton.Root>
  );
}

function PriceSkeleton() {
  return <Skeleton.Box className="my-2 h-4 w-20" />;
}

function FormSkeleton() {
  return (
    <Skeleton.Root className="space-y-4" pending>
      <div className="space-y-2">
        <Skeleton.Box className="h-3 w-12" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton.Box className="h-9 w-9" key={idx} />
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton.Box className="h-10 w-24" />
        <Skeleton.Box className="h-10 flex-1" />
      </div>
    </Skeleton.Root>
  );
}

export function MinimalPDPSkeleton() {
  return (
    <Skeleton.Root className="grid grid-cols-1 @2xl:grid-cols-2" pending>
      <GallerySkeleton />
      <div className="space-y-3 px-8 py-8">
        <Skeleton.Box className="h-2.5 w-16" />
        <Skeleton.Box className="h-6 w-48" />
        <PriceSkeleton />
        <FormSkeleton />
      </div>
    </Skeleton.Root>
  );
}
