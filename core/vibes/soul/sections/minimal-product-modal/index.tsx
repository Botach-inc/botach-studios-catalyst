'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { clsx } from 'clsx';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowLeftIcon, ShoppingBagIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Image } from '~/components/image';
import { Link } from '~/components/link';

export interface ModalProduct {
  id: string;
  title: string;
  href: string;
  price?: string;
  description?: string;
  images: Array<{ src: string; alt: string }>;
}

interface MinimalProductModalProps {
  product: ModalProduct | null;
  open: boolean;
  onClose: () => void;
  cartHref?: string;
}

export const MinimalProductModal = ({
  product,
  open,
  onClose,
  cartHref = '/cart',
}: MinimalProductModalProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [slideCount, setSlideCount] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;

    setSelectedSlide(emblaApi.selectedSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    setSlideCount(emblaApi.slideNodes().length);
    emblaApi.on('select', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (open && emblaApi) {
      emblaApi.goTo(0, true);
      setSelectedSlide(0);
    }
  }, [open, emblaApi, product?.id]);

  if (!product) return null;

  return (
    <Dialog.Root onOpenChange={(val) => !val && onClose()} open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-white data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed inset-0 z-50 flex flex-col bg-white focus:outline-none">
          <Dialog.Title className="sr-only">{product.title}</Dialog.Title>
          <Dialog.Description className="sr-only">
            Product details for {product.title}
          </Dialog.Description>

          {/* Top bar: back arrow | price | cart icon */}
          <header className="flex w-full items-center justify-between px-4 py-3">
            <Dialog.Close asChild>
              <button
                aria-label="Go back"
                className="flex items-center justify-center p-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-black"
                type="button"
              >
                <ArrowLeftIcon className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </Dialog.Close>

            {product.price != null && (
              <span className="text-sm font-bold uppercase tracking-wider">{product.price}</span>
            )}

            <Link
              aria-label="Shopping bag"
              className="flex items-center justify-center p-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-black"
              href={cartHref}
            >
              <ShoppingBagIcon className="h-5 w-5" strokeWidth={1.5} />
            </Link>
          </header>

          {/* Image carousel */}
          <div className="flex-1 overflow-hidden" ref={emblaRef}>
            <div className="flex h-full">
              {product.images.map((image, idx) => (
                <div className="relative min-w-0 flex-[0_0_100%]" key={idx}>
                  <Image
                    alt={image.alt}
                    className="h-full w-full object-contain"
                    fill
                    preload={idx === 0}
                    sizes="100vw"
                    src={image.src}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Slide indicators */}
          {slideCount > 1 && (
            <div className="flex items-center justify-center gap-1.5 py-3">
              {Array.from({ length: slideCount }, (_, i) => (
                <button
                  aria-label={`Go to slide ${i + 1}`}
                  className={clsx(
                    'h-1.5 rounded-full transition-all duration-300',
                    i === selectedSlide ? 'w-4 bg-black' : 'w-1.5 bg-neutral-300',
                  )}
                  key={i}
                  onClick={() => emblaApi?.goTo(i)}
                  type="button"
                />
              ))}
            </div>
          )}

          {/* Product info */}
          <div className="space-y-4 px-5 pb-6 pt-2">
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-500">
              {product.title}
            </p>

            {product.description != null && product.description.length > 0 && (
              <p className="text-center text-[11px] font-bold uppercase leading-relaxed tracking-wider">
                {product.description}
              </p>
            )}

            <Link
              className="block w-full bg-black py-3.5 text-center text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              href={product.href}
            >
              View Full Details
            </Link>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
