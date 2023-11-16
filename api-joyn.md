```bash
curl 'https://subs.joyn.de/abo/api/v1/config?' -H 'Authorization: Bearer {token}'
```

```json
{
  "webPaymentSettings": {
    "stripePublicAPIKey": "pk_live_XPNmgyeKB7UaBGPD9XQwTK2V00uxCmkoAI",
    "paypalClientId": "AfPnJMClV1R-CNXdpctubgLazXxJ5cUDPeImRKZRLGqWep1N4q22hEDtfXC3R7daG0JdtOO4vNqgKs5L",
    "paypalPlans": {
      "HD_PLAN_ID": "P-6U244555WF719645ALXLD3RY",
      "PREMIUM_PLAN_ID": "P-6U244555WF719645ALXLD3RY",
      "PLUS_PLAN_ID": "P-6U244555WF719645ALXLD3RY"
    },
    "canUseDirectDebit": true,
    "canUsePaypal": true,
    "useKlarnaCheckout": true,
    "useBillingAgreements": false,
    "allowedPaymentMethods": ["creditcard", "klarna", "paypal"]
  },
  "hasActivePremium": false,
  "hasActivePlus": false,
  "hasActiveHD": false,
  "userEmail": "ulima.ums@gmail.com",
  "freeTrialUntil": "2023-11-22T23:59:59.999",
  "renewsOn": "2023-11-23T00:00",
  "products": [
    {
      "id": "deplus",
      "name": "PLUS+",
      "type": "PLUS",
      "country": "DE",
      "price": 699,
      "freeTrialMonths": 1,
      "freeTrialUntil": "2023-11-22T23:59:59.999",
      "billingSummaryMessage": "Dein Testzeitraum endet am 22.11.2023. Wenn du bis dahin kündigst, wird dir nichts berechnet. Ansonsten verlängert sich deine Mitgliedschaft automatisch um einen Monat nach Ablauf des Testzeitraums. Der monatliche Preis beträgt dann 6,99 (inkl. MwSt.). Dein Vertrag ist jederzeit online zum Ende eines Vertragsmonats kündbar.",
      "confirmationText": "Jetzt musst du nur noch auf den Button in der E-Mail drücken, die wir dir gerade geschickt haben, dann kannst du sofort PLUS+ nutzen. Bis 22.11.2023 kannst du es kostenlos ausprobieren. Wenn es dir gefällt, musst du nichts machen, dein Abo läuft dann einfach weiter.<p> Wenn es dir nicht gefällt, kannst du es jederzeit über deinen Account kündigen. Aber jetzt erst einmal viel Spaß mit PLUS+.",
      "offerId": "DefaultWithTrial",
      "freeTrialDays": 7
    }
  ],
  "browseJoynLink": "https://dev.joyn.de/",
  "themeColor": "#4a148c",
  "joynId": "JNDE-9738fc7c-abcc-462e-b145-314abb44ae11",
  "isAnonymous": false,
  "gender": "unknown",
  "env": "prd",
  "accountsPath": "https://auth.joyn.de",
  "hasConfirmedEmail": true
}
```

```bash
curl 'https://subs.joyn.de/abo/api/v1/subscriptions?' -H 'Authorization: Bearer {token}'
```

```json
[
  {
    "id": "sub_1OD7F9CIWjFzZsVYJfsNoH75",
    "product": "deplus",
    "productId": "deplus",
    "provider": {
      "name": "stripe",
      "token": "pm_1OD7F6CIWjFzZsVY8raFypHF",
      "details": { "vendor": "mastercard", "indicator": "7896", "expiry": "8/27" }
    },
    "voucher": "",
    "userDetails": { "cardholder": "L. Kuehne-Hellmessen", "agreeterms": true },
    "state": {
      "state": "active",
      "started": "2023-11-16T16:12:35.138",
      "expiresOn": "2023-11-22T23:59:59.999",
      "renewOn": "2023-11-23T00:00",
      "freeTrialUntil": "2023-11-22T23:59:59.999",
      "currentPrice": 0,
      "renewalPrice": 699,
      "canCancelWeb": true,
      "canReactivateWeb": false,
      "isActive": true,
      "canChangePayment": true,
      "paymentState": "trial",
      "isPaused": false
    },
    "type": "PLUS",
    "config": {
      "id": "deplus",
      "name": "PLUS+",
      "type": "PLUS",
      "country": "DE",
      "price": 699,
      "freeTrialMonths": 1,
      "freeTrialUntil": "2023-11-22T23:59:59.999",
      "billingSummaryMessage": "Dein Testzeitraum endet am 22.11.2023. Wenn du bis dahin kündigst, wird dir nichts berechnet. Ansonsten verlängert sich deine Mitgliedschaft automatisch um einen Monat nach Ablauf des Testzeitraums. Der monatliche Preis beträgt dann 6,99 (inkl. MwSt.). Dein Vertrag ist jederzeit online zum Ende eines Vertragsmonats kündbar.",
      "confirmationText": "Jetzt musst du nur noch auf den Button in der E-Mail drücken, die wir dir gerade geschickt haben, dann kannst du sofort PLUS+ nutzen. Bis 22.11.2023 kannst du es kostenlos ausprobieren. Wenn es dir gefällt, musst du nichts machen, dein Abo läuft dann einfach weiter.<p> Wenn es dir nicht gefällt, kannst du es jederzeit über deinen Account kündigen. Aber jetzt erst einmal viel Spaß mit PLUS+.",
      "offerId": "DefaultWithTrial",
      "freeTrialDays": 7
    },
    "noBilling": false,
    "isMaxdome12MonthContract": false,
    "isMaxdomeBBO": false,
    "isForceMigratedFromMaxdome": false,
    "partnerName": "joyn"
  }
]
```

```bash
curl -X POST https://auth.joyn.de/auth/refresh -L -H 'Authorization: Bearer {access_token}' --data-raw 'client_id={client_id}&client_name=web&grant_type=refresh_token&refresh_token={refresh_token}'
```

where

```js
const token = JSON.parse(localStorage.getItem('token'));
const { access_token, refresh_token } = tokenConfig;
const client_id = localStorage.getItem('ajs_anonymous_id');
```

```json
{ "access_token": "{access_token}", "refresh_token": "{refresh_token}", "token_type": "Bearer", "expires_in": 3600000 }
```
