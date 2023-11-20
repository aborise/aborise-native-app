**Note:** Dazn requires NO special characters in the password.
So Register flow cannot allow those

```bash
curl 'https://authentication-prod.ar.indazn.com/v5/SignIn' -X POST \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0 signin/4.34.5.57 hyper/0.14.0 (web; production; de)' \
  -H 'Content-Type: application/json' \
  --data-raw '{"Email":"dazn@aborise.com","Password":"CAX3bnt2wyqady4wmv"}'
```

```json
{
  "Result": "SignedInInactive",
  "AuthToken": {
    "Token": "{access_token}",
    "TokenType": "UserAccount",
    "IsRefreshable": true,
    "Expires": "2023-11-18T12:29:10.000Z",
    "CurrentTime": "2023-11-18T10:29:10.000Z"
  }
}
```

401

```json
{ "odata.error": { "code": 10049, "message": { "lang": "en-US", "value": "InvalidPassword" } } }
```

```bash
curl 'https://user-profile.ar.indazn.com/v1/UserProfile' -H 'Authorization: Bearer {access_token}'
```

```json
{
  "ViewerId": "e863d6070312",
  "FirstName": "Aborise",
  "LastName": "Test",
  "Email": "dazn@aborise.com",
  "UserCountryCode": "DE",
  "UserLanguageLocaleKey": "de",
  "UserTimeZoneSidKey": "Europe/Berlin",
  "UpdatedDateUtc": "2023-11-18T09:38:50.362Z",
  "GCPaymentExpiryDate": "9999-12-31",
  "Preferences": {
    "KeyMomentsDisabled": null,
    "OptedOutFromPersonalisation": null,
    "CaptionsPresets": [],
    "MultiTrackAudioLanguage": null,
    "DaznEmailMarketing": true,
    "NflEmailMarketing": false
  },
  "PriceRiseNotificationModal": false,
  "MyAccountStatus": "Synced",
  "SupportedLanguages": ["en", "de"],
  "HasSetPaymentMethod": null,
  "SourceSystem": "UNDETERMINED",
  "FirstSubscriptionDate": null,
  "CustomerType": null
}
```

```bash
curl 'https://subscriptions-service.ar.indazn.com/fe/v1/subscriptions' -H 'Authorization: Bearer {access_token}'

# or
curl 'https://myaccount-bff.ar.indazn.com/v2/subscriptions' -H 'Authorization: Bearer {access_token}'
```

First is 404!!

```json
{
  "error": {
    "code": "02002",
    "message": { "lang": "en-US", "value": "Subscription not found for user bdcc7b0a-bc53-490c-b2a9-e863d6070312" }
  }
}
```

Second

```json
[
  {
    "status": "Active",
    "id": "8a1295998bdd5e19018be23c6ad45df9",
    "subscriptionName": "A-S9b77462a938d78a0f7ff8dd47ee4edd1",
    "startDate": "2023-11-18T11:41:31.000Z",
    "latestSubscriptionStartDate": "2023-11-18T11:41:32.000Z",
    "contractEndsOn": "2024-08-01T00:00:00.000Z",
    "paymentMethod": {
      "type": "CreditCardReferenceTransaction",
      "details": {
        "creditCardMaskNumber": "************7896",
        "creditCardExpirationMonth": "8",
        "creditCardType": "MasterCard",
        "creditCardExpirationYear": "2027",
        "recurringDetailReference": "KNN8NP9HQ6CS3VW3"
      }
    },
    "nextPaymentDate": "2023-11-26T11:41:32.000Z",
    "freeTrialEndDate": "2023-11-25T11:41:32.000Z",
    "cancellableOnDate": "2023-11-18",
    "cancelledDate": null,
    "proRatedDays": 0,
    "activePass": { "currency": "EUR", "price": 44.99, "period": "Annual", "subscriptionTerm": "TERMED" },
    "canCancelKeep": true,
    "pauseEndDate": null,
    "inProgress": "NONE",
    "crossGradeCreatedDate": null,
    "zipCode": null,
    "requestRenewal": "true",
    "productGroup": "NFL",
    "numFreeTrialPeriods": "7",
    "freeTrialPeriodsType": "days",
    "pauseWindowStartDate": "2023-11-27",
    "pauseWindowEndDate": "2024-01-25",
    "tiers": { "currentPlan": { "id": "tier_nfl_pro", "name": "NFL Annual Season Pass DE" } }
  }
]
```

```bash
curl 'https://myaccount-bff.ar.indazn.com/v2/subscriptions/A-S9b77462a938d78a0f7ff8dd47ee4edd1/cancel' -X POST \
  -H 'Authorization: Bearer {access_token}' \
  -H 'Content-Type: application/json' \
  --data-raw '{"reason":"OTHER","comment":"","provider":"PureDazn"}'
```

```json

```

```bash
curl -X POST https://ott-authz-bff-prod.ar.indazn.com/v5/RefreshAccessToken -H "Content-Type: application/json" -H 'Authorization: Bearer {access_token}'
```

// test later with this token:
eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6IjJXZlVweldreUxEcS1aOXkyRG1Yb0VwNXM3SHBYd3FnZGluallsS3c5NWsifQ.eyJ1c2VyIjoiYmRjYzdiMGEtYmM1My00OTBjLWIyYTktZTg2M2Q2MDcwMzEyIiwiaXNzdWVkIjoxNzAwMzAyOTk0LCJ1c2Vyc3RhdHVzIjoiUGFydGlhbCIsInNvdXJjZVR5cGUiOiIiLCJwcm9kdWN0U3RhdHVzIjp7Ik5GTCI6IlBhcnRpYWwiLCJEQVpOIjoiUGFydGlhbCJ9LCJ2aWV3ZXJJZCI6ImU4NjNkNjA3MDMxMiIsImNvdW50cnkiOiJkZSIsImNvbnRlbnRDb3VudHJ5IjoiZGUiLCJob21lQ291bnRyeSI6ImRlIiwidXNlclR5cGUiOjMsImRldmljZUlkIjoiYmRjYzdiMGEtYmM1My00OTBjLWIyYTktZTg2M2Q2MDcwMz…ZF9kZXZpY2VzIjo1fSwiQ09OQ1VSUkVOQ1kiOnsibWF4X2RldmljZXMiOjJ9fX0sImxpbmtlZFNvY2lhbFBhcnRuZXJzIjpbXSwiZXhwIjoxNzAwMzEwMTk0LCJpc3MiOiJodHRwczovL2F1dGguYXIuaW5kYXpuLmNvbSJ9.bHUax3eUsrndChFqaaBp24RNia9pQdz2VeJ9baOvk-eIWNIx04eI1kBYMtEbNE-wH3yiBNUl1HcnfBAopZNJcqtna5NFJGnEAiMY-mAyUeVmJzJzD2_rOpKlSD5eQXnnUv993BOnb-1xaBJ_6yS8MQgTz5Akvo8zPl7rovfgDFZYz8IbwRMoEnrpxSDjptvya0tfndW8AO3xV7bMLwUm6s2A61mEzV-tT3H-nbvcNeByW8BHKK-XU17lim11ThXpkAG7g-OBybA9m82651hQywHAPtiF0rk3Nc4WeYEqqnkFP0mOXKUn6ZzFhtD9gMKXu1XBPQmQ2nFAs8eGWiiT2A
Expires "2023-11-18T12:23:14.000Z"

offers:

```bash
curl 'https://tiered-pricing-offer-service.ar.indazn.com/v1/offers' --compressed -X POST \
-H 'Authorization: Bearer {access_token}' \
-H 'Content-Type: application/json' \
 --data-raw '{"Platform":"web","Manufacturer":"","PromoLandingPageId":"","IsTiering":true,"ProductGroup":"","Version":""}'
```

```json
{
  "Offers": [
    {
      "Id": "Zuora_8a129b9c853873920185808893163e70",
      "SkuId": null,
      "BillingPeriod": "Month",
      "BillingDate": "2023-11-18T11:25:54Z",
      "RenewalDate": "2023-12-18T11:25:54Z",
      "ChargeTiers": [
        { "Price": 9.99, "Currency": "EUR", "Discount": null },
        { "Price": 10, "Currency": "GBP", "Discount": null }
      ],
      "RatePlanId": "8a129b9c853873920185808893163e70",
      "PaymentMethodIds": ["ApplePay", "GooglePay", "CreditCard", "PayPal"],
      "AllowsNoPaymentMethod": true,
      "FreeTrialMonths": 0,
      "TotalFreeMonths": 0,
      "Instalment": null,
      "EntitlementSetId": "tier_bronze_de",
      "TierRank": 10,
      "NextBillingDate": "2023-11-18T11:25:54Z",
      "Purchasable": true,
      "IsAccessCodeApplicable": false,
      "ProductGroup": ""
    },
    {
      "Id": "Zuora_8a128009890171e601891b6f196439d7",
      "SkuId": null,
      "BillingPeriod": "Month",
      "BillingDate": "2023-11-18T11:25:54Z",
      "RenewalDate": "2023-12-18T11:25:54Z",
      "ChargeTiers": [
        { "Price": 24.99, "Currency": "EUR", "Discount": null },
        { "Price": 10, "Currency": "GBP", "Discount": null }
      ],
      "RatePlanId": "8a128009890171e601891b6f196439d7",
      "PaymentMethodIds": ["ApplePay", "GooglePay", "CreditCard", "PayPal"],
      "AllowsNoPaymentMethod": true,
      "FreeTrialMonths": 0,
      "TotalFreeMonths": 0,
      "Instalment": null,
      "EntitlementSetId": "tier_supersport_de",
      "TierRank": 14,
      "NextBillingDate": "2023-11-18T11:25:54Z",
      "Purchasable": true,
      "IsAccessCodeApplicable": false,
      "ProductGroup": ""
    },
    {
      "Id": "Zuora_8a1283137e9a3744017e9acbdb713169",
      "SkuId": null,
      "BillingPeriod": "Month",
      "BillingDate": "2023-11-18T11:25:54Z",
      "RenewalDate": "2023-12-18T11:25:54Z",
      "ChargeTiers": [
        { "Price": 44.99, "Currency": "EUR", "Discount": null },
        { "Price": 10, "Currency": "GBP", "Discount": null }
      ],
      "RatePlanId": "8a1283137e9a3744017e9acbdb713169",
      "PaymentMethodIds": ["ApplePay", "GooglePay", "CreditCard", "PayPal"],
      "AllowsNoPaymentMethod": true,
      "FreeTrialMonths": 0,
      "TotalFreeMonths": 0,
      "Instalment": null,
      "EntitlementSetId": "tier_silver_de",
      "TierRank": 20,
      "NextBillingDate": "2023-11-18T11:25:54Z",
      "Purchasable": true,
      "IsAccessCodeApplicable": false,
      "ProductGroup": ""
    },
    {
      "Id": "Zuora_8a128aa885386ba701858083c6292192",
      "SkuId": null,
      "BillingPeriod": "Month",
      "BillingDate": "2023-11-18T11:25:54Z",
      "RenewalDate": "2023-12-18T11:25:54Z",
      "ChargeTiers": [
        { "Price": 44.99, "Currency": "EUR", "Discount": null },
        { "Price": 10, "Currency": "GBP", "Discount": null }
      ],
      "RatePlanId": "8a128aa885386ba701858083c6292192",
      "PaymentMethodIds": ["ApplePay", "GooglePay", "CreditCard", "PayPal"],
      "AllowsNoPaymentMethod": true,
      "FreeTrialMonths": 0,
      "TotalFreeMonths": 0,
      "Instalment": null,
      "EntitlementSetId": "tier_gold_de",
      "TierRank": 30,
      "NextBillingDate": "2023-11-18T11:25:54Z",
      "Purchasable": true,
      "IsAccessCodeApplicable": false,
      "ProductGroup": ""
    },
    {
      "Id": "Zuora_8a128432890171d101891b91643c7ac6",
      "SkuId": null,
      "BillingPeriod": "Instalments",
      "BillingDate": "2023-11-18T11:25:54Z",
      "RenewalDate": "2024-11-18T11:25:54Z",
      "ChargeTiers": [
        { "Price": 6.99, "Currency": "EUR", "Discount": null },
        { "Price": 10, "Currency": "GBP", "Discount": null }
      ],
      "RatePlanId": "8a128432890171d101891b91643c7ac6",
      "PaymentMethodIds": ["ApplePay", "GooglePay", "CreditCard", "PayPal"],
      "AllowsNoPaymentMethod": false,
      "FreeTrialMonths": 0,
      "TotalFreeMonths": 0,
      "Instalment": { "TermInMonths": 12, "NextPaymentCaptureDate": "2023-12-18T11:25:54Z" },
      "EntitlementSetId": "tier_bronze_de",
      "TierRank": 10,
      "NextBillingDate": "2023-11-18T11:25:54Z",
      "Purchasable": true,
      "IsAccessCodeApplicable": false,
      "ProductGroup": ""
    },
    {
      "Id": "Zuora_8a129ce889018aa601891b72ba5d072d",
      "SkuId": null,
      "BillingPeriod": "Instalments",
      "BillingDate": "2023-11-18T11:25:54Z",
      "RenewalDate": "2024-11-18T11:25:54Z",
      "ChargeTiers": [
        { "Price": 19.99, "Currency": "EUR", "Discount": null },
        { "Price": 10, "Currency": "GBP", "Discount": null }
      ],
      "RatePlanId": "8a129ce889018aa601891b72ba5d072d",
      "PaymentMethodIds": ["ApplePay", "GooglePay", "CreditCard", "PayPal"],
      "AllowsNoPaymentMethod": false,
      "FreeTrialMonths": 0,
      "TotalFreeMonths": 0,
      "Instalment": { "TermInMonths": 12, "NextPaymentCaptureDate": "2023-12-18T11:25:54Z" },
      "EntitlementSetId": "tier_supersport_de",
      "TierRank": 14,
      "NextBillingDate": "2023-11-18T11:25:54Z",
      "Purchasable": true,
      "IsAccessCodeApplicable": false,
      "ProductGroup": ""
    },
    {
      "Id": "Zuora_8a129d3a7e9a4fc6017eaf605f382dd3",
      "SkuId": null,
      "BillingPeriod": "Instalments",
      "BillingDate": "2023-11-18T11:25:54Z",
      "RenewalDate": "2024-11-18T11:25:54Z",
      "ChargeTiers": [
        { "Price": 29.99, "Currency": "EUR", "Discount": null },
        { "Price": 10, "Currency": "GBP", "Discount": null }
      ],
      "RatePlanId": "8a129d3a7e9a4fc6017eaf605f382dd3",
      "PaymentMethodIds": ["ApplePay", "GooglePay", "CreditCard", "PayPal"],
      "AllowsNoPaymentMethod": false,
      "FreeTrialMonths": 0,
      "TotalFreeMonths": 0,
      "Instalment": { "TermInMonths": 12, "NextPaymentCaptureDate": "2023-12-18T11:25:54Z" },
      "EntitlementSetId": "tier_silver_de",
      "TierRank": 20,
      "NextBillingDate": "2023-11-18T11:25:54Z",
      "Purchasable": true,
      "IsAccessCodeApplicable": false,
      "ProductGroup": ""
    },
    {
      "Id": "Zuora_8a129525853873990185808ee5e67af5",
      "SkuId": null,
      "BillingPeriod": "Instalments",
      "BillingDate": "2023-11-18T11:25:54Z",
      "RenewalDate": "2024-11-18T11:25:54Z",
      "ChargeTiers": [
        { "Price": 29.99, "Currency": "EUR", "Discount": null },
        { "Price": 10, "Currency": "GBP", "Discount": null }
      ],
      "RatePlanId": "8a129525853873990185808ee5e67af5",
      "PaymentMethodIds": ["ApplePay", "GooglePay", "CreditCard", "PayPal"],
      "AllowsNoPaymentMethod": false,
      "FreeTrialMonths": 0,
      "TotalFreeMonths": 0,
      "Instalment": { "TermInMonths": 12, "NextPaymentCaptureDate": "2023-12-18T11:25:54Z" },
      "EntitlementSetId": "tier_gold_de",
      "TierRank": 30,
      "NextBillingDate": "2023-11-18T11:25:54Z",
      "Purchasable": true,
      "IsAccessCodeApplicable": false,
      "ProductGroup": ""
    },
    {
      "Id": "Zuora_8a1298657e9a4fca017e9acde9a95ad3",
      "SkuId": null,
      "BillingPeriod": "Annual",
      "BillingDate": "2023-11-18T11:25:54Z",
      "RenewalDate": "2024-11-18T11:25:54Z",
      "ChargeTiers": [
        { "Price": 349.99, "Currency": "EUR", "Discount": null },
        { "Price": 120, "Currency": "GBP", "Discount": null }
      ],
      "RatePlanId": "8a1298657e9a4fca017e9acde9a95ad3",
      "PaymentMethodIds": ["ApplePay", "GooglePay", "CreditCard", "PayPal"],
      "AllowsNoPaymentMethod": true,
      "FreeTrialMonths": 0,
      "TotalFreeMonths": 0,
      "Instalment": null,
      "EntitlementSetId": "tier_silver_de",
      "TierRank": 20,
      "NextBillingDate": "2023-11-18T11:25:54Z",
      "Purchasable": true,
      "IsAccessCodeApplicable": false,
      "ProductGroup": ""
    },
    {
      "Id": "Zuora_8a1295258594917001859a78b29f67cc",
      "SkuId": null,
      "BillingPeriod": "Annual",
      "BillingDate": "2023-11-18T11:25:54Z",
      "RenewalDate": "2024-11-18T11:25:54Z",
      "ChargeTiers": [
        { "Price": 349.99, "Currency": "EUR", "Discount": null },
        { "Price": 120, "Currency": "GBP", "Discount": null }
      ],
      "RatePlanId": "8a1295258594917001859a78b29f67cc",
      "PaymentMethodIds": ["ApplePay", "GooglePay", "CreditCard", "PayPal"],
      "AllowsNoPaymentMethod": true,
      "FreeTrialMonths": 0,
      "TotalFreeMonths": 0,
      "Instalment": null,
      "EntitlementSetId": "tier_gold_de",
      "TierRank": 30,
      "NextBillingDate": "2023-11-18T11:25:54Z",
      "Purchasable": true,
      "IsAccessCodeApplicable": false,
      "ProductGroup": ""
    }
  ],
  "Addons": [],
  "FreeTrialIneligibilityReason": "ForcedHardOffer",
  "DiscountIneligibilityReason": "AccountStatusPreventsDiscount",
  "GiftCode": null,
  "PaymentMethods": [
    {
      "Id": "ApplePay",
      "BillingCountries": ["DE"],
      "SourceSystem": null,
      "Default": false,
      "RequireZipCode": false,
      "GiftCodeDisallowed": false
    },
    {
      "Id": "GooglePay",
      "BillingCountries": ["DE"],
      "SourceSystem": null,
      "Default": false,
      "RequireZipCode": false,
      "GiftCodeDisallowed": false
    },
    {
      "Id": "CreditCard",
      "BillingCountries": ["DE"],
      "SourceSystem": null,
      "Default": true,
      "RequireZipCode": false,
      "GiftCodeDisallowed": false
    },
    {
      "Id": "PayPal",
      "BillingCountries": ["DE"],
      "SourceSystem": null,
      "Default": false,
      "RequireZipCode": false,
      "GiftCodeDisallowed": false
    }
  ],
  "NoOfferFreeTrialMonths": 0,
  "Entitlements": [
    {
      "setId": "tier_bronze_de",
      "entitlementIds": [
        "entitlement_multiple_devices_3",
        "entitlement_disallow_watch_concurrency",
        "e_bronze_de",
        "e_bronze_art_de",
        "e_bronze_super_de",
        "e_bronze_super_silver_de",
        "base_dazn_content"
      ],
      "features": {
        "DEVICE": { "access_device": "any", "max_registered_devices": 3 },
        "CONCURRENCY": { "max_devices": 1 }
      },
      "content": [
        "e_bronze_de",
        "e_bronze_art_de",
        "base_dazn_content",
        "e_bronze_super_silver_de",
        "e_bronze_super_de"
      ]
    },
    {
      "setId": "tier_supersport_de",
      "entitlementIds": [
        "entitlement_multiple_devices_3",
        "entitlement_disallow_watch_concurrency",
        "e_bronze_art_de",
        "e_silver_super_de",
        "e_bronze_super_de",
        "e_bronze_super_silver_de",
        "base_dazn_content"
      ],
      "features": {
        "DEVICE": { "access_device": "any", "max_registered_devices": 3 },
        "CONCURRENCY": { "max_devices": 1 }
      },
      "content": [
        "e_bronze_art_de",
        "base_dazn_content",
        "e_bronze_super_silver_de",
        "e_bronze_super_de",
        "e_silver_super_de"
      ]
    },
    {
      "setId": "tier_silver_de",
      "entitlementIds": [
        "entitlement_multiple_devices_3",
        "entitlement_disallow_watch_concurrency",
        "e_silver_de",
        "e_silver_art_de",
        "e_silver_super_de",
        "e_bronze_super_silver_de",
        "base_dazn_content"
      ],
      "features": {
        "DEVICE": { "access_device": "any", "max_registered_devices": 3 },
        "CONCURRENCY": { "max_devices": 1 }
      },
      "content": [
        "e_silver_de",
        "e_silver_art_de",
        "base_dazn_content",
        "e_bronze_super_silver_de",
        "e_silver_super_de"
      ]
    },
    {
      "setId": "tier_gold_de",
      "entitlementIds": [
        "entitlement_multiple_devices_20",
        "entitlement_allow_watch_concurrency_3",
        "e_bronze_de",
        "e_silver_de",
        "e_bronze_art_de",
        "e_silver_art_de",
        "e_silver_super_de",
        "e_bronze_super_de",
        "e_bronze_super_silver_de",
        "base_dazn_content"
      ],
      "features": {
        "DEVICE": { "max_registered_devices": 20, "access_device": "any" },
        "CONCURRENCY": { "max_devices": 3 }
      },
      "content": [
        "e_bronze_de",
        "e_silver_de",
        "e_bronze_art_de",
        "e_silver_art_de",
        "base_dazn_content",
        "e_bronze_super_silver_de",
        "e_bronze_super_de",
        "e_silver_super_de"
      ]
    }
  ]
}
```
