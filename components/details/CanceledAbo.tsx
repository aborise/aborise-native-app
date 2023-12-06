import { View } from 'react-native';
import { SizableText, YStack } from 'tamagui';
import { ActionResultCanceled } from '~/automations/helpers/helpers';
import { capitalize } from '~/automations/helpers/strings';
import { useDayJs, useI18n } from '~/composables/useI18n';
import { Subscription } from '~/realms/Subscription';
import { billingCycle } from '~/shared/translationMapping';
import { InstanceToPlain } from '~/shared/typeHelpers';

type Props = {
  subscription: InstanceToPlain<Subscription>;
};

const { t } = useI18n();
const dayjs = useDayJs();

const CanceledAbo: React.FC<Props> = ({ subscription }) => {
  return (
    <YStack>
      <View>
        <SizableText>
          {t('plan')}: {capitalize(subscription.planName) ?? 'Basic'}
        </SizableText>
      </View>
      <SizableText>
        EUR {((subscription.planPrice ?? 0) / 100).toFixed(2)} / {billingCycle[subscription.billingCycle ?? 'monthly']}
      </SizableText>
      <SizableText>
        {t('canceled')} - {t('expires')} {dayjs(subscription.expiresAt ?? 0).fromNow()}
      </SizableText>
    </YStack>
  );
};

export default CanceledAbo;
