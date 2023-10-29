import { initializeApp, getApp } from 'firebase/app';
import { getDatabase, ref } from 'firebase/database';
import { getMessaging } from 'firebase/messaging';
import firebaseConfig from '~/firebase.config.json';

export const useFirebaseApp = () => {
  try {
    return getApp();
  } catch (e) {
    // console.log('Firebase app not initialized yet');
    return initializeApp(firebaseConfig);
  }
};

export const useFirebaseDb = () => {
  const app = useFirebaseApp();
  return getDatabase(app);
};
