import { Stack as ExpoStack } from 'expo-router/stack';
import React, { useCallback, useState } from 'react';
import Toast from 'react-native-root-toast';
import RNUxcam from 'react-native-ux-cam';
import { Button, Input, SizableText, YStack } from 'tamagui';
import { useI18n } from '~/composables/useI18n';
import { logEvent } from '~/shared/helpers';

const { t } = useI18n();

const Feedback = () => {
  const [feedback, setFeedback] = useState('');
  const addFeedback = useCallback(async () => {
    logEvent('feedback', {
      feedback,
    });
    setFeedback('');
    Toast.show(t('feedback-sent'));
  }, []);

  return (
    <YStack padding="$4" space>
      <ExpoStack.Screen options={{ title: t('feedback') }} />

      <SizableText size="$4" fontWeight="bold">
        You can send us feedback at any time by filling in the text field and hit send.
      </SizableText>

      <Input
        value={feedback}
        onChangeText={setFeedback}
        placeholder={t('feedback')}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        returnKeyType="done"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Button
        onPress={addFeedback}
        disabled={!feedback}
        backgroundColor={feedback ? '$blue10' : '$blue6'}
        pressStyle={{ backgroundColor: '$blue8' }}
      >
        {t('send')}
      </Button>
    </YStack>
  );
};

export default Feedback;
