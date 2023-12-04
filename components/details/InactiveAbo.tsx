import { SizableText, XStack } from 'tamagui';
import { useI18n } from '~/composables/useI18n';

const { t } = useI18n();

const InactiveAbo: React.FC = () => {
  return (
    <XStack>
      <SizableText>{t('you-dont-have-any-active-subscriptions')}</SizableText>
    </XStack>
  );
};

export default InactiveAbo;
