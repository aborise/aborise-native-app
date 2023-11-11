import { z } from 'zod';

type SimpleObject = Record<string, any>;

export function generateZodValidator(obj: SimpleObject): string {
  function getZodType(value: any): string {
    const typeOfValue = typeof value;

    switch (typeOfValue) {
      case 'string':
        return 'z.string()';
      case 'number':
        return 'z.number()';
      case 'boolean':
        return 'z.boolean()';
      case 'object':
        if (Array.isArray(value)) {
          if (value.length > 0) {
            // Assuming all elements of the array are of the same type.
            return `z.array(${getZodType(value[0])})`;
          } else {
            return 'z.array(z.unknown())'; // Empty array
          }
        } else {
          return generateNestedZodValidator(value);
        }
      default:
        return 'z.any()';
    }
  }

  function generateNestedZodValidator(nestedObj: SimpleObject): string {
    const lines: string[] = ['z.object({'];

    for (const key in nestedObj) {
      lines.push(`  ${key}: ${getZodType(nestedObj[key])},`);
    }

    lines.push('})');
    return lines.join('\n');
  }

  return generateNestedZodValidator(obj);
}

function identifyDiscriminatorKey(objects: SimpleObject[]): string | null {
  for (const key in objects[0]) {
    const uniqueValues = new Set(objects.map((obj) => obj[key]));
    if (uniqueValues.size === objects.length) {
      return key;
    }
  }
  return null;
}

function generateZodValidatorForDiscriminatedUnion(objects: SimpleObject[]): string {
  const discriminator = identifyDiscriminatorKey(objects);
  if (!discriminator) {
    throw new Error('No discriminating key found.');
  }

  function generateZodValidator(obj: SimpleObject): string {
    const lines: string[] = ['z.object({'];

    for (const key in obj) {
      lines.push(`  ${key}: ${getZodType(obj[key])},`);
    }

    lines.push('})');
    return lines.join('\n');
  }

  function getZodType(value: any): string {
    switch (typeof value) {
      case 'string':
        return 'z.string()';
      case 'number':
        return 'z.number()';
      case 'boolean':
        return 'z.boolean()';
      case 'object':
        if (Array.isArray(value)) {
          if (value.length > 0) {
            return `z.array(${getZodType(value[0])})`;
          } else {
            return 'z.array(z.unknown())';
          }
        } else {
          return generateZodValidator(value);
        }
      default:
        return 'z.any()';
    }
  }

  const cases = objects.map((obj) => generateZodValidator(obj)).join(',\n  ');

  return `z.discriminatedUnion('${discriminator}', {\n  ${cases}\n})`;
}

// Example:
const objects = [
  {
    type: 'developer',
    name: 'Ulima',
    age: 25,
  },
  {
    type: 'tool',
    toolName: 'vue',
    version: 3,
  },
];
// console.log(generateZodValidatorForDiscriminatedUnion([objects[0]]));

const objects2 = {
  entitlement: {
    addOns: [],
    adFree: false,
    multiPackageTracking: '',
    packageCode: '',
    packageId: null,
    packageSource: '',
    productName: '',
    vendorCode: '',
  },
  isLoggedIn: true,
  displayName: 'Leonhard K',
  regID: 228747240,
  profile: {
    first_name: 'Leonhard',
    last_name: 'Kühne-Hellmessen',
    email: 'leonhard@k-h.me',
    connections: {
      facebook: false,
      twitter: false,
      google: false,
    },
    optIn: false,
    profile_type: 'ADULT',
  },
  svod: {
    packages: [
      {
        product_code: null,
        product_name: null,
        product_tier: 0,
        code: 'NEW_FREE_PACKAGE',
        status: 'ACTIVE',
        source: 'cbscomp',
        holding_state: 'OK',
        user_can_edit: true,
        supported_vendor: false,
        on_trial: false,
        plan_type: null,
        plan_tier: null,
        addOns: [],
        vendor_code: null,
        no_trial: false,
        mobile_only: false,
        subscription_country: null,
      },
    ],
    status: 'EX_SUBSCRIBER',
    recurly_package: null,
    user_package: {
      product_code: null,
      product_name: null,
      product_tier: 0,
      code: 'NEW_FREE_PACKAGE',
      status: 'ACTIVE',
      source: 'cbscomp',
      holding_state: 'OK',
      user_can_edit: true,
      supported_vendor: false,
      on_trial: false,
      plan_type: null,
      plan_tier: null,
      addOns: [],
      vendor_code: null,
      no_trial: false,
      mobile_only: false,
      subscription_country: null,
    },
    package_status: 'esb|14',
    package_source: 'cbscomp',
    package_status_raw: 'ACTIVE',
    package_code: 'NEW_FREE_PACKAGE',
    bundle_status: '',
    issues: [],
    multi_package_tracking: 'cbscomp:null',
  },
  statusCode: 'exsub',
  isSubscriber: false,
  isThirdParty: false,
  isExSubscriber: true,
  isSuspended: false,
  isGhost: false,
  isMVPDAuthZ: false,
  isMVPDAuthZExSub: false,
  isActive: true,
  isPartnerSubscription: false,
  isReseller: false,
  isRecurly: false,
  isLC: false,
  isCF: false,
  isCompUser: false,
  isRegistered: false,
  isOptimum: false,
  isUnsupportedVendor: false,
  isMonthlyPlan: false,
  isAnnualPlan: false,
  canEdit: true,
  provideNativeDeviceSubSettingsLink: false,
  needsUpdate: false,
  edu: {
    profile: null,
    coupon: null,
  },
  isMVPD: false,
  userRegistrationCountry: 'DE',
  isUserRegionOnSunset: false,
  tags: {
    bundleStatus: '',
    packageSource: 'cbscomp',
    packageStatus: 'ACTIVE',
    multiPackageTracking: 'cbscomp:null',
    userStatus: 'esb|14',
    userType: 'EX_SUBSCRIBER',
    vendorCode: '',
    userId: 228747240,
    userRegId: 228747240,
    referenceProfileId: 0,
    userProfileCategory: 'ADULT',
    userProfileId: 257172065,
    userProfileMaster: 'true',
    userProfilePic: 'default',
    userProfilePicPath: 'https://wwwimage-intl.pplusstatic.com/thumbnails/photos/w200-q80/profile/GIANT_CYCLOPS_0.png',
  },
  mvpdDispute: {
    isDmaInDispute: false,
    mvpdProvider: '',
  },
};

const object3 = {
  authToken:
    'T2tNU29lN3NnK3hHWWx1djVlVmZpMEY5MWlYWTRXdGhOaW8xenQzcDlaMWJhbFZYbUdPY1FqZEk5QngwM3BLMHBUK2hyOWdPQzVlMWxjRDV0RWtBYnc9PQ==',
  user: {
    displayName: 'Aborise T',
    profile: {
      first_name: 'aborise',
      last_name: 'Team',
      email: 'paramount@aborise.com',
      connections: { facebook: false, twitter: false, google: false },
      optIn: false,
      profile_type: 'ADULT',
    },
    svod: {
      status: 'SUBSCRIBER',
      user_package: {
        product_code: 'pplus_intl_de_monthly',
        product_name: 'Paramount+ monthly - Germany - Trial',
        product_tier: 2,
        code: 'CBS_ALL_ACCESS_AD_FREE_PACKAGE',
        status: 'TRIAL',
        source: 'recurly',
        holding_state: 'OK',
        user_can_edit: true,
        supported_vendor: true,
        on_trial: true,
        plan_type: 'monthly',
        plan_tier: 'standard',
        addOns: [],
        vendor_code: null,
        no_trial: false,
        mobile_only: false,
        subscription_country: 'DE',
      },
      package_status: 'tsb|14',
      package_source: 'recurly',
      package_status_raw: 'TRIAL',
      package_code: 'CBS_ALL_ACCESS_AD_FREE_PACKAGE',
      bundle_status: '',
      issues: [],
      multi_package_tracking: 'recurly:pplus_intl_de_monthly',
    },
    isLoggedIn: true,
    statusCode: 'sub',
    isCompUser: false,
    isRegistered: false,
    isSubscriber: true,
    isExSubscriber: false,
    isSuspended: false,
    isGhost: false,
    isThirdParty: false,
    isMVPDAuthZ: false,
    isMVPDAuthZExSub: false,
    isActive: false,
    isReseller: false,
    isPartnerSubscription: false,
    isRecurly: true,
    isOptimum: false,
    isLC: false,
    isCF: true,
    isUnsupportedVendor: false,
    isMonthlyPlan: true,
    isAnnualPlan: false,
    canEdit: true,
    provideNativeDeviceSubSettingsLink: false,
    edu: { profile: null, coupon: null },
    isMVPD: false,
    userRegistrationCountry: 'DE',
    isUserRegionOnSunset: null,
  },
  currentSubscription: {
    id: '6d2c75150d4914a78d7fcb486099163a',
    sub_status: 'active',
    activeCoupons: null,
    create_date: { date: '2023-11-11 01:15:05.000000', timezone_type: 3, timezone: 'America/Los_Angeles' },
    cancel_date: null,
    sub_end_date: null,
    next_bill_date: { date: '2023-11-18 01:15:05.000000', timezone_type: 3, timezone: 'America/Los_Angeles' },
    user_plan: {
      href: 'https://cbsi-entertainment-can.recurly.com/v2/plans/pplus_intl_de_monthly',
      planCode: 'pplus_intl_de_monthly',
      name: 'Paramount+ Monats-Abo',
    },
    plan_bill_amount: 7.99,
    pending_sub: null,
    addons: null,
    removed_addons: [],
    can_add_addons: [],
    currency_subunits: 100,
    total_overall_amount: 7.99,
    has_active_coupon: false,
    coupon: null,
    coupon_code: null,
    currency: 'EUR',
    next_bill_date_str: '18/11/23',
  },
  subscriptionStatus: {
    downgrade_maintenance_mode: false,
    scheduled_for_downgrade: false,
    cancel_date: null,
    scheduled_for_cancellation: false,
    user_can_cancel: true,
  },
};

const object4 = {
  planType: 'monthly',
  planTier: 'standard',
};

console.log(generateZodValidator(object3));
