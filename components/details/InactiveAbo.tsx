import { SizableText, XStack } from 'tamagui';
import { ActionResultInactive } from '~/automations/helpers/helpers';
import { useI18n } from '~/composables/useI18n';
import { Subscription } from '~/realms/Subscription';

type Props = {
  subscription: Subscription;
};

const { t } = useI18n();

const InactiveAbo: React.FC<Props> = ({ subscription }) => {
  return (
    <XStack>
      <SizableText>{t('inactive')}</SizableText>
    </XStack>
  );
};

export default InactiveAbo;
