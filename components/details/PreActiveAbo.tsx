import { SizableText, XStack } from 'tamagui';
import { FlowResultPreactive } from '~/automations/playwright/helpers';
import { useI18n } from '~/composables/useI18n';

type Props = {
  serviceData: FlowResultPreactive;
};

const { t } = useI18n();

const PreactiveAbo: React.FC<Props> = ({ serviceData }) => {
  return (
    <XStack>
      <SizableText>{t('preactive')}</SizableText>
    </XStack>
  );
};

export default PreactiveAbo;
