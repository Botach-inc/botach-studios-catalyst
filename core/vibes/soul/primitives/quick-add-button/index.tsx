'use client';

import * as Dialog from '@radix-ui/react-dialog';
import * as Popover from '@radix-ui/react-popover';
import { clsx } from 'clsx';
import { Check, Loader2, Plus, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';

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
  productTitle?: string;
  getQuickAddOptions: GetQuickAddOptionsFn;
  quickAddToCart: QuickAddToCartFn;
}

type ButtonState = 'idle' | 'loading' | 'success';

const MOBILE_BREAKPOINT = 640;

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const handleChange = () => setIsMobile(mql.matches);

    handleChange();
    mql.addEventListener('change', handleChange);

    return () => mql.removeEventListener('change', handleChange);
  }, []);

  return isMobile;
};

interface OptionFieldsProps {
  fields: QuickAddOptionsResult['fields'];
  selectedValues: Record<string, string>;
  onSelectChange: (name: string, value: string) => void;
  compact?: boolean;
}

const OptionFields = ({ fields, selectedValues, onSelectChange, compact = false }: OptionFieldsProps) => (
  <div className={compact ? 'space-y-2.5' : 'space-y-4'}>
    {fields.map((field) => {
      if (field.type === 'checkbox') return null;
      if (!('options' in field)) return null;

      return (
        <div key={field.name}>
          <label
            className={clsx(
              'mb-1 block font-medium uppercase tracking-[0.12em] text-neutral-400',
              compact ? 'text-[9px]' : 'text-[11px]',
            )}
            htmlFor={`qa-${field.name}`}
          >
            {field.label}
            {field.required && <span className="text-red-400"> *</span>}
          </label>
          <select
            className={clsx(
              'w-full appearance-none rounded-lg border border-neutral-200 bg-white',
              'font-medium text-neutral-800',
              'transition-colors hover:border-neutral-300',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400',
              'bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23999%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E")] bg-no-repeat',
              compact
                ? 'bg-[length:12px] bg-[right_6px_center] px-2.5 py-1.5 pr-6 text-xs'
                : 'bg-[length:14px] bg-[right_10px_center] px-3 py-2.5 pr-8 text-sm',
            )}
            id={`qa-${field.name}`}
            onChange={(e) => onSelectChange(field.name, e.target.value)}
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
);

interface SubmitButtonProps {
  disabled: boolean;
  loading: boolean;
  onClick: (e: React.MouseEvent) => void;
  compact?: boolean;
}

const SubmitButton = ({ disabled, loading, onClick, compact = false }: SubmitButtonProps) => (
  <button
    className={clsx(
      'flex w-full items-center justify-center font-semibold uppercase tracking-[0.1em]',
      'bg-neutral-900 text-white transition-all',
      'hover:bg-neutral-800',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      compact
        ? 'mt-3 rounded-lg px-3 py-1.5 text-[10px]'
        : 'mt-4 rounded-xl px-4 py-3 text-xs',
    )}
    disabled={disabled}
    onClick={onClick}
    type="button"
  >
    {loading ? <Loader2 className="animate-spin" size={compact ? 12 : 16} /> : 'Add to Cart'}
  </button>
);

export const QuickAddButton = ({
  productHref,
  productTitle,
  getQuickAddOptions,
  quickAddToCart,
}: QuickAddButtonProps) => {
  const [buttonState, setButtonState] = useState<ButtonState>('idle');
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<QuickAddOptionsResult | null>(null);
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const isMobile = useIsMobile();

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
          setIsOpen(false);
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
          setIsOpen(true);
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
          setIsOpen(true);
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

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (buttonState === 'loading') return;

      setIsOpen(open);
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

  const triggerButton = (
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
  );

  const isFormBusy = isPending || buttonState === 'loading';

  if (isMobile) {
    return (
      <Dialog.Root onOpenChange={handleOpenChange} open={isOpen}>
        <Dialog.Trigger asChild>{triggerButton}</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay
            className={clsx(
              'fixed inset-0 z-50 bg-black/40',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            )}
            onClick={(e) => {
              e.stopPropagation();
            }}
          />
          <Dialog.Content
            aria-describedby={undefined}
            className={clsx(
              'fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white px-5 pb-8 pt-4 shadow-2xl',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
              'data-[state=closed]:duration-200 data-[state=open]:duration-300',
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-neutral-200" />

            <Dialog.Title className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-neutral-900">
              {productTitle ?? 'Select Options'}
            </Dialog.Title>

            <OptionFields
              compact={false}
              fields={options?.fields ?? []}
              onSelectChange={handleSelectChange}
              selectedValues={selectedValues}
            />

            <SubmitButton
              compact={false}
              disabled={isFormBusy}
              loading={isFormBusy}
              onClick={handleSubmit}
            />

            <Dialog.Close asChild>
              <button
                aria-label="Close"
                className="absolute right-4 top-4 rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
                type="button"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  return (
    <Popover.Root onOpenChange={handleOpenChange} open={isOpen}>
      <Popover.Trigger asChild>{triggerButton}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="center"
          className={clsx(
            'z-50 w-52 rounded-xl bg-white p-3 shadow-xl ring-1 ring-black/5',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1',
          )}
          collisionPadding={12}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          side="bottom"
          sideOffset={6}
        >
          <OptionFields
            compact
            fields={options?.fields ?? []}
            onSelectChange={handleSelectChange}
            selectedValues={selectedValues}
          />

          <SubmitButton
            compact
            disabled={isFormBusy}
            loading={isFormBusy}
            onClick={handleSubmit}
          />

          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
