import { liteClient as algoliasearch } from 'algoliasearch/lite';

import { algoliaEnv } from './config';

export const searchClient = algoliasearch(
  algoliaEnv.NEXT_PUBLIC_ALGOLIA_APP_ID,
  algoliaEnv.NEXT_PUBLIC_ALGOLIA_APP_KEY,
);

export const indexName = algoliaEnv.NEXT_PUBLIC_ALGOLIA_INDEX_NAME;
