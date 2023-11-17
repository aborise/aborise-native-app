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

// spotify
const object4 = {
  props: {
    pageProps: {
      widgets: {
        plan: {
          cta: {
            gaData: { category: 'Account Pages', action: 'Subscription Widget CTA clicked', label: 'change plan' },
            // or
            // "gaData":{
            //   "category":"Account Pages",
            //   "action":"Subscription Widget CTA clicked",
            //   "label":"join premium"
            // },
          },
          secondCta: {
            gaData: { category: 'Account Pages', action: 'Subscription Widget CTA clicked', label: 'cancel premium' },
          }, // or null
          plan: {
            name: 'Premium Family', // or "Spotify Free"
            expiryDate: null,
          },
          freeModule: null, // or  { "title":"Free" }
          paymentInfo: {
            billingInfo:
              'Du erhältst deine nächste Rechnung in Höhe von \u003cb class="recurring-price"\u003e17,99 €\u003c/b\u003e am \u003cb class="recurring-date"\u003e08.12.23\u003c/b\u003e.',
          }, // or null
          resubscriptionData: false,
        },
      },
      isError: false,
    },
    csrfToken: '013acda719615fca4ebd10c44b2005ea4a0d42951b31363939373739323830343332',
  },
};

// apple

const object5 = {
  subscriptions: [
    {
      serviceType: 'AppleTVPlus',
      dayBefore: '14.12.2023',
      expirationTimestamp: 1702655481000,
      type: 'TVChannels',
      appAdamId: 1174078549,
      renewalOptions: [
        {
          buyParams: {
            offerName: 'AppleTVPlus_1month_001',
            quantity: '1',
            price: '9990',
            pg: 'default',
            appExtVrsId: '847982783',
            buySubscription: 'true',
            salableAdamId: '1472441559',
            pricingParameters: 'STDQ',
            bid: 'com.apple.tv',
            subscriptionId: '420000062653628',
            appAdamId: '1174078549',
            productType: 'A',
          },
          period: 'P1M',
          isFamilyPlan: true,
          priceForBuy: '9990',
          price: '9,99 €',
          displayName: 'Apple TV+',
          isSalableSelected: true,
          rank: 1,
          adamId: '1472441559',
        },
        {
          buyParams: {
            offerName: 'AppleTVPlus_1year_001',
            quantity: '1',
            price: '99000',
            pg: 'default',
            appExtVrsId: '847982783',
            buySubscription: 'true',
            salableAdamId: '1478184786',
            pricingParameters: 'STDQ',
            bid: 'com.apple.tv',
            subscriptionId: '420000062653628',
            appAdamId: '1174078549',
            productType: 'A',
          },
          period: 'P1Y',
          isFamilyPlan: true,
          priceForBuy: '99000',
          price: '99,00 €',
          displayName: 'Apple TV+',
          isSalableSelected: false,
          rank: 1,
          adamId: '1478184786',
        },
      ],
      familyName: 'Apple TV‑kanal',
      nextPlan: {
        agreedToPrice: '9,99 €',
        period: 'P1M',
        isFamilyPlan: true,
        displayName: 'Apple TV+',
        salableAdamId: '1472441559',
      },
      isBundlable: true,
      isDiscontinued: false,
      latestPlan: {
        period: 'P1M',
        isFamilyPlan: true,
        displayName: 'Apple TV+',
        salableAdamId: '1472441559',
        paidPrice: '9,99 €',
      },
      expirationDate: '15.12.2023',
      isInFreeTrialPeriod: false,
      isAutoRenewEnabled: true,
      bundleId: 'com.apple.tv',
      currentPrice: '9,99 €',
      coverArt: {
        backgroundColor: 'rgb(50,50,50)',
        isTemplateUrl: true,
        width: 1080,
        url: 'https://is1-ssl.mzstatic.com/image/thumb/Features123/v4/8c/51/11/8c511172-6faa-643b-3615-2678e4a4280b/pr_source.png/{w}x{h}{c}-{q}.{f}',
        height: 1080,
      },
      familyId: 20534958,
      contentProviderName: 'Apple Inc.',
      showFamilyName: true,
      appHasMultipleSubscriptionFamily: true,
      subType: 'TVPlus',
      subscriptionId: '420000062653628',
      publicationName: 'Apple TV+',
      status: 'Active',
    },
  ],
  userInfo: { isValidStudent: false, isInFamily: false, shouldShowSharingMasterToggle: false },
  status: 0,
};

// joyn

const object6 = {
  webPaymentSettings: {
    stripePublicAPIKey: 'pk_live_XPNmgyeKB7UaBGPD9XQwTK2V00uxCmkoAI',
    paypalClientId: 'AfPnJMClV1R-CNXdpctubgLazXxJ5cUDPeImRKZRLGqWep1N4q22hEDtfXC3R7daG0JdtOO4vNqgKs5L',
    paypalPlans: {
      HD_PLAN_ID: 'P-6U244555WF719645ALXLD3RY',
      PREMIUM_PLAN_ID: 'P-6U244555WF719645ALXLD3RY',
      PLUS_PLAN_ID: 'P-6U244555WF719645ALXLD3RY',
    },
    canUseDirectDebit: true,
    canUsePaypal: true,
    useKlarnaCheckout: true,
    useBillingAgreements: false,
    allowedPaymentMethods: ['creditcard', 'klarna', 'paypal'],
  },
  hasActivePremium: false,
  hasActivePlus: false,
  hasActiveHD: false,
  userEmail: 'ulima.ums@gmail.com',
  freeTrialUntil: '2023-11-22T23:59:59.999',
  renewsOn: '2023-11-23T00:00',
  products: [
    {
      id: 'deplus',
      name: 'PLUS+',
      type: 'PLUS',
      country: 'DE',
      price: 699,
      freeTrialMonths: 1,
      freeTrialUntil: '2023-11-22T23:59:59.999',
      billingSummaryMessage:
        'Dein Testzeitraum endet am 22.11.2023. Wenn du bis dahin kündigst, wird dir nichts berechnet. Ansonsten verlängert sich deine Mitgliedschaft automatisch um einen Monat nach Ablauf des Testzeitraums. Der monatliche Preis beträgt dann 6,99 (inkl. MwSt.). Dein Vertrag ist jederzeit online zum Ende eines Vertragsmonats kündbar.',
      confirmationText:
        'Jetzt musst du nur noch auf den Button in der E-Mail drücken, die wir dir gerade geschickt haben, dann kannst du sofort PLUS+ nutzen. Bis 22.11.2023 kannst du es kostenlos ausprobieren. Wenn es dir gefällt, musst du nichts machen, dein Abo läuft dann einfach weiter.<p> Wenn es dir nicht gefällt, kannst du es jederzeit über deinen Account kündigen. Aber jetzt erst einmal viel Spaß mit PLUS+.',
      offerId: 'DefaultWithTrial',
      freeTrialDays: 7,
    },
  ],
  browseJoynLink: 'https://dev.joyn.de/',
  themeColor: '#4a148c',
  joynId: 'JNDE-9738fc7c-abcc-462e-b145-314abb44ae11',
  isAnonymous: false,
  gender: 'unknown',
  env: 'prd',
  accountsPath: 'https://auth.joyn.de',
  hasConfirmedEmail: true,
};

const object7 = [
  {
    id: 'sub_1OD7F9CIWjFzZsVYJfsNoH75',
    product: 'deplus',
    productId: 'deplus',
    provider: {
      name: 'stripe',
      token: 'pm_1OD7F6CIWjFzZsVY8raFypHF',
      details: { vendor: 'mastercard', indicator: '7896', expiry: '8/27' },
    },
    voucher: '',
    userDetails: { cardholder: 'L. Kuehne-Hellmessen', agreeterms: true },
    state: {
      state: 'active',
      started: '2023-11-16T16:12:35.138',
      expiresOn: '2023-11-22T23:59:59.999',
      renewOn: '2023-11-23T00:00',
      freeTrialUntil: '2023-11-22T23:59:59.999',
      currentPrice: 0,
      renewalPrice: 699,
      canCancelWeb: true,
      canReactivateWeb: false,
      isActive: true,
      canChangePayment: true,
      paymentState: 'trial',
      isPaused: false,
    },
    type: 'PLUS',
    config: {
      id: 'deplus',
      name: 'PLUS+',
      type: 'PLUS',
      country: 'DE',
      price: 699,
      freeTrialMonths: 1,
      freeTrialUntil: '2023-11-22T23:59:59.999',
      billingSummaryMessage:
        'Dein Testzeitraum endet am 22.11.2023. Wenn du bis dahin kündigst, wird dir nichts berechnet. Ansonsten verlängert sich deine Mitgliedschaft automatisch um einen Monat nach Ablauf des Testzeitraums. Der monatliche Preis beträgt dann 6,99 (inkl. MwSt.). Dein Vertrag ist jederzeit online zum Ende eines Vertragsmonats kündbar.',
      confirmationText:
        'Jetzt musst du nur noch auf den Button in der E-Mail drücken, die wir dir gerade geschickt haben, dann kannst du sofort PLUS+ nutzen. Bis 22.11.2023 kannst du es kostenlos ausprobieren. Wenn es dir gefällt, musst du nichts machen, dein Abo läuft dann einfach weiter.<p> Wenn es dir nicht gefällt, kannst du es jederzeit über deinen Account kündigen. Aber jetzt erst einmal viel Spaß mit PLUS+.',
      offerId: 'DefaultWithTrial',
      freeTrialDays: 7,
    },
    noBilling: false,
    isMaxdome12MonthContract: false,
    isMaxdomeBBO: false,
    isForceMigratedFromMaxdome: false,
    partnerName: 'joyn',
  },
];

// rtl

const object8 = {
  startDate: '2023-11-17',
  productName: 'Free',
  productSubscriptions: [
    {
      productId: 'FR001',
      productName: 'Free',
      contractType: 'INTERNAL',
      paymentBearerType: null,
      startDate: '2023-11-17',
      nextBillingDate: '2024-11-17',
      cancellationDate: null,
    },
  ],
  nextBillingDate: '2024-11-17',
  nextBillingPreviewAmount: { amountPayable: 0.0, totalGross: 0.0, billingDate: null },
  statusKey: 'subscription.status.active',
  customerStatusKey: 'customer.status.active',
  userCanTransition: true,
  userCanCancelSubscription: false,
  userCanRevertCancellation: false,
  userCanRedeemCouponCode: false,
  userCanDeletePaymentMethod: false,
  userIsInTrialPhase: false,
  userCanRedeemPrepaidCard: true,
  userCanPayWithDebit: true,
  userCanInheritPaymentBearer: false,
  userCanBeRetained: false,
  userCanChangeToDebit: false,
  cancellationEffectivenessDate: '2024-11-17',
  billingPeriod: { unit: 'YEAR', quantity: 1 },
  hasDiscount: false,
  writtenOff: false,
  isNewCustomer: true,
  eligibleForCreditTypes: [],
};

console.log(generateZodValidator(object8));
