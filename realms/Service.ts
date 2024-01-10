import Realm from 'realm';
import { Subscription } from './Subscription';
import { SchemaToData } from './realm';
import { getRealm } from './realm.1';
import { AllServices } from '~/shared/allServices';
import { useDayJs, useI18n } from '~/composables/useI18n';
import { ActionResult } from '~/automations/helpers/helpers';

const { t } = useI18n();
const dayjs = useDayJs();

export class Service extends Realm.Object<Service, 'lastSyncedAt'> {
  _id!: keyof AllServices;
  lastSyncedAt!: string;
  subscriptions!: Realm.List<Subscription>;

  static schema: Realm.ObjectSchema = {
    name: 'Service',
    primaryKey: '_id',
    properties: {
      _id: 'string',
      lastSyncedAt: 'string',
      subscriptions: 'Subscription[]',
    },
  };

  static create(values: Partial<SchemaToData<typeof Service>> & { _id: keyof AllServices }) {
    const realm = getRealm();
    return realm.write(() =>
      realm.create(Service, {
        ...values,
        lastSyncedAt: new Date().toISOString(),
      }),
    );
  }

  static recreateServiceFromActionResult(serviceId: keyof AllServices, data: ActionResult[] | null | undefined) {
    const realm = getRealm();
    const serviceObj = realm.objectForPrimaryKey(Service, serviceId);

    if (data) {
      realm.write(() => {
        serviceObj?.removeSubscriptions();
        serviceObj?.remove();
        realm.create(Service, {
          _id: serviceId,
          lastSyncedAt: new Date().toISOString(),
          subscriptions: data.map((sub, index) => Subscription.mapToData(sub, serviceId, index)),
        });
      });
    }

    if (!serviceObj && !data) {
      Service.create({ _id: serviceId });
    }
  }

  remove() {
    return getRealm().delete(this);
  }

  $remove() {
    return getRealm().write(() => {
      getRealm().delete(this);
    });
  }

  removeSubscriptions() {
    return getRealm().delete(this.subscriptions);
  }

  getMonthlyPrice() {
    const monthly = this.subscriptions.filtered('billingCycle = "monthly" && status = "active"').sum('planPrice');
    const annual = this.subscriptions.filtered('billingCycle = "annual" && status = "active"').sum('planPrice') / 12;

    return monthly + annual;
  }

  getSubscriptionPrice() {
    const monthly = this.subscriptions.filtered('billingCycle = "monthly"').sum('planPrice');
    const annual = this.subscriptions.filtered('billingCycle = "annual"').sum('planPrice') / 12;

    return monthly + annual;
  }

  getPaymentDate() {
    const subs = this.subscriptions.filtered('status = "active"').sorted('nextPaymentDate', true)[0];
    if (!subs) return null;

    return subs.nextPaymentDate ? dayjs(subs.nextPaymentDate).format('MMM DD') : t('unknown');
  }

  getExpirationDate() {
    const subs = this.subscriptions.filtered('status = "canceled"').sorted('expiresAt', true)[0];
    if (!subs) return null;

    return subs.expiresAt ? dayjs(subs.expiresAt).format('MMM DD') : t('unknown');
  }

  areSomeActive() {
    return this.subscriptions.filtered('status = "active"').length > 0;
  }

  areSomeCanceled() {
    return this.subscriptions.filtered('status = "canceled"').length > 0;
  }

  hasOnlyInactive() {
    return this.subscriptions.filtered('status != "inactive"').length === 0;
  }

  hasSubscriptions() {
    return this.subscriptions.length > 0;
  }
}
