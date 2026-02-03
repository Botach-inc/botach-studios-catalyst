import { Metadata } from 'next';

import { locales } from '~/i18n/locales';
import { getPageMetadata, Page as MakeswiftPage } from '~/lib/makeswift';

interface Params {
  locale: string;
}

interface Props {
  params: Promise<Params>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const metadata = await getPageMetadata({ path: '/', locale });

  return metadata ?? {};
}

export function generateStaticParams(): Params[] {
  return locales.map((locale) => ({ locale }));
}

export default async function Home({ params }: Props) {
  const { locale } = await params;

  return <MakeswiftPage locale={locale} path="/" />;
}
