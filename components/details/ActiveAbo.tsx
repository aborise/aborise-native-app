import { SizableText, XStack, YStack } from 'tamagui';
import { ActionResultActive } from '~/automations/helpers/helpers';
import { capitalize } from '~/automations/helpers/strings';
import { toDisplayDate, useDayJs, useI18n } from '~/composables/useI18n';
import { billingCycle } from '~/shared/translationMapping';

type Props = {
  serviceData: ActionResultActive;
};

const { t } = useI18n();

const ActiveAbo: React.FC<Props> = ({ serviceData }) => {
  return (
    <YStack>
      <SizableText>
        {t('plan')}: {capitalize(serviceData.planName) ?? 'Basic'}
      </SizableText>
      <SizableText>
        EUR {((serviceData.planPrice ?? 0) / 100).toFixed(2)} / {billingCycle[serviceData.billingCycle ?? 'monthly']}
      </SizableText>
      <XStack>
        <SizableText>{t('next-payment')}: </SizableText>
        <SizableText>{toDisplayDate(serviceData.nextPaymentDate)}</SizableText>
      </XStack>
    </YStack>
  );
};

export default ActiveAbo;
