import Realm from 'realm';

export let realm: Realm | null = null;
export const getRealm = () => {
  return realm!;
};

export const setRealm = (newRealm: Realm) => {
  realm = newRealm;
};
