import { Metadata } from 'next';

import { HomepageSearch } from '~/components/algolia/homepage-search';
import { locales } from '~/i18n/locales';
import { getMetadataAlternates } from '~/lib/seo/canonical';

interface Params {
  locale: string;
}

interface Props {
  params: Promise<Params>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: 'Shop All Products',
    alternates: await getMetadataAlternates({ path: '/', locale }),
  };
}

export const dynamic = 'force-dynamic';

export default function Home() {
  return <HomepageSearch key="all" />;
}
