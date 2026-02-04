---
"@bigcommerce/catalyst-makeswift": patch
---

Add explicit Makeswift SEO metadata support to public-facing pages. When configured in Makeswift, the SEO title and description will take priority over the default values from BigCommerce or static translations.

The following pages now support Makeswift SEO metadata:

- Home page (`/`)
- Catch-all page (`/[...rest]`)
- Product page (`/product/[slug]`)
- Brand page (`/brand/[slug]`)
- Category page (`/category/[slug]`)
- Blog list page (`/blog`)
- Blog post page (`/blog/[blogId]`)
- Search page (`/search`)
- Cart page (`/cart`)
- Compare page (`/compare`)
- Gift certificates page (`/gift-certificates`)
- Gift certificates balance page (`/gift-certificates/balance`)
- Contact webpage (`/webpages/[id]/contact`)
- Normal webpage (`/webpages/[id]/normal`)

## Migration steps

### Step 1: Add `getMakeswiftPageMetadata` function

Add the `getMakeswiftPageMetadata` function to `core/lib/makeswift/client.ts`:

```diff
+ export async function getMakeswiftPageMetadata({ path, locale }: { path: string; locale: string }) {
+   const snapshot = await getPageSnapshot({ path, locale });
+
+   if (snapshot == null) {
+     return null;
+   }
+
+   const { meta } = snapshot.document;
+
+   return {
+     ...(meta.title && { title: meta.title }),
+     ...(meta.description && { description: meta.description }),
+   };
+ }
```

Export the function from `core/lib/makeswift/index.ts`:

```diff
  export { Page } from './page';
- export { client } from './client';
+ export { client, getMakeswiftPageMetadata } from './client';
```

### Step 2: Update page metadata

Each page's `generateMetadata` function has been updated to fetch Makeswift metadata and use it as the primary source, falling back to existing values. Here's an example using the cart page:

Update `core/app/[locale]/(default)/cart/page.tsx`:

```diff
  import { getPreferredCurrencyCode } from '~/lib/currency';
+ import { getMakeswiftPageMetadata } from '~/lib/makeswift';
  import { Slot } from '~/lib/makeswift/slot';
```

```diff
  export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;

    const t = await getTranslations({ locale, namespace: 'Cart' });
+   const makeswiftMetadata = await getMakeswiftPageMetadata({ path: '/cart', locale });

    return {
-     title: t('title'),
+     title: makeswiftMetadata?.title || t('title'),
+     description: makeswiftMetadata?.description || undefined,
    };
  }
```

Apply the same pattern to the other pages listed above, using the appropriate path for each page (e.g., `/blog`, `/search`, `/compare`, etc.).
