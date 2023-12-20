import { router } from 'expo-router';
import { useLocalSearchParams } from 'expo-router/src/hooks';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform, StyleSheet, View } from 'react-native';
import Toast from 'react-native-root-toast';
import RNUxcam from 'react-native-ux-cam';
import Icon from 'react-native-vector-icons/FontAwesome';
import { openApp } from 'rn-openapp';
import { Button, SizableText, XStack, YStack } from 'tamagui';
import * as apis from '~/automations/api/index';
import { useI18n } from '~/composables/useI18n';
import { useOnline } from '~/composables/useOnline';
import { Subscription } from '~/realms/Subscription';
import { AllServices, services } from '~/shared/allServices';
import { getAction } from '~/shared/apis';
import { ERROR_CODES } from '~/shared/errors';
import { Service, Service as ServiceSchema } from '~/shared/validators';
import ActiveAbo from './ActiveAbo';
import CanceledAbo from './CanceledAbo';
import InactiveAbo from './InactiveAbo';
import PreactiveAbo from './PreActiveAbo';
import { InstanceToPlain } from '~/shared/typeHelpers';
import { logEvent } from '~/shared/helpers';

type Props = {
  subscription: InstanceToPlain<Subscription>;
};

type Action = ServiceSchema['actions'][number];

const { t } = useI18n();

const confirmAction = (serviceTitle: string, action: string, cb: () => void) =>
  Alert.alert(t('confirm-X', [t(action)]), t('are-you-sure-you-want-to-X-Y', [t(action), serviceTitle]), [
    {
      text: t('cancel2'),
      style: 'cancel',
    },
    { text: t('confirm'), onPress: cb },
  ]);

const AboDetails: React.FC<Props> = ({ subscription }) => {
  // const subscription: Subscription = useQuery(Subscription).filtered('id == $0', id)[0];

  const [executing, setExecuting] = useState(false);

  const local = useLocalSearchParams<{ id: keyof AllServices }>();
  const service = useMemo(() => {
    return services[local.id!];
  }, [local.id]);

  const isOnline = useOnline();

  const actions = useMemo(
    () =>
      (service?.actions as Action[]).filter(
        (action) =>
          action.states.includes(subscription?.status as string) || process.env.EXPO_PUBLIC_SHOW_ALL_ACTIONS === 'true',
      ),
    [service?.actions, subscription?.status],
  );

  const handleWebViewActions = async (serviceId: keyof AllServices, actionName: Service['actions'][number]['name']) => {
    router.push(`/details/${serviceId}/webview/${actionName}`);
  };

  const handleAction = (serviceId: keyof AllServices, action: Service['actions'][number]) => {
    if (!isOnline) {
      return Toast.show(t('you-are-offline'), { duration: Toast.durations.SHORT });
    }

    confirmAction(service.title, action.name, async () => {
      logEvent(action.name, { service: local.id, action: action.name });

      if (action.type === 'api') return;

      if (action.webView) {
        return handleWebViewActions(serviceId, action.name);
      }

      setExecuting(true);

      const api = apis[serviceId];

      const actionHandler = getAction(
        api,
        action.name as import('~/shared/allServices').Service['actions'][number]['name'],
      );

      if (!actionHandler) return;

      const res = await actionHandler(serviceId, subscription);

      setExecuting(false);

      if (res.ok) {
        return;
      }

      const err = res.val;

      // Special handling for inactive accounts that want to resume -> let them reactivate
      if (err.code === ERROR_CODES.INVALID_MEMBERSHIP_STATUS && action.name === 'resume') {
        return Alert.alert(t('invalid-membership-status'), t('your-account-is-inactive-reactivate-now') + '?', [
          {
            text: t('cancel2'),
            style: 'cancel',
          },
          { text: t('confirm'), onPress: () => handleWebViewActions(serviceId, 'reactivate') },
        ]);
      }

      Toast.show(res.val.message, { duration: Toast.durations.LONG });
    });
  };

  const openAppStore = () => {
    // is ios device
    if (Platform.OS === 'ios') {
      try {
        if (!service.schema) throw new Error('No schema found');
        Linking.openURL(service.schema);
      } catch (e) {
        Linking.openURL(`itms-apps://itunes.apple.com/app/id${service.appleId}`);
      }
    }

    // is android device
    if (Platform.OS === 'android') {
      openApp(service.googleId).catch(() => {
        Linking.openURL(`https://play.google.com/store/apps/details?id=${service.googleId}`);
      });
    }
  };

  const getAboComponent = () => {
    switch (subscription!.status) {
      case 'active':
        return <ActiveAbo subscription={subscription} />;
      case 'inactive':
        return <InactiveAbo />;
      case 'canceled':
        return <CanceledAbo subscription={subscription} />;
      case 'preactive':
        return <PreactiveAbo subscription={subscription} />;
    }
  };

  const bgMap = { cancel: '$red8', resume: '$green8' };

  return (
    <YStack p="$4" bg="white" borderRadius="$4" backgroundColor="$gray3">
      {getAboComponent()}

      <XStack space="$2" marginTop="$2">
        {actions.map((action, index) => (
          <Button
            key={index}
            size="$4"
            onPress={() => handleAction(service.id, action)}
            bg={bgMap[action.name as keyof typeof bgMap]}
          >
            <SizableText>{t(action.name)}</SizableText>
          </Button>
        ))}
        <Button size="$4" onPress={() => openAppStore()} bg="$blue7">
          <XStack space="$2" alignItems="center">
            <SizableText>{t('open-app')}</SizableText>
            <Icon name="external-link" size={12} color="#000000" style={{ marginTop: 4 }} />
          </XStack>
        </Button>
      </XStack>

      {executing && (
        <View
          style={{
            // @ts-expect-error
            ...StyleSheet.absoluteFill,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" />
        </View>
      )}
    </YStack>
  );
};

export default AboDetails;
