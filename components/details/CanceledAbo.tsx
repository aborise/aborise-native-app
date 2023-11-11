import { View } from 'react-native';
import { SizableText, YStack } from 'tamagui';
import { FlowResultCanceled } from '~/automations/playwright/helpers';
import { useDayJs, useI18n } from '~/composables/useI18n';
import { billingCycle } from '~/shared/translationMapping';

type Props = {
  serviceData: FlowResultCanceled;
};

const { t } = useI18n();
const dayjs = useDayJs();

const CanceledAbo: React.FC<Props> = ({ serviceData }) => {
  return (
    <YStack>
      <View>
        <SizableText>
          {t('plan')}: {serviceData.membershipPlan ?? 'Basic'}
        </SizableText>
      </View>
      <SizableText>
        {((serviceData.nextPaymentPrice ?? 0) / 100).toFixed(2)} / {billingCycle[serviceData.billingCycle ?? 'monthly']}
      </SizableText>
      <SizableText>
        {t('canceled')} - {t('expires')} {dayjs(serviceData.expiresAt ?? 0).fromNow()}
      </SizableText>
    </YStack>
  );
};

export default CanceledAbo;
