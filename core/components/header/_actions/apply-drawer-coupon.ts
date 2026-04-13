'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { revalidateTag } from 'next/cache';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';
import { TAGS } from '~/client/tags';

const ApplyCheckoutCouponMutation = graphql(`
  mutation ApplyDrawerCouponMutation($input: ApplyCheckoutCouponInput!) {
    checkout {
      applyCheckoutCoupon(input: $input) {
        checkout {
          entityId
        }
      }
    }
  }
`);

const RemoveCheckoutCouponMutation = graphql(`
  mutation RemoveDrawerCouponMutation($input: UnapplyCheckoutCouponInput!) {
    checkout {
      unapplyCheckoutCoupon(input: $input) {
        checkout {
          entityId
        }
      }
    }
  }
`);

type ApplyVars = VariablesOf<typeof ApplyCheckoutCouponMutation>;
type RemoveVars = VariablesOf<typeof RemoveCheckoutCouponMutation>;

export interface DrawerCouponResult {
  success: boolean;
  error?: string;
}

export async function applyDrawerCoupon(
  checkoutEntityId: ApplyVars['input']['checkoutEntityId'],
  couponCode: string,
): Promise<DrawerCouponResult> {
  try {
    const customerAccessToken = await getSessionCustomerAccessToken();

    await client.fetch({
      document: ApplyCheckoutCouponMutation,
      variables: {
        input: {
          checkoutEntityId,
          data: { couponCode },
        },
      },
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });

    revalidateTag(TAGS.checkout, { expire: 0 });
    revalidateTag(TAGS.cart, { expire: 0 });

    return { success: true };
  } catch (error) {
    if (error instanceof BigCommerceGQLError) {
      const message = error.errors[0]?.message;

      if (message?.includes('Incorrect or mismatch:')) {
        return { success: false, error: 'Invalid coupon code' };
      }

      return { success: false, error: message ?? 'Failed to apply coupon' };
    }

    return { success: false, error: 'Failed to apply coupon' };
  }
}

export async function removeDrawerCoupon(
  checkoutEntityId: RemoveVars['input']['checkoutEntityId'],
  couponCode: string,
): Promise<DrawerCouponResult> {
  try {
    const customerAccessToken = await getSessionCustomerAccessToken();

    await client.fetch({
      document: RemoveCheckoutCouponMutation,
      variables: {
        input: {
          checkoutEntityId,
          data: { couponCode },
        },
      },
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });

    revalidateTag(TAGS.checkout, { expire: 0 });
    revalidateTag(TAGS.cart, { expire: 0 });

    return { success: true };
  } catch (error) {
    if (error instanceof BigCommerceGQLError) {
      return { success: false, error: error.errors[0]?.message ?? 'Failed to remove coupon' };
    }

    return { success: false, error: 'Failed to remove coupon' };
  }
}
