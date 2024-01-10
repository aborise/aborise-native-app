import { Service } from './Service';
import { Subscription } from './Subscription';
import { setRealm } from './realm.1';
import Realm from 'realm';
import { appId as id, baseUrl } from '../atlasConfig.json';
import { createContext } from 'react';

// const realmContext = createContext<Realm | null>(null);

// try {
//   // const app = new Realm.App({id, baseUrl})
//   // const user = app.currentUser;

//   // user?.addListener(() => {
//   //   console.log('user changed', user);
//   // })

//   const realm = new Realm({
//     deleteRealmIfMigrationNeeded: true,
//     schema: [Service, Subscription],
//     // sync: { flexible: true, user },
//   });

//   setRealm(realm);
// } catch (e) {
//   console.log('Realm error', (e as Error).message);
// }

export {};
