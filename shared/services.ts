import { DeepWriteable } from './plumbing';
import { Service } from './validators';

const _netflix = {
  id: 'netflix',
  title: 'Netflix',
  logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Netflix_2015_N_logo.svg',
  description: 'Watch movies and series',
  auth: ['email', 'password'],
  optionalDataKeys: ['creditcard'],
  optional: [
    {
      key: 'creditcard',
      value: {
        number: '1234 1234 1234 1234',
        expiration: '12/24',
        cvc: '123',
      },
    },
  ],
  actions: [
    {
      name: 'connect',
      type: 'manual',
    },
    {
      name: 'register',
      type: 'manual',
    },
    {
      name: 'cancel',
      type: 'manual',
    },
    {
      name: 'resume',
      type: 'manual',
    },
  ],
} as const;

type Netflix = typeof _netflix;

export const netflix = _netflix as DeepWriteable<Netflix> satisfies Service;

const _amazon = {
  id: 'amazon',
  title: 'Amazon Prime',
  logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Amazon_Prime_Logo.svg',
  description: 'Watch movies and series',
  auth: ['email', 'password'],
  optionalDataKeys: [],
  optional: [],
  actions: [
    {
      name: 'connect',
      type: 'manual',
    },
  ],
} as const;

type Amazon = typeof _amazon;

export const amazon = _amazon as DeepWriteable<Amazon> satisfies Service;

const _disney = {
  id: 'disney',
  title: 'Disney+',
  logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg',
  description: 'Watch movies and series',
  auth: ['email', 'password'],
  optionalDataKeys: [],
  optional: [],
  actions: [
    {
      name: 'connect',
      type: 'manual',
    },
    {
      name: 'cancel',
      type: 'manual',
    },
    // {
    //   name: 'reactivate',
    //   type: 'manual',
    // },
    {
      name: 'resume',
      type: 'manual',
    },
    {
      name: 'register',
      type: 'manual',
    },
  ],
} as const;

type Disney = typeof _disney;

export const disney = _disney as DeepWriteable<Disney> satisfies Service;

const _spotify = {
  id: 'spotify',
  title: 'Spotify',
  logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg',
  description: 'Listen to music',
  auth: ['email', 'password'],
  optionalDataKeys: [],
  optional: [],
  actions: [
    {
      name: 'connect',
      type: 'manual',
    },
    {
      name: 'cancel',
      type: 'manual',
    },
    // {
    //   name: 'reactivate',
    //   type: 'manual',
    // },
    {
      name: 'resume',
      type: 'manual',
    },
    // {
    //   name: 'register',
    //   type: 'manual',
    // },
  ],
} as const;

type Spotify = typeof _spotify;

export const spotify = _spotify as DeepWriteable<Spotify> satisfies Service;

const _paramount = {
  id: 'paramount',
  title: 'Paramount',
  logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Paramount%2B_logo.svg',
  description: 'Listen to music',
  auth: ['email', 'password'], // , 'name'
  optionalDataKeys: [],
  optional: [],
  actions: [
    {
      name: 'connect',
      type: 'manual',
    },
    {
      name: 'cancel',
      type: 'manual',
    },
    // {
    //   name: 'reactivate',
    //   type: 'manual',
    // },
    {
      name: 'resume',
      type: 'manual',
    },
    {
      name: 'register',
      type: 'manual',
    },
  ],
} as const;

type Paramount = typeof _paramount;

export const paramount = _paramount as DeepWriteable<Paramount> satisfies Service;
