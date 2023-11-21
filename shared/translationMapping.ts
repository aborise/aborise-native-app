import { useI18n } from '~/composables/useI18n';

const { t } = useI18n();

export const billingCycle = {
  monthly: t('month'),
  annual: t('year'),
};
