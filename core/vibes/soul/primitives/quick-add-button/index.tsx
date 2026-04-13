'use client';

import * as Popover from '@radix-ui/react-popover';
import { clsx } from 'clsx';
import { Check, Loader2, Plus } from 'lucide-react';
import { useCallback, useRef, useState, useTransition } from 'react';

import { toast } from '@/vibes/soul/primitives/toaster';
import { type QuickAddOptionsResult } from '~/components/header/_actions/get-quick-add-options';
import { type QuickAddToCartResult } from '~/components/header/_actions/quick-add-to-cart';

type GetQuickAddOptionsFn = (productPath: string) => Promise<QuickAddOptionsResult>;
type QuickAddToCartFn = (input: {
  productEntityId: number;
  quantity?: number;
  selectedOptions?: Record<string, string>;
}) => Promise<QuickAddToCartResult>;

interface QuickAddButtonProps {
  productHref: string;
  getQuickAddOptions: GetQuickAddOptionsFn;
  quickAddToCart: QuickAddToCartFn;
}

type ButtonState = 'idle' | 'loading' | 'success';

export const QuickAddButton = ({
  productHref,
  getQuickAddOptions,
  quickAddToCart,
}: QuickAddButtonProps) => {
  const [buttonState, setButtonState] = useState<ButtonState>('idle');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [options, setOptions] = useState<QuickAddOptionsResult | null>(null);
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const showSuccess = useCallback(() => {
    setButtonState('success');

    if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);

    successTimeoutRef.current = setTimeout(() => {
      setButtonState('idle');
    }, 1500);
  }, []);

  const addToCart = useCallback(
    (entityId: number, selectedOpts?: Record<string, string>) => {
      startTransition(async () => {
        const result = await quickAddToCart({
          productEntityId: entityId,
          selectedOptions: selectedOpts,
        });

        if (result.success) {
          setPopoverOpen(false);
          showSuccess();
          toast.success('Added to cart');
        } else {
          setButtonState('idle');
          toast.error(result.error ?? 'Failed to add to cart');
        }
      });
    },
    [quickAddToCart, showSuccess],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (buttonState !== 'idle') return;

      if (options) {
        if (!options.entityId) return;

        if (options.fields.length === 0 && !options.hasComplexOptions) {
          setButtonState('loading');
          addToCart(options.entityId);
        } else if (options.hasComplexOptions && options.fields.length === 0) {
          return;
        } else {
          setPopoverOpen(true);
        }

        return;
      }

      setButtonState('loading');

      startTransition(async () => {
        const result = await getQuickAddOptions(productHref);

        setOptions(result);

        if (!result.entityId) {
          setButtonState('idle');
          toast.error('Product not found');

          return;
        }

        if (result.fields.length === 0 && !result.hasComplexOptions) {
          addToCart(result.entityId);
        } else if (result.hasComplexOptions && result.fields.length === 0) {
          setButtonState('idle');
        } else {
          const defaults: Record<string, string> = {};

          for (const field of result.fields) {
            if (field.type !== 'checkbox' && field.defaultValue) {
              defaults[field.name] = field.defaultValue;
            }
          }

          setSelectedValues(defaults);
          setButtonState('idle');
          setPopoverOpen(true);
        }
      });
    },
    [buttonState, options, productHref, getQuickAddOptions, addToCart],
  );

  const handleSubmit = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!options?.entityId) return;

      const missingRequired = options.fields.some(
        (field) => field.required && !selectedValues[field.name],
      );

      if (missingRequired) {
        toast.error('Please select all required options');

        return;
      }

      setButtonState('loading');
      addToCart(options.entityId, selectedValues);
    },
    [options, selectedValues, addToCart],
  );

  const handleSelectChange = useCallback(
    (name: string, value: string) => {
      setSelectedValues((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  const handlePopoverOpenChange = useCallback(
    (open: boolean) => {
      if (buttonState === 'loading') return;

      setPopoverOpen(open);
    },
    [buttonState],
  );

  const icon = (() => {
    switch (buttonState) {
      case 'loading':
        return <Loader2 className="animate-spin" size={10} strokeWidth={2} />;
      case 'success':
        return <Check size={10} strokeWidth={2.5} />;
      default:
        return <Plus size={10} strokeWidth={2} />;
    }
  })();

  return (
    <Popover.Root onOpenChange={handlePopoverOpenChange} open={popoverOpen}>
      <Popover.Trigger asChild>
        <button
          aria-label="Quick add to cart"
          className={clsx(
            'relative z-10 flex shrink-0 items-center justify-center rounded-full transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400',
            'hover:bg-neutral-100',
            buttonState === 'success'
              ? 'text-green-600'
              : 'text-neutral-400 hover:text-neutral-700',
          )}
          onClick={handleClick}
          style={{ width: 'clamp(16px, 4cqi, 22px)', height: 'clamp(16px, 4cqi, 22px)' }}
          tabIndex={0}
          type="button"
        >
          {icon}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          className={clsx(
            'z-50 w-52 rounded-xl bg-white p-3 shadow-xl ring-1 ring-black/5',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1',
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          side="bottom"
          sideOffset={6}
        >
          <div className="space-y-2.5">
            {options?.fields.map((field) => {
              if (field.type === 'checkbox') return null;

              if (!('options' in field)) return null;

              return (
                <div key={field.name}>
                  <label
                    className="mb-1 block text-[9px] font-medium uppercase tracking-[0.12em] text-neutral-400"
                    htmlFor={`qa-${field.name}`}
                  >
                    {field.label}
                    {field.required && <span className="text-red-400"> *</span>}
                  </label>
                  <select
                    className={clsx(
                      'w-full appearance-none rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5',
                      'text-xs font-medium text-neutral-800',
                      'transition-colors hover:border-neutral-300',
                      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400',
                      'bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23999%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E")] bg-[length:12px] bg-[right_6px_center] bg-no-repeat pr-6',
                    )}
                    id={`qa-${field.name}`}
                    onChange={(e) => handleSelectChange(field.name, e.target.value)}
                    value={selectedValues[field.name] ?? ''}
                  >
                    <option value="">Select</option>
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>

          <button
            className={clsx(
              'mt-3 flex w-full items-center justify-center rounded-lg px-3 py-1.5',
              'text-[10px] font-semibold uppercase tracking-[0.1em]',
              'bg-neutral-900 text-white transition-all',
              'hover:bg-neutral-800',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
            disabled={isPending || buttonState === 'loading'}
            onClick={handleSubmit}
            type="button"
          >
            {isPending || buttonState === 'loading' ? (
              <Loader2 className="animate-spin" size={12} />
            ) : (
              'Add to Cart'
            )}
          </button>

          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
