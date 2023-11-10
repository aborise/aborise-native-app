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

console.log(generateZodValidator(objects2));
