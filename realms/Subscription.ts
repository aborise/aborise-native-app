import Realm from 'realm';
import { ActionResult, status } from '~/automations/helpers/helpers';
import { SchemaToData } from './realm';
import { getRealm } from './realm.1';

export class Subscription extends Realm.Object<Subscription> {
  id!: string;
  status!: status;
  expiresAt?: string;
  billingCycle!: 'monthly' | 'annual';
  planName!: string;
  planPrice!: number;
  nextPaymentDate?: string;
  productId?: string;

  static schema: Realm.ObjectSchema = {
    name: 'Subscription',
    // primaryKey: 'id',
    embedded: true,
    properties: {
      id: 'string',
      status: 'string',
      expiresAt: 'string?',
      billingCycle: 'string',
      planName: 'string',
      planPrice: 'int',
      nextPaymentDate: 'string?',
      productId: 'string?',
      service: {
        type: 'linkingObjects',
        objectType: 'Service',
        property: 'subscriptions',
      },
    },
  };

  static mapToData(values: ActionResult, serviceId: string, index: number): SchemaToData<typeof Subscription> {
    switch (values.status) {
      case 'active': {
        return {
          id: values.productId ?? serviceId + '-' + String(index),
          planName: values.planName,
          nextPaymentDate: values.nextPaymentDate,
          status: values.status,
          planPrice: values.planPrice,
          billingCycle: values.billingCycle,
          productId: values.productId,
        };
      }
      case 'canceled': {
        return {
          id: values.productId ?? serviceId + '-' + String(index),
          planName: values.planName,
          expiresAt: values.expiresAt,
          status: values.status,
          planPrice: values.planPrice,
          billingCycle: values.billingCycle,
          productId: values.productId,
        };
      }
      case 'inactive': {
        return {
          id: serviceId + '-' + String(index),
          status: values.status,
        };
      }
      case 'preactive': {
        return {
          id: serviceId + '-' + String(index),
          status: values.status,
        };
      }
    }
  }

  static create(values: Partial<Subscription>) {
    return {
      id: new Realm.BSON.ObjectId(),
      ...values,
    };
  }

  remove() {
    return getRealm().write(() => getRealm().delete(this));
  }

  toObject() {
    return {
      id: this.id,
      status: this.status,
      expiresAt: this.expiresAt ?? null,
      billingCycle: this.billingCycle,
      planName: this.planName,
      planPrice: this.planPrice,
      nextPaymentDate: this.nextPaymentDate,
      productId: this.productId ?? null,
    };
  }

  // toTyped(): FlowResult {
  //   return {
  //     status: this.status,
  //     expiresAt: this.expiresAt ?? null,
  //     billingCycle: this.billingCycle,
  //     planName: this.planName,
  //     planPrice: this.planPrice,
  //     nextPaymentDate: this.nextPaymentDate,
  //     productId: this.productId ?? null,
  //   };
  // }
}
