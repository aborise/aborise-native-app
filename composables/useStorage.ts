import { setItemAsync, getItemAsync, deleteItemAsync } from 'expo-secure-store';
import { useFirebaseDb } from './useFirebase';
import { get, ref, set } from 'firebase/database';

export interface Storage {
  set(key: string, value: any): Promise<void>;

  get<T>(key: string): Promise<T | null>;
  get<T>(key: string, defaultValue: T): Promise<T>;
  get<T>(key: string, defaultValue?: T): Promise<T | null>;

  delete(key: string): Promise<void>;
}

const regex = /\//g;
const LocalStorage: Storage = {
  set(key: string, value: any) {
    console.log('set', key, value);
    return setItemAsync(key.replace(regex, '_'), JSON.stringify(value));
  },
  get(key: string, defaultValue?: any) {
    return getItemAsync(key.replace(regex, '_')).then((value) => {
      console.log('get', key, value);
      if (value === null) return defaultValue;
      return JSON.parse(value);
    });
  },
  delete(key: string) {
    return deleteItemAsync(key.replace(regex, '_'));
  },
};

const RemoteStorage = (userId: string): Storage => ({
  set(key: string, value: any) {
    return set(ref(useFirebaseDb(), `users/${userId}/${key}`), value);
  },
  get(key: string, defaultValue?: any) {
    return get(ref(useFirebaseDb(), `users/${userId}/${key}`)).then((value) => {
      if (!value.exists()) return defaultValue;
      return value.val();
    });
  },
  delete(key: string) {
    return set(ref(useFirebaseDb(), `users/${userId}/${key}`), null);
  },
});

const SyncedStorage = (userId: string): Storage => {
  const local = LocalStorage;
  const remote = RemoteStorage(userId);

  return {
    set(key: string, value: any) {
      return Promise.all([local.set(key, value), remote.set(key, value)]).then(() => {});
    },
    get(key: string, defaultValue?: any) {
      return local.get(key, defaultValue);
    },
    delete(key: string) {
      return Promise.all([local.delete(key), remote.delete(key)]).then(() => {});
    },
  };
};

export function useStorage(storeType: 'local' | 'remote' | 'synced', userId?: string): Storage {
  if (storeType === 'local') {
    return LocalStorage;
  } else if (storeType === 'remote') {
    return RemoteStorage(userId!);
  } else {
    return SyncedStorage(userId!);
  }
}
