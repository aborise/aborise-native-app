import { SizableText, XStack } from 'tamagui';
import { ActionResultInactive } from '~/automations/helpers/helpers';
import { useI18n } from '~/composables/useI18n';
import { Subscription } from '~/realms/Subscription';

const { t } = useI18n();

const InactiveAbo: React.FC = () => {
  return (
    <XStack>
      <SizableText>{t('you-dont-have-any-active-subscriptions')}</SizableText>
    </XStack>
  );
};

export default InactiveAbo;
