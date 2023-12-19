```bash
curl 'https://ottsas.sky.com/commerce/is/availableproducts?showPricing=true' --compressed \
  -H 'X-SkyOTT-UserToken: {cookie:skyUMV}' \
  -H 'X-SkyOTT-Platform: PC' \
  -H 'X-SkyOTT-Device: COMPUTER'  \
  -H 'X-SkyOTT-Territory: DE' \
  -H 'X-SkyOTT-Provider: NOWTV' \
  -H 'X-SkyOTT-Proposition: NOWTV' \
  -H 'X-SkyID-Token: {cookie:skyCEsidismesso01}'
```

```json
{
  "currency": "EUR",
  "products": [
    {
      "static_id": "ENTERTAINMENT_SUBSCRIPTION_MONTH",
      "business_id": "C_007153",
      "available": false,
      "category": "ENTERTAINMENT",
      "data": {
        "links": {
          "self": "/adapter-atlas/v2/query/node/52f3e558-fe85-11eb-aae2-8bfcfcee244c"
        },
        "id": "52f3e558-fe85-11eb-aae2-8bfcfcee244c",
        "type": "PROMOTION/PRODUCT/SUBSCRIPTION",
        "attributes": {
          "addressRequired": false,
          "availableEndDate": "2099-12-31T00:00:00Z",
          "availableStartDate": "2019-01-31T00:00:00Z",
          "billingDescription": "ENT1M",
          "businessId": "C_007153",
          "category": "ENTERTAINMENT",
          "childNodeTypes": ["PROMOTION/CONTEXT/PASS", "PROMOTION/CONTEXT/SIGNUP"],
          "createdDate": 1629113414075,
          "itemType": "MONTHLY_SUBSCRIPTION",
          "price": [
            {
              "currency": "EUR",
              "nonRecurringPointOfSale": "0.00",
              "recurringFull": "7.99",
              "defaultDuration": false
            }
          ],
          "saleable": true,
          "sectionNavigation": "ENTERTAINMENT",
          "staticId": "ENTERTAINMENT_SUBSCRIPTION_MONTH",
          "title": "Serien Monatsabo"
        },
        "relationships": {
          "mypasses": {
            "data": [
              {
                "links": {
                  "self": "/adapter-atlas/v2/query/node/bb5eb6f4-0b0f-11ec-a464-6bc9301d2348"
                },
                "id": "bb5eb6f4-0b0f-11ec-a464-6bc9301d2348",
                "type": "PROMOTION/CONTEXT/PASS",
                "attributes": {
                  "childNodeTypes": ["CMS/IMAGE/MASTER"],
                  "createdDate": 1630492273748
                },
                "relationships": {
                  "active-images": {
                    "data": [
                      {
                        "id": "23da8462-e61e-11ec-a250-33cb2543460b",
                        "type": "CMS/IMAGE/MASTER",
                        "attributes": {
                          "alttext": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_SERIEN",
                          "checksum": "1932679102",
                          "createdDate": "2022-06-07 04:56:07.242",
                          "deviceAvailability": {
                            "available": true
                          },
                          "expirationDate": "1970-01-01 00:00:00.0",
                          "filename": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_SERIEN.png",
                          "formats": {
                            "UNKNOWN": {
                              "eventStage": "NOTAPPLICABLE",
                              "availability": {
                                "available": true,
                                "mediaType": "CUTV",
                                "offerStage": "NOTAPPLICABLE",
                                "offerStartTs": 0,
                                "offerEndTs": 253370764800000,
                                "streamable": false,
                                "downloadable": false,
                                "extendedOfferStartTs": 0,
                                "extendedOfferEndTs": 253370764800000
                              },
                              "startOfCredits": 0
                            }
                          },
                          "height": 755,
                          "language": "any",
                          "modifiedDate": "2022-06-07 04:56:07.242",
                          "title": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_SERIEN",
                          "type": "AGG_SOURCE",
                          "url": "https://de.imageservice.sky.com/pcms/23da8462-e61e-11ec-a250-33cb2543460b/AGG_SOURCE?territory=DE&proposition=NOWTV&language=ger",
                          "width": 1339
                        }
                      }
                    ]
                  }
                }
              }
            ]
          },
          "signup": {
            "data": [
              {
                "links": {
                  "self": "/adapter-atlas/v2/query/node/bb64a032-0b0f-11ec-a46c-9b5d72d2ed15"
                },
                "id": "bb64a032-0b0f-11ec-a46c-9b5d72d2ed15",
                "type": "PROMOTION/CONTEXT/SIGNUP",
                "attributes": {
                  "childNodeTypes": ["CMS/IMAGE/MASTER"],
                  "createdDate": 1630492273748
                },
                "relationships": {
                  "images": {
                    "data": [
                      {
                        "id": "23da8462-e61e-11ec-a250-33cb2543460b",
                        "type": "CMS/IMAGE/MASTER",
                        "attributes": {
                          "alttext": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_SERIEN",
                          "checksum": "1932679102",
                          "createdDate": "2022-06-07 04:56:07.242",
                          "deviceAvailability": {
                            "available": true
                          },
                          "expirationDate": "1970-01-01 00:00:00.0",
                          "filename": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_SERIEN.png",
                          "formats": {
                            "UNKNOWN": {
                              "eventStage": "NOTAPPLICABLE",
                              "availability": {
                                "available": true,
                                "mediaType": "CUTV",
                                "offerStage": "NOTAPPLICABLE",
                                "offerStartTs": 0,
                                "offerEndTs": 253370764800000,
                                "streamable": false,
                                "downloadable": false,
                                "extendedOfferStartTs": 0,
                                "extendedOfferEndTs": 253370764800000
                              },
                              "startOfCredits": 0
                            }
                          },
                          "height": 755,
                          "language": "any",
                          "modifiedDate": "2022-06-07 04:56:07.242",
                          "title": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_SERIEN",
                          "type": "AGG_SOURCE",
                          "url": "https://de.imageservice.sky.com/pcms/23da8462-e61e-11ec-a250-33cb2543460b/AGG_SOURCE?territory=DE&proposition=NOWTV&language=ger",
                          "width": 1339
                        }
                      }
                    ]
                  }
                }
              }
            ]
          }
        }
      },
      "price": [
        {
          "non-recurring": "0.00",
          "recurring": "7.99"
        }
      ]
    },
    {
      "static_id": "ENTERTAINMENT_UPFRONT_PASS",
      "business_id": "C_011152",
      "available": true,
      "category": "ENTERTAINMENT",
      "data": {
        "links": {
          "self": "/adapter-atlas/v2/query/node/5310ba48-fe85-11eb-ab00-c35657e1833a"
        },
        "id": "5310ba48-fe85-11eb-ab00-c35657e1833a",
        "type": "PROMOTION/PRODUCT/SUBSCRIPTION",
        "attributes": {
          "addressRequired": false,
          "availableEndDate": "2099-12-31T00:00:00Z",
          "availableStartDate": "2021-06-07T00:00:00Z",
          "billingDescription": "Serienabo einmalig",
          "businessId": "C_011152",
          "category": "ENTERTAINMENT",
          "childNodeTypes": ["PROMOTION/CONTEXT/PASS", "PROMOTION/CONTEXT/SIGNUP"],
          "createdDate": 1629113414264,
          "durations": ["P2M", "P3M", "P9M", "P11M", "P5M", "P12M", "P4M", "P6M", "P10M", "P8M", "P7M"],
          "itemType": "UP_FRONT_PAID_SUBSCRIPTION",
          "price": [
            {
              "duration": "P9M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "71.91",
              "recurringFull": "7.99",
              "defaultDuration": false
            },
            {
              "duration": "P11M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "87.89",
              "recurringFull": "7.99",
              "defaultDuration": false
            },
            {
              "duration": "P12M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "95.88",
              "recurringFull": "7.99",
              "defaultDuration": false
            },
            {
              "duration": "P4M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "31.96",
              "recurringFull": "7.99",
              "defaultDuration": false
            },
            {
              "duration": "P10M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "79.90",
              "recurringFull": "7.99",
              "defaultDuration": false
            },
            {
              "duration": "P8M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "63.92",
              "recurringFull": "7.99",
              "defaultDuration": false
            },
            {
              "duration": "P5M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "39.95",
              "recurringFull": "7.99",
              "defaultDuration": false
            },
            {
              "duration": "P2M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "15.98",
              "recurringFull": "7.99",
              "defaultDuration": false
            },
            {
              "duration": "P6M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "47.94",
              "recurringFull": "7.99",
              "defaultDuration": false
            },
            {
              "duration": "P7M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "55.93",
              "recurringFull": "7.99",
              "defaultDuration": false
            },
            {
              "duration": "P3M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "23.97",
              "recurringFull": "7.99",
              "defaultDuration": false
            }
          ],
          "saleable": false,
          "staticId": "ENTERTAINMENT_UPFRONT_PASS",
          "title": "Serienabo einmalig",
          "uris": ["duration"]
        },
        "relationships": {
          "mypasses": {
            "data": [
              {
                "links": {
                  "self": "/adapter-atlas/v2/query/node/3fd92b8c-0fb9-11ec-91d4-9bfe143dcd4d"
                },
                "id": "3fd92b8c-0fb9-11ec-91d4-9bfe143dcd4d",
                "type": "PROMOTION/CONTEXT/PASS",
                "attributes": {
                  "childNodeTypes": ["CMS/IMAGE/MASTER"],
                  "createdDate": 1631004885591
                },
                "relationships": {
                  "active-images": {
                    "data": [
                      {
                        "id": "23da8462-e61e-11ec-a250-33cb2543460b",
                        "type": "CMS/IMAGE/MASTER",
                        "attributes": {
                          "alttext": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_SERIEN",
                          "checksum": "1932679102",
                          "createdDate": "2022-06-07 04:56:07.242",
                          "deviceAvailability": {
                            "available": true
                          },
                          "expirationDate": "1970-01-01 00:00:00.0",
                          "filename": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_SERIEN.png",
                          "formats": {
                            "UNKNOWN": {
                              "eventStage": "NOTAPPLICABLE",
                              "availability": {
                                "available": true,
                                "mediaType": "CUTV",
                                "offerStage": "NOTAPPLICABLE",
                                "offerStartTs": 0,
                                "offerEndTs": 253370764800000,
                                "streamable": false,
                                "downloadable": false,
                                "extendedOfferStartTs": 0,
                                "extendedOfferEndTs": 253370764800000
                              },
                              "startOfCredits": 0
                            }
                          },
                          "height": 755,
                          "language": "any",
                          "modifiedDate": "2022-06-07 04:56:07.242",
                          "title": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_SERIEN",
                          "type": "AGG_SOURCE",
                          "url": "https://de.imageservice.sky.com/pcms/23da8462-e61e-11ec-a250-33cb2543460b/AGG_SOURCE?territory=DE&proposition=NOWTV&language=ger",
                          "width": 1339
                        }
                      }
                    ]
                  }
                }
              }
            ]
          },
          "signup": {
            "data": [
              {
                "links": {
                  "self": "/adapter-atlas/v2/query/node/3fe42ca8-0fb9-11ec-91dc-17aa9db39060"
                },
                "id": "3fe42ca8-0fb9-11ec-91dc-17aa9db39060",
                "type": "PROMOTION/CONTEXT/SIGNUP",
                "attributes": {
                  "childNodeTypes": ["CMS/IMAGE/MASTER"],
                  "createdDate": 1631004885591
                },
                "relationships": {
                  "images": {
                    "data": [
                      {
                        "id": "23da8462-e61e-11ec-a250-33cb2543460b",
                        "type": "CMS/IMAGE/MASTER",
                        "attributes": {
                          "alttext": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_SERIEN",
                          "checksum": "1932679102",
                          "createdDate": "2022-06-07 04:56:07.242",
                          "deviceAvailability": {
                            "available": true
                          },
                          "expirationDate": "1970-01-01 00:00:00.0",
                          "filename": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_SERIEN.png",
                          "formats": {
                            "UNKNOWN": {
                              "eventStage": "NOTAPPLICABLE",
                              "availability": {
                                "available": true,
                                "mediaType": "CUTV",
                                "offerStage": "NOTAPPLICABLE",
                                "offerStartTs": 0,
                                "offerEndTs": 253370764800000,
                                "streamable": false,
                                "downloadable": false,
                                "extendedOfferStartTs": 0,
                                "extendedOfferEndTs": 253370764800000
                              },
                              "startOfCredits": 0
                            }
                          },
                          "height": 755,
                          "language": "any",
                          "modifiedDate": "2022-06-07 04:56:07.242",
                          "title": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_SERIEN",
                          "type": "AGG_SOURCE",
                          "url": "https://de.imageservice.sky.com/pcms/23da8462-e61e-11ec-a250-33cb2543460b/AGG_SOURCE?territory=DE&proposition=NOWTV&language=ger",
                          "width": 1339
                        }
                      }
                    ]
                  }
                }
              }
            ]
          }
        }
      },
      "price": [
        {
          "duration": "P9M",
          "non-recurring": "71.91",
          "recurring": "7.99",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "71.91"
        },
        {
          "duration": "P11M",
          "non-recurring": "87.89",
          "recurring": "7.99",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "87.89"
        },
        {
          "duration": "P12M",
          "non-recurring": "95.88",
          "recurring": "7.99",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "95.88"
        },
        {
          "duration": "P4M",
          "non-recurring": "31.96",
          "recurring": "7.99",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "31.96"
        },
        {
          "duration": "P10M",
          "non-recurring": "79.90",
          "recurring": "7.99",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "79.90"
        },
        {
          "duration": "P8M",
          "non-recurring": "63.92",
          "recurring": "7.99",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "63.92"
        },
        {
          "duration": "P5M",
          "non-recurring": "39.95",
          "recurring": "7.99",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "39.95"
        },
        {
          "duration": "P2M",
          "non-recurring": "15.98",
          "recurring": "7.99",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "15.98"
        },
        {
          "duration": "P6M",
          "non-recurring": "47.94",
          "recurring": "7.99",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "47.94"
        },
        {
          "duration": "P7M",
          "non-recurring": "55.93",
          "recurring": "7.99",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "55.93"
        },
        {
          "duration": "P3M",
          "non-recurring": "23.97",
          "recurring": "7.99",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "23.97"
        }
      ],
      "included_products": ["C_007153"]
    },
    {
      "static_id": "ENTERTAINMENT_FREE_TRIAL",
      "business_id": "C_010809",
      "available": false,
      "category": "ENTERTAINMENT",
      "data": {
        "links": {
          "self": "/adapter-atlas/v2/query/node/5281bf82-fe85-11eb-aac3-ef577a49f7d0"
        },
        "id": "5281bf82-fe85-11eb-aac3-ef577a49f7d0",
        "type": "PROMOTION/PRODUCT/SUBSCRIPTION",
        "attributes": {
          "addressRequired": false,
          "availableEndDate": "2099-12-31T00:00:00Z",
          "availableStartDate": "2016-04-11T00:00:00Z",
          "billingDescription": "ENT",
          "businessId": "C_010809",
          "category": "ENTERTAINMENT",
          "childNodeTypes": ["PROMOTION/CONTEXT/PASS", "PROMOTION/CONTEXT/SIGNUP"],
          "createdDate": 1629113413327,
          "durations": ["P7D"],
          "itemType": "TRIAL_SUBSCRIPTION",
          "price": [
            {
              "currency": "EUR",
              "nonRecurringPointOfSale": "0.00",
              "recurringFull": "7.99",
              "defaultDuration": false
            }
          ],
          "saleable": false,
          "staticId": "ENTERTAINMENT_FREE_TRIAL",
          "title": "Serien 7 Tage Probezeitraum",
          "uris": ["duration"]
        },
        "relationships": {
          "mypasses": {
            "data": [
              {
                "links": {
                  "self": "/adapter-atlas/v2/query/node/a707a520-0b10-11ec-bdad-2f7e002628aa"
                },
                "id": "a707a520-0b10-11ec-bdad-2f7e002628aa",
                "type": "PROMOTION/CONTEXT/PASS",
                "attributes": {
                  "childNodeTypes": ["CMS/IMAGE/MASTER"],
                  "createdDate": 1630492669114
                },
                "relationships": {
                  "active-images": {
                    "data": [
                      {
                        "id": "23da8462-e61e-11ec-a250-33cb2543460b",
                        "type": "CMS/IMAGE/MASTER",
                        "attributes": {
                          "alttext": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_SERIEN",
                          "checksum": "1932679102",
                          "createdDate": "2022-06-07 04:56:07.242",
                          "deviceAvailability": {
                            "available": true
                          },
                          "expirationDate": "1970-01-01 00:00:00.0",
                          "filename": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_SERIEN.png",
                          "formats": {
                            "UNKNOWN": {
                              "eventStage": "NOTAPPLICABLE",
                              "availability": {
                                "available": true,
                                "mediaType": "CUTV",
                                "offerStage": "NOTAPPLICABLE",
                                "offerStartTs": 0,
                                "offerEndTs": 253370764800000,
                                "streamable": false,
                                "downloadable": false,
                                "extendedOfferStartTs": 0,
                                "extendedOfferEndTs": 253370764800000
                              },
                              "startOfCredits": 0
                            }
                          },
                          "height": 755,
                          "language": "any",
                          "modifiedDate": "2022-06-07 04:56:07.242",
                          "title": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_SERIEN",
                          "type": "AGG_SOURCE",
                          "url": "https://de.imageservice.sky.com/pcms/23da8462-e61e-11ec-a250-33cb2543460b/AGG_SOURCE?territory=DE&proposition=NOWTV&language=ger",
                          "width": 1339
                        }
                      }
                    ]
                  }
                }
              }
            ]
          },
          "signup": {
            "data": [
              {
                "links": {
                  "self": "/adapter-atlas/v2/query/node/a70e663a-0b10-11ec-bdb5-cb00342b7944"
                },
                "id": "a70e663a-0b10-11ec-bdb5-cb00342b7944",
                "type": "PROMOTION/CONTEXT/SIGNUP",
                "attributes": {
                  "childNodeTypes": ["CMS/IMAGE/MASTER"],
                  "createdDate": 1630492669114
                },
                "relationships": {
                  "images": {
                    "data": [
                      {
                        "id": "23da8462-e61e-11ec-a250-33cb2543460b",
                        "type": "CMS/IMAGE/MASTER",
                        "attributes": {
                          "alttext": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_SERIEN",
                          "checksum": "1932679102",
                          "createdDate": "2022-06-07 04:56:07.242",
                          "deviceAvailability": {
                            "available": true
                          },
                          "expirationDate": "1970-01-01 00:00:00.0",
                          "filename": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_SERIEN.png",
                          "formats": {
                            "UNKNOWN": {
                              "eventStage": "NOTAPPLICABLE",
                              "availability": {
                                "available": true,
                                "mediaType": "CUTV",
                                "offerStage": "NOTAPPLICABLE",
                                "offerStartTs": 0,
                                "offerEndTs": 253370764800000,
                                "streamable": false,
                                "downloadable": false,
                                "extendedOfferStartTs": 0,
                                "extendedOfferEndTs": 253370764800000
                              },
                              "startOfCredits": 0
                            }
                          },
                          "height": 755,
                          "language": "any",
                          "modifiedDate": "2022-06-07 04:56:07.242",
                          "title": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_SERIEN",
                          "type": "AGG_SOURCE",
                          "url": "https://de.imageservice.sky.com/pcms/23da8462-e61e-11ec-a250-33cb2543460b/AGG_SOURCE?territory=DE&proposition=NOWTV&language=ger",
                          "width": 1339
                        }
                      }
                    ]
                  }
                }
              }
            ]
          }
        }
      },
      "price": [
        {
          "non-recurring": "0.00",
          "recurring": "7.99"
        }
      ],
      "included_products": ["C_007153"]
    },
    {
      "static_id": "CINEMA_SUBSCRIPTION_MONTH",
      "business_id": "C_010785",
      "available": true,
      "category": "CINEMA",
      "data": {
        "links": {
          "self": "/adapter-atlas/v2/query/node/53a632ee-fe85-11eb-aba8-b771b79e8418"
        },
        "id": "53a632ee-fe85-11eb-aba8-b771b79e8418",
        "type": "PROMOTION/PRODUCT/SUBSCRIPTION",
        "attributes": {
          "addressRequired": false,
          "availableEndDate": "2099-12-31T00:00:00Z",
          "availableStartDate": "2021-02-10T00:00:00Z",
          "billingDescription": "CIN1M",
          "businessId": "C_010785",
          "category": "CINEMA",
          "childNodeTypes": ["PROMOTION/CONTEXT/PASS", "PROMOTION/CONTEXT/SIGNUP"],
          "createdDate": 1629113415243,
          "itemType": "MONTHLY_SUBSCRIPTION",
          "price": [
            {
              "currency": "EUR",
              "nonRecurringPointOfSale": "0.00",
              "recurringFull": "7.99",
              "defaultDuration": false
            }
          ],
          "saleable": true,
          "sectionNavigation": "CINEMA",
          "staticId": "CINEMA_SUBSCRIPTION_MONTH",
          "title": "Filme Monatsabo"
        },
        "relationships": {
          "mypasses": {
            "data": [
              {
                "links": {
                  "self": "/adapter-atlas/v2/query/node/93cde39e-0b0f-11ec-9869-2378672219c2"
                },
                "id": "93cde39e-0b0f-11ec-9869-2378672219c2",
                "type": "PROMOTION/CONTEXT/PASS",
                "attributes": {
                  "childNodeTypes": ["CMS/IMAGE/MASTER"],
                  "createdDate": 1630492207365
                },
                "relationships": {
                  "active-images": {
                    "data": [
                      {
                        "id": "083ca460-e61e-11ec-a116-2bec812923b0",
                        "type": "CMS/IMAGE/MASTER",
                        "attributes": {
                          "alttext": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_FILME",
                          "checksum": "3453662166",
                          "createdDate": "2022-06-07 04:55:20.973",
                          "deviceAvailability": {
                            "available": true
                          },
                          "expirationDate": "1970-01-01 00:00:00.0",
                          "filename": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_FILME.png",
                          "formats": {
                            "UNKNOWN": {
                              "eventStage": "NOTAPPLICABLE",
                              "availability": {
                                "available": true,
                                "mediaType": "CUTV",
                                "offerStage": "NOTAPPLICABLE",
                                "offerStartTs": 0,
                                "offerEndTs": 253370764800000,
                                "streamable": false,
                                "downloadable": false,
                                "extendedOfferStartTs": 0,
                                "extendedOfferEndTs": 253370764800000
                              },
                              "startOfCredits": 0
                            }
                          },
                          "height": 755,
                          "language": "any",
                          "modifiedDate": "2022-06-07 04:55:20.973",
                          "title": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_FILME",
                          "type": "AGG_SOURCE",
                          "url": "https://de.imageservice.sky.com/pcms/083ca460-e61e-11ec-a116-2bec812923b0/AGG_SOURCE?territory=DE&proposition=NOWTV&language=ger",
                          "width": 1338
                        }
                      }
                    ]
                  }
                }
              }
            ]
          },
          "signup": {
            "data": [
              {
                "links": {
                  "self": "/adapter-atlas/v2/query/node/93d3f36a-0b0f-11ec-9871-93a3eed06407"
                },
                "id": "93d3f36a-0b0f-11ec-9871-93a3eed06407",
                "type": "PROMOTION/CONTEXT/SIGNUP",
                "attributes": {
                  "childNodeTypes": ["CMS/IMAGE/MASTER"],
                  "createdDate": 1630492207365
                },
                "relationships": {
                  "images": {
                    "data": [
                      {
                        "id": "083ca460-e61e-11ec-a116-2bec812923b0",
                        "type": "CMS/IMAGE/MASTER",
                        "attributes": {
                          "alttext": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_FILME",
                          "checksum": "3453662166",
                          "createdDate": "2022-06-07 04:55:20.973",
                          "deviceAvailability": {
                            "available": true
                          },
                          "expirationDate": "1970-01-01 00:00:00.0",
                          "filename": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_FILME.png",
                          "formats": {
                            "UNKNOWN": {
                              "eventStage": "NOTAPPLICABLE",
                              "availability": {
                                "available": true,
                                "mediaType": "CUTV",
                                "offerStage": "NOTAPPLICABLE",
                                "offerStartTs": 0,
                                "offerEndTs": 253370764800000,
                                "streamable": false,
                                "downloadable": false,
                                "extendedOfferStartTs": 0,
                                "extendedOfferEndTs": 253370764800000
                              },
                              "startOfCredits": 0
                            }
                          },
                          "height": 755,
                          "language": "any",
                          "modifiedDate": "2022-06-07 04:55:20.973",
                          "title": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_FILME",
                          "type": "AGG_SOURCE",
                          "url": "https://de.imageservice.sky.com/pcms/083ca460-e61e-11ec-a116-2bec812923b0/AGG_SOURCE?territory=DE&proposition=NOWTV&language=ger",
                          "width": 1338
                        }
                      }
                    ]
                  }
                }
              }
            ]
          }
        }
      },
      "price": [
        {
          "conditional_price": true,
          "non-recurring": "0.00",
          "recurring": "4.99",
          "saving_amount": "3.00",
          "saving_percentage": "37.55",
          "tenure_non-discounted_amount_total": "7.99"
        }
      ]
    },
    {
      "static_id": "DE_CINEMA_UPFRONT_PASS",
      "business_id": "C_012500",
      "available": true,
      "category": "CINEMA",
      "data": {
        "links": {
          "self": "/adapter-atlas/v2/query/node/629c2e8c-158e-11ec-a051-0fab48b5c52c"
        },
        "id": "629c2e8c-158e-11ec-a051-0fab48b5c52c",
        "type": "PROMOTION/PRODUCT/SUBSCRIPTION",
        "attributes": {
          "addressRequired": false,
          "availableEndDate": "2099-12-31T00:00:00Z",
          "availableStartDate": "2021-08-05T00:00:00Z",
          "billingDescription": "Filmabo einmalig",
          "businessId": "C_012500",
          "category": "CINEMA",
          "childNodeTypes": ["PROMOTION/CONTEXT/PASS", "PROMOTION/CONTEXT/SIGNUP"],
          "createdDate": 1631646182558,
          "durations": ["P2M", "P10M", "P6M", "P3M", "P7M", "P11M", "P12M", "P8M", "P5M", "P4M", "P9M"],
          "itemType": "UP_FRONT_PAID_SUBSCRIPTION",
          "price": [
            {
              "duration": "P2M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "15.98",
              "recurringFull": "7.99",
              "defaultDuration": false
            },
            {
              "duration": "P10M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "79.90",
              "recurringFull": "7.99",
              "defaultDuration": false
            },
            {
              "duration": "P6M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "47.94",
              "recurringFull": "7.99",
              "defaultDuration": false
            },
            {
              "duration": "P3M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "23.97",
              "recurringFull": "7.99",
              "defaultDuration": false
            },
            {
              "duration": "P7M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "55.93",
              "recurringFull": "7.99",
              "defaultDuration": false
            },
            {
              "duration": "P11M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "87.89",
              "recurringFull": "7.99",
              "defaultDuration": false
            },
            {
              "duration": "P12M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "95.88",
              "recurringFull": "7.99",
              "defaultDuration": false
            },
            {
              "duration": "P8M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "63.92",
              "recurringFull": "7.99",
              "defaultDuration": false
            },
            {
              "duration": "P5M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "39.95",
              "recurringFull": "7.99",
              "defaultDuration": false
            },
            {
              "duration": "P4M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "31.96",
              "recurringFull": "7.99",
              "defaultDuration": false
            },
            {
              "duration": "P9M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "71.91",
              "recurringFull": "7.99",
              "defaultDuration": false
            }
          ],
          "saleable": false,
          "staticId": "DE_CINEMA_UPFRONT_PASS",
          "title": "Filmabo einmalig",
          "uris": ["duration"]
        },
        "relationships": {
          "mypasses": {
            "data": [
              {
                "links": {
                  "self": "/adapter-atlas/v2/query/node/a1a8192a-50f7-11ec-bf15-4bfba0309020"
                },
                "id": "a1a8192a-50f7-11ec-bf15-4bfba0309020",
                "type": "PROMOTION/CONTEXT/PASS",
                "attributes": {
                  "childNodeTypes": ["CMS/IMAGE/MASTER"],
                  "createdDate": 1638178504086
                },
                "relationships": {
                  "active-images": {
                    "data": [
                      {
                        "id": "083ca460-e61e-11ec-a116-2bec812923b0",
                        "type": "CMS/IMAGE/MASTER",
                        "attributes": {
                          "alttext": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_FILME",
                          "checksum": "3453662166",
                          "createdDate": "2022-06-07 04:55:20.973",
                          "deviceAvailability": {
                            "available": true
                          },
                          "expirationDate": "1970-01-01 00:00:00.0",
                          "filename": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_FILME.png",
                          "formats": {
                            "UNKNOWN": {
                              "eventStage": "NOTAPPLICABLE",
                              "availability": {
                                "available": true,
                                "mediaType": "CUTV",
                                "offerStage": "NOTAPPLICABLE",
                                "offerStartTs": 0,
                                "offerEndTs": 253370764800000,
                                "streamable": false,
                                "downloadable": false,
                                "extendedOfferStartTs": 0,
                                "extendedOfferEndTs": 253370764800000
                              },
                              "startOfCredits": 0
                            }
                          },
                          "height": 755,
                          "language": "any",
                          "modifiedDate": "2022-06-07 04:55:20.973",
                          "title": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_FILME",
                          "type": "AGG_SOURCE",
                          "url": "https://de.imageservice.sky.com/pcms/083ca460-e61e-11ec-a116-2bec812923b0/AGG_SOURCE?territory=DE&proposition=NOWTV&language=ger",
                          "width": 1338
                        }
                      }
                    ]
                  }
                }
              }
            ]
          },
          "signup": {
            "data": [
              {
                "links": {
                  "self": "/adapter-atlas/v2/query/node/a1b02b38-50f7-11ec-bf1e-87055522f394"
                },
                "id": "a1b02b38-50f7-11ec-bf1e-87055522f394",
                "type": "PROMOTION/CONTEXT/SIGNUP",
                "attributes": {
                  "bulletPoint1": "TESt",
                  "childNodeTypes": ["CMS/IMAGE/MASTER"],
                  "createdDate": 1638178504086
                },
                "relationships": {
                  "images": {
                    "data": [
                      {
                        "id": "083ca460-e61e-11ec-a116-2bec812923b0",
                        "type": "CMS/IMAGE/MASTER",
                        "attributes": {
                          "alttext": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_FILME",
                          "checksum": "3453662166",
                          "createdDate": "2022-06-07 04:55:20.973",
                          "deviceAvailability": {
                            "available": true
                          },
                          "expirationDate": "1970-01-01 00:00:00.0",
                          "filename": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_FILME.png",
                          "formats": {
                            "UNKNOWN": {
                              "eventStage": "NOTAPPLICABLE",
                              "availability": {
                                "available": true,
                                "mediaType": "CUTV",
                                "offerStage": "NOTAPPLICABLE",
                                "offerStartTs": 0,
                                "offerEndTs": 253370764800000,
                                "streamable": false,
                                "downloadable": false,
                                "extendedOfferStartTs": 0,
                                "extendedOfferEndTs": 253370764800000
                              },
                              "startOfCredits": 0
                            }
                          },
                          "height": 755,
                          "language": "any",
                          "modifiedDate": "2022-06-07 04:55:20.973",
                          "title": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_FILME",
                          "type": "AGG_SOURCE",
                          "url": "https://de.imageservice.sky.com/pcms/083ca460-e61e-11ec-a116-2bec812923b0/AGG_SOURCE?territory=DE&proposition=NOWTV&language=ger",
                          "width": 1338
                        }
                      }
                    ]
                  }
                }
              }
            ]
          }
        }
      },
      "price": [
        {
          "conditional_price": true,
          "duration": "P2M",
          "non-recurring": "15.98",
          "recurring": "4.99",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "9.98"
        },
        {
          "conditional_price": true,
          "duration": "P10M",
          "non-recurring": "79.90",
          "recurring": "4.99",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "49.90"
        },
        {
          "conditional_price": true,
          "duration": "P6M",
          "non-recurring": "47.94",
          "recurring": "4.99",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "29.94"
        },
        {
          "conditional_price": true,
          "duration": "P3M",
          "non-recurring": "23.97",
          "recurring": "4.99",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "14.97"
        },
        {
          "conditional_price": true,
          "duration": "P7M",
          "non-recurring": "55.93",
          "recurring": "4.99",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "34.93"
        },
        {
          "conditional_price": true,
          "duration": "P11M",
          "non-recurring": "87.89",
          "recurring": "4.99",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "54.89"
        },
        {
          "conditional_price": true,
          "duration": "P12M",
          "non-recurring": "95.88",
          "recurring": "4.99",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "59.88"
        },
        {
          "conditional_price": true,
          "duration": "P8M",
          "non-recurring": "63.92",
          "recurring": "4.99",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "39.92"
        },
        {
          "conditional_price": true,
          "duration": "P5M",
          "non-recurring": "39.95",
          "recurring": "4.99",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "24.95"
        },
        {
          "conditional_price": true,
          "duration": "P4M",
          "non-recurring": "31.96",
          "recurring": "4.99",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "19.96"
        },
        {
          "conditional_price": true,
          "duration": "P9M",
          "non-recurring": "71.91",
          "recurring": "4.99",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "44.91"
        }
      ],
      "included_products": ["C_010785"]
    },
    {
      "static_id": "CINEMA_FREE_TRIAL",
      "business_id": "C_010787",
      "available": true,
      "category": "CINEMA",
      "data": {
        "links": {
          "self": "/adapter-atlas/v2/query/node/5383eedc-fe85-11eb-ab83-67cacaa10953"
        },
        "id": "5383eedc-fe85-11eb-ab83-67cacaa10953",
        "type": "PROMOTION/PRODUCT/SUBSCRIPTION",
        "attributes": {
          "addressRequired": false,
          "availableEndDate": "2099-12-31T00:00:00Z",
          "availableStartDate": "2021-02-10T00:00:00Z",
          "billingDescription": "CIN",
          "businessId": "C_010787",
          "category": "CINEMA",
          "childNodeTypes": ["PROMOTION/CONTEXT/PASS", "PROMOTION/CONTEXT/SIGNUP"],
          "createdDate": 1629113415019,
          "durations": ["P7D"],
          "itemType": "TRIAL_SUBSCRIPTION",
          "price": [
            {
              "currency": "EUR",
              "nonRecurringPointOfSale": "0.00",
              "recurringFull": "7.99",
              "defaultDuration": false
            }
          ],
          "saleable": false,
          "staticId": "CINEMA_FREE_TRIAL",
          "title": "Filme 7 Tage Probezeitraum",
          "uris": ["duration"]
        },
        "relationships": {
          "mypasses": {
            "data": [
              {
                "links": {
                  "self": "/adapter-atlas/v2/query/node/c9ba251c-0b0f-11ec-ad9f-3fd78b1d0784"
                },
                "id": "c9ba251c-0b0f-11ec-ad9f-3fd78b1d0784",
                "type": "PROMOTION/CONTEXT/PASS",
                "attributes": {
                  "childNodeTypes": ["CMS/IMAGE/MASTER"],
                  "createdDate": 1630492297835
                },
                "relationships": {
                  "active-images": {
                    "data": [
                      {
                        "id": "083ca460-e61e-11ec-a116-2bec812923b0",
                        "type": "CMS/IMAGE/MASTER",
                        "attributes": {
                          "alttext": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_FILME",
                          "checksum": "3453662166",
                          "createdDate": "2022-06-07 04:55:20.973",
                          "deviceAvailability": {
                            "available": true
                          },
                          "expirationDate": "1970-01-01 00:00:00.0",
                          "filename": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_FILME.png",
                          "formats": {
                            "UNKNOWN": {
                              "eventStage": "NOTAPPLICABLE",
                              "availability": {
                                "available": true,
                                "mediaType": "CUTV",
                                "offerStage": "NOTAPPLICABLE",
                                "offerStartTs": 0,
                                "offerEndTs": 253370764800000,
                                "streamable": false,
                                "downloadable": false,
                                "extendedOfferStartTs": 0,
                                "extendedOfferEndTs": 253370764800000
                              },
                              "startOfCredits": 0
                            }
                          },
                          "height": 755,
                          "language": "any",
                          "modifiedDate": "2022-06-07 04:55:20.973",
                          "title": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_FILME",
                          "type": "AGG_SOURCE",
                          "url": "https://de.imageservice.sky.com/pcms/083ca460-e61e-11ec-a116-2bec812923b0/AGG_SOURCE?territory=DE&proposition=NOWTV&language=ger",
                          "width": 1338
                        }
                      }
                    ]
                  }
                }
              }
            ]
          },
          "signup": {
            "data": [
              {
                "links": {
                  "self": "/adapter-atlas/v2/query/node/c9c00b6c-0b0f-11ec-ada7-0bdb8ea9bd47"
                },
                "id": "c9c00b6c-0b0f-11ec-ada7-0bdb8ea9bd47",
                "type": "PROMOTION/CONTEXT/SIGNUP",
                "attributes": {
                  "childNodeTypes": ["CMS/IMAGE/MASTER"],
                  "createdDate": 1630492297835
                },
                "relationships": {
                  "images": {
                    "data": [
                      {
                        "id": "083ca460-e61e-11ec-a116-2bec812923b0",
                        "type": "CMS/IMAGE/MASTER",
                        "attributes": {
                          "alttext": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_FILME",
                          "checksum": "3453662166",
                          "createdDate": "2022-06-07 04:55:20.973",
                          "deviceAvailability": {
                            "available": true
                          },
                          "expirationDate": "1970-01-01 00:00:00.0",
                          "filename": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_FILME.png",
                          "formats": {
                            "UNKNOWN": {
                              "eventStage": "NOTAPPLICABLE",
                              "availability": {
                                "available": true,
                                "mediaType": "CUTV",
                                "offerStage": "NOTAPPLICABLE",
                                "offerStartTs": 0,
                                "offerEndTs": 253370764800000,
                                "streamable": false,
                                "downloadable": false,
                                "extendedOfferStartTs": 0,
                                "extendedOfferEndTs": 253370764800000
                              },
                              "startOfCredits": 0
                            }
                          },
                          "height": 755,
                          "language": "any",
                          "modifiedDate": "2022-06-07 04:55:20.973",
                          "title": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_FILME",
                          "type": "AGG_SOURCE",
                          "url": "https://de.imageservice.sky.com/pcms/083ca460-e61e-11ec-a116-2bec812923b0/AGG_SOURCE?territory=DE&proposition=NOWTV&language=ger",
                          "width": 1338
                        }
                      }
                    ]
                  }
                }
              }
            ]
          }
        }
      },
      "price": [
        {
          "conditional_price": true,
          "non-recurring": "0.00",
          "recurring": "4.99",
          "saving_amount": "3.00",
          "saving_percentage": "37.55",
          "tenure_non-discounted_amount_total": "7.99"
        }
      ],
      "included_products": ["C_010785"]
    },
    {
      "static_id": "SPORTSLITE_SUBSCRIPTION_MONTH",
      "business_id": "C_010826",
      "available": false,
      "category": "SPORTS",
      "data": {
        "links": {
          "self": "/adapter-atlas/v2/query/node/536bcabe-fe85-11eb-ab62-bb2d0e6f9eb1"
        },
        "id": "536bcabe-fe85-11eb-ab62-bb2d0e6f9eb1",
        "type": "PROMOTION/PRODUCT/SUBSCRIPTION",
        "attributes": {
          "addressRequired": false,
          "availableEndDate": "2099-12-31T00:00:00Z",
          "availableStartDate": "2014-01-01T00:00:00Z",
          "billingDescription": "SP1M",
          "businessId": "C_010826",
          "category": "SPORTS",
          "childNodeTypes": ["PROMOTION/CONTEXT/PASS", "PROMOTION/CONTEXT/SIGNUP"],
          "createdDate": 1629113414860,
          "itemType": "MONTHLY_SUBSCRIPTION",
          "price": [
            {
              "currency": "EUR",
              "nonRecurringPointOfSale": "0.00",
              "recurringFull": "0.00",
              "defaultDuration": false
            }
          ],
          "saleable": false,
          "staticId": "SPORTSLITE_SUBSCRIPTION_MONTH",
          "title": "Sport Month Pass"
        },
        "relationships": {
          "mypasses": {
            "data": [
              {
                "links": {
                  "self": "/adapter-atlas/v2/query/node/a0291762-0b0f-11ec-a8b5-f3ca466c0845"
                },
                "id": "a0291762-0b0f-11ec-a8b5-f3ca466c0845",
                "type": "PROMOTION/CONTEXT/PASS",
                "attributes": {
                  "childNodeTypes": [],
                  "createdDate": 1630492228088
                }
              }
            ]
          },
          "signup": {
            "data": [
              {
                "links": {
                  "self": "/adapter-atlas/v2/query/node/a0333abc-0b0f-11ec-a8bd-7b1a1641b05b"
                },
                "id": "a0333abc-0b0f-11ec-a8bd-7b1a1641b05b",
                "type": "PROMOTION/CONTEXT/SIGNUP",
                "attributes": {
                  "childNodeTypes": [],
                  "createdDate": 1630492228088
                }
              }
            ]
          }
        }
      },
      "price": [
        {
          "non-recurring": "0.00",
          "recurring": "0.00"
        }
      ]
    },
    {
      "static_id": "SUPERSPORTS_SUBSCRIPTION_MONTH",
      "business_id": "C_010798",
      "available": true,
      "category": "SPORTS",
      "data": {
        "links": {
          "self": "/adapter-atlas/v2/query/node/5350ea32-fe85-11eb-ab41-8bc7250a2890"
        },
        "id": "5350ea32-fe85-11eb-ab41-8bc7250a2890",
        "type": "PROMOTION/PRODUCT/SUBSCRIPTION",
        "attributes": {
          "addressRequired": false,
          "availableEndDate": "2099-12-31T00:00:00Z",
          "availableStartDate": "2016-11-04T00:00:00Z",
          "billingDescription": "SSP1M",
          "businessId": "C_010798",
          "buttonText": "Live-Sport Monatsabo",
          "category": "SPORTS",
          "childNodeTypes": ["PROMOTION/CONTEXT/PASS", "PROMOTION/CONTEXT/SIGNUP"],
          "createdDate": 1629113414684,
          "itemType": "MONTHLY_SUBSCRIPTION",
          "price": [
            {
              "currency": "EUR",
              "nonRecurringPointOfSale": "0.00",
              "recurringFull": "29.99",
              "defaultDuration": false
            }
          ],
          "saleable": true,
          "sectionNavigation": "SPORT",
          "staticId": "SUPERSPORTS_SUBSCRIPTION_MONTH",
          "title": "Live-Sport Monatsabo"
        },
        "relationships": {
          "mypasses": {
            "data": [
              {
                "links": {
                  "self": "/adapter-atlas/v2/query/node/08ad17f6-0b11-11ec-a38f-b721c22c5ee5"
                },
                "id": "08ad17f6-0b11-11ec-a38f-b721c22c5ee5",
                "type": "PROMOTION/CONTEXT/PASS",
                "attributes": {
                  "childNodeTypes": ["CMS/IMAGE/MASTER"],
                  "createdDate": 1630492832942
                },
                "relationships": {
                  "active-images": {
                    "data": [
                      {
                        "id": "1608aec2-e61e-11ec-bf9a-3f63297ef30e",
                        "type": "CMS/IMAGE/MASTER",
                        "attributes": {
                          "alttext": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_LIVE-SPORT",
                          "checksum": "3538840800",
                          "createdDate": "2022-06-07 04:55:43.998",
                          "deviceAvailability": {
                            "available": true
                          },
                          "expirationDate": "1970-01-01 00:00:00.0",
                          "filename": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_LIVE-SPORT.png",
                          "formats": {
                            "UNKNOWN": {
                              "eventStage": "NOTAPPLICABLE",
                              "availability": {
                                "available": true,
                                "mediaType": "CUTV",
                                "offerStage": "NOTAPPLICABLE",
                                "offerStartTs": 0,
                                "offerEndTs": 253370764800000,
                                "streamable": false,
                                "downloadable": false,
                                "extendedOfferStartTs": 0,
                                "extendedOfferEndTs": 253370764800000
                              },
                              "startOfCredits": 0
                            }
                          },
                          "height": 755,
                          "language": "any",
                          "modifiedDate": "2022-06-07 04:55:43.998",
                          "title": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_LIVE-SPORT",
                          "type": "AGG_SOURCE",
                          "url": "https://de.imageservice.sky.com/pcms/1608aec2-e61e-11ec-bf9a-3f63297ef30e/AGG_SOURCE?territory=DE&proposition=NOWTV&language=ger",
                          "width": 1339
                        }
                      }
                    ]
                  }
                }
              }
            ]
          },
          "signup": {
            "data": [
              {
                "links": {
                  "self": "/adapter-atlas/v2/query/node/08b31f8e-0b11-11ec-a397-9bcea904ab20"
                },
                "id": "08b31f8e-0b11-11ec-a397-9bcea904ab20",
                "type": "PROMOTION/CONTEXT/SIGNUP",
                "attributes": {
                  "childNodeTypes": ["CMS/IMAGE/MASTER"],
                  "createdDate": 1630492832942
                },
                "relationships": {
                  "images": {
                    "data": [
                      {
                        "id": "1608aec2-e61e-11ec-bf9a-3f63297ef30e",
                        "type": "CMS/IMAGE/MASTER",
                        "attributes": {
                          "alttext": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_LIVE-SPORT",
                          "checksum": "3538840800",
                          "createdDate": "2022-06-07 04:55:43.998",
                          "deviceAvailability": {
                            "available": true
                          },
                          "expirationDate": "1970-01-01 00:00:00.0",
                          "filename": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_LIVE-SPORT.png",
                          "formats": {
                            "UNKNOWN": {
                              "eventStage": "NOTAPPLICABLE",
                              "availability": {
                                "available": true,
                                "mediaType": "CUTV",
                                "offerStage": "NOTAPPLICABLE",
                                "offerStartTs": 0,
                                "offerEndTs": 253370764800000,
                                "streamable": false,
                                "downloadable": false,
                                "extendedOfferStartTs": 0,
                                "extendedOfferEndTs": 253370764800000
                              },
                              "startOfCredits": 0
                            }
                          },
                          "height": 755,
                          "language": "any",
                          "modifiedDate": "2022-06-07 04:55:43.998",
                          "title": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_LIVE-SPORT",
                          "type": "AGG_SOURCE",
                          "url": "https://de.imageservice.sky.com/pcms/1608aec2-e61e-11ec-bf9a-3f63297ef30e/AGG_SOURCE?territory=DE&proposition=NOWTV&language=ger",
                          "width": 1339
                        }
                      }
                    ]
                  }
                }
              }
            ]
          }
        }
      },
      "price": [
        {
          "non-recurring": "0.00",
          "recurring": "29.99"
        }
      ]
    },
    {
      "static_id": "SUPERSPORTS_DAY_PASS",
      "business_id": "C_010802",
      "available": true,
      "category": "SPORTS",
      "data": {
        "links": {
          "self": "/adapter-atlas/v2/query/node/532f25be-fe85-11eb-ab21-37b8339f58d8"
        },
        "id": "532f25be-fe85-11eb-ab21-37b8339f58d8",
        "type": "PROMOTION/PRODUCT/PASS",
        "attributes": {
          "addressRequired": false,
          "availableEndDate": "2099-12-31T00:00:00Z",
          "availableStartDate": "2016-04-11T00:00:00Z",
          "billingDescription": "SSP1T",
          "businessId": "C_010802",
          "category": "SPORTS",
          "childNodeTypes": ["PROMOTION/CONTEXT/PASS", "PROMOTION/CONTEXT/SIGNUP"],
          "createdDate": 1629113414463,
          "itemType": "NON_RECURRING_PASS",
          "price": [
            {
              "currency": "EUR",
              "nonRecurringPointOfSale": "14.99",
              "recurringFull": "0.00",
              "defaultDuration": false
            }
          ],
          "saleable": false,
          "sectionNavigation": "SPORT",
          "staticId": "SUPERSPORTS_DAY_PASS",
          "title": "Live-Sport Tagesabo"
        },
        "relationships": {
          "mypasses": {
            "data": [
              {
                "links": {
                  "self": "/adapter-atlas/v2/query/node/e7ae36a2-0b10-11ec-a076-7b9f2c7ecbbf"
                },
                "id": "e7ae36a2-0b10-11ec-a076-7b9f2c7ecbbf",
                "type": "PROMOTION/CONTEXT/PASS",
                "attributes": {
                  "childNodeTypes": ["CMS/IMAGE/MASTER"],
                  "createdDate": 1630492777578
                },
                "relationships": {
                  "active-images": {
                    "data": [
                      {
                        "id": "1cd09436-e61e-11ec-b540-ff6431c70245",
                        "type": "CMS/IMAGE/MASTER",
                        "attributes": {
                          "alttext": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_LIVE-SPORT_Tag",
                          "checksum": "924043464",
                          "createdDate": "2022-06-07 04:55:55.465",
                          "deviceAvailability": {
                            "available": true
                          },
                          "expirationDate": "1970-01-01 00:00:00.0",
                          "filename": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_LIVE-SPORT_Tag.png",
                          "formats": {
                            "UNKNOWN": {
                              "eventStage": "NOTAPPLICABLE",
                              "availability": {
                                "available": true,
                                "mediaType": "CUTV",
                                "offerStage": "NOTAPPLICABLE",
                                "offerStartTs": 0,
                                "offerEndTs": 253370764800000,
                                "streamable": false,
                                "downloadable": false,
                                "extendedOfferStartTs": 0,
                                "extendedOfferEndTs": 253370764800000
                              },
                              "startOfCredits": 0
                            }
                          },
                          "height": 755,
                          "language": "any",
                          "modifiedDate": "2022-06-07 04:55:55.465",
                          "title": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_LIVE-SPORT_Tag",
                          "type": "AGG_SOURCE",
                          "url": "https://de.imageservice.sky.com/pcms/1cd09436-e61e-11ec-b540-ff6431c70245/AGG_SOURCE?territory=DE&proposition=NOWTV&language=ger",
                          "width": 1339
                        }
                      }
                    ]
                  }
                }
              }
            ]
          },
          "signup": {
            "data": [
              {
                "links": {
                  "self": "/adapter-atlas/v2/query/node/e7b41f0e-0b10-11ec-a07e-5726018413d9"
                },
                "id": "e7b41f0e-0b10-11ec-a07e-5726018413d9",
                "type": "PROMOTION/CONTEXT/SIGNUP",
                "attributes": {
                  "childNodeTypes": ["CMS/IMAGE/MASTER"],
                  "createdDate": 1630492777578
                },
                "relationships": {
                  "images": {
                    "data": [
                      {
                        "id": "1cd09436-e61e-11ec-b540-ff6431c70245",
                        "type": "CMS/IMAGE/MASTER",
                        "attributes": {
                          "alttext": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_LIVE-SPORT_Tag",
                          "checksum": "924043464",
                          "createdDate": "2022-06-07 04:55:55.465",
                          "deviceAvailability": {
                            "available": true
                          },
                          "expirationDate": "1970-01-01 00:00:00.0",
                          "filename": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_LIVE-SPORT_Tag.png",
                          "formats": {
                            "UNKNOWN": {
                              "eventStage": "NOTAPPLICABLE",
                              "availability": {
                                "available": true,
                                "mediaType": "CUTV",
                                "offerStage": "NOTAPPLICABLE",
                                "offerStartTs": 0,
                                "offerEndTs": 253370764800000,
                                "streamable": false,
                                "downloadable": false,
                                "extendedOfferStartTs": 0,
                                "extendedOfferEndTs": 253370764800000
                              },
                              "startOfCredits": 0
                            }
                          },
                          "height": 755,
                          "language": "any",
                          "modifiedDate": "2022-06-07 04:55:55.465",
                          "title": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_LIVE-SPORT_Tag",
                          "type": "AGG_SOURCE",
                          "url": "https://de.imageservice.sky.com/pcms/1cd09436-e61e-11ec-b540-ff6431c70245/AGG_SOURCE?territory=DE&proposition=NOWTV&language=ger",
                          "width": 1339
                        }
                      }
                    ]
                  }
                }
              }
            ]
          }
        }
      },
      "price": [
        {
          "non-recurring": "14.99",
          "recurring": "0.00"
        }
      ]
    },
    {
      "static_id": "DE_SUPERSPORT_UPFRONT_PASS",
      "business_id": "C_013144",
      "available": true,
      "category": "SPORTS",
      "data": {
        "links": {
          "self": "/adapter-atlas/v2/query/node/be374978-5442-11ec-af34-d38e4c8f5ff0"
        },
        "id": "be374978-5442-11ec-af34-d38e4c8f5ff0",
        "type": "PROMOTION/PRODUCT/SUBSCRIPTION",
        "attributes": {
          "addressRequired": false,
          "availableEndDate": "2099-12-31T00:00:00Z",
          "availableStartDate": "2021-11-22T00:00:00Z",
          "billingDescription": "Live-Sport Abo einmalig",
          "businessId": "C_013144",
          "category": "SPORTS",
          "childNodeTypes": ["PROMOTION/CONTEXT/PASS", "PROMOTION/CONTEXT/SIGNUP"],
          "createdDate": 1638540617751,
          "durations": ["P12M", "P2M", "P6M", "P3M"],
          "itemType": "UP_FRONT_PAID_SUBSCRIPTION",
          "price": [
            {
              "duration": "P12M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "359.88",
              "recurringFull": "29.99",
              "defaultDuration": false
            },
            {
              "duration": "P6M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "179.94",
              "recurringFull": "29.99",
              "defaultDuration": false
            },
            {
              "duration": "P3M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "89.97",
              "recurringFull": "29.99",
              "defaultDuration": false
            },
            {
              "duration": "P2M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "59.98",
              "recurringFull": "29.99",
              "defaultDuration": false
            }
          ],
          "saleable": false,
          "staticId": "DE_SUPERSPORT_UPFRONT_PASS",
          "title": "Live-Sport Abo einmalig",
          "uris": ["duration"]
        },
        "relationships": {
          "mypasses": {
            "data": [
              {
                "links": {
                  "self": "/adapter-atlas/v2/query/node/4e88ee24-e628-11ec-afa8-8b901e2a33b6"
                },
                "id": "4e88ee24-e628-11ec-afa8-8b901e2a33b6",
                "type": "PROMOTION/CONTEXT/PASS",
                "attributes": {
                  "childNodeTypes": [],
                  "createdDate": 1654582133211
                }
              }
            ]
          },
          "signup": {
            "data": [
              {
                "links": {
                  "self": "/adapter-atlas/v2/query/node/4e91c990-e628-11ec-afb0-974227f3325f"
                },
                "id": "4e91c990-e628-11ec-afb0-974227f3325f",
                "type": "PROMOTION/CONTEXT/SIGNUP",
                "attributes": {
                  "childNodeTypes": ["CMS/IMAGE/MASTER"],
                  "createdDate": 1654582133211
                },
                "relationships": {
                  "images": {
                    "data": [
                      {
                        "id": "1608aec2-e61e-11ec-bf9a-3f63297ef30e",
                        "type": "CMS/IMAGE/MASTER",
                        "attributes": {
                          "alttext": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_LIVE-SPORT",
                          "checksum": "3538840800",
                          "createdDate": "2022-06-07 04:55:43.998",
                          "deviceAvailability": {
                            "available": true
                          },
                          "expirationDate": "1970-01-01 00:00:00.0",
                          "filename": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_LIVE-SPORT.png",
                          "formats": {
                            "UNKNOWN": {
                              "eventStage": "NOTAPPLICABLE",
                              "availability": {
                                "available": true,
                                "mediaType": "CUTV",
                                "offerStage": "NOTAPPLICABLE",
                                "offerStartTs": 0,
                                "offerEndTs": 253370764800000,
                                "streamable": false,
                                "downloadable": false,
                                "extendedOfferStartTs": 0,
                                "extendedOfferEndTs": 253370764800000
                              },
                              "startOfCredits": 0
                            }
                          },
                          "height": 755,
                          "language": "any",
                          "modifiedDate": "2022-06-07 04:55:43.998",
                          "title": "WOW_Card_Logo_Green-Gradient_Templates_320x180px_AW_LIVE-SPORT",
                          "type": "AGG_SOURCE",
                          "url": "https://de.imageservice.sky.com/pcms/1608aec2-e61e-11ec-bf9a-3f63297ef30e/AGG_SOURCE?territory=DE&proposition=NOWTV&language=ger",
                          "width": 1339
                        }
                      }
                    ]
                  }
                }
              }
            ]
          }
        }
      },
      "price": [
        {
          "duration": "P12M",
          "non-recurring": "359.88",
          "recurring": "29.99",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "359.88"
        },
        {
          "duration": "P6M",
          "non-recurring": "179.94",
          "recurring": "29.99",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "179.94"
        },
        {
          "duration": "P3M",
          "non-recurring": "89.97",
          "recurring": "29.99",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "89.97"
        },
        {
          "duration": "P2M",
          "non-recurring": "59.98",
          "recurring": "29.99",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "59.98"
        }
      ],
      "included_products": ["C_010798"]
    },
    {
      "static_id": "DE_BOOST_MONTH_PASS",
      "business_id": "C_016492",
      "available": true,
      "category": "HD",
      "data": {
        "links": {
          "self": "/adapter-atlas/v2/query/node/3cd2cc86-effa-11ed-bd0b-2f4c134eea5c"
        },
        "id": "3cd2cc86-effa-11ed-bd0b-2f4c134eea5c",
        "type": "PROMOTION/PRODUCT/SUBSCRIPTION",
        "attributes": {
          "addressRequired": false,
          "availableEndDate": "2099-12-31T00:00:00Z",
          "availableStartDate": "2022-11-16T00:00:00Z",
          "billingDescription": "WOW Premium Monatsabo",
          "businessId": "C_016492",
          "category": "HD",
          "childNodeTypes": ["PROMOTION/CONTEXT/PASS", "PROMOTION/CONTEXT/SIGNUP"],
          "createdDate": 1683809355966,
          "itemType": "MONTHLY_SUBSCRIPTION",
          "price": [
            {
              "currency": "EUR",
              "nonRecurringPointOfSale": "0.00",
              "recurringFull": "5.00",
              "defaultDuration": false
            }
          ],
          "saleable": true,
          "staticId": "DE_BOOST_MONTH_PASS",
          "title": "WOW Premium Monatsabo"
        },
        "relationships": {
          "mypasses": {
            "data": [
              {
                "links": {
                  "self": "/adapter-atlas/v2/query/node/4612b340-06b8-11ee-a6c9-cfc54da2696b"
                },
                "id": "4612b340-06b8-11ee-a6c9-cfc54da2696b",
                "type": "PROMOTION/CONTEXT/PASS",
                "attributes": {
                  "childNodeTypes": ["CMS/IMAGE/MASTER"],
                  "createdDate": 1686309901404
                },
                "relationships": {
                  "active-images": {
                    "data": [
                      {
                        "id": "36b19ae0-09e4-11ee-92e7-0fb1ba5141c4",
                        "type": "CMS/IMAGE/MASTER",
                        "attributes": {
                          "alttext": "WOW_Boost_Web",
                          "checksum": "4184856937",
                          "createdDate": "2023-06-13 12:17:07.491",
                          "deviceAvailability": {
                            "available": true
                          },
                          "expirationDate": "1970-01-01 00:00:00.0",
                          "filename": "WOW_Boost_Web.png",
                          "formats": {
                            "UNKNOWN": {
                              "eventStage": "NOTAPPLICABLE",
                              "availability": {
                                "available": true,
                                "mediaType": "CUTV",
                                "offerStage": "NOTAPPLICABLE",
                                "offerStartTs": 0,
                                "offerEndTs": 253370764800000,
                                "streamable": false,
                                "downloadable": false,
                                "extendedOfferStartTs": 0,
                                "extendedOfferEndTs": 253370764800000
                              },
                              "startOfCredits": 0
                            }
                          },
                          "height": 333,
                          "language": "ANY",
                          "modifiedDate": "2023-06-13 12:17:07.491",
                          "title": "WOW_Boost_Web",
                          "type": "AGG_SOURCE",
                          "url": "https://de.imageservice.sky.com/pcms/36b19ae0-09e4-11ee-92e7-0fb1ba5141c4/AGG_SOURCE?proposition=NOWTV&language=ger&versionId=e7ac7a0d-eead-4e99-9c75-2f4ce04e37c5&territory=DE",
                          "width": 592
                        }
                      }
                    ]
                  }
                }
              }
            ]
          },
          "signup": {
            "data": [
              {
                "links": {
                  "self": "/adapter-atlas/v2/query/node/461c1200-06b8-11ee-a6d1-9bd7115c3c15"
                },
                "id": "461c1200-06b8-11ee-a6d1-9bd7115c3c15",
                "type": "PROMOTION/CONTEXT/SIGNUP",
                "attributes": {
                  "childNodeTypes": ["CMS/IMAGE/MASTER"],
                  "createdDate": 1686309901404
                },
                "relationships": {
                  "images": {
                    "data": [
                      {
                        "id": "36b19ae0-09e4-11ee-92e7-0fb1ba5141c4",
                        "type": "CMS/IMAGE/MASTER",
                        "attributes": {
                          "alttext": "WOW_Boost_Web",
                          "checksum": "4184856937",
                          "createdDate": "2023-06-13 12:17:07.491",
                          "deviceAvailability": {
                            "available": true
                          },
                          "expirationDate": "1970-01-01 00:00:00.0",
                          "filename": "WOW_Boost_Web.png",
                          "formats": {
                            "UNKNOWN": {
                              "eventStage": "NOTAPPLICABLE",
                              "availability": {
                                "available": true,
                                "mediaType": "CUTV",
                                "offerStage": "NOTAPPLICABLE",
                                "offerStartTs": 0,
                                "offerEndTs": 253370764800000,
                                "streamable": false,
                                "downloadable": false,
                                "extendedOfferStartTs": 0,
                                "extendedOfferEndTs": 253370764800000
                              },
                              "startOfCredits": 0
                            }
                          },
                          "height": 333,
                          "language": "ANY",
                          "modifiedDate": "2023-06-13 12:17:07.491",
                          "title": "WOW_Boost_Web",
                          "type": "AGG_SOURCE",
                          "url": "https://de.imageservice.sky.com/pcms/36b19ae0-09e4-11ee-92e7-0fb1ba5141c4/AGG_SOURCE?proposition=NOWTV&language=ger&versionId=e7ac7a0d-eead-4e99-9c75-2f4ce04e37c5&territory=DE",
                          "width": 592
                        }
                      }
                    ]
                  }
                }
              }
            ]
          }
        }
      },
      "price": [
        {
          "non-recurring": "0.00",
          "recurring": "5.00",
          "tenure_non-discounted_amount_total": "5.00"
        }
      ]
    },
    {
      "static_id": "DE_BOOST_UFP",
      "business_id": "C_016493",
      "available": true,
      "category": "HD",
      "data": {
        "links": {
          "self": "/adapter-atlas/v2/query/node/3d1711b6-effa-11ed-beaa-eb729442265a"
        },
        "id": "3d1711b6-effa-11ed-beaa-eb729442265a",
        "type": "PROMOTION/PRODUCT/SUBSCRIPTION",
        "attributes": {
          "addressRequired": false,
          "availableEndDate": "2099-12-31T00:00:00Z",
          "availableStartDate": "2022-11-16T00:00:00Z",
          "billingDescription": "Premium DE UFP",
          "businessId": "C_016493",
          "category": "HD",
          "childNodeTypes": ["PROMOTION/CONTEXT/PASS", "PROMOTION/CONTEXT/SIGNUP"],
          "createdDate": 1683809356413,
          "durations": ["P9M", "P5M", "P7M", "P8M", "P6M", "P10M", "P3M", "P2M", "P4M", "P11M", "P12M"],
          "itemType": "UP_FRONT_PAID_SUBSCRIPTION",
          "price": [
            {
              "duration": "P3M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "15.00",
              "recurringFull": "5.00",
              "defaultDuration": false
            },
            {
              "duration": "P2M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "10.00",
              "recurringFull": "5.00",
              "defaultDuration": false
            },
            {
              "duration": "P4M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "20.00",
              "recurringFull": "5.00",
              "defaultDuration": false
            },
            {
              "duration": "P9M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "45.00",
              "recurringFull": "5.00",
              "defaultDuration": false
            },
            {
              "duration": "P5M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "25.00",
              "recurringFull": "5.00",
              "defaultDuration": false
            },
            {
              "duration": "P7M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "35.00",
              "recurringFull": "5.00",
              "defaultDuration": false
            },
            {
              "duration": "P8M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "40.00",
              "recurringFull": "5.00",
              "defaultDuration": false
            },
            {
              "duration": "P6M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "30.00",
              "recurringFull": "5.00",
              "defaultDuration": false
            },
            {
              "duration": "P10M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "50.00",
              "recurringFull": "5.00",
              "defaultDuration": false
            },
            {
              "duration": "P11M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "55.00",
              "recurringFull": "5.00",
              "defaultDuration": false
            },
            {
              "duration": "P12M",
              "currency": "EUR",
              "nonRecurringPointOfSale": "60.00",
              "recurringFull": "5.00",
              "defaultDuration": false
            }
          ],
          "saleable": false,
          "staticId": "DE_BOOST_UFP",
          "title": "WOW Premium Upfront Abo",
          "uris": ["duration"]
        },
        "relationships": {
          "mypasses": {
            "data": [
              {
                "links": {
                  "self": "/adapter-atlas/v2/query/node/f88713e4-09de-11ee-bc5f-9f529da3ef4b"
                },
                "id": "f88713e4-09de-11ee-bc5f-9f529da3ef4b",
                "type": "PROMOTION/CONTEXT/PASS",
                "attributes": {
                  "childNodeTypes": ["CMS/IMAGE/MASTER"],
                  "createdDate": 1686656375152
                },
                "relationships": {
                  "active-images": {
                    "data": [
                      {
                        "id": "36b19ae0-09e4-11ee-92e7-0fb1ba5141c4",
                        "type": "CMS/IMAGE/MASTER",
                        "attributes": {
                          "alttext": "WOW_Boost_Web",
                          "checksum": "4184856937",
                          "createdDate": "2023-06-13 12:17:07.491",
                          "deviceAvailability": {
                            "available": true
                          },
                          "expirationDate": "1970-01-01 00:00:00.0",
                          "filename": "WOW_Boost_Web.png",
                          "formats": {
                            "UNKNOWN": {
                              "eventStage": "NOTAPPLICABLE",
                              "availability": {
                                "available": true,
                                "mediaType": "CUTV",
                                "offerStage": "NOTAPPLICABLE",
                                "offerStartTs": 0,
                                "offerEndTs": 253370764800000,
                                "streamable": false,
                                "downloadable": false,
                                "extendedOfferStartTs": 0,
                                "extendedOfferEndTs": 253370764800000
                              },
                              "startOfCredits": 0
                            }
                          },
                          "height": 333,
                          "language": "ANY",
                          "modifiedDate": "2023-06-13 12:17:07.491",
                          "title": "WOW_Boost_Web",
                          "type": "AGG_SOURCE",
                          "url": "https://de.imageservice.sky.com/pcms/36b19ae0-09e4-11ee-92e7-0fb1ba5141c4/AGG_SOURCE?proposition=NOWTV&language=ger&versionId=e7ac7a0d-eead-4e99-9c75-2f4ce04e37c5&territory=DE",
                          "width": 592
                        }
                      }
                    ]
                  }
                }
              }
            ]
          },
          "signup": {
            "data": [
              {
                "links": {
                  "self": "/adapter-atlas/v2/query/node/f893c5bc-09de-11ee-bc67-6b322e1a9ee1"
                },
                "id": "f893c5bc-09de-11ee-bc67-6b322e1a9ee1",
                "type": "PROMOTION/CONTEXT/SIGNUP",
                "attributes": {
                  "childNodeTypes": ["CMS/IMAGE/MASTER"],
                  "createdDate": 1686656375152
                },
                "relationships": {
                  "images": {
                    "data": [
                      {
                        "id": "36b19ae0-09e4-11ee-92e7-0fb1ba5141c4",
                        "type": "CMS/IMAGE/MASTER",
                        "attributes": {
                          "alttext": "WOW_Boost_Web",
                          "checksum": "4184856937",
                          "createdDate": "2023-06-13 12:17:07.491",
                          "deviceAvailability": {
                            "available": true
                          },
                          "expirationDate": "1970-01-01 00:00:00.0",
                          "filename": "WOW_Boost_Web.png",
                          "formats": {
                            "UNKNOWN": {
                              "eventStage": "NOTAPPLICABLE",
                              "availability": {
                                "available": true,
                                "mediaType": "CUTV",
                                "offerStage": "NOTAPPLICABLE",
                                "offerStartTs": 0,
                                "offerEndTs": 253370764800000,
                                "streamable": false,
                                "downloadable": false,
                                "extendedOfferStartTs": 0,
                                "extendedOfferEndTs": 253370764800000
                              },
                              "startOfCredits": 0
                            }
                          },
                          "height": 333,
                          "language": "ANY",
                          "modifiedDate": "2023-06-13 12:17:07.491",
                          "title": "WOW_Boost_Web",
                          "type": "AGG_SOURCE",
                          "url": "https://de.imageservice.sky.com/pcms/36b19ae0-09e4-11ee-92e7-0fb1ba5141c4/AGG_SOURCE?proposition=NOWTV&language=ger&versionId=e7ac7a0d-eead-4e99-9c75-2f4ce04e37c5&territory=DE",
                          "width": 592
                        }
                      }
                    ]
                  }
                }
              }
            ]
          }
        }
      },
      "price": [
        {
          "duration": "P3M",
          "non-recurring": "15.00",
          "recurring": "5.00",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "15.00"
        },
        {
          "duration": "P2M",
          "non-recurring": "10.00",
          "recurring": "5.00",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "10.00"
        },
        {
          "duration": "P4M",
          "non-recurring": "20.00",
          "recurring": "5.00",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "20.00"
        },
        {
          "duration": "P9M",
          "non-recurring": "45.00",
          "recurring": "5.00",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "45.00"
        },
        {
          "duration": "P5M",
          "non-recurring": "25.00",
          "recurring": "5.00",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "25.00"
        },
        {
          "duration": "P7M",
          "non-recurring": "35.00",
          "recurring": "5.00",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "35.00"
        },
        {
          "duration": "P8M",
          "non-recurring": "40.00",
          "recurring": "5.00",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "40.00"
        },
        {
          "duration": "P6M",
          "non-recurring": "30.00",
          "recurring": "5.00",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "30.00"
        },
        {
          "duration": "P10M",
          "non-recurring": "50.00",
          "recurring": "5.00",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "50.00"
        },
        {
          "duration": "P11M",
          "non-recurring": "55.00",
          "recurring": "5.00",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "55.00"
        },
        {
          "duration": "P12M",
          "non-recurring": "60.00",
          "recurring": "5.00",
          "saving_amount": "0.00",
          "saving_percentage": "0.00",
          "tenure_non-discounted_amount_total": "60.00"
        }
      ],
      "included_products": ["C_016492"]
    },
    {
      "static_id": "DE_BOOST_FREE_TRIAL",
      "business_id": "C_016494",
      "available": true,
      "category": "HD",
      "data": {
        "links": {
          "self": "/adapter-atlas/v2/query/node/3d4bad4a-effa-11ed-ba31-bbdbe94b0b00"
        },
        "id": "3d4bad4a-effa-11ed-ba31-bbdbe94b0b00",
        "type": "PROMOTION/PRODUCT/SUBSCRIPTION",
        "attributes": {
          "addressRequired": false,
          "availableEndDate": "2099-12-31T00:00:00Z",
          "availableStartDate": "2022-11-16T00:00:00Z",
          "billingDescription": "WOW Premium 7-Tage-Probeabo",
          "businessId": "C_016494",
          "category": "HD",
          "childNodeTypes": ["PROMOTION/CONTEXT/PASS", "PROMOTION/CONTEXT/SIGNUP"],
          "createdDate": 1683809356758,
          "durations": ["P7D"],
          "itemType": "TRIAL_SUBSCRIPTION",
          "price": [
            {
              "currency": "EUR",
              "nonRecurringPointOfSale": "0.00",
              "recurringFull": "5.00",
              "defaultDuration": false
            }
          ],
          "saleable": true,
          "staticId": "DE_BOOST_FREE_TRIAL",
          "title": "WOW Premium 7-Tage-Probeabo",
          "uris": ["duration"]
        },
        "relationships": {
          "mypasses": {
            "data": [
              {
                "links": {
                  "self": "/adapter-atlas/v2/query/node/0b984930-09df-11ee-8daf-8bec057255bc"
                },
                "id": "0b984930-09df-11ee-8daf-8bec057255bc",
                "type": "PROMOTION/CONTEXT/PASS",
                "attributes": {
                  "childNodeTypes": ["CMS/IMAGE/MASTER"],
                  "createdDate": 1686656407152
                },
                "relationships": {
                  "active-images": {
                    "data": [
                      {
                        "id": "36b19ae0-09e4-11ee-92e7-0fb1ba5141c4",
                        "type": "CMS/IMAGE/MASTER",
                        "attributes": {
                          "alttext": "WOW_Boost_Web",
                          "checksum": "4184856937",
                          "createdDate": "2023-06-13 12:17:07.491",
                          "deviceAvailability": {
                            "available": true
                          },
                          "expirationDate": "1970-01-01 00:00:00.0",
                          "filename": "WOW_Boost_Web.png",
                          "formats": {
                            "UNKNOWN": {
                              "eventStage": "NOTAPPLICABLE",
                              "availability": {
                                "available": true,
                                "mediaType": "CUTV",
                                "offerStage": "NOTAPPLICABLE",
                                "offerStartTs": 0,
                                "offerEndTs": 253370764800000,
                                "streamable": false,
                                "downloadable": false,
                                "extendedOfferStartTs": 0,
                                "extendedOfferEndTs": 253370764800000
                              },
                              "startOfCredits": 0
                            }
                          },
                          "height": 333,
                          "language": "ANY",
                          "modifiedDate": "2023-06-13 12:17:07.491",
                          "title": "WOW_Boost_Web",
                          "type": "AGG_SOURCE",
                          "url": "https://de.imageservice.sky.com/pcms/36b19ae0-09e4-11ee-92e7-0fb1ba5141c4/AGG_SOURCE?proposition=NOWTV&language=ger&versionId=e7ac7a0d-eead-4e99-9c75-2f4ce04e37c5&territory=DE",
                          "width": 592
                        }
                      }
                    ]
                  }
                }
              }
            ]
          },
          "signup": {
            "data": [
              {
                "links": {
                  "self": "/adapter-atlas/v2/query/node/0ba16128-09df-11ee-8db7-bb519381b9f1"
                },
                "id": "0ba16128-09df-11ee-8db7-bb519381b9f1",
                "type": "PROMOTION/CONTEXT/SIGNUP",
                "attributes": {
                  "childNodeTypes": ["CMS/IMAGE/MASTER"],
                  "createdDate": 1686656407152,
                  "terms": "WOW Premium: Wenn du WOW Premium jetzt testest, beginnt deine 7-tägige kostenlose Testversion sofort. Ein Probeabo pro Kunde. Am Ende der Probewoche wird deine Zahlungsmethode mit 5,00€ pro Monat belastet."
                },
                "relationships": {
                  "images": {
                    "data": [
                      {
                        "id": "36b19ae0-09e4-11ee-92e7-0fb1ba5141c4",
                        "type": "CMS/IMAGE/MASTER",
                        "attributes": {
                          "alttext": "WOW_Boost_Web",
                          "checksum": "4184856937",
                          "createdDate": "2023-06-13 12:17:07.491",
                          "deviceAvailability": {
                            "available": true
                          },
                          "expirationDate": "1970-01-01 00:00:00.0",
                          "filename": "WOW_Boost_Web.png",
                          "formats": {
                            "UNKNOWN": {
                              "eventStage": "NOTAPPLICABLE",
                              "availability": {
                                "available": true,
                                "mediaType": "CUTV",
                                "offerStage": "NOTAPPLICABLE",
                                "offerStartTs": 0,
                                "offerEndTs": 253370764800000,
                                "streamable": false,
                                "downloadable": false,
                                "extendedOfferStartTs": 0,
                                "extendedOfferEndTs": 253370764800000
                              },
                              "startOfCredits": 0
                            }
                          },
                          "height": 333,
                          "language": "ANY",
                          "modifiedDate": "2023-06-13 12:17:07.491",
                          "title": "WOW_Boost_Web",
                          "type": "AGG_SOURCE",
                          "url": "https://de.imageservice.sky.com/pcms/36b19ae0-09e4-11ee-92e7-0fb1ba5141c4/AGG_SOURCE?proposition=NOWTV&language=ger&versionId=e7ac7a0d-eead-4e99-9c75-2f4ce04e37c5&territory=DE",
                          "width": 592
                        }
                      }
                    ]
                  }
                }
              }
            ]
          }
        }
      },
      "price": [
        {
          "non-recurring": "0.00",
          "recurring": "5.00",
          "tenure_non-discounted_amount_total": "5.00"
        }
      ],
      "included_products": ["C_016492"]
    }
  ],
  "currentSubscriptions": [
    {
      "id": "bb48915f-853e-49f2-87d4-115779879838",
      "startDate": "2023-12-15T15:32:10Z",
      "state": "ACTIVE",
      "nextRenewalDueDate": "2024-01-15T15:32:10Z",
      "nextRenewalAmount": "7.99",
      "currency": "EUR",
      "lastUpdatedDate": "2023-12-15T15:32:10.493Z",
      "product": {
        "id": "C_007153",
        "staticId": "ENTERTAINMENT_SUBSCRIPTION_MONTH",
        "context": {
          "subscriptionType": "MONTHLY",
          "startDate": "2023-12-15T15:32:10Z",
          "nextRenewalDueDate": "2024-01-15T15:32:10Z",
          "staticId": "ENTERTAINMENT_SUBSCRIPTION_MONTH",
          "isIncluded": "False",
          "paymentType": "PAYMENT",
          "retryWindow": false
        },
        "thirdParty": false
      },
      "entitlements": ["d13de012-9f0d-43a3-86fa-4cdeed156d13"],
      "allowedOperations": [
        "AGENT_CANCEL",
        "UPDATE_PRODUCT",
        "UPDATE_SUBSCRIPTION",
        "DELETE",
        "SYSTEM_CANCEL",
        "USER_CANCEL",
        "IMMEDIATE_CANCEL",
        "TRANSFER_CANCEL",
        "CHARGEBACK_CANCEL",
        "CHARGEBACK_RENEW_CANCEL",
        "UPGRADE_CANCEL",
        "DOWNGRADE_CANCEL"
      ],
      "offerAllowed": true,
      "upfrontAllowed": true,
      "retryWindow": false
    }
  ],
  "currentEntitlements": [
    {
      "id": "d13de012-9f0d-43a3-86fa-4cdeed156d13",
      "name": "ENTERTAINMENT",
      "productId": "C_007153",
      "productStaticId": "ENTERTAINMENT_SUBSCRIPTION_MONTH",
      "state": "ACTIVATED",
      "startDate": "2023-12-15T15:32:10Z",
      "billingType": "Recurring"
    }
  ]
}
```

```bash
curl 'https://auth.client.ott.sky.com/auth/tokens' -X POST \
  -H 'Content-Type: application/vnd.tokens.v1+json' \
  -H 'X-SkyOTT-Territory: DE' \
  -H 'X-SkyOTT-Provider: NOWTV' \
  -H 'X-SkyOTT-Proposition: NOWTV' \
  -H 'X-SkyOTT-Platform: PC' \
  -H 'X-SkyOTT-Device: COMPUTER' \
  -H 'Content-MD5: 4d1042b8cc3d7d77fad64e74b913c43a' \
  --data-raw '{"auth":{"authScheme":"MESSO","authToken":"{cookie:skyCEsidismesso01}","authIssuer":"NOWTV","personaId":"{cookie:personaId}","provider":"NOWTV","providerTerritory":"DE","proposition":"NOWTV"},"device":{"type":"COMPUTER","platform":"PC"}}'
```

```json
{
  "userToken": "{userToken}",
  "tokenExpiryTime": "2023-12-19T20:50:55.828Z",
  "recommendedTokenReacquireTime": "2023-12-19T20:45:26.064Z"
}
```

Cancel

```bash
curl 'https://ottsas.sky.com/commerce/payments-manager/cancelrenewal' -X POST \
-H 'Content-Type: application/vnd.cancelrenewal.v1+json' \
-H 'X-SkyOTT-UserToken: {userToken}' \
-H 'X-SkyOTT-Territory: DE' \
-H 'X-SkyOTT-Provider: NOWTV' \
-H 'X-SkyOTT-Proposition: NOWTV' \
-H 'X-SkyOTT-Platform: PC' \
-H 'X-SkyOTT-Device: COMPUTER' \
-H 'Content-MD5: 25df021f59b2aef326b326cd29133414' \
--data-raw '{"subscriptionId":"bb48915f-853e-49f2-87d4-115779879838"}'
```

```json
{ "orderId": "2cc797bc-1913-4fef-ba9e-2935bb9a32b7", "cancellationEffectiveDate": "2024-01-15T15:32:10Z" }
```

Resume

```bash
curl 'https://ottsas.sky.com/commerce/payments-manager/reinstatesubscription' -X POST \
 -H 'Content-Type: application/vnd.reinstate.v1+json' \
 -H 'X-SkyOTT-UserToken: {UserToken}' \
 -H 'X-SkyOTT-Territory: DE' \
 -H 'X-SkyOTT-Provider: NOWTV' \
 -H 'X-SkyOTT-Proposition: NOWTV' \
 -H 'X-SkyOTT-Platform: PC' \
 -H 'X-SkyOTT-Device: COMPUTER' \
 -H 'Content-MD5: 25df021f59b2aef326b326cd29133414' \
  --data-raw '{"subscriptionId":"bb48915f-853e-49f2-87d4-115779879838"}'
```

```json
{ "orderId": "2cc797bc-1913-4fef-ba9e-2935bb9a32b7" }
```

````bash

Refresh token???

```bash
curl 'https://p.sky.com/auth/tokens' -X PATCH -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0' -H 'Accept: application/vnd.tokens.v1+json' -H 'Accept-Language: de,en-US;q=0.7,en;q=0.3' -H 'Accept-Encoding: gzip, deflate, br' -H 'X-SkyOTT-Provider: NOWTV' -H 'X-SkyOTT-Territory: DE' -H 'X-SkyOTT-Proposition: NOWTV' -H 'X-SkyOTT-Platform: PC' -H 'X-SkyOTT-Device: COMPUTER' -H 'X-SkyOTT-UserToken: 65-gUi/ESO9M+FsCXZVGWdLEbx5KfzmnC2fr8DAKnmsqBcCzFoi0u/CD9nPEpxoq51nmWVUHDXvCICygpFO8I9cKXLKT9NVJATOB6uFjPUvCgFEfMnkZX9Qz6UfvdU9oTc/5qD2nCwP62sNweltMk52E5HPBCxsL3bNrrKUQNiKePehWyFFZZ2O41nUN62OFlIZwUaKj0MwRVCOrOFnXopKqqGBLc3q+xZROFXIObLugUuxApYARYYh5gkDFUdMp3livoHt895Os4/ARNg1YxAVOk5b3AFVyC6RAboKoQufzmdJxMgsaCZtDZ7zA8qwZKFW6eJPP+uQ1yzVkVQzq2UqveSnpwcpGFhoYGnRntuYCkWqBUKg9Z/NTza44rnSYoYu80QPYALmB22jT3YuQ74EfoCyJ0Ma1G8bH3rvZrgt08zmSTg059QXNSOI4b2o9BK/6b920VbfvlciTLMYYiLzKQ==' -H 'Content-Type: application/vnd.tokens.v1+json' -H 'x-sky-signature: SkyOTT client="NOWTV-WEBPLAYER-v1",signature="KMVRuk7U29IMB+TP6SL1hQGB3CM=",timestamp="1702932658",version="1.0"' -H 'Origin: https://www.wowtv.de' -H 'Connection: keep-alive' -H 'Referer: https://www.wowtv.de/' -H 'Sec-Fetch-Dest: empty' -H 'Sec-Fetch-Mode: cors' -H 'Sec-Fetch-Site: cross-site' --data-raw '{"auth":{"personaId":"b73a5a15-3174-4659-9209-394de2ef7520"}}'
````

curl 'https://ottsas.sky.com/commerce/payments-manager/cancelrenewal' -X POST -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0' -H 'Accept: application/vnd.cancelrenewal.v1+json' -H 'Accept-Language: de,en-US;q=0.7,en;q=0.3' -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/vnd.cancelrenewal.v1+json' -H 'X-SkyOTT-UserToken: 62-ECmIkzXfuw/8JIJ5WftvP3LK1cbr+Yfapy7GA4asDdOqYfJaU1tw2chEhmXxTCFWsJHOGgYCW7DM8H5s7+Rz2SoTxRDAyr/YzgVlMK0yISpaqiRLAMDaCoucJ0gBCjJiSyzImAw0nCwAgD61SBtLRvliho4GISIhwMXa2eP+v1AqH2g+sFR75W5L6HPs04WCYsUA+g22P8eBQiNaJVl+P4XlNWgQVNFMTEzS+Ss6AnhLWbv6LQQKsgj1k330vDnT5hsuPOlBdWXfXTvH/Gyjc2wJpRyn834FczEv6kWCUdpVxVPKSdCTy8q0xFKWZ1SUB9wr3LRWvFmvDjlVNNRfFitklSj2/tfUsY4zucQ/v/pEU/QTDEqSY9aQ16Its12j6DqXYSCudoYRhDPBgfcXT5ouSho5vrcEBTbdDfH2EfZixE+OugQ33mGeDcAGaQFZbeL0o8R2fYSIa21JTdny3BGkkywCuekotAtPcChElyWNXO7h3Oane3e88VDSNqbxeQJj4AMh6dJHjVEggT/6MA==' -H 'X-SkyOTT-Territory: DE' -H 'X-SkyOTT-Provider: NOWTV' -H 'X-SkyOTT-Proposition: NOWTV' -H 'X-SkyOTT-Platform: PC' -H 'X-SkyOTT-Device: COMPUTER' -H 'Content-MD5: 25df021f59b2aef326b326cd29133414' -H 'X-SkyInt-RequestId: bf7ef427-5606-41be-8dcb-00db2a295f5e' -H 'Origin: https://www.wowtv.de' -H 'Connection: keep-alive' -H 'Referer: https://www.wowtv.de/' -H 'Sec-Fetch-Dest: empty' -H 'Sec-Fetch-Mode: cors' -H 'Sec-Fetch-Site: cross-site' -H 'TE: trailers' --data-raw '{"subscriptionId":"bb48915f-853e-49f2-87d4-115779879838"}'

curl 'https://ottsas.sky.com/commerce/payments-manager/reinstatesubscription' -X POST -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0' -H 'Accept: application/vnd.reinstate.v1+json' -H 'Accept-Language: de,en-US;q=0.7,en;q=0.3' -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/vnd.reinstate.v1+json' -H 'X-SkyOTT-UserToken: 62-ECmIkzXfuw/8JIJ5WftvP3LK1cbr+Yfapy7GA4asDdOqYfJaU1tw2chEhmXxTCFWsJHOGgYCW7DM8H5s7+Rz2SoTxRDAyr/YzgVlMK0yISpaqiRLAMDaCoucJ0gBCjJiSyzImAw0nCwAgD61SBtLRvliho4GISIhwMXa2eP+v1AqH2g+sFR75W5L6HPs04WCYsUA+g22P8eBQiNaJVl+P4XlNWgQVNFMTEzS+Ss6AnhLWbv6LQQKsgj1k330vDnT5hsuPOlBdWXfXTvH/Gyjc2wJpRyn834FczEv6kWCUdpVxVPKSdCTy8q0xFKWZ1SUB9wr3LRWvFmvDjlVNNRfFitklSj2/tfUsY4zucQ/v/pEU/QTDEqSY9aQ16Its12j6DqXYSCudoYRhDPBgfcXT5ouSho5vrcEBTbdDfH2EfZixE+OugQ33mGeDcAGaQFZbeL0o8R2fYSIa21JTdny3BGkkywCuekotAtPcChElyWNXO7h3Oane3e88VDSNqbxeQJj4AMh6dJHjVEggT/6MA==' -H 'X-SkyOTT-Territory: DE' -H 'X-SkyOTT-Provider: NOWTV' -H 'X-SkyOTT-Proposition: NOWTV' -H 'X-SkyOTT-Platform: PC' -H 'X-SkyOTT-Device: COMPUTER' -H 'Content-MD5: 25df021f59b2aef326b326cd29133414' -H 'X-SkyInt-RequestId: af660877-aa24-403b-a1c2-0814dd1b8da3' -H 'Origin: https://www.wowtv.de' -H 'Connection: keep-alive' -H 'Referer: https://www.wowtv.de/' -H 'Sec-Fetch-Dest: empty' -H 'Sec-Fetch-Mode: cors' -H 'Sec-Fetch-Site: cross-site' -H 'TE: trailers' --data-raw '{"subscriptionId":"bb48915f-853e-49f2-87d4-115779879838"}'
