import { SizableText, XStack } from 'tamagui';
import { ActioneResultPreactive } from '~/automations/helpers/helpers';
import { useI18n } from '~/composables/useI18n';

type Props = {
  serviceData: ActioneResultPreactive;
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
