import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getSessionCustomerAccessToken } from '~/auth';
import { HomepageSearch } from '~/components/algolia/homepage-search';
import { getMakeswiftPageMetadata } from '~/lib/makeswift';
import { getMetadataAlternates } from '~/lib/seo/canonical';

import { getBrandPageData } from './page-data';

interface Props {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug, locale } = await props.params;
  const customerAccessToken = await getSessionCustomerAccessToken();

  const brandId = Number(slug);

  const { brand } = await getBrandPageData(brandId, customerAccessToken);

  if (!brand) {
    return notFound();
  }

  const makeswiftMetadata = await getMakeswiftPageMetadata({ path: brand.path, locale });

  const { pageTitle, metaDescription, metaKeywords } = brand.seo;

  return {
    title: makeswiftMetadata?.title || pageTitle || brand.name,
    ...((makeswiftMetadata?.description || metaDescription) && {
      description: makeswiftMetadata?.description || metaDescription,
    }),
    ...(metaKeywords && { keywords: metaKeywords.split(',') }),
    ...(brand.path && { alternates: await getMetadataAlternates({ path: brand.path, locale }) }),
  };
}

export default async function Brand(props: Props) {
  const { slug } = await props.params;
  const customerAccessToken = await getSessionCustomerAccessToken();

  const brandId = Number(slug);

  const { brand } = await getBrandPageData(brandId, customerAccessToken);

  if (!brand) {
    return notFound();
  }

  return (
    <HomepageSearch
      filterLabel={brand.name}
      key={`brand:${brand.name}`}
      preFilter={{ attribute: 'brand_name', value: brand.name }}
    />
  );
}
