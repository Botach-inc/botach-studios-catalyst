'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { clsx } from 'clsx';
import {
  ArrowRight,
  ChevronDown,
  GiftIcon,
  ShoppingBag,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState, useTransition } from 'react';

import { Image } from '~/components/image';

export interface CartDrawerItem {
  id: string;
  title: string;
  subtitle: string;
  image?: { src: string; alt: string };
  price: string;
  salePrice?: string;
  quantity: number;
  href?: string;
  isGiftCertificate?: boolean;
}

export interface CartDrawerData {
  items: CartDrawerItem[];
  subtotal: string;
  total: string;
  itemCount: number;
  currencyCode: string;
  couponCodes: string[];
  discountTotal: string | null;
  checkoutEntityId: string | null;
}

export interface DrawerCouponResult {
  success: boolean;
  error?: string;
}

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fetchCartData: () => Promise<CartDrawerData | null>;
  removeItemAction?: (lineItemEntityId: string) => Promise<unknown>;
  applyCouponAction?: (checkoutEntityId: string, code: string) => Promise<DrawerCouponResult>;
  removeCouponAction?: (checkoutEntityId: string, code: string) => Promise<DrawerCouponResult>;
  cartHref: string;
  checkoutHref?: string;
  cartLabel?: string;
  checkoutLabel?: string;
  viewCartLabel?: string;
  subtotalLabel?: string;
  totalLabel?: string;
  emptyTitle?: string;
  emptySubtitle?: string;
  removeItemLabel?: string;
  promoLabel?: string;
  promoPlaceholder?: string;
  promoApplyLabel?: string;
  onNavigate?: (href: string) => void;
}

export function CartDrawer({
  open,
  onOpenChange,
  fetchCartData,
  removeItemAction,
  applyCouponAction,
  removeCouponAction,
  cartHref,
  checkoutHref = '/checkout',
  cartLabel = 'Your Cart',
  checkoutLabel = 'Checkout',
  viewCartLabel = 'View Full Cart',
  subtotalLabel = 'Subtotal',
  totalLabel = 'Total',
  emptyTitle = 'Your cart is empty',
  emptySubtitle = 'Looks like you haven\u2019t added anything yet.',
  removeItemLabel = 'Remove item',
  promoLabel = 'Promo code',
  promoPlaceholder = 'Enter code',
  promoApplyLabel = 'Apply',
  onNavigate,
}: CartDrawerProps) {
  const [data, setData] = useState<CartDrawerData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadCartData = useCallback(async () => {
    setIsLoading(true);

    try {
      const result = await fetchCartData();

      setData(result);
    } finally {
      setIsLoading(false);
    }
  }, [fetchCartData]);

  useEffect(() => {
    if (open) {
      loadCartData();
    }
  }, [open, loadCartData]);

  const handleRemoveItem = useCallback(
    (itemId: string) => {
      if (!removeItemAction) return;

      setRemovingId(itemId);
      startTransition(async () => {
        try {
          await removeItemAction(itemId);
          await loadCartData();
        } finally {
          setRemovingId(null);
        }
      });
    },
    [removeItemAction, loadCartData],
  );

  const handleNavigate = useCallback(
    (href: string) => {
      onOpenChange(false);
      onNavigate?.(href);
    },
    [onOpenChange, onNavigate],
  );

  const isEmpty = !isLoading && (!data || data.items.length === 0);

  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Portal>
        {/* Subtle overlay - not heavy gray */}
        <Dialog.Overlay
          className={clsx(
            'fixed inset-0 z-50 bg-black/10',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          )}
        />
        {/* Floating panel with rounded corners and margin */}
        <Dialog.Content
          aria-describedby={undefined}
          className={clsx(
            'fixed z-50 flex flex-col overflow-hidden',
            'inset-0 sm:inset-auto sm:right-3 sm:top-3 sm:bottom-3 sm:w-[420px]',
            'rounded-none sm:rounded-2xl',
            'bg-[var(--cart-drawer-bg,hsl(var(--background)))]',
            'shadow-2xl ring-1 ring-black/[0.04]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
            'data-[state=closed]:duration-200 data-[state=open]:duration-400',
            '[animation-timing-function:cubic-bezier(0.32,0.72,0,1)]',
          )}
          forceMount
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-4 pt-5 sm:px-6">
            <Dialog.Title className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight text-[var(--cart-drawer-text,hsl(var(--foreground)))]">
              <span>{cartLabel}</span>
              {data && data.itemCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--cart-drawer-text,hsl(var(--foreground)))] px-1.5 text-[10px] font-bold tabular-nums text-[var(--cart-drawer-bg,hsl(var(--background)))]">
                  {data.itemCount}
                </span>
              )}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                aria-label="Close cart"
                className="rounded-full p-1.5 text-[var(--cart-drawer-muted,hsl(var(--contrast-400)))] transition-colors hover:bg-[var(--cart-drawer-border,hsl(var(--contrast-100)))] hover:text-[var(--cart-drawer-text,hsl(var(--foreground)))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-drawer-focus,hsl(var(--primary)))]"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </Dialog.Close>
          </div>

          {/* Divider */}
          <div className="mx-5 border-t border-[var(--cart-drawer-border,hsl(var(--contrast-100)/60%))] sm:mx-6" />

          {/* Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {isLoading ? (
              <DrawerSkeleton />
            ) : isEmpty ? (
              <DrawerEmptyState subtitle={emptySubtitle} title={emptyTitle} />
            ) : (
              <ul className="flex flex-col gap-px px-3 py-3 sm:px-4">
                {data?.items.map((item) => (
                  <DrawerLineItem
                    item={item}
                    key={item.id}
                    onNavigate={handleNavigate}
                    onRemove={removeItemAction ? handleRemoveItem : undefined}
                    removeLabel={removeItemLabel}
                    removing={removingId === item.id || (isPending && removingId === item.id)}
                  />
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {!isEmpty && data && (
            <div className="border-t border-[var(--cart-drawer-border,hsl(var(--contrast-100)/60%))] bg-[var(--cart-drawer-bg,hsl(var(--background)))]">
              {/* Promo code */}
              {applyCouponAction && data.checkoutEntityId && (
                <PromoSection
                  applyCoupon={applyCouponAction}
                  applyLabel={promoApplyLabel}
                  checkoutEntityId={data.checkoutEntityId}
                  codes={data.couponCodes}
                  label={promoLabel}
                  onUpdate={loadCartData}
                  placeholder={promoPlaceholder}
                  removeCoupon={removeCouponAction}
                />
              )}

              {/* Summary */}
              <div className="space-y-1.5 px-5 pt-4 sm:px-6">
                <div className="flex items-center justify-between text-[13px] text-[var(--cart-drawer-muted,hsl(var(--contrast-400)))]">
                  <span>{subtotalLabel}</span>
                  <span>{data.subtotal}</span>
                </div>
                {data.discountTotal && (
                  <div className="flex items-center justify-between text-[13px] font-medium text-green-600">
                    <span className="flex items-center gap-1">
                      <Tag size={12} strokeWidth={1.5} />
                      Discount
                    </span>
                    <span>-{data.discountTotal}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-[var(--cart-drawer-border,hsl(var(--contrast-100)/60%))] pt-2.5 text-[15px] font-semibold text-[var(--cart-drawer-text,hsl(var(--foreground)))]">
                  <span>{totalLabel}</span>
                  <span>{data.total}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 p-5 sm:p-6">
                <a
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--cart-drawer-text,hsl(var(--foreground)))] px-6 py-3 text-[13px] font-semibold text-[var(--cart-drawer-bg,hsl(var(--background)))] transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-drawer-focus,hsl(var(--primary)))] focus-visible:ring-offset-2"
                  href={checkoutHref}
                  onClick={() => onOpenChange(false)}
                >
                  {checkoutLabel}
                  <ArrowRight
                    className="transition-transform group-hover:translate-x-0.5"
                    size={14}
                    strokeWidth={2}
                  />
                </a>
                <a
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl px-6 py-2.5 text-[13px] font-medium text-[var(--cart-drawer-muted,hsl(var(--contrast-400)))] transition-all hover:text-[var(--cart-drawer-text,hsl(var(--foreground)))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-drawer-focus,hsl(var(--primary)))]"
                  href={cartHref}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigate(cartHref);
                  }}
                >
                  {viewCartLabel}
                </a>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function PromoSection({
  checkoutEntityId,
  codes,
  applyCoupon,
  removeCoupon,
  onUpdate,
  label = 'Promo code',
  placeholder = 'Enter code',
  applyLabel = 'Apply',
}: {
  checkoutEntityId: string;
  codes: string[];
  applyCoupon: (checkoutEntityId: string, code: string) => Promise<DrawerCouponResult>;
  removeCoupon?: (checkoutEntityId: string, code: string) => Promise<DrawerCouponResult>;
  onUpdate: () => Promise<void>;
  label?: string;
  placeholder?: string;
  applyLabel?: string;
}) {
  const [isOpen, setIsOpen] = useState(codes.length > 0);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isApplying, startApplying] = useTransition();
  const [isRemoving, startRemoving] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleApply = useCallback(() => {
    if (!code.trim()) return;

    setError(null);
    startApplying(async () => {
      const result = await applyCoupon(checkoutEntityId, code.trim());

      if (result.success) {
        setCode('');
        await onUpdate();
      } else {
        setError(result.error ?? 'Invalid code');
      }
    });
  }, [code, applyCoupon, checkoutEntityId, onUpdate]);

  const handleRemove = useCallback(
    (couponCode: string) => {
      if (!removeCoupon) return;

      startRemoving(async () => {
        await removeCoupon(checkoutEntityId, couponCode);
        await onUpdate();
      });
    },
    [removeCoupon, checkoutEntityId, onUpdate],
  );

  return (
    <div className="px-5 pt-4 sm:px-6">
      <button
        className="flex w-full items-center gap-1.5 text-[13px] font-medium text-[var(--cart-drawer-muted,hsl(var(--contrast-400)))] transition-colors hover:text-[var(--cart-drawer-text,hsl(var(--foreground)))]"
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
          }
        }}
      >
        <Tag size={13} strokeWidth={1.5} />
        {label}
        <ChevronDown
          className={clsx('ml-auto transition-transform', isOpen && 'rotate-180')}
          size={14}
          strokeWidth={1.5}
        />
      </button>

      {isOpen && (
        <div className="mt-2.5 space-y-2">
          <div className="flex gap-1.5">
            <input
              className="h-9 flex-1 rounded-lg border border-[var(--cart-drawer-border,hsl(var(--contrast-100)))] bg-transparent px-3 text-[13px] text-[var(--cart-drawer-text,hsl(var(--foreground)))] placeholder:text-[var(--cart-drawer-muted,hsl(var(--contrast-300)))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-drawer-focus,hsl(var(--primary)))]"
              disabled={isApplying}
              onChange={(e) => {
                setCode(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApply();
                }
              }}
              placeholder={placeholder}
              ref={inputRef}
              type="text"
              value={code}
            />
            <button
              className="h-9 shrink-0 rounded-lg bg-[var(--cart-drawer-text,hsl(var(--foreground)))] px-4 text-[12px] font-semibold text-[var(--cart-drawer-bg,hsl(var(--background)))] transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-drawer-focus,hsl(var(--primary)))]"
              disabled={isApplying || !code.trim()}
              onClick={handleApply}
            >
              {isApplying ? '...' : applyLabel}
            </button>
          </div>

          {error && <p className="text-[12px] text-red-500">{error}</p>}

          {codes.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {codes.map((c) => (
                <span
                  className={clsx(
                    'inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-[11px] font-semibold text-green-700',
                    isRemoving && 'opacity-50',
                  )}
                  key={c}
                >
                  <Tag size={10} strokeWidth={2} />
                  {c}
                  {removeCoupon && (
                    <button
                      aria-label={`Remove coupon ${c}`}
                      className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-green-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-500"
                      disabled={isRemoving}
                      onClick={() => handleRemove(c)}
                    >
                      <X size={10} strokeWidth={2} />
                    </button>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DrawerLineItem({
  item,
  onRemove,
  onNavigate,
  removing = false,
  removeLabel = 'Remove item',
}: {
  item: CartDrawerItem;
  onRemove?: (id: string) => void;
  onNavigate?: (href: string) => void;
  removing?: boolean;
  removeLabel?: string;
}) {
  const content = (
    <div
      className={clsx(
        'group flex gap-3.5 rounded-xl p-2.5 transition-colors',
        'hover:bg-[var(--cart-drawer-hover,hsl(var(--contrast-100)/40%))]',
        removing && 'pointer-events-none opacity-30',
      )}
    >
      {/* Image */}
      <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg bg-[var(--cart-drawer-image-bg,hsl(var(--contrast-100)/60%))]">
        {item.isGiftCertificate ? (
          <div className="flex h-full w-full items-center justify-center">
            <GiftIcon
              className="text-[var(--cart-drawer-muted,hsl(var(--contrast-400)))]"
              size={24}
              strokeWidth={1}
            />
          </div>
        ) : item.image ? (
          <Image
            alt={item.image.alt}
            className="object-cover"
            fill
            sizes="72px"
            src={item.image.src}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ShoppingBag
              className="text-[var(--cart-drawer-muted,hsl(var(--contrast-300)))]"
              size={20}
              strokeWidth={1}
            />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div>
          <h4 className="truncate text-[13px] font-medium leading-snug text-[var(--cart-drawer-text,hsl(var(--foreground)))]">
            {item.title}
          </h4>
          {item.subtitle && (
            <p className="mt-0.5 truncate text-[11px] text-[var(--cart-drawer-muted,hsl(var(--contrast-400)))]">
              {item.subtitle}
            </p>
          )}
        </div>
        <div className="flex items-end justify-between">
          <span className="text-[11px] text-[var(--cart-drawer-muted,hsl(var(--contrast-400)))]">
            Qty: {item.quantity}
          </span>
          <div className="flex items-center gap-1.5">
            {item.salePrice ? (
              <>
                <span className="text-[11px] text-[var(--cart-drawer-muted,hsl(var(--contrast-300)))] line-through">
                  {item.price}
                </span>
                <span className="text-[13px] font-semibold text-green-600">
                  {item.salePrice}
                </span>
              </>
            ) : (
              <span className="text-[13px] font-semibold text-[var(--cart-drawer-text,hsl(var(--foreground)))]">
                {item.price}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Remove */}
      {onRemove && (
        <button
          aria-label={removeLabel}
          className="shrink-0 self-start rounded-full p-1 opacity-0 transition-all hover:bg-[var(--cart-drawer-border,hsl(var(--contrast-100)))] group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-drawer-focus,hsl(var(--primary)))]"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(item.id);
          }}
          tabIndex={0}
        >
          <Trash2
            className="text-[var(--cart-drawer-muted,hsl(var(--contrast-400)))]"
            size={13}
            strokeWidth={1.5}
          />
        </button>
      )}
    </div>
  );

  if (item.href && onNavigate) {
    return (
      <li>
        <a
          className="block cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-drawer-focus,hsl(var(--primary)))]"
          href={item.href}
          onClick={(e) => {
            e.preventDefault();
            onNavigate(item.href!);
          }}
        >
          {content}
        </a>
      </li>
    );
  }

  return <li>{content}</li>;
}

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-px px-3 py-3 sm:px-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div className="flex animate-pulse gap-3.5 rounded-xl p-2.5" key={i}>
          <div className="h-[72px] w-[72px] shrink-0 rounded-lg bg-[var(--cart-drawer-border,hsl(var(--contrast-100)))]" />
          <div className="flex flex-1 flex-col justify-between py-1">
            <div className="space-y-1.5">
              <div className="h-3 w-3/4 rounded bg-[var(--cart-drawer-border,hsl(var(--contrast-100)))]" />
              <div className="h-2.5 w-1/2 rounded bg-[var(--cart-drawer-border,hsl(var(--contrast-100)))]" />
            </div>
            <div className="flex items-center justify-between">
              <div className="h-2.5 w-8 rounded bg-[var(--cart-drawer-border,hsl(var(--contrast-100)))]" />
              <div className="h-3 w-12 rounded bg-[var(--cart-drawer-border,hsl(var(--contrast-100)))]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DrawerEmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 py-20 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--cart-drawer-border,hsl(var(--contrast-100)/60%))]">
        <ShoppingBag
          className="text-[var(--cart-drawer-muted,hsl(var(--contrast-300)))]"
          size={26}
          strokeWidth={1}
        />
      </div>
      <h3 className="mb-1.5 text-[15px] font-semibold text-[var(--cart-drawer-text,hsl(var(--foreground)))]">
        {title}
      </h3>
      <p className="text-[13px] text-[var(--cart-drawer-muted,hsl(var(--contrast-400)))]">
        {subtitle}
      </p>
    </div>
  );
}
