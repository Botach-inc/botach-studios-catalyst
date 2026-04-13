'use client';

import { ArrowLeftIcon } from 'lucide-react';

import { useRouter } from '~/i18n/routing';

export const BackButton = () => {
  const router = useRouter();

  return (
    <button
      aria-label="Go back"
      className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.15em] text-contrast-400 transition-colors hover:text-foreground"
      onClick={() => router.back()}
      type="button"
    >
      <ArrowLeftIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
      Back
    </button>
  );
};
