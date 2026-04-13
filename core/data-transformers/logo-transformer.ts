import { ResultOf } from 'gql.tada';

import { StoreLogoFragment } from '~/components/store-logo/fragment';

export const logoTransformer = (data: ResultOf<typeof StoreLogoFragment>) => {
  const { logoV2: logo, storeName } = data;

  if (logo.__typename === 'StoreImageLogo' && logo.image.url) {
    return { src: logo.image.url, alt: logo.image.altText || storeName };
  }

  return storeName || (logo.__typename === 'StoreTextLogo' ? logo.text : storeName) || '';
};
