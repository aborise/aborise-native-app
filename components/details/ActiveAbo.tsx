import { SizableText, XStack, YStack } from 'tamagui';
import { capitalize } from '~/automations/helpers/strings';
import { toDisplayDate, useI18n } from '~/composables/useI18n';
import { Subscription } from '~/realms/Subscription';
import { billingCycle } from '~/shared/translationMapping';
import { InstanceToPlain } from '~/shared/typeHelpers';

type Props = {
  subscription: InstanceToPlain<Subscription>;
};

const { t } = useI18n();

const ActiveAbo: React.FC<Props> = ({ subscription }) => {
  return (
    <YStack>
      <SizableText>
        {t('plan')}: {capitalize(subscription.planName) ?? 'Basic'}
      </SizableText>
      <SizableText>
        EUR {((subscription.planPrice ?? 0) / 100).toFixed(2)} / {billingCycle[subscription.billingCycle ?? 'monthly']}
      </SizableText>
      <XStack>
        <SizableText>{t('next-payment')}: </SizableText>
        <SizableText>{toDisplayDate(subscription.nextPaymentDate)}</SizableText>
      </XStack>
    </YStack>
  );
};

export default ActiveAbo;
