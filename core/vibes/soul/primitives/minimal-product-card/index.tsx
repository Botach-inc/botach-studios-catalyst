import { clsx } from 'clsx';

import * as Skeleton from '@/vibes/soul/primitives/skeleton';
import { Image } from '~/components/image';

export interface MinimalProduct {
  id: string;
  title: string;
  href: string;
  image?: { src: string; alt: string };
  hoverImage?: { src: string; alt: string };
  price?: string;
}

export interface MinimalProductCardProps {
  className?: string;
  product: MinimalProduct;
  imagePriority?: boolean;
  imageSizes?: string;
}

export const MinimalProductCard = ({
  product,
  className,
  imagePriority = false,
  imageSizes = '(max-width: 767px) 375px, 560px',
}: MinimalProductCardProps) => {
  const { id, title, image, hoverImage } = product;

  return (
    <div
      aria-label={`View ${title}`}
      className={clsx('minimal-card group cursor-pointer outline-none', className)}
      data-product-id={id}
      role="button"
      tabIndex={0}
    >
      <div className="flex w-full flex-col items-center justify-center transition-transform duration-300 hover:scale-[1.02]">
        <div className="relative w-full overflow-hidden">
          <div className="aspect-square w-full max-w-full" style={{ padding: 'clamp(6px, 8%, 24px)' }}>
            <div className="relative h-full w-full">
              {image != null ? (
                <>
                  <Image
                    alt={image.alt}
                    className={clsx(
                      'select-none object-contain transition-opacity duration-500',
                      hoverImage != null ? 'group-hover:opacity-0' : '',
                    )}
                    fill
                    preload={imagePriority}
                    quality={85}
                    sizes={imageSizes}
                    src={image.src}
                  />
                  {hoverImage != null && (
                    <Image
                      alt={hoverImage.alt}
                      className="select-none object-contain opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      fill
                      quality={85}
                      sizes={imageSizes}
                      src={hoverImage.src}
                    />
                  )}
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-neutral-50">
                  <span className="select-none font-medium uppercase tracking-[0.15em] text-neutral-300" style={{ fontSize: 'clamp(8px, 4cqi, 12px)' }}>
                    {title}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <p className="w-full max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-center uppercase" style={{ padding: '0 clamp(2px, 2cqi, 8px)' }}>{title}</p>
      </div>
    </div>
  );
};

export const MinimalProductCardSkeleton = ({ className }: { className?: string }) => {
  return (
    <Skeleton.Root className={clsx('bg-white', className)}>
      <Skeleton.Box className="aspect-square w-full" />
      <div className="py-2 text-center">
        <Skeleton.Text characterCount={5} className="mx-auto" />
      </div>
    </Skeleton.Root>
  );
};
