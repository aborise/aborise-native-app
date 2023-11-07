import { SizableText, XStack, YStack } from 'tamagui';
import { FlowResultActive } from '~/automations/playwright/helpers';
import { useDayJs, useI18n } from '~/composables/useI18n';
import { billingCycle } from '~/shared/translationMapping';

type Props = {
  serviceData: FlowResultActive;
};

const { t } = useI18n();
const dayjs = useDayJs();

const ActiveAbo: React.FC<Props> = ({ serviceData }) => {
  return (
    <YStack>
      <SizableText>
        {t('plan')}: {serviceData.membershipPlan ?? 'Basic'}
      </SizableText>
      <SizableText>
        {serviceData.nextPaymentPrice?.integer}.<SizableText>{serviceData.nextPaymentPrice?.decimal}</SizableText> /{' '}
        {billingCycle[serviceData.billingCycle ?? 'monthly']}
      </SizableText>
      <XStack>
        <SizableText>{t('next-payment')}: </SizableText>
        <SizableText>{dayjs(serviceData.nextPaymentDate ?? 0).format('DD.MM.YYYY')}</SizableText>
      </XStack>
    </YStack>
  );
};

export default ActiveAbo;
