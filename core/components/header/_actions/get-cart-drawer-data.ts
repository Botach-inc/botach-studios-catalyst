'use server';

import { getFormatter } from 'next-intl/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';
import { getCartId } from '~/lib/cart';

const MiniCartQuery = graphql(`
  query MiniCartQuery($cartId: String) {
    site {
      cart(entityId: $cartId) {
        entityId
        currencyCode
        discountedAmount {
          currencyCode
          value
        }
        lineItems {
          physicalItems {
            __typename
            entityId
            name
            quantity
            parentEntityId
            image {
              url: urlTemplate(lossy: true)
            }
            listPrice {
              currencyCode
              value
            }
            salePrice {
              currencyCode
              value
            }
            selectedOptions {
              __typename
              entityId
              name
              ... on CartSelectedMultipleChoiceOption {
                value
              }
              ... on CartSelectedCheckboxOption {
                value
              }
              ... on CartSelectedNumberFieldOption {
                number
              }
              ... on CartSelectedTextFieldOption {
                text
              }
              ... on CartSelectedMultiLineTextFieldOption {
                text
              }
            }
            url
          }
          digitalItems {
            __typename
            entityId
            name
            quantity
            parentEntityId
            image {
              url: urlTemplate(lossy: true)
            }
            listPrice {
              currencyCode
              value
            }
            salePrice {
              currencyCode
              value
            }
            selectedOptions {
              __typename
              entityId
              name
              ... on CartSelectedMultipleChoiceOption {
                value
              }
              ... on CartSelectedCheckboxOption {
                value
              }
              ... on CartSelectedNumberFieldOption {
                number
              }
              ... on CartSelectedTextFieldOption {
                text
              }
              ... on CartSelectedMultiLineTextFieldOption {
                text
              }
            }
            url
          }
          giftCertificates {
            __typename
            entityId
            name
            recipient {
              name
              email
            }
            amount {
              currencyCode
              value
            }
          }
          totalQuantity
        }
      }
      checkout(entityId: $cartId) {
        entityId
        subtotal {
          currencyCode
          value
        }
        grandTotal {
          currencyCode
          value
        }
        coupons {
          code
          discountedAmount {
            currencyCode
            value
          }
        }
      }
    }
  }
`);

export interface CartDrawerItem {
  id: string;
  title: string;
  subtitle: string;
  image?: { src: string; alt: string };
  price: string;
  salePrice?: string;
  quantity: number;
  href?: string;
  isGiftCertificate?: boolean;
}

export interface CartDrawerData {
  items: CartDrawerItem[];
  subtotal: string;
  total: string;
  itemCount: number;
  currencyCode: string;
  couponCodes: string[];
  discountTotal: string | null;
  checkoutEntityId: string | null;
}

export async function getCartDrawerData(): Promise<CartDrawerData | null> {
  const cartId = await getCartId();

  if (!cartId) return null;

  const customerAccessToken = await getSessionCustomerAccessToken();

  const { data } = await client.fetch({
    document: MiniCartQuery,
    variables: { cartId },
    customerAccessToken,
    fetchOptions: {
      cache: 'no-store',
      next: { tags: [TAGS.cart] },
    },
  });

  const cart = data.site.cart;
  const checkout = data.site.checkout;

  if (!cart) return null;

  const format = await getFormatter();

  const physicalAndDigital = [
    ...cart.lineItems.physicalItems,
    ...cart.lineItems.digitalItems,
  ].filter((item) => !item.parentEntityId);

  const items: CartDrawerItem[] = physicalAndDigital.map((item) => {
    const options = item.selectedOptions
      .map((option) => {
        switch (option.__typename) {
          case 'CartSelectedMultipleChoiceOption':
          case 'CartSelectedCheckboxOption':
            return `${option.name}: ${option.value}`;

          case 'CartSelectedNumberFieldOption':
            return `${option.name}: ${option.number}`;

          case 'CartSelectedMultiLineTextFieldOption':
          case 'CartSelectedTextFieldOption':
            return `${option.name}: ${option.text}`;

          default:
            return '';
        }
      })
      .filter(Boolean)
      .join(', ');

    return {
      id: item.entityId,
      title: item.name,
      subtitle: options,
      image: item.image?.url ? { src: item.image.url, alt: item.name } : undefined,
      price: format.number(item.listPrice.value, {
        style: 'currency',
        currency: item.listPrice.currencyCode,
      }),
      salePrice:
        item.salePrice.value !== item.listPrice.value
          ? format.number(item.salePrice.value, {
              style: 'currency',
              currency: item.salePrice.currencyCode,
            })
          : undefined,
      quantity: item.quantity,
      href: new URL(item.url).pathname,
    };
  });

  for (const gc of cart.lineItems.giftCertificates) {
    items.push({
      id: gc.entityId,
      title: gc.name,
      subtitle: `To: ${gc.recipient.name}`,
      quantity: 1,
      price: format.number(gc.amount.value, {
        style: 'currency',
        currency: gc.amount.currencyCode,
      }),
      isGiftCertificate: true,
    });
  }

  const totalCouponDiscount =
    checkout?.coupons.reduce((sum, coupon) => sum + coupon.discountedAmount.value, 0) ?? 0;

  return {
    items,
    subtotal: format.number(checkout?.subtotal?.value ?? 0, {
      style: 'currency',
      currency: cart.currencyCode,
    }),
    total: format.number(checkout?.grandTotal?.value ?? 0, {
      style: 'currency',
      currency: cart.currencyCode,
    }),
    itemCount: cart.lineItems.totalQuantity,
    currencyCode: cart.currencyCode,
    couponCodes: checkout?.coupons.map((c) => c.code) ?? [],
    discountTotal:
      totalCouponDiscount > 0
        ? format.number(totalCouponDiscount, {
            style: 'currency',
            currency: cart.currencyCode,
          })
        : null,
    checkoutEntityId: checkout?.entityId ?? null,
  };
}
