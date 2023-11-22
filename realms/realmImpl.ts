import { Service } from './Service';
import { Subscription } from './Subscription';
import { setRealm } from './realm';
import Realm from 'realm';

try {
  const realm = new Realm({
    deleteRealmIfMigrationNeeded: true,
    schema: [Service, Subscription],
  });

  setRealm(realm);
} catch (e) {
  console.log('Realm error', (e as Error).message);
}

export {};
