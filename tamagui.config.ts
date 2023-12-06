import { config as base } from '@tamagui/config/v2-native';
import { createMedia } from '@tamagui/react-native-media-driver';
import { createFont, createTamagui, createTokens } from 'tamagui'; // or '@tamagui/core'
const bodyFont = createFont({
  ...base.fonts.body,
  family: 'Roboto, Inter, Helvetica, Arial, sans-serif',
});

const headingFont = createFont({
  ...base.fonts.heading,
  family: 'Roboto, Inter, Helvetica, Arial, sans-serif',
});

const config = createTamagui({
  ...base,
  fonts: {
    body: bodyFont,
    heading: headingFont,
    mono: bodyFont,
    silkscreen: bodyFont,
  },
});
type AppConfig = typeof config;
// this will give you types for your components
// note - if using your own design system, put the package name here instead of tamagui
declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}
export default config;
