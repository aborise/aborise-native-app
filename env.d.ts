/// <reference types="nativewind/types" />

declare global {
  namespace NodeJS {
    interface Process {
      server: boolean;
    }
  }
}

declare module 'react-native-html-parser' {
  export default class Parser {
    static DOMParser: { new (): DOMParser };
  }
}

declare module '*.png' {}
