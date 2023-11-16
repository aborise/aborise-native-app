# Apple TV+

```bash
curl 'https://buy.tv.apple.com/commerce/web/subscription/status/tv' -H 'authorization: Bearer xxx' -H 'Cookie: xxx'
```

```json
{
  "tv": {
    "isPurchaser": true,
    "isFamilySharable": true,
    "expireDate": 1702655481000,
    "adamId": "1472441559",
    "status": "Enabled"
  },
  "account": { "isMinor": false, "suspectUnderage": false },
  "status": 0
}
```

```json
{ "tv": { "status": "Disabled" }, "account": {}, "status": 0 }
```

```json
{ "tv": { "status": "Disabled" }, "account": { "isMinor": false, "suspectUnderage": false }, "status": 0 }
```

```bash
curl 'https://buy.tv.apple.com/commerce/web/subscription?subscriptionType=tv' -H 'Cookie: xxx'
```

```json
{
  "subscriptions": [
    {
      "serviceType": "AppleTVPlus",
      "dayBefore": "14.12.2023",
      "expirationTimestamp": 1702655481000,
      "type": "TVChannels",
      "appAdamId": 1174078549,
      "renewalOptions": [
        {
          "buyParams": {
            "offerName": "AppleTVPlus_1month_001",
            "quantity": "1",
            "price": "9990",
            "pg": "default",
            "appExtVrsId": "847982783",
            "buySubscription": "true",
            "salableAdamId": "1472441559",
            "pricingParameters": "STDQ",
            "bid": "com.apple.tv",
            "subscriptionId": "420000062653628",
            "appAdamId": "1174078549",
            "productType": "A"
          },
          "period": "P1M",
          "isFamilyPlan": true,
          "priceForBuy": "9990",
          "price": "9,99 €",
          "displayName": "Apple TV+",
          "isSalableSelected": true,
          "rank": 1,
          "adamId": "1472441559"
        },
        {
          "buyParams": {
            "offerName": "AppleTVPlus_1year_001",
            "quantity": "1",
            "price": "99000",
            "pg": "default",
            "appExtVrsId": "847982783",
            "buySubscription": "true",
            "salableAdamId": "1478184786",
            "pricingParameters": "STDQ",
            "bid": "com.apple.tv",
            "subscriptionId": "420000062653628",
            "appAdamId": "1174078549",
            "productType": "A"
          },
          "period": "P1Y",
          "isFamilyPlan": true,
          "priceForBuy": "99000",
          "price": "99,00 €",
          "displayName": "Apple TV+",
          "isSalableSelected": false,
          "rank": 1,
          "adamId": "1478184786"
        }
      ],
      "familyName": "Apple TV‑kanal",
      "nextPlan": {
        "agreedToPrice": "9,99 €",
        "period": "P1M",
        "isFamilyPlan": true,
        "displayName": "Apple TV+",
        "salableAdamId": "1472441559"
      },
      "isBundlable": true,
      "isDiscontinued": false,
      "latestPlan": {
        "period": "P1M",
        "isFamilyPlan": true,
        "displayName": "Apple TV+",
        "salableAdamId": "1472441559",
        "paidPrice": "9,99 €"
      },
      "expirationDate": "15.12.2023",
      "isInFreeTrialPeriod": false,
      "isAutoRenewEnabled": true,
      "bundleId": "com.apple.tv",
      "currentPrice": "9,99 €",
      "coverArt": {
        "backgroundColor": "rgb(50,50,50)",
        "isTemplateUrl": true,
        "width": 1080,
        "url": "https://is1-ssl.mzstatic.com/image/thumb/Features123/v4/8c/51/11/8c511172-6faa-643b-3615-2678e4a4280b/pr_source.png/{w}x{h}{c}-{q}.{f}",
        "height": 1080
      },
      "familyId": 20534958,
      "contentProviderName": "Apple Inc.",
      "showFamilyName": true,
      "appHasMultipleSubscriptionFamily": true,
      "subType": "TVPlus",
      "subscriptionId": "420000062653628",
      "publicationName": "Apple TV+",
      "status": "Active"
    }
  ],
  "userInfo": { "isValidStudent": false, "isInFamily": false, "shouldShowSharingMasterToggle": false },
  "status": 0
}
```

```json
{
  "subscriptions": [],
  "userInfo": { "isValidStudent": false, "isInFamily": false, "shouldShowSharingMasterToggle": false },
  "status": 0
}
```

```bash
curl 'https://buy.tv.apple.com/commerce/web/subscription/offers/tv' -H 'authorization: Bearer xxx' -H 'Cookie: xxx'
```

```json
{
  "offers": [
    {
      "isSubscriptionShareable": true,
      "isOfferable": true,
      "price": "9,99 €",
      "buyParams": {
        "offerName": "AppleTVPlus_1month_001",
        "offrd-free-trial": "false",
        "price": "9990",
        "pg": "default",
        "appExtVrsId": "858963434",
        "salableAdamId": "1472441559",
        "pricingParameters": "STDQ",
        "bid": "com.apple.tv",
        "productType": "A",
        "appAdamId": "1174078549"
      },
      "adamId": 1472441559,
      "freeTrialPeriod": "P7D",
      "isBundle": false,
      "renewalPeriod": "P1M",
      "introOfferPrice": null,
      "introPeriod": null,
      "subscriptionType": "Apple TV+",
      "clientIntegrationType": null,
      "capacityInBytes": null,
      "isIntroOffer": false,
      "eligibilityType": "NONE"
    }
  ],
  "status": 0
}
```
