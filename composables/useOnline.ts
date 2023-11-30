import NetInfo from '@react-native-community/netinfo';

let isOnline: boolean | null = null;
NetInfo.addEventListener((state) => {
  isOnline = state.isInternetReachable;
});

NetInfo.fetch().then((state) => {
  isOnline = state.isInternetReachable;
});

export const useOnline = () => {
  return isOnline;
};
