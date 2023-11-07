import { SizableText, XStack } from 'tamagui';
import { FlowResultInactive } from '~/automations/playwright/helpers';
import { useI18n } from '~/composables/useI18n';

type Props = {
  serviceData: FlowResultInactive;
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
