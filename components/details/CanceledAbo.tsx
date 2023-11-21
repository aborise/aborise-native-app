import { View } from 'react-native';
import { SizableText, YStack } from 'tamagui';
import { ActionResultCanceled } from '~/automations/helpers/helpers';
import { capitalize } from '~/automations/helpers/strings';
import { useDayJs, useI18n } from '~/composables/useI18n';
import { billingCycle } from '~/shared/translationMapping';

type Props = {
  serviceData: ActionResultCanceled;
};

const { t } = useI18n();
const dayjs = useDayJs();

const CanceledAbo: React.FC<Props> = ({ serviceData }) => {
  return (
    <YStack>
      <View>
        <SizableText>
          {t('plan')}: {capitalize(serviceData.planName) ?? 'Basic'}
        </SizableText>
      </View>
      <SizableText>
        EUR {((serviceData.planPrice ?? 0) / 100).toFixed(2)} / {billingCycle[serviceData.billingCycle ?? 'monthly']}
      </SizableText>
      <SizableText>
        {t('canceled')} - {t('expires')} {dayjs(serviceData.expiresAt ?? 0).fromNow()}
      </SizableText>
    </YStack>
  );
};

export default CanceledAbo;
