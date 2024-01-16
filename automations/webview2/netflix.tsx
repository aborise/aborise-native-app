import { AutomationScript } from '~/shared/Page';
import { WebViewConfig2, wait } from '../webview/webview.helpers';
import { Checkbox, RadioGroup, YStack } from 'tamagui';
import { XStack } from 'tamagui';
import { useState } from 'react';
import { Label } from 'tamagui';
import { Button } from 'tamagui';
import { Ok } from '~/shared/Result';
import { Input } from 'tamagui';
import Icon from 'react-native-vector-icons/FontAwesome';

type FieldType<T> = {
  value: T;
};

type NetflixPlanChoice = {
  value: string;
  fields: {
    billingFrequency: FieldType<'Monthly' | 'Annual'>;
    planDescription: FieldType<string>;
    planPriceAmount: FieldType<string>;
    planPriceCurrency: FieldType<string>;
    planType: FieldType<string>;
    localizedPlanName: FieldType<string>;
    hasAds: FieldType<boolean>;
    planHas720p: FieldType<boolean>;
    planHasHd: FieldType<boolean>;
    planHasUltraHd: FieldType<boolean>;
    planId: FieldType<string>;
    offerId: FieldType<string>;
  };
};

type PathToObj<Path extends string, Type> = Path extends `${infer First}.${infer Rest}`
  ? { [K in First]: PathToObj<Rest, Type> }
  : { [K in Path]: Type };

type Path = PathToObj<'netflix.reactContext.models.flow.data.fields.planChoice.options', NetflixPlanChoice[]>;

const netflixRegisterScript: AutomationScript = async (page) => {
  const choices = await page.evaluate(() => {
    'use webview';
    const choices = (window as unknown as Path).netflix.reactContext.models.flow.data.fields.planChoice.options;

    return choices.map((choice) => {
      return {
        planName: choice.fields.localizedPlanName.value,
        planPrice: choice.fields.planPriceAmount.value,
        planCurrency: choice.fields.planPriceCurrency.value,
        planType: choice.fields.planType.value,
        planDescription: choice.fields.planDescription.value,
        billingCycle: choice.fields.billingFrequency.value,
        hasAds: choice.fields.hasAds.value,
        planHas720p: choice.fields.planHas720p.value,
        planHasHd: choice.fields.planHasHd.value,
        planHasUltraHd: choice.fields.planHasUltraHd.value,
        planId: choice.fields.planId.value,
        offerId: choice.fields.offerId.value,
      };
    });
  });

  const choice = await page
    .render<string>((props) => {
      const [selected, setSelected] = useState(choices[0].offerId);

      return (
        <YStack space>
          <YStack space>
            <RadioGroup defaultValue={selected} gap="$2" onValueChange={setSelected}>
              {choices.map((choice) => (
                <YStack key={choice.offerId}>
                  <XStack space>
                    <RadioGroup.Item value={choice.offerId} id={choice.offerId}>
                      <RadioGroup.Indicator />
                    </RadioGroup.Item>
                    <Label htmlFor={choice.offerId}>
                      {choice.planName} {choice.planPrice} {choice.planCurrency}
                    </Label>
                  </XStack>
                  <Label htmlFor={choice.offerId}>{choice.planDescription}</Label>
                </YStack>
              ))}
            </RadioGroup>
          </YStack>

          <XStack space>
            <Button onPress={() => props.onClose(selected)}>Confirm</Button>
            <Button onPress={props.onCancel}>Cancel</Button>
          </XStack>
        </YStack>
      );
    })
    .catch(() => null);

  if (choice === null) {
    return Ok({});
  }

  const choiceIndex = choices.findIndex((c) => c.offerId === choice);

  console.log(choice);

  await page.locator('[data-uia="continue-button"]').click();

  await page
    .locator(
      `[data-uia="form-plan-selection"] div[role="radiogroup"] div:nth-child(${choiceIndex + 1}) input[type="radio"]`,
    )
    .click();

  await page.locator('[data-uia="cta-plan-selection"]').click();
  await page.locator('[data-uia="cta-continue-registration"]').click();

  const [email, password] = await page.render<[string, string]>((props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [secureTextEntry, setSecureTextEntry] = useState(true);

    return (
      <YStack space>
        <Label>Email</Label>
        <Input placeholder="Email" value={email} onChangeText={(val) => setEmail(val)} />
        <Label>Password</Label>
        <Input
          placeholder="Password"
          secureTextEntry={true}
          value={password}
          onChangeText={(val) => setPassword(val)}
        />

        <XStack space>
          <Checkbox
            id={'checkbox'}
            checked={secureTextEntry}
            onCheckedChange={(val) => setSecureTextEntry(val as boolean)}
          >
            <Checkbox.Indicator>
              <Icon name="check" />
            </Checkbox.Indicator>
          </Checkbox>
          <Label htmlFor={'checkbox'}>Show password</Label>
        </XStack>

        <XStack space>
          <Button onPress={() => props.onClose([email, password])}>Confirm</Button>
          <Button onPress={props.onCancel}>Cancel</Button>
        </XStack>
      </YStack>
    );
  });

  await page.locator('[data-uia="field-email"]').fill(email);
  await page.locator('[data-uia="field-password"]').fill(password);

  await page.locator('[data-uia="cta-registration"]').click();

  await wait();

  return Ok({});
};

export const register: WebViewConfig2 = {
  url: 'https://www.netflix.com/signup',
  getCookies: () => [], //getCookies('paramount', ['CBS_COM']),
  script: netflixRegisterScript,
};
