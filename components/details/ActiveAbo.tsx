import { SizableText, XStack, YStack } from 'tamagui';
import { FlowResultActive } from '~/automations/playwright/helpers';
import { capitalize } from '~/automations/playwright/strings';
import { toDisplayDate, useDayJs, useI18n } from '~/composables/useI18n';
import { billingCycle } from '~/shared/translationMapping';

type Props = {
  serviceData: FlowResultActive;
};

const { t } = useI18n();

const ActiveAbo: React.FC<Props> = ({ serviceData }) => {
  return (
    <YStack>
      <SizableText>
        {t('plan')}: {capitalize(serviceData.membershipPlan) ?? 'Basic'}
      </SizableText>
      <SizableText>
        EUR {((serviceData.nextPaymentPrice ?? 0) / 100).toFixed(2)} /{' '}
        {billingCycle[serviceData.billingCycle ?? 'monthly']}
      </SizableText>
      <XStack>
        <SizableText>{t('next-payment')}: </SizableText>
        <SizableText>{toDisplayDate(serviceData.nextPaymentDate)}</SizableText>
      </XStack>
    </YStack>
  );
};

export default ActiveAbo;
