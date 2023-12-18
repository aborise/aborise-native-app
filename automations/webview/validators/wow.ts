import { z } from 'zod';

const wowSubscriptionSchema = z.object({
  currency: z.string(),
  products: z.array(
    z.object({
      static_id: z.string(),
      business_id: z.string(),
      available: z.boolean(),
      category: z.string(),
      data: z.object({
        links: z.object({
          self: z.string(),
        }),
        id: z.string(),
        type: z.string(),
        attributes: z.object({
          addressRequired: z.boolean(),
          availableEndDate: z.string(),
          availableStartDate: z.string(),
          billingDescription: z.string(),
          businessId: z.string(),
          category: z.string(),
          childNodeTypes: z.array(z.string()),
          createdDate: z.number(),
          itemType: z.string(),
          price: z.array(
            z.object({
              currency: z.string(),
              nonRecurringPointOfSale: z.string(),
              recurringFull: z.string(),
              defaultDuration: z.boolean(),
            }),
          ),
          saleable: z.boolean(),
          sectionNavigation: z.string(),
          staticId: z.string(),
          title: z.string(),
        }),
        relationships: z.object({
          mypasses: z.object({
            data: z.array(
              z.object({
                links: z.object({
                  self: z.string(),
                }),
                id: z.string(),
                type: z.string(),
                attributes: z.object({
                  childNodeTypes: z.array(z.string()),
                  createdDate: z.number(),
                }),
                relationships: z.object({
                  'active-images': z.object({
                    data: z.array(
                      z.object({
                        id: z.string(),
                        type: z.string(),
                        attributes: z.object({
                          alttext: z.string(),
                          checksum: z.string(),
                          createdDate: z.string(),
                          deviceAvailability: z.object({
                            available: z.boolean(),
                          }),
                          expirationDate: z.string(),
                          filename: z.string(),
                          formats: z.object({
                            UNKNOWN: z.object({
                              eventStage: z.string(),
                              availability: z.object({
                                available: z.boolean(),
                                mediaType: z.string(),
                                offerStage: z.string(),
                                offerStartTs: z.number(),
                                offerEndTs: z.number(),
                                streamable: z.boolean(),
                                downloadable: z.boolean(),
                                extendedOfferStartTs: z.number(),
                                extendedOfferEndTs: z.number(),
                              }),
                              startOfCredits: z.number(),
                            }),
                          }),
                          height: z.number(),
                          language: z.string(),
                          modifiedDate: z.string(),
                          title: z.string(),
                          type: z.string(),
                          url: z.string(),
                          width: z.number(),
                        }),
                      }),
                    ),
                  }),
                }),
              }),
            ),
          }),
          signup: z.object({
            data: z.array(
              z.object({
                links: z.object({
                  self: z.string(),
                }),
                id: z.string(),
                type: z.string(),
                attributes: z.object({
                  childNodeTypes: z.array(z.string()),
                  createdDate: z.number(),
                }),
                relationships: z.object({
                  images: z.object({
                    data: z.array(
                      z.object({
                        id: z.string(),
                        type: z.string(),
                        attributes: z.object({
                          alttext: z.string(),
                          checksum: z.string(),
                          createdDate: z.string(),
                          deviceAvailability: z.object({
                            available: z.boolean(),
                          }),
                          expirationDate: z.string(),
                          filename: z.string(),
                          formats: z.object({
                            UNKNOWN: z.object({
                              eventStage: z.string(),
                              availability: z.object({
                                available: z.boolean(),
                                mediaType: z.string(),
                                offerStage: z.string(),
                                offerStartTs: z.number(),
                                offerEndTs: z.number(),
                                streamable: z.boolean(),
                                downloadable: z.boolean(),
                                extendedOfferStartTs: z.number(),
                                extendedOfferEndTs: z.number(),
                              }),
                              startOfCredits: z.number(),
                            }),
                          }),
                          height: z.number(),
                          language: z.string(),
                          modifiedDate: z.string(),
                          title: z.string(),
                          type: z.string(),
                          url: z.string(),
                          width: z.number(),
                        }),
                      }),
                    ),
                  }),
                }),
              }),
            ),
          }),
        }),
      }),
      price: z.array(
        z.object({
          'non-recurring': z.string(),
          recurring: z.string(),
        }),
      ),
    }),
  ),
  currentSubscriptions: z.array(
    z.object({
      id: z.string(),
      startDate: z.string(),
      state: z.enum(['ACTIVE']),
      nextRenewalDueDate: z.string(),
      nextRenewalAmount: z.string(),
      currency: z.string(),
      lastUpdatedDate: z.string(),
      product: z.object({
        id: z.string(),
        staticId: z.string(),
        context: z.object({
          subscriptionType: z.enum(['MONTHLY']),
          startDate: z.string(),
          nextRenewalDueDate: z.string(),
          staticId: z.string(),
          isIncluded: z.string(),
          paymentType: z.string(),
          retryWindow: z.boolean(),
        }),
        thirdParty: z.boolean(),
      }),
      entitlements: z.array(z.string()),
      allowedOperations: z.array(z.string()),
      offerAllowed: z.boolean(),
      upfrontAllowed: z.boolean(),
      retryWindow: z.boolean(),
    }),
  ),
  currentEntitlements: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      productId: z.string(),
      productStaticId: z.string(),
      state: z.string(),
      startDate: z.string(),
      billingType: z.string(),
    }),
  ),
});

export type WowSubscription = z.infer<typeof wowSubscriptionSchema>;
