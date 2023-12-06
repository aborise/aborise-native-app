import { Link } from 'expo-router';
import React from 'react';
import { SizableText, XStack } from 'tamagui';
import { useI18n } from '~/composables/useI18n';

const { t } = useI18n();

const Feedback: React.FC = () => {
  return (
    <XStack space>
      <SizableText size="$4" fontWeight={'bold'}>
        {t('got-feedback')}
      </SizableText>
      <Link href="/feedback" asChild>
        <SizableText color="$blue10" size="$4" lineHeight="$3">
          {t('hit-us')}
        </SizableText>
      </Link>
    </XStack>
  );
};

export default Feedback;
