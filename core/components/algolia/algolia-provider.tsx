'use client';

import { type ReactNode } from 'react';
import { Configure, InstantSearch } from 'react-instantsearch';

import { indexName, searchClient } from '~/lib/algolia/client';

interface AlgoliaProviderProps {
  children: ReactNode;
  hitsPerPage?: number;
  filters?: string;
}

export const AlgoliaProvider = ({
  children,
  hitsPerPage = 40,
  filters = 'is_visible:true',
}: AlgoliaProviderProps) => {
  return (
    <InstantSearch
      key={filters}
      indexName={indexName}
      searchClient={searchClient}
      future={{ preserveSharedStateOnUnmount: false }}
    >
      <Configure distinct filters={filters} hitsPerPage={hitsPerPage} />
      {children}
    </InstantSearch>
  );
};
