import { SizableText, XStack } from 'tamagui';
import { ActionResultInactive } from '~/automations/helpers/helpers';
import { useI18n } from '~/composables/useI18n';

type Props = {
  serviceData: ActionResultInactive;
};

const { t } = useI18n();

const InactiveAbo: React.FC<Props> = ({ serviceData }) => {
  return (
    <XStack>
      <SizableText>{t('inactive')}</SizableText>
    </XStack>
  );
};

export default InactiveAbo;
