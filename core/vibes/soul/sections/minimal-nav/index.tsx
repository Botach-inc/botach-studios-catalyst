'use client';

import { clsx } from 'clsx';
import { useState } from 'react';

import { Link } from '~/components/link';

interface NavFilter {
  label: string;
  id: string;
}

interface MinimalNavProps {
  filters?: NavFilter[];
  activeFilter?: string;
  onFilterChange?: (filterId: string) => void;
  cartHref?: string;
  cartCount?: number | null;
}

const DEFAULT_FILTERS: NavFilter[] = [
  { label: 'NEW', id: 'new' },
  { label: 'MENS', id: 'mens' },
  { label: 'WOMENS', id: 'womens' },
  { label: 'SLIDES', id: 'slides' },
  { label: 'ACCESSORIES', id: 'accessories' },
];

export const MinimalNav = ({
  filters = DEFAULT_FILTERS,
  activeFilter = 'new',
  onFilterChange,
  cartHref = '/cart',
  cartCount,
}: MinimalNavProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const row1 = filters.slice(0, 3);
  const row2 = filters.slice(3);

  const handleMenuToggle = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <nav
      aria-label="Main navigation"
      className="fixed left-0 top-0 z-[99] flex h-16 max-h-16 w-full max-w-full flex-row flex-nowrap items-center justify-start overflow-hidden border-none bg-white py-4 outline-none"
    >
      {/* Hamburger menu button */}
      <div className="absolute left-4 top-2 z-10 flex flex-row flex-nowrap">
        <button
          aria-label="Menu"
          className="relative flex h-12 w-4 cursor-pointer select-none flex-col items-center justify-center gap-1"
          onClick={handleMenuToggle}
          type="button"
        >
          <div
            className={clsx(
              'absolute left-0 top-0 flex h-full w-full items-center justify-center transition-transform duration-300',
              menuOpen && 'rotate-45',
            )}
          >
            <span className="block h-[2px] w-4 rounded-full bg-black transition-all duration-300" />
          </div>
          <div
            className={clsx(
              'absolute left-0 top-0 flex h-full w-full items-center justify-center transition-transform duration-300',
              menuOpen && '-rotate-45',
            )}
          >
            <span className="block h-[2px] w-4 rounded-full bg-black transition-all duration-300" />
          </div>
        </button>
      </div>

      {/* Center: filter buttons in two rows */}
      <div className="relative flex h-full flex-1 flex-col flex-nowrap items-center justify-start">
        <div className="flex w-full flex-row flex-nowrap items-center justify-center gap-4">
          {row1.map((filter) => (
            <button
              className={clsx(
                'text-[9px] font-medium uppercase tracking-[0.1em] transition-opacity sm:text-[10px]',
                filter.id === activeFilter ? 'opacity-100' : 'opacity-20',
              )}
              key={filter.id}
              onClick={() => onFilterChange?.(filter.id)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
        {row2.length > 0 && (
          <div className="flex w-full flex-row flex-nowrap items-center justify-center gap-4">
            {row2.map((filter) => (
              <button
                className={clsx(
                  'text-[9px] font-medium uppercase tracking-[0.1em] transition-opacity sm:text-[10px]',
                  filter.id === activeFilter ? 'opacity-100' : 'opacity-20',
                )}
                key={filter.id}
                onClick={() => onFilterChange?.(filter.id)}
                type="button"
              >
                {filter.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: cart bag icon */}
      <div className="absolute right-4 top-0 z-10 flex h-full items-center justify-center gap-4">
        <Link
          aria-label={`Shopping bag${cartCount ? `, ${cartCount} items` : ''}`}
          className="flex flex-row flex-nowrap items-center justify-center"
          href={cartHref}
        >
          <svg
            aria-hidden="true"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              height="10"
              rx="2"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
              width="12"
              x="6"
              y="8"
            />
            <path
              d="M9 7V7C9 5.34315 10.3431 4 12 4V4C13.6569 4 15 5.34315 15 7V7"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
            />
          </svg>
        </Link>
      </div>
    </nav>
  );
};
