```bash
curl 'https://auth.tvnow.de/login/byBearerToken' -X POST \
 -H 'Content-Type: application/json' \
 --data-raw '{"accessToken":"{access_token}"}'
```

```json
{ "token": "{token}" }
```

```bash
curl 'https://my.plus.rtl.de/api/subscription' --compressed  -H 'Authorization: Bearer {access_token}'
```

Free:

```json
{
  "startDate": "2023-11-17",
  "productName": "Free",
  "productSubscriptions": [
    {
      "productId": "FR001",
      "productName": "Free",
      "contractType": "INTERNAL",
      "paymentBearerType": null,
      "startDate": "2023-11-17",
      "nextBillingDate": "2024-11-17",
      "cancellationDate": null
    }
  ],
  "nextBillingDate": "2024-11-17",
  "nextBillingPreviewAmount": { "amountPayable": 0.0, "totalGross": 0.0, "billingDate": null },
  "statusKey": "subscription.status.active",
  "customerStatusKey": "customer.status.active",
  "userCanTransition": true,
  "userCanCancelSubscription": false,
  "userCanRevertCancellation": false,
  "userCanRedeemCouponCode": false,
  "userCanDeletePaymentMethod": false,
  "userIsInTrialPhase": false,
  "userCanRedeemPrepaidCard": true,
  "userCanPayWithDebit": true,
  "userCanInheritPaymentBearer": false,
  "userCanBeRetained": false,
  "userCanChangeToDebit": false,
  "cancellationEffectivenessDate": "2024-11-17",
  "billingPeriod": { "unit": "YEAR", "quantity": 1 },
  "hasDiscount": false,
  "writtenOff": false,
  "isNewCustomer": true,
  "eligibleForCreditTypes": []
}
```

Premium:

```json
{
  "startDate": "2023-11-17",
  "productName": "Premium",
  "productSubscriptions": [
    {
      "productId": "PM001",
      "productName": "Premium",
      "contractType": "INTERNAL",
      "paymentBearerType": "CREDIT_CARD",
      "startDate": "2023-11-17",
      "nextBillingDate": "2023-12-17",
      "cancellationDate": null
    }
  ],
  "nextBillingDate": "2023-12-17",
  "nextBillingPreviewAmount": { "amountPayable": 6.99, "totalGross": 6.99, "billingDate": "2023-12-17" },
  "statusKey": "subscription.status.active",
  "paymentBearerTypeKey": "payment.bearer.type.creditcard",
  "customerStatusKey": "customer.status.active",
  "userCanTransition": true,
  "userCanCancelSubscription": true,
  "userCanRevertCancellation": false,
  "userCanRedeemCouponCode": true,
  "userCanDeletePaymentMethod": false,
  "userIsInTrialPhase": true,
  "userCanRedeemPrepaidCard": true,
  "userCanPayWithDebit": true,
  "userCanInheritPaymentBearer": true,
  "userCanBeRetained": true,
  "userCanChangeToDebit": true,
  "cancellationEffectivenessDate": "2023-12-17",
  "billingPeriod": { "unit": "MONTH", "quantity": 1 },
  "trialEndDate": "2023-12-17",
  "hasDiscount": false,
  "writtenOff": false,
  "isNewCustomer": false,
  "eligibleForCreditTypes": []
}
```

```bash
curl 'https://auth.rtl.de/auth/realms/rtlplus/protocol/openid-connect/token?ngsw-bypass' --compressed -X POST \
 --data-raw 'grant_type=refresh_token&refresh_token={refresh_token}&client_id=rtlplus-web'
```

```json
{
  "access_token": "{access_token}",
  "expires_in": 604800,
  "refresh_expires_in": 7776000,
  "refresh_token": "{refresh_token}",
  "token_type": "Bearer",
  "id_token": "{id_token}",
  "not-before-policy": 1654768806,
  "session_state": "1875cbd5-f214-446d-8946-a5963bd176ae",
  "scope": "openid opt-ins email"
}
```

Cancel:

```bash
curl 'https://my.plus.rtl.de/api/cancelSubscription' -X POST \
 -H 'Authorization: Bearer {access_token}' \
 --data-raw '{"password":"{password}","reasonId":"ffc_nutzung","reasonText":"Ich nutze mein RTL+ Paket zu wenig"}'
```

```json

```

Resume:

```bash
curl 'https://my.plus.rtl.de/api/withdrawCancellation' -X POST \
  -H 'Authorization: Bearer {access_token}'
```

```json

```
