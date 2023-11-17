import { Image, ImageResolvedAssetSource } from 'react-native';
import amazon from '../assets/icons/amazon.png';
import disney from '../assets/icons/disney.png';
import netflix from '../assets/icons/netflix.png';
import paramount from '../assets/icons/paramount.png';
import spotify from '../assets/icons/spotify.png';
import apple from '../assets/icons/apple.png';
import joyn from '../assets/icons/joyn.png';
import rtl from '../assets/icons/rtl.png';
import { objectKeys } from './typeHelpers';

const logos = {
  netflix,
  amazon,
  disney,
  paramount,
  spotify,
  apple,
  joyn,
  rtl,
};

let cache: { [key: string]: ImageResolvedAssetSource } = {};

objectKeys(logos).forEach((key) => {
  cache[key] = Image.resolveAssetSource(logos[key]);
});

export const getLogo = (assetName: string) => {
  return cache[assetName];
};
