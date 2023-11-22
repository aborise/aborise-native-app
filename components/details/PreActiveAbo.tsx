import { SizableText, XStack } from 'tamagui';
import { ActioneResultPreactive } from '~/automations/helpers/helpers';
import { useI18n } from '~/composables/useI18n';
import { Subscription } from '~/realms/Subscription';

type Props = {
  subscription: Subscription;
};

const { t } = useI18n();

const PreactiveAbo: React.FC<Props> = ({ subscription }) => {
  return (
    <XStack>
      <SizableText>{t('preactive')}</SizableText>
    </XStack>
  );
};

export default PreactiveAbo;
